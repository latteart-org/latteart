import { Reply, ReplyImpl } from "@/lib/captureControl/Reply";
import RESTClient from "../RESTClient";

export class NoteRepository {
  constructor(
    private restClient: RESTClient,
    private buildAPIURL: (url: string) => string
  ) {}

  public async getNotes(
    testResultId: string,
    noteId: string | null
  ): Promise<
    Reply<{
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    }>
  > {
    const response = await this.restClient.httpGet(
      this.buildAPIURL(`/test-results/${testResultId}/notes/${noteId}`)
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as {
        id: string;
        type: string;
        value: string;
        details: string;
        imageFileUrl?: string;
        tags?: string[];
      },
    });
  }

  public async postNotes(
    testResultId: string,
    intention: {
      summary: string;
      details: string;
    }
  ): Promise<
    Reply<{
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    }>
  > {
    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/test-results/${testResultId}/notes`),
      {
        type: "intention",
        value: intention.summary,
        details: intention.details,
      }
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as {
        id: string;
        type: string;
        value: string;
        details: string;
        imageFileUrl?: string;
        tags?: string[];
      },
    });
  }

  public async putNotes(
    testResultId: string,
    noteId: string,
    intention: {
      summary: string;
      details: string;
    }
  ): Promise<
    Reply<{
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    }>
  > {
    const response = await this.restClient.httpPut(
      this.buildAPIURL(`/test-results/${testResultId}/notes/${noteId}`),
      {
        type: "intention",
        value: intention.summary,
        details: intention.details,
      }
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as {
        id: string;
        type: string;
        value: string;
        details: string;
        imageFileUrl?: string;
        tags?: string[];
      },
    });
  }

  public async deleteNotes(
    testResultId: string,
    noteId: string
  ): Promise<Reply<void>> {
    const response = await this.restClient.httpDelete(
      this.buildAPIURL(`/test-results/${testResultId}/notes/${noteId}`)
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as void,
    });
  }
}
