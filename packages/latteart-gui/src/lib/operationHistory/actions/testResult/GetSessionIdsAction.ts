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

import {
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import { RepositoryService } from "latteart-client";

const GET_SESSION_IDS_FAILED_MESSAGE_KEY =
  "error.operation_history.get_session_ids_failed";

export class GetSessionIdsAction {
  constructor(
    private repositoryService: Pick<RepositoryService, "testResultRepository">
  ) {}

  public async getSessionIds(
    testResultId: string
  ): Promise<ActionResult<Array<string>>> {
    const result =
      await this.repositoryService.testResultRepository.getSessionIds(
        testResultId
      );

    if (result.isFailure()) {
      return new ActionFailure({
        messageKey: GET_SESSION_IDS_FAILED_MESSAGE_KEY,
      });
    }

    return new ActionSuccess(result.data);
  }
}
