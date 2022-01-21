import {
  TestResultImportable,
  ImportAction,
} from "@/lib/operationHistory/actions/ImportAction";

describe("ImportAction", () => {
  describe("#importWithTestResult", () => {
    it("渡されたファイル名を用いてインポートを実行し、その戻り値を返す", async () => {
      const reply = {
        succeeded: true,
        data: { name: "importFileName" },
      };

      const dispatcher: TestResultImportable = {
        importTestResult: jest.fn().mockResolvedValue(reply),
      };

      const importFileName = "importFileName";

      const returnName = await new ImportAction(
        dispatcher
      ).importWithTestResult(importFileName);

      expect(dispatcher.importTestResult).toBeCalledWith(importFileName);
      expect(returnName).toEqual(importFileName);
    });

    it("渡されたファイル名を用いてインポートを実行した結果、エラーが返ってきた場合はエラーコードをメッセージとするエラーをthrowする", async () => {
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

      const importFileName = "importFileName";

      await expect(
        new ImportAction(dispatcher).importWithTestResult(importFileName)
      ).rejects.toThrowError("import-data-error");

      expect(dispatcher.importTestResult).toBeCalledWith(importFileName);
    });
  });
});
