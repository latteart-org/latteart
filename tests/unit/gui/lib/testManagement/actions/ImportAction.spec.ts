import {
  Importable,
  ImportAction,
} from "@/lib/testManagement/actions/ImportAction";

describe("ImportAction", () => {
  describe("#importZip", () => {
    it("渡されたファイル名を用いてインポートを実行し、その戻り値を返す", async () => {
      const reply = {
        status: 200,
        data: { name: "importFileName", id: "projectId" },
      };

      const expectedResult = {
        data: reply.data,
        error: undefined,
      };

      const importProjectRepository = {
        getProjects: jest.fn(),
        postProjects: jest.fn().mockResolvedValue(reply),
      };

      const repositoryContainer: Importable = {
        importProjectRepository,
      };

      const source = { projectFileUrl: "projectFileUrl" };
      const selectOption = { includeProject: true, includeTestResults: false };

      const result = await new ImportAction(repositoryContainer).importZip(
        source,
        selectOption
      );

      expect(
        repositoryContainer.importProjectRepository.postProjects
      ).toBeCalledWith(source, selectOption);
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
        error: { code: "import-data-error" },
      };

      const importProjectRepository = {
        getProjects: jest.fn(),
        postProjects: jest.fn().mockResolvedValue(reply),
      };

      const repositoryContainer: Importable = {
        importProjectRepository,
      };

      const source = { projectFileUrl: "projectFileUrl" };
      const selectOption = { includeProject: true, includeTestResults: false };

      const result = await new ImportAction(repositoryContainer).importZip(
        source,
        selectOption
      );

      expect(
        repositoryContainer.importProjectRepository.postProjects
      ).toBeCalledWith(source, selectOption);
      expect(result).toEqual(receivedError);
    });
  });
});
