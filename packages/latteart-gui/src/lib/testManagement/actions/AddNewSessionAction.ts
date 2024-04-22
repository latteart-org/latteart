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

import { ActionFailure, type ActionResult, ActionSuccess } from "@/lib/common/ActionResult";
import { type RepositoryService } from "latteart-client";
import SessionDataConverter from "../SessionDataConverter";
import { type Session } from "../types";

export class AddNewSessionAction {
  public async addNewSession(
    payload: {
      projectId: string;
      storyId: string;
    },
    repositoryService: Pick<RepositoryService, "sessionRepository" | "serviceUrl">
  ): Promise<ActionResult<Session>> {
    const result = await repositoryService.sessionRepository.postSession(payload.projectId, {
      storyId: payload.storyId
    });

    if (result.isFailure()) {
      return new ActionFailure({
        messageKey: result.error.message ?? ""
      });
    }

    const convertedSession = new SessionDataConverter().convertToSession(result.data);

    return new ActionSuccess(convertedSession);
  }
}
