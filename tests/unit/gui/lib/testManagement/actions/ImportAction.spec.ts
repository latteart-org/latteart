import { ImportAction } from "@/lib/testManagement/actions/ImportAction";
import { ImportProjectRepository } from "@/lib/eventDispatcher/repositoryService/ImportProjectRepository";
import {
  RESTClient,
  RESTClientResponse,
} from "@/lib/eventDispatcher/RESTClient";

const baseRestClient: RESTClient = {
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
};

describe("ImportAction", () => {
  describe("#importZip", () => {
    describe("指定のプロジェクトファイルをリポジトリにインポートする", () => {
      const expectedData = { projectId: "projectId" };
      const resSuccess: RESTClientResponse = {
        status: 200,
        data: expectedData,
      };

      const resFailure: RESTClientResponse = {
        status: 500,
        data: { code: "errorcode", message: "errormessage" },
      };

      const source = { projectFileUrl: "projectFileUrl" };
      const selectOption = {
        includeProject: true,
        includeTestResults: false,
      };

      it("インポートに成功した場合は、インポートされたプロジェクトの識別情報を返す", async () => {
        const restClient = {
          ...baseRestClient,
          httpPost: jest.fn().mockResolvedValue(resSuccess),
        };
        const action = new ImportAction({
          importProjectRepository: new ImportProjectRepository(restClient),
        });

        const result = await action.importZip(source, selectOption);

        expect(restClient.httpPost).toBeCalledWith(`/imports/projects`, {
          source,
          includeTestResults: selectOption.includeTestResults,
          includeProject: selectOption.includeProject,
        });
        if (result.isSuccess()) {
          expect(result.data).toEqual({ projectId: expectedData.projectId });
        } else {
          throw new Error("failed");
        }
      });

      it("インポートに失敗した場合は、エラー情報を返す", async () => {
        const restClient = {
          ...baseRestClient,
          httpPost: jest.fn().mockResolvedValue(resFailure),
        };
        const action = new ImportAction({
          importProjectRepository: new ImportProjectRepository(restClient),
        });

        const result = await action.importZip(source, selectOption);

        expect(restClient.httpPost).toBeCalledWith(`/imports/projects`, {
          source,
          includeTestResults: selectOption.includeTestResults,
          includeProject: selectOption.includeProject,
        });
        if (result.isSuccess()) {
          throw new Error("failed");
        } else {
          expect(result.error).toEqual({
            messageKey: "error.import_export.import-data-error",
          });
        }
      });
    });
  });
});
