import {
  Exportable,
  ExportAction,
} from "@/lib/testManagement/actions/ExportAction";

describe("ExportAction", () => {
  describe("#exportZip", () => {
    it("渡されたテスト結果IDを用いてエクスポートを実行し、その戻り値を返す", async () => {
      const reply = {
        succeeded: true,
        data: { url: "/test/export.zip" },
      };

      const dispatcher: Exportable = {
        exportZipFile: jest.fn().mockResolvedValue(reply),
      };

      const projectId = "projectId";
      const selectOption = { includeProject: true, includeTestResults: false };

      const returnUrl = await new ExportAction(dispatcher).exportZip(
        projectId,
        selectOption
      );

      expect(dispatcher.exportZipFile).toBeCalledWith(projectId, selectOption);
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

      const dispatcher: Exportable = {
        exportZipFile: jest.fn().mockResolvedValue(reply),
      };

      const projectId = "projectId";
      const selectOption = { includeProject: true, includeTestResults: false };

      await expect(
        new ExportAction(dispatcher).exportZip(projectId, selectOption)
      ).rejects.toThrowError("create-export-data-error");

      expect(dispatcher.exportZipFile).toBeCalledWith(projectId, selectOption);
    });
  });
});
