import {
  Importable,
  ImportAction,
} from "@/lib/testManagement/actions/ImportAction";

describe("ImportAction", () => {
  describe("#importZip", () => {
    it("渡されたファイル名を用いてインポートを実行し、その戻り値を返す", async () => {
      const reply = {
        succeeded: true,
        data: { name: "importFileName", id: "projectId" },
      };

      const dispatcher: Importable = {
        importZipFile: jest.fn().mockResolvedValue(reply),
      };

      const importFileName = "importFileName";
      const selectOption = { includeProject: true, includeTestResults: false };

      const returnData = await new ImportAction(dispatcher).importZip(
        importFileName,
        selectOption
      );

      expect(dispatcher.importZipFile).toBeCalledWith(
        importFileName,
        selectOption
      );
      expect(returnData).toEqual(reply.data);
    });

    it("渡されたファイル名を用いてインポートを実行した結果、エラーが返ってきた場合はエラーコードをメッセージとするエラーをthrowする", async () => {
      const reply = {
        succeeded: false,
        error: {
          code: "errorcode",
          message: "errormessage",
        },
      };

      const dispatcher: Importable = {
        importZipFile: jest.fn().mockResolvedValue(reply),
      };

      const importFileName = "importFileName";
      const selectOption = { includeProject: true, includeTestResults: false };

      await expect(
        new ImportAction(dispatcher).importZip(importFileName, selectOption)
      ).rejects.toThrowError("import-data-error");

      expect(dispatcher.importZipFile).toBeCalledWith(
        importFileName,
        selectOption
      );
    });
  });
});
