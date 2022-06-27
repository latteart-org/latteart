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

import {
  RepositoryAccessResult,
  RepositoryAccessSuccess,
  createRepositoryAccessFailure,
} from "@/lib/captureControl/Reply";
import { RESTClient } from "../RESTClient";

export interface NoteRepository {
  getNotes(
    testResultId: string,
    noteId: string | null
  ): Promise<
    RepositoryAccessResult<{
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    }>
  >;

  postNotes(
    testResultId: string,
    intention?: {
      summary: string;
      details: string;
    },
    bug?: {
      summary: string;
      details: string;
      imageData?: string;
    },
    notice?: {
      summary: string;
      details: string;
      tags: string[];
      imageData?: string;
    }
  ): Promise<
    RepositoryAccessResult<{
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    }>
  >;

  putNotes(
    testResultId: string,
    noteId: string,
    intention?: {
      summary: string;
      details: string;
    },
    bug?: {
      summary: string;
      details: string;
    },
    notice?: {
      summary: string;
      details: string;
      tags: string[];
    }
  ): Promise<
    RepositoryAccessResult<{
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    }>
  >;

  deleteNotes(
    testResultId: string,
    noteId: string
  ): Promise<RepositoryAccessResult<void>>;
}

export class NoteRepositoryImpl implements NoteRepository {
  constructor(private restClient: RESTClient) {}

  public async getNotes(
    testResultId: string,
    noteId: string | null
  ): Promise<
    RepositoryAccessResult<{
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    }>
  > {
    const response = await this.restClient.httpGet(
      `/test-results/${testResultId}/notes/${noteId}`
    );

    if (response.status !== 200) {
      return createRepositoryAccessFailure(response);
    }

    return new RepositoryAccessSuccess({
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
    },
    notice?: {
      summary: string;
      details: string;
      tags: string[];
      imageData?: string;
    }
  ): Promise<
    RepositoryAccessResult<{
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
      : bug
      ? {
          type: "bug",
          value: bug.summary,
          details: bug.details,
          imageData: bug.imageData,
        }
      : {
          type: "notice",
          value: notice!.summary,
          details: notice!.details,
          tags: notice!.tags,
          imageData: notice!.imageData,
        };
    const response = await this.restClient.httpPost(
      `/test-results/${testResultId}/notes`,
      body
    );

    if (response.status !== 200) {
      return createRepositoryAccessFailure(response);
    }

    return new RepositoryAccessSuccess({
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
    },
    notice?: {
      summary: string;
      details: string;
      tags: string[];
    }
  ): Promise<
    RepositoryAccessResult<{
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
      : bug
      ? {
          type: "bug",
          value: bug.summary,
          details: bug.details,
        }
      : {
          type: "notice",
          value: notice!.summary,
          details: notice!.details,
          tags: notice!.tags,
        };
    const response = await this.restClient.httpPut(
      `/test-results/${testResultId}/notes/${noteId}`,
      body
    );

    if (response.status !== 200) {
      return createRepositoryAccessFailure(response);
    }

    return new RepositoryAccessSuccess({
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
  ): Promise<RepositoryAccessResult<void>> {
    const response = await this.restClient.httpDelete(
      `/test-results/${testResultId}/notes/${noteId}`
    );

    if (response.status !== 204) {
      return createRepositoryAccessFailure(response);
    }

    return new RepositoryAccessSuccess({
      status: response.status,
      data: response.data as void,
    });
  }
}
