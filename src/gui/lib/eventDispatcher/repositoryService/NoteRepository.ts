/**
 * Copyright 2022 NTT Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    intention?: {
      summary: string;
      details: string;
    },
    bug?: {
      summary: string;
      details: string;
      imageData?: string;
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
    const body = intention
      ? {
          type: "intention",
          value: intention.summary,
          details: intention.details,
        }
      : {
          type: "bug",
          value: bug!.summary,
          details: bug!.details,
          imageData: bug!.imageData,
        };
    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/test-results/${testResultId}/notes`),
      body
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
    intention?: {
      summary: string;
      details: string;
    },
    bug?: {
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
    const body = intention
      ? {
          type: "intention",
          value: intention.summary,
          details: intention.details,
        }
      : {
          type: "bug",
          value: bug!.summary,
          details: bug!.details,
        };
    const response = await this.restClient.httpPut(
      this.buildAPIURL(`/test-results/${testResultId}/notes/${noteId}`),
      body
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
