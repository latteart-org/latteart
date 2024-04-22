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
import { type Group } from "../types";

export class AddNewGroupAction {
  public async addNewGroup(
    payload: {
      testMatrixId: string;
      name: string;
    },
    repositoryService: Pick<RepositoryService, "testTargetGroupRepository">
  ): Promise<ActionResult<Group>> {
    const testTargetGroupResult =
      await repositoryService.testTargetGroupRepository.postTestTargetGroup({
        testMatrixId: payload.testMatrixId,
        name: payload.name
      });

    if (testTargetGroupResult.isFailure()) {
      return new ActionFailure({
        messageKey: testTargetGroupResult.error.message ?? ""
      });
    }

    return new ActionSuccess(testTargetGroupResult.data);
  }
}
