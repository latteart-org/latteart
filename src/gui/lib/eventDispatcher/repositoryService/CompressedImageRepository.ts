import RESTClient from "../RESTClient";
import { Reply, ReplyImpl } from "@/lib/captureControl/Reply";

export class CompressedImageRepository {
  constructor(
    private restClient: RESTClient,
    private buildAPIURL: (url: string) => string
  ) {}

  /**
   * Compress screenshot of note.
   * @param testResultId  Test result id.
   * @param noteId  Note id.
   * @returns File path after compression.
   */
  public async postNoteImage(
    testResultId: string,
    noteId: number
  ): Promise<Reply<{ imageFileUrl: string }>> {
    const response = await this.restClient.httpPost(
      this.buildAPIURL(
        `/test-results/${testResultId}/notes/${noteId}/compressed-image`
      ),
      null
    );

    const { imageFileUrl } = response.data as { imageFileUrl: string };

    return new ReplyImpl({
      status: response.status,
      data: { imageFileUrl },
    });
  }

  /**
   * Compress screenshot of test step.
   * @param testResultId  Test result id.
   * @param testStepId  Test step id of the target test step.
   * @returns File path after compression.
   */
  public async postTestStepImage(
    testResultId: string,
    testStepId: string
  ): Promise<Reply<{ imageFileUrl: string }>> {
    const response = await this.restClient.httpPost(
      this.buildAPIURL(
        `/test-results/${testResultId}/test-steps/${testStepId}/compressed-image`
      ),
      null
    );

    const { imageFileUrl } = response.data as { imageFileUrl: string };

    if (!imageFileUrl) {
      throw new Error();
    }

    return new ReplyImpl({
      status: response.status,
      data: { imageFileUrl },
    });
  }
}
