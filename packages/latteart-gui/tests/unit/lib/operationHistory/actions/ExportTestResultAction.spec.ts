import { ExportTestResultAction } from "@/lib/operationHistory/actions/testResult/ExportTestResultAction";
import { RESTClientResponse, RESTClient } from "latteart-client";
import { TestResultRepository } from "latteart-client";

const baseRestClient: RESTClient = {
  serverUrl: "",
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
  httpGetFile: jest.fn(),
};

describe("ExportTestResultAction", () => {
  describe("#exportWithTestResult", () => {
    describe("指定のテスト結果をファイルにエクスポートする", () => {
      const expectedData = { url: "url" };
      const resSuccess: RESTClientResponse = {
        status: 200,
        data: expectedData,
      };

      const resFailure: RESTClientResponse = {
        status: 500,
        data: { code: "errorcode", message: "errormessage" },
      };

      const testResultId = "testResultId";

      it("エクスポートに成功した場合は、エクスポートされたファイルのダウンロードURLを返す", async () => {
        const restClient = {
          ...baseRestClient,
          httpPost: jest.fn().mockResolvedValue(resSuccess),
        };
        const action = new ExportTestResultAction({
          testResultRepository: new TestResultRepository(restClient),
        });

        const result = await action.exportWithTestResult(testResultId);

        expect(restClient.httpPost).toBeCalledWith(
          `api/v1/test-results/${testResultId}/export`
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
        const action = new ExportTestResultAction({
          testResultRepository: new TestResultRepository(restClient),
        });

        const result = await action.exportWithTestResult(testResultId);

        expect(restClient.httpPost).toBeCalledWith(
          `api/v1/test-results/${testResultId}/export`
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
