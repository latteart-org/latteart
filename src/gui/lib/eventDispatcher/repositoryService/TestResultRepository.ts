import RESTClient from "../RESTClient";
import { ReplyImpl, Reply } from "@/lib/captureControl/Reply";

export class TestResultRepository {
  constructor(
    private restClient: RESTClient,
    private buildAPIURL: (url: string) => string
  ) {}

  /**
   * Delete local test result.
   * @param testResultId  Test result id.
   */
  public async deleteTestResult(testResultId: string): Promise<Reply<void>> {
    const response = await this.restClient.httpDelete(
      this.buildAPIURL(`/test-results/${testResultId}`)
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as void,
    });
  }

  /**
   * Creates export data with the specified test results.
   * @param testResultId  Test result ID.
   * @param shouldSaveTemporary Whether to save temporary.
   * @returns Test script URL.
   */
  public async postTestResultForExport(
    testResultId: string,
    shouldSaveTemporary: boolean
  ): Promise<Reply<{ url: string }>> {
    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/test-results/${testResultId}/export`),
      { temp: shouldSaveTemporary }
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as { url: string },
    });
  }
}
