import {
  TestResultExportable,
  ExportAction,
} from "@/lib/operationHistory/actions/ExportAction";

describe("ExportAction", () => {
  describe("#exportWithTestResult", () => {
    it("渡されたテスト結果IDを用いてエクスポートを実行し、その戻り値を返す", async () => {
      const reply = {
        succeeded: true,
        data: { url: "/test/export.zip" },
      };

      const dispatcher: TestResultExportable = {
        exportTestResult: jest.fn().mockResolvedValue(reply),
      };

      const testResultId = "testResultId";

      const returnUrl = await new ExportAction(dispatcher).exportWithTestResult(
        testResultId
      );

      expect(dispatcher.exportTestResult).toBeCalledWith(testResultId);
      expect(returnUrl).toEqual(reply.data.url);
    });

    it("渡されたファイル名を用いてインポートを実行した結果、エラーが返ってきた場合はエラーコードをメッセージとするエラーをthrowする", async () => {
      const reply = {
        succeeded: false,
        error: {
          code: "errorcode",
          message: "errormessage",
        },
      };

      const dispatcher: TestResultExportable = {
        exportTestResult: jest.fn().mockResolvedValue(reply),
      };

      const testResultId = "testResultId";

      await expect(
        new ExportAction(dispatcher).exportWithTestResult(testResultId)
      ).rejects.toThrowError("create-export-data-error");

      expect(dispatcher.exportTestResult).toBeCalledWith(testResultId);
    });
  });
});
