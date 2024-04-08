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

export class DeleteSessionAction {
  public async deleteSession(
    payload: {
      projectId: string;
      sessionId: string;
    },
    repositoryService: Pick<RepositoryService, "sessionRepository">
  ): Promise<ActionResult<void>> {
    const result = await repositoryService.sessionRepository.deleteSession(
      payload.projectId,
      payload.sessionId
    );

    if (result.isFailure()) {
      return new ActionFailure({
        messageKey: result.error.message ?? ""
      });
    }

    return new ActionSuccess(result.data);
  }
}
