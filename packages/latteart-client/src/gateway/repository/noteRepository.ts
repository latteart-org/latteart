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

import { RESTClient } from "../../network/http/client";
import {
  RepositoryAccessResult,
  createRepositoryAccessSuccess,
  createRepositoryAccessFailure,
  createConnectionRefusedFailure,
} from "./result";
import { NoteForRepository } from "./types";

export interface NoteRepository {
  getNotes(
    testResultId: string,
    noteId: string | null
  ): Promise<RepositoryAccessResult<NoteForRepository>>;

  postNotes(
    testResultId: string,
    note: {
      type: "intention" | "bug" | "notice";
      value: string;
      details: string;
      imageData?: string;
      tags?: string[];
    }
  ): Promise<RepositoryAccessResult<NoteForRepository>>;

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
  ): Promise<RepositoryAccessResult<NoteForRepository>>;

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
  ): Promise<RepositoryAccessResult<NoteForRepository>> {
    try {
      const response = await this.restClient.httpGet(
        `api/v1/test-results/${testResultId}/notes/${noteId}`
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as NoteForRepository,
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
  ): Promise<RepositoryAccessResult<NoteForRepository>> {
    try {
      const response = await this.restClient.httpPost(
        `api/v1/test-results/${testResultId}/notes`,
        note
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as NoteForRepository,
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
  ): Promise<RepositoryAccessResult<NoteForRepository>> {
    try {
      const response = await this.restClient.httpPut(
        `api/v1/test-results/${testResultId}/notes/${noteId}`,
        note
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as NoteForRepository,
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
        `api/v1/test-results/${testResultId}/notes/${noteId}`
      );

      if (response.status !== 204) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as void,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
