import { RESTClientResponse, RESTClient } from "@/network/http/client";
import { createRepositoryService } from "@/index";

const baseRestClient: RESTClient = {
  serverUrl: "",
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
  httpGetFile: jest.fn(),
};

describe("createEmptyTestResult", () => {
  describe("空のテスト結果を新規作成する", () => {
    it("作成に成功した場合は作成されたテスト結果のIDと名前を返す", async () => {
      const restClient = {
        ...baseRestClient,
        httpPost: jest.fn().mockResolvedValue({
          status: 200,
          data: { id: "id", name: "name" },
        }),
      };
      const service = createRepositoryService(restClient);

      const result = await service.createEmptyTestResult();

      if (result.isFailure()) {
        throw new Error("failed");
      }

      expect(result.data).toEqual({ id: "id", name: "name" });
      expect(restClient.httpPost).toBeCalledWith(`api/v1/test-results`, {});
    });

    it("作成に失敗した場合はエラー情報を返す", async () => {
      const restClient = {
        ...baseRestClient,
        httpPost: jest.fn().mockResolvedValue({
          status: 500,
        }),
      };
      const service = createRepositoryService(restClient);

      const result = await service.createEmptyTestResult();

      if (result.isSuccess()) {
        throw new Error("failed");
      }

      expect(result.error).toEqual({
        errorCode: "create_empty_test_result_failed",
        message: "Create empty Test Result failed.",
      });
      expect(restClient.httpPost).toBeCalledWith(`api/v1/test-results`, {});
    });
  });
});

describe("TestResultAccessor", () => {
  describe("#addTestPurposeToTestStep", () => {
    describe("渡されたテスト目的をリポジトリに追加する", () => {
      const resFailure: RESTClientResponse = {
        status: 500,
        data: { code: "errorcode", message: "errormessage" },
      };

      it("記録に成功した場合は記録されたテスト目的を返す", async () => {
        const expectedNote = {
          id: "intention1",
          type: "intention",
          value: "summary",
          details: "details",
        };
        const postResSuccess: RESTClientResponse = {
          status: 200,
          data: expectedNote,
        };
        const expectedTestStep = {
          id: "testStep1",
          operation: {},
          intention: "intention1",
          bugs: null,
          notices: null,
        };
        const patchResSuccess: RESTClientResponse = {
          status: 200,
          data: expectedTestStep,
        };
        const restClient = {
          ...baseRestClient,
          httpPost: jest.fn().mockResolvedValue(postResSuccess),
          httpPatch: jest.fn().mockResolvedValue(patchResSuccess),
        };

        const service = createRepositoryService(restClient);
        const testResult = service.createTestResultAccessor("testResultId");

        const testResultId = "testResultId";
        const testStepId = "testStepId";
        const note = {
          value: "summary",
          details: "details",
        };
        const result = await testResult.addTestPurposeToTestStep(
          note,
          testStepId
        );

        expect(restClient.httpPost).toBeCalledWith(
          `api/v1/test-results/${testResultId}/notes`,
          {
            type: "intention",
            value: note.value,
            details: note.details,
          }
        );
        expect(restClient.httpPatch).toBeCalledWith(
          `api/v1/test-results/${testResultId}/test-steps/${testStepId}`,
          { intention: expectedNote.id }
        );

        if (result.isFailure()) {
          throw new Error("failed");
        }

        expect(result.data).toEqual({
          note: {
            type: "intention",
            id: "intention1",
            value: "summary",
            details: "details",
            imageFileUrl: "",
          },
          testStep: {
            id: "testStep1",
            operation: { imageFileUrl: "" },
            intention: "intention1",
            bugs: null,
            notices: null,
          },
        });
      });

      describe("テスト目的の記録に失敗した場合は、エラー情報を返す", () => {
        it("テストステップへの紐づけに失敗した場合", async () => {
          const expectedNote = {
            id: "intention1",
            type: "intention",
            value: "summary",
            details: "details",
          };
          const resSuccess: RESTClientResponse = {
            status: 200,
            data: expectedNote,
          };
          const restClient = {
            ...baseRestClient,
            httpPost: jest.fn().mockResolvedValue(resSuccess),
            httpPatch: jest.fn().mockResolvedValue(resFailure),
          };

          const service = createRepositoryService(restClient);
          const testResult = service.createTestResultAccessor("testResultId");

          const testResultId = "testResultId";
          const testStepId = "testStepId";
          const note = {
            value: "summary",
            details: "details",
          };
          const result = await testResult.addTestPurposeToTestStep(
            note,
            testStepId
          );

          expect(restClient.httpPost).toBeCalledWith(
            `api/v1/test-results/${testResultId}/notes`,
            {
              type: "intention",
              value: note.value,
              details: note.details,
            }
          );
          expect(restClient.httpPatch).toBeCalledWith(
            `api/v1/test-results/${testResultId}/test-steps/${testStepId}`,
            { intention: expectedNote.id }
          );

          if (result.isSuccess()) {
            throw new Error("failed");
          } else {
            expect(result.error).toEqual({
              errorCode: "link_test_purpose_to_test_step_failed",
              message: "Link Test Purpose to Test Step failed.",
            });
          }
        });
      });
    });
  });
});
