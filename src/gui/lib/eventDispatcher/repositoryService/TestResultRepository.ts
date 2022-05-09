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
}
