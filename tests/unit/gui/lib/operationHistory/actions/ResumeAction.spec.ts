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
        operationHistoryItems: [],
        coverageSources: [],
        inputElementInfos: [],
        initialUrl: "url",
      };

      const dispatcher: TestResultResumable = {
        resume: jest.fn().mockResolvedValue({ data }),
      };

      const testResultId = "testResultId";

      await new ResumeAction(observer, dispatcher).resume(testResultId);

      expect(dispatcher.resume).toBeCalledWith(testResultId);

      expect(observer.setResumedData).toBeCalledWith({
        coverageSources: data.coverageSources,
        inputElementInfos: data.inputElementInfos,
        historyItems: data.operationHistoryItems,
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

      const error = {
        code: "errorCode",
      };

      const dispatcher: TestResultResumable = {
        resume: jest.fn().mockResolvedValue({ error }),
      };

      const testResultId = "testResultId";

      await expect(
        new ResumeAction(observer, dispatcher).resume(testResultId)
      ).rejects.toThrowError(error.code);

      expect(dispatcher.resume).toBeCalledWith(testResultId);

      expect(observer.setResumedData).not.toBeCalled();
    });
  });
});
