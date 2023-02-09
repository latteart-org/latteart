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
  ActionFailure,
  ActionResult,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import { RepositoryService } from "latteart-client";
import { TestMatrix } from "../types";

export class DeleteGroupAction {
  public async deleteGroup(
    payload: {
      testMatrixId: string;
      groupId: string;
    },
    repositoryService: Pick<
      RepositoryService,
      "testTargetGroupRepository" | "testMatrixRepository"
    >
  ): Promise<ActionResult<TestMatrix>> {
    const testTargetGroupResult =
      await repositoryService.testTargetGroupRepository.deleteTestTargetGroup(
        payload.groupId
      );

    if (testTargetGroupResult.isFailure()) {
      return new ActionFailure({
        messageKey: testTargetGroupResult.error.message ?? "",
      });
    }

    const testMatrixResult =
      await repositoryService.testMatrixRepository.getTestMatrix(
        payload.testMatrixId
      );

    if (testMatrixResult.isFailure()) {
      return new ActionFailure({
        messageKey: testMatrixResult.error.message ?? "",
      });
    }

    return new ActionSuccess(testMatrixResult.data);
  }
}
