import { ImportTestResultAction } from "@/lib/operationHistory/actions/testResult/ImportTestResultAction";
import {
  RESTClientResponse,
  RESTClient,
} from "@/lib/eventDispatcher/RESTClient";
import { ImportTestResultRepository } from "@/lib/eventDispatcher/repositoryService/ImportTestResultRepository";

const baseRestClient: RESTClient = {
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
};

describe("ImportTestResultAction", () => {
  describe("#import", () => {
    describe("指定のテスト結果ファイルをリポジトリにインポートする", () => {
      const expectedData = { testResultId: "testResultId" };
      const resSuccess: RESTClientResponse = {
        status: 200,
        data: expectedData,
      };

      const resFailure: RESTClientResponse = {
        status: 500,
        data: { code: "errorcode", message: "errormessage" },
      };

      const source = { testResultFile: { data: "data", name: "name" } };
      const dest = { testResultId: "testResultId" };

      it("インポートに成功した場合は、インポートされたテスト結果の識別情報を返す", async () => {
        const restClient = {
          ...baseRestClient,
          httpPost: jest.fn().mockResolvedValue(resSuccess),
        };
        const action = new ImportTestResultAction({
          importTestResultRepository: new ImportTestResultRepository(
            restClient
          ),
        });

        const result = await action.import(source, dest);

        expect(restClient.httpPost).toBeCalledWith(`/imports/test-results`, {
          source,
          dest,
        });
        if (result.isSuccess()) {
          expect(result.data).toEqual({
            testResultId: expectedData.testResultId,
          });
        } else {
          throw new Error("failed");
        }
      });

      it("インポートに失敗した場合は、エラー情報を返す", async () => {
        const restClient = {
          ...baseRestClient,
          httpPost: jest.fn().mockResolvedValue(resFailure),
        };
        const action = new ImportTestResultAction({
          importTestResultRepository: new ImportTestResultRepository(
            restClient
          ),
        });

        const result = await action.import(source, dest);

        expect(restClient.httpPost).toBeCalledWith(`/imports/test-results`, {
          source,
          dest,
        });
        if (result.isSuccess()) {
          throw new Error("failed");
        } else {
          expect(result.error).toEqual({
            messageKey: "error.operation_history.import_test_result_failed",
          });
        }
      });
    });
  });
});
