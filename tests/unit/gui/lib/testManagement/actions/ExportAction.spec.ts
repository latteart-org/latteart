import { ExportAction } from "@/lib/testManagement/actions/ExportAction";
import {
  RESTClient,
  RESTClientResponse,
} from "@/lib/eventDispatcher/RESTClient";
import { ProjectRESTRepository } from "@/lib/eventDispatcher/repositoryService/ProjectRepository";

const baseRestClient: RESTClient = {
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
};

describe("ExportAction", () => {
  describe("#exportZip", () => {
    describe("指定のプロジェクトをファイルにエクスポートする", () => {
      const expectedData = { url: "url" };
      const resSuccess: RESTClientResponse = {
        status: 200,
        data: expectedData,
      };

      const resFailure: RESTClientResponse = {
        status: 500,
        data: { code: "errorcode", message: "errormessage" },
      };

      const projectId = "projectId";
      const selectOption = {
        includeProject: true,
        includeTestResults: false,
      };

      it("エクスポートに成功した場合は、エクスポートされたファイルのダウンロードURLを返す", async () => {
        const restClient = {
          ...baseRestClient,
          httpPost: jest.fn().mockResolvedValue(resSuccess),
        };
        const action = new ExportAction({
          projectRepository: new ProjectRESTRepository(restClient),
        });

        const result = await action.exportZip(projectId, selectOption);

        expect(restClient.httpPost).toBeCalledWith(
          `/projects/${projectId}/export`,
          selectOption
        );
        if (result.isSuccess()) {
          expect(result.data).toEqual(expectedData.url);
        } else {
          throw new Error("failed");
        }
      });

      it("エクスポートに失敗した場合は、エラー情報を返す", async () => {
        const restClient = {
          ...baseRestClient,
          httpPost: jest.fn().mockResolvedValue(resFailure),
        };
        const action = new ExportAction({
          projectRepository: new ProjectRESTRepository(restClient),
        });

        const result = await action.exportZip(projectId, selectOption);

        expect(restClient.httpPost).toBeCalledWith(
          `/projects/${projectId}/export`,
          selectOption
        );
        if (result.isSuccess()) {
          throw new Error("failed");
        } else {
          expect(result.error).toEqual({
            messageKey: "error.import_export.create-export-data-error",
          });
        }
      });
    });
  });
});
