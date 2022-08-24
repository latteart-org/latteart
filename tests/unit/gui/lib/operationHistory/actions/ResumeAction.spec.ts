import {
  ResumeAction,
  ResumeActionObserver,
} from "@/lib/operationHistory/actions/ResumeAction";
import { TestResultRepository } from "@/lib/eventDispatcher/repositoryService/TestResultRepository";
import {
  RESTClient,
  RESTClientResponse,
} from "@/lib/eventDispatcher/RESTClient";
import { TestResult } from "@/lib/operationHistory/types";

const baseRestClient: RESTClient = {
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
};

describe("ResumeAction", () => {
  describe("#resume", () => {
    let observer: ResumeActionObserver;

    beforeEach(() => {
      observer = {
        setResumedData: jest.fn(),
        registerTestStepId: jest.fn(),
        clearTestStepIds: jest.fn(),
      };
    });

    describe("指定のテスト結果をリポジトリから読み込む", () => {
      it("リポジトリからの読み込みに成功した場合、読み込んだテスト結果の情報をobserverの関数に渡す", async () => {
        const expectedTestResult: TestResult = {
          id: "id",
          name: "name",
          startTimeStamp: 0,
          endTimeStamp: 0,
          initialUrl: "url",
          testSteps: [],
          coverageSources: [],
        };
        const resSuccess: RESTClientResponse = {
          status: 200,
          data: expectedTestResult,
        };
        const restClient = {
          ...baseRestClient,
          httpGet: jest.fn().mockResolvedValue(resSuccess),
        };
        const action = new ResumeAction(observer, {
          testResultRepository: new TestResultRepository(restClient),
          serviceUrl: "serviceUrl",
        });

        const testResultId = "testResultId";
        const result = await action.resume(testResultId);

        expect(restClient.httpGet).toBeCalledWith(
          `/test-results/${testResultId}`
        );

        expect(observer.setResumedData).toBeCalledWith({
          coverageSources: expectedTestResult.coverageSources,
          historyItems: expectedTestResult.testSteps,
          url: expectedTestResult.initialUrl,
          testResultInfo: {
            id: expectedTestResult.id,
            name: expectedTestResult.name,
          },
        });

        if (result.isFailure()) {
          throw new Error("failed");
        }
      });

      it("リポジトリからの読み込みに失敗した場合、エラー情報を返す", async () => {
        const resFailure: RESTClientResponse = {
          status: 500,
          data: { code: "errorcode", message: "errormessage" },
        };
        const restClient = {
          ...baseRestClient,
          httpGet: jest.fn().mockResolvedValue(resFailure),
        };
        const action = new ResumeAction(observer, {
          testResultRepository: new TestResultRepository(restClient),
          serviceUrl: "serviceUrl",
        });

        const testResultId = "testResultId";
        const result = await action.resume(testResultId);

        expect(restClient.httpGet).toBeCalledWith(
          `/test-results/${testResultId}`
        );

        expect(observer.setResumedData).not.toBeCalled();

        if (result.isSuccess()) {
          throw new Error("failed");
        } else {
          expect(result.error).toEqual({
            messageKey: "error.operation_history.resume_failed",
          });
        }
      });
    });
  });
});
