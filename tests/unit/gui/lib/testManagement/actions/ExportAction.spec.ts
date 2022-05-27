import { ExportAction } from "@/lib/testManagement/actions/ExportAction";

describe("ExportAction", () => {
  describe("#exportZip", () => {
    it("渡されたテスト結果IDを用いてエクスポートを実行し、その戻り値を返す", async () => {
      const reply = {
        status: 200,
        data: { url: "/test/export.zip" },
      };

      const expectedResult = {
        data: reply.data.url,
        error: undefined,
      };

      const projectRepository = {
        postProjectForExport: jest.fn().mockResolvedValue(reply),
        getProjects: jest.fn(),
        getProject: jest.fn(),
        postProject: jest.fn(),
        putProject: jest.fn(),
      };

      const repositoryContainer = {
        projectRepository,
      };

      const projectId = "projectId";
      const selectOption = { includeProject: true, includeTestResults: false };

      const result = await new ExportAction(repositoryContainer).exportZip(
        projectId,
        selectOption
      );

      expect(
        repositoryContainer.projectRepository.postProjectForExport
      ).toBeCalledWith(projectId, selectOption);
      expect(result).toEqual(expectedResult);
    });

    it("渡されたファイル名を用いてインポートを実行した結果、エラーが返ってきた場合はエラーコードをメッセージとするエラーをthrowする", async () => {
      const reply = {
        status: 500,
        error: {
          code: "errorcode",
          message: "errormessage",
        },
      };

      const receivedError = {
        data: undefined,
        error: { code: "create-export-data-error" },
      };

      const projectRepository = {
        postProjectForExport: jest.fn().mockResolvedValue(reply),
        getProjects: jest.fn(),
        getProject: jest.fn(),
        postProject: jest.fn(),
        putProject: jest.fn(),
      };

      const repositoryContainer = {
        projectRepository,
      };

      const projectId = "projectId";
      const selectOption = { includeProject: true, includeTestResults: false };

      const result = await new ExportAction(repositoryContainer).exportZip(
        projectId,
        selectOption
      );

      expect(
        repositoryContainer.projectRepository.postProjectForExport
      ).toBeCalledWith(projectId, selectOption);
      expect(result).toEqual(receivedError);
    });
  });
});
