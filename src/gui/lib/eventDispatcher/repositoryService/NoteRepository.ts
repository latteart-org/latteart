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
  createConnectionRefusedFailure,
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
    note: {
      type: "intention" | "bug" | "notice";
      value: string;
      details: string;
      imageData?: string;
      tags?: string[];
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
    note: {
      type: "intention" | "bug" | "notice";
      value: string;
      details: string;
      imageData?: string;
      tags?: string[];
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
    try {
      const response = await this.restClient.httpGet(
        `/test-results/${testResultId}/notes/${noteId}`
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as {
          id: string;
          type: string;
          value: string;
          details: string;
          imageFileUrl?: string;
          tags?: string[];
        },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async postNotes(
    testResultId: string,
    note: {
      type: "intention" | "bug" | "notice";
      value: string;
      details: string;
      imageData?: string;
      tags?: string[];
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
    try {
      const response = await this.restClient.httpPost(
        `/test-results/${testResultId}/notes`,
        note
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as {
          id: string;
          type: string;
          value: string;
          details: string;
          imageFileUrl?: string;
          tags?: string[];
        },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async putNotes(
    testResultId: string,
    noteId: string,
    note: {
      type: "intention" | "bug" | "notice";
      value: string;
      details: string;
      tags?: string[];
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
    try {
      const response = await this.restClient.httpPut(
        `/test-results/${testResultId}/notes/${noteId}`,
        note
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as {
          id: string;
          type: string;
          value: string;
          details: string;
          imageFileUrl?: string;
          tags?: string[];
        },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async deleteNotes(
    testResultId: string,
    noteId: string
  ): Promise<RepositoryAccessResult<void>> {
    try {
      const response = await this.restClient.httpDelete(
        `/test-results/${testResultId}/notes/${noteId}`
      );

      if (response.status !== 204) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as void,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
