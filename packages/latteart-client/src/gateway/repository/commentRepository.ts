/**
 * Copyright 2025 NTT Corporation.
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
  createConnectionRefusedFailure,
  createRepositoryAccessFailure,
  createRepositoryAccessSuccess,
} from "./result";
import { RESTClient } from "@/network/http/client";
import { CommentForRepository } from "./types";

export type CommentRepository = {
  getComments(
    testResultId: string,
    filter?: {
      period?: { since?: number; until?: number };
    }
  ): Promise<RepositoryAccessResult<CommentForRepository[]>>;

  postComment(
    testResultId: string,
    comment: Omit<CommentForRepository, "id">
  ): Promise<RepositoryAccessResult<CommentForRepository>>;
};

export class CommentRepositoryImpl implements CommentRepository {
  constructor(private restClient: RESTClient) {}

  public async getComments(
    testResultId: string,
    filter: {
      period?: { since?: number; until?: number };
    } = {}
  ): Promise<RepositoryAccessResult<CommentForRepository[]>> {
    try {
      const query: string[] = [];
      if (filter.period?.since !== undefined) {
        query.push(`since=${filter.period.since}`);
      }
      if (filter.period?.until !== undefined) {
        query.push(`until=${filter.period.until}`);
      }

      const response = await this.restClient.httpGet(
        `api/v1/test-results/${testResultId}/comments${
          query.length > 0 ? `?${query.join("&")}` : ""
        }`
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      const comments = response.data as CommentForRepository[];

      return createRepositoryAccessSuccess({
        data: comments,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async postComment(
    testResultId: string,
    comment: Omit<CommentForRepository, "id">
  ): Promise<RepositoryAccessResult<CommentForRepository>> {
    try {
      const response = await this.restClient.httpPost(
        `api/v1/test-results/${testResultId}/comments`,
        { value: comment.value, timestamp: comment.timestamp }
      );
      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as CommentForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
