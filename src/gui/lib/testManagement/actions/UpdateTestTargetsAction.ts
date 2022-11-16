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

import { ActionResult, ActionSuccess } from "@/lib/common/ActionResult";
import { RepositoryService } from "src/common/service/repository";
import { Group, Plan } from "../types";

export class UpdateTestTargetsAction {
  public async updateTestTargets(
    payload: {
      testMatrixId: string;
      groupId: string;
      testTargets: {
        id: string;
        name?: string;
        index?: number;
        plans?: Plan[];
      }[];
    },
    repositoryService: Pick<
      RepositoryService,
      "testTargetRepository" | "testTargetGroupRepository"
    >
  ): Promise<ActionResult<Group>> {
    await Promise.all(
      payload.testTargets.map(async (testTarget) => {
        const testTargetResult =
          await repositoryService.testTargetRepository.patchTestTarget(
            testTarget.id,
            {
              name: testTarget.name,
              index: testTarget.index,
              plans: testTarget.plans,
            }
          );
        if (testTargetResult.isFailure()) {
          throw testTargetResult.error;
        }
        return testTargetResult.data;
      })
    );

    const testTargetGroup =
      await repositoryService.testTargetGroupRepository.getTestTargetGroup(
        payload.groupId
      );

    if (testTargetGroup.isFailure()) {
      throw testTargetGroup.error;
    }

    return new ActionSuccess(testTargetGroup.data);
  }
}
