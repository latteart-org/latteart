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
  isServerError,
  RepositoryAccessResult,
  RepositoryAccessFailure,
  RepositoryAccessSuccess,
} from "@/lib/captureControl/Reply";

export class SnapshotRepository {
  constructor(private restClient: RESTClient) {}

  /**
   * Create a snapshot of the specified project ID.
   * @param projectId  Project ID.
   * @returns URL of the snapshot.
   */
  public async postSnapshots(
    projectId: string
  ): Promise<RepositoryAccessResult<{ url: string }>> {
    const response = await this.restClient.httpPost(
      `/projects/${projectId}/snapshots`,
      null
    );

    if (response.status !== 200 && isServerError(response.data)) {
      return new RepositoryAccessFailure({
        status: response.status,
        error: response.data,
      });
    }

    return new RepositoryAccessSuccess({
      status: response.status,
      data: response.data as { url: string },
    });
  }
}
