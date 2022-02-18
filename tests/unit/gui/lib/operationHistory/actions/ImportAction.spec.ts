import {
  TestResultImportable,
  ImportAction,
} from "@/lib/operationHistory/actions/ImportAction";

describe("ImportAction", () => {
  describe("#importWithTestResult", () => {
    it("渡されたインポート元、インポート先を用いてインポートを実行し、その戻り値を返す", async () => {
      const expectedReply = {
        succeeded: true,
        data: { name: "name", id: "id", beforeId: "beforeId" },
      };

      const dispatcher: TestResultImportable = {
        importTestResult: jest.fn().mockResolvedValue(expectedReply),
      };

      const source = { repositoryUrl: "repositoryUrl", fileName: "fileName" };
      const dest = { testResultId: "testResultId", shouldSaveTemporary: true };
      const response = await new ImportAction(dispatcher).importWithTestResult(
        source,
        dest
      );

      expect(dispatcher.importTestResult).toBeCalledWith(source, dest);
      expect(response).toEqual(expectedReply.data);
    });

    it("渡されたインポート元、インポート先を用いてインポートを実行した結果、エラーが返ってきた場合はエラーコードをメッセージとするエラーをthrowする", async () => {
      const reply = {
        succeeded: false,
        error: {
          code: "errorcode",
          message: "errormessage",
        },
      };

      const dispatcher: TestResultImportable = {
        importTestResult: jest.fn().mockResolvedValue(reply),
      };

      const source = { repositoryUrl: "repositoryUrl", fileName: "fileName" };
      const dest = { testResultId: "testResultId", shouldSaveTemporary: true };

      await expect(
        new ImportAction(dispatcher).importWithTestResult(source, dest)
      ).rejects.toThrowError("import-data-error");

      expect(dispatcher.importTestResult).toBeCalledWith(source, dest);
    });
  });
});
