import { ImportTestResultAction } from "@/lib/operationHistory/actions/import/ImportTestResultAction";

describe("ImportTestResultAction", () => {
  describe("#importWithTestResult", () => {
    it("渡されたインポート元、インポート先を用いてインポートを実行し、その戻り値を返す", async () => {
      const reply = {
        status: 200,
        data: { name: "name", id: "id", beforeId: "beforeId" },
      };

      const expectedResult = {
        data: reply.data,
        error: undefined,
      };

      const importTestResultRepository = {
        postTestResult: jest.fn().mockResolvedValue(reply),
        getTestResults: jest.fn(),
      };

      const repositoryContainer = {
        importTestResultRepository,
      };

      const source = { testResultFileUrl: "testResultFileUrl" };
      const dest = { testResultId: "testResultId" };
      const result = await new ImportTestResultAction(
        repositoryContainer
      ).importWithTestResult(source, dest);

      expect(
        repositoryContainer.importTestResultRepository.postTestResult
      ).toBeCalledWith(source, dest);
      expect(result).toEqual(expectedResult);
    });

    it("渡されたインポート元、インポート先を用いてインポートを実行した結果、エラーが返ってきた場合はエラーコードの戻り値を返す。", async () => {
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

      const importTestResultRepository = {
        postTestResult: jest.fn().mockResolvedValue(reply),
        getTestResults: jest.fn(),
      };

      const repositoryContainer = {
        importTestResultRepository,
      };

      const source = { testResultFileUrl: "testResultFileUrl" };
      const dest = { testResultId: "testResultId" };

      const result = await new ImportTestResultAction(
        repositoryContainer
      ).importWithTestResult(source, dest);

      expect(
        repositoryContainer.importTestResultRepository.postTestResult
      ).toBeCalledWith(source, dest);
      expect(result).toEqual(receivedError);
    });
  });
});
