import {
  ResumeAction,
  ResumeActionObserver,
  TestResultResumable,
} from "@/lib/operationHistory/actions/ResumeAction";

describe("ResumeAction", () => {
  describe("#resume", () => {
    it("渡されたテスト結果IDを用いてリジュームを実行し、その戻り値を加工してオブザーバに渡す", async () => {
      const observer: ResumeActionObserver = {
        setResumedData: jest.fn(),
        registerTestStepId: jest.fn(),
        clearTestStepIds: jest.fn(),
      };

      const data = {
        id: "id",
        name: "name",
        startTimeStamp: "0",
        endTimeStamp: "0",
        initialUrl: "url",
        testSteps: [],
        coverageSources: [],
        inputElementInfos: [],
      };

      const reply = {
        status: 200,
        data,
      };

      const testResultRepository = {
        deleteTestResult: jest.fn(),
        postTestResultForExport: jest.fn(),
        postTestResultForUpload: jest.fn(),
        postEmptyTestResult: jest.fn(),
        getTestResults: jest.fn(),
        getTestResult: jest.fn().mockResolvedValue(reply),
        patchTestResult: jest.fn(),
      };

      const repositoryContainer: TestResultResumable = {
        testResultRepository,
        serviceUrl: "serviceUrl",
      };

      const testResultId = "testResultId";

      await new ResumeAction(observer, repositoryContainer).resume(
        testResultId
      );

      expect(
        repositoryContainer.testResultRepository.getTestResult
      ).toBeCalledWith(testResultId);

      expect(observer.setResumedData).toBeCalledWith({
        coverageSources: data.coverageSources,
        inputElementInfos: data.inputElementInfos,
        historyItems: data.testSteps,
        url: data.initialUrl,
        testResultInfo: { id: data.id, name: data.name },
      });
    });

    it("渡されたテスト結果IDを用いてリジュームを実行した結果、エラーが返ってきた場合はエラーコードをメッセージとするエラーをthrowする", async () => {
      const observer: ResumeActionObserver = {
        setResumedData: jest.fn(),
        registerTestStepId: jest.fn(),
        clearTestStepIds: jest.fn(),
      };

      const reply = {
        status: 500,
        error: {
          code: "errorCode",
          message: "errorMessage",
        },
      };

      const receivedError = {
        data: undefined,
        error: { code: "errorCode" },
      };

      const testResultRepository = {
        deleteTestResult: jest.fn(),
        postTestResultForExport: jest.fn(),
        postTestResultForUpload: jest.fn(),
        postEmptyTestResult: jest.fn(),
        getTestResults: jest.fn(),
        getTestResult: jest.fn().mockResolvedValue(reply),
        patchTestResult: jest.fn(),
      };

      const repositoryContainer: TestResultResumable = {
        testResultRepository,
        serviceUrl: "serviceUrl",
      };

      const testResultId = "testResultId";

      const result = await new ResumeAction(
        observer,
        repositoryContainer
      ).resume(testResultId);

      expect(
        repositoryContainer.testResultRepository.getTestResult
      ).toBeCalledWith(testResultId);
      expect(result).toEqual(receivedError);
    });
  });
});
