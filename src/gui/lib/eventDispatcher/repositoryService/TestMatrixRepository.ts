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

import { RESTClient } from "../RESTClient";
import {
  createConnectionRefusedFailure,
  createRepositoryAccessFailure,
  RepositoryAccessResult,
  RepositoryAccessSuccess,
} from "@/lib/captureControl/Reply";
import { TestMatrix } from "@/lib/testManagement/types";

export class TestMatrixRepository {
  constructor(private restClient: RESTClient) {}

  public async getTestMatrix(
    id: string
  ): Promise<RepositoryAccessResult<TestMatrix>> {
    try {
      const response = await this.restClient.httpGet(`/test-matrices/${id}`);

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as TestMatrix,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async postTestMatrix(body: {
    projectId: string;
    name: string;
  }): Promise<RepositoryAccessResult<TestMatrix>> {
    try {
      const response = await this.restClient.httpPost(`/test-matrices`, body);

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as TestMatrix,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async patchTestMatrix(
    id: string,
    name: string
  ): Promise<RepositoryAccessResult<TestMatrix>> {
    try {
      const response = await this.restClient.httpPatch(`/test-matrices/${id}`, {
        name,
      });

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as TestMatrix,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async deleteTestMatrix(
    id: string
  ): Promise<RepositoryAccessResult<void>> {
    try {
      const response = await this.restClient.httpDelete(`/test-matrices/${id}`);
      if (response.status !== 204) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess(response.data as { data: void });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
