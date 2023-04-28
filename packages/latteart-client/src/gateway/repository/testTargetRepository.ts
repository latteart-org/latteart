/**
 * Copyright 2023 NTT Corporation.
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
  createConnectionRefusedFailure,
  createRepositoryAccessFailure,
} from "./result";
import { TestTargetForRepository } from "./types";

export class TestTargetRepository {
  constructor(private restClient: RESTClient) {}

  public async getTestTarget(
    projectId: string,
    testTargetId: string
  ): Promise<RepositoryAccessResult<TestTargetForRepository>> {
    try {
      const response = await this.restClient.httpGet(
        `api/v1/projects/${projectId}/test-targets/${testTargetId}`
      );
      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as TestTargetForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async postTestTarget(
    projectId: string,
    body: {
      testTargetGroupId: string;
      name: string;
    }
  ): Promise<RepositoryAccessResult<TestTargetForRepository>> {
    try {
      const response = await this.restClient.httpPost(
        `api/v1/projects/${projectId}/test-targets`,
        body
      );
      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as TestTargetForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async patchTestTarget(
    projectId: string,
    testTargetId: string,
    body: {
      name?: string;
      index?: number;
      plans?: {
        viewPointId: string;
        value: number;
      }[];
    }
  ): Promise<RepositoryAccessResult<TestTargetForRepository>> {
    try {
      const response = await this.restClient.httpPatch(
        `api/v1/projects/${projectId}/test-targets/${testTargetId}`,
        body
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as TestTargetForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async deleteTestTarget(
    projectId: string,
    testTargetId: string
  ): Promise<RepositoryAccessResult<void>> {
    try {
      const response = await this.restClient.httpDelete(
        `api/v1/projects/${projectId}/test-targets/${testTargetId}`
      );
      if (response.status !== 204) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess(response.data as { data: void });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
