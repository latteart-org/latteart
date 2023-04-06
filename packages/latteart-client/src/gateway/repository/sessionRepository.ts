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
import { PatchSessionDto, SessionForRepository } from "./types";

export class SessionRepository {
  constructor(private restClient: RESTClient) {}

  public async postSession(
    projectId: string,
    body: {
      storyId: string;
    }
  ): Promise<RepositoryAccessResult<SessionForRepository>> {
    try {
      const response = await this.restClient.httpPost(
        `api/v1/projects/${projectId}/sessions/`,
        body
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as SessionForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async patchSession(
    projectId: string,
    sessionId: string,
    body: Partial<PatchSessionDto>
  ): Promise<RepositoryAccessResult<SessionForRepository>> {
    try {
      const response = await this.restClient.httpPatch(
        `api/v1/projects/${projectId}/sessions/${sessionId}`,
        body
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as SessionForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async deleteSession(
    projectId: string,
    sessionId: string
  ): Promise<RepositoryAccessResult<void>> {
    try {
      const response = await this.restClient.httpDelete(
        `api/v1/projects/${projectId}/sessions/${sessionId}`
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
