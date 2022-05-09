import { Reply, ReplyImpl } from "@/lib/captureControl/Reply";
import { TestStepOperation } from "@/lib/operationHistory/types";
import RESTClient from "../RESTClient";

export class TestStepRepository {
  constructor(
    private restClient: RESTClient,
    private buildAPIURL: (url: string) => string
  ) {}

  public async getTestSteps(
    testResultId: string,
    testStepId: string
  ): Promise<
    Reply<{
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    }>
  > {
    const response = await this.restClient.httpGet(
      this.buildAPIURL(`/test-results/${testResultId}/test-steps/${testStepId}`)
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as {
        id: string;
        operation: TestStepOperation;
        intention: string | null;
        bugs: string[];
        notices: string[];
      },
    });
  }

  public async patchTestSteps(
    testResultId: string,
    testStepId: string,
    noteId: string | null
  ): Promise<
    Reply<{
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    }>
  > {
    const response = await this.restClient.httpPatch(
      this.buildAPIURL(
        `/test-results/${testResultId}/test-steps/${testStepId}`
      ),
      {
        intention: noteId,
      }
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as {
        id: string;
        operation: TestStepOperation;
        intention: string | null;
        bugs: string[];
        notices: string[];
      },
    });
  }
}
