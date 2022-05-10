import RESTClient from "../RESTClient";
import { ReplyImpl, Reply } from "@/lib/captureControl/Reply";

export class ImportTestResultRepository {
  constructor(
    private restClient: RESTClient,
    private buildAPIURL: (url: string) => string
  ) {}

  /**
   * Import test result.
   * @param source.importFileUrl Source import file url.
   * @param dest.testResultId Destination local test result id.
   * @param dest.shouldSaveTemporary Whether to save temporary.
   */
  public async postTestResult(
    source: { testResultFileUrl: string },
    dest?: { testResultId?: string }
  ): Promise<Reply<{ testResultId: string }>> {
    const body = {
      source,
      dest,
    };

    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/imports/test-results`),
      body
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as { testResultId: string },
    });
  }

  /**
   * Get a list of test results for import.
   * @returns List of test results for import.
   */
  public async getTestResults(): Promise<
    Reply<Array<{ id: string; name: string }>>
  > {
    const response = await this.restClient.httpGet(
      this.buildAPIURL(`/imports/test-results`)
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as Array<{
        id: string;
        name: string;
      }>,
    });
  }
}
