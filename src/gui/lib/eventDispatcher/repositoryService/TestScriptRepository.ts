import RESTClient from "../RESTClient";
import { TestScript } from "@/lib/operationHistory/scriptGenerator/TestScript";
import { Reply, ReplyImpl } from "@/lib/captureControl/Reply";

export class TestScriptRepository {
  constructor(
    private restClient: RESTClient,
    private buildAPIURL: (url: string) => string
  ) {}

  /**
   * Create a test script with the specified project ID.
   * @param projectId  Project ID.
   * @param body.pageObjects  Page Objects.
   * @params body.testSuite  TestSuite.
   * @returns Test script URL.
   */
  public async postTestscriptsWithProjectId(
    projectId: string,
    body: TestScript
  ): Promise<Reply<{ url: string }>> {
    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/projects/${projectId}/test-scripts`),
      body
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as { url: string },
    });
  }

  /**
   * Create a test script with the specified test results.
   * @param testResultId  Test result ID.
   * @param body.pageObjects  Page objects.
   * @param body.testSuite  Test suite.
   * @returns Test script URL.
   */
  public async postTestscriptsWithTestResultId(
    testResultId: string,
    body: TestScript
  ): Promise<Reply<{ url: string }>> {
    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/test-results/${testResultId}/test-scripts`),
      body
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as { url: string },
    });
  }
}
