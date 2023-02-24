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

import {
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import { ManagedSession } from "../TestManagementData";
import { RepositoryService } from "latteart-client";

const UPDATE_SESSION_FAILED_MESSAGE_KEY =
  "error.test_management.update_session_failed";

export class UpdateSessionAction {
  constructor(
    private repositoryService: Pick<RepositoryService, "sessionRepository">
  ) {}

  public async updateSession(
    projectId: string,
    sessionId: string,
    body: Partial<ManagedSession>
  ): Promise<ActionResult<ManagedSession>> {
    const patchSessionResult =
      await this.repositoryService.sessionRepository.patchSession(
        projectId,
        sessionId,
        body
      );

    if (patchSessionResult.isFailure()) {
      return new ActionFailure({
        messageKey: UPDATE_SESSION_FAILED_MESSAGE_KEY,
      });
    }

    return new ActionSuccess(patchSessionResult.data);
  }
}
