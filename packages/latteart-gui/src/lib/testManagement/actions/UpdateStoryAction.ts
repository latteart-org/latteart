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
import { type Story } from "../types";

export class UpdateStoryAction {
  public async updateStory(
    payload: {
      id: string;
      status?: string;
    },
    repositoryService: Pick<RepositoryService, "storyRepository" | "serviceUrl">
  ): Promise<ActionResult<Story>> {
    const result = await repositoryService.storyRepository.patchStory(payload.id, {
      status: payload.status
    });

    if (result.isFailure()) {
      return new ActionFailure({
        messageKey: result.error.message ?? ""
      });
    }

    const sessions = result.data.sessions.map((session) => {
      return new SessionDataConverter().convertToSession({
        ...session
      });
    });

    return new ActionSuccess({ ...result.data, sessions });
  }
}
