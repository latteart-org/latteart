import { ExportTestResultAction } from "@/lib/operationHistory/actions/testResult/ExportTestResultAction";

describe("ExportTestResultAction", () => {
  describe("#exportWithTestResult", () => {
    it("渡されたテスト結果IDを用いてエクスポートを実行し、その戻り値を返す", async () => {
      const reply = {
        status: 200,
        data: { url: "/test/export.zip" },
      };

      const expectedResult = {
        data: reply.data.url,
        error: undefined,
      };

      const testResultRepository = {
        deleteTestResult: jest.fn(),
        postTestResultForExport: jest.fn().mockResolvedValue(reply),
        postTestResultForUpload: jest.fn(),
        postEmptyTestResult: jest.fn(),
        getTestResults: jest.fn(),
        getTestResult: jest.fn(),
        patchTestResult: jest.fn(),
      };

      const repositoryContainer = {
        testResultRepository,
      };

      const testResultId = "testResultId";

      const result = await new ExportTestResultAction(
        repositoryContainer
      ).exportWithTestResult(testResultId);

      expect(
        repositoryContainer.testResultRepository.postTestResultForExport
      ).toBeCalledWith(testResultId, false);
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

      const testResultRepository = {
        deleteTestResult: jest.fn(),
        postTestResultForExport: jest.fn().mockResolvedValue(reply),
        postTestResultForUpload: jest.fn(),
        postEmptyTestResult: jest.fn(),
        getTestResults: jest.fn(),
        getTestResult: jest.fn(),
        patchTestResult: jest.fn(),
      };

      const repositoryContainer = {
        testResultRepository,
      };
      const testResultId = "testResultId";

      const result = await new ExportTestResultAction(
        repositoryContainer
      ).exportWithTestResult(testResultId);

      expect(
        repositoryContainer.testResultRepository.postTestResultForExport
      ).toBeCalledWith(testResultId, false);
      expect(result).toEqual(receivedError);
    });
  });
});
