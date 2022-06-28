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
import { ManagedSession } from "@/lib/testManagement/TestManagementData";
import {
  RepositoryAccessResult,
  RepositoryAccessSuccess,
  createRepositoryAccessFailure,
  createConnectionRefusedFailure,
} from "@/lib/captureControl/Reply";

export class SessionRepository {
  constructor(private restClient: RESTClient) {}

  public async patchSession(
    projectId: string,
    sessionId: string,
    body: Partial<ManagedSession>
  ): Promise<RepositoryAccessResult<ManagedSession>> {
    try {
      const response = await this.restClient.httpPatch(
        `/projects/${projectId}/sessions/${sessionId}`,
        body
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return new RepositoryAccessSuccess({
        data: response.data as ManagedSession,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
