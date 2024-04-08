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
import { type TestMatrix } from "../types";

export class AddNewTestMatrixAction {
  public async addTestMatrix(
    payload: {
      projectId: string;
      testMatrixName: string;
      viewPoints: {
        name: string;
        index: number;
        description: string;
      }[];
    },
    repositoryService: Pick<RepositoryService, "testMatrixRepository" | "viewPointRepository">
  ): Promise<ActionResult<TestMatrix>> {
    const testMatrixResult = await repositoryService.testMatrixRepository.postTestMatrix({
      projectId: payload.projectId,
      name: payload.testMatrixName
    });

    if (testMatrixResult.isFailure()) {
      return new ActionFailure({
        messageKey: testMatrixResult.error.message ?? ""
      });
    }

    const testMatrix = testMatrixResult.data;

    const viewPointReplys = await Promise.all(
      payload.viewPoints.map(async (viewPoint) => {
        return await repositoryService.viewPointRepository.postViewPoint({
          testMatrixId: testMatrix.id as string,
          name: viewPoint.name,
          index: viewPoint.index,
          description: viewPoint.description
        });
      })
    );

    const viewPoints = viewPointReplys.map((viewPoint) => {
      if (viewPoint.isFailure()) {
        throw viewPoint.error;
      }
      return viewPoint.data;
    });

    return new ActionSuccess({
      id: testMatrix.id,
      name: testMatrix.name,
      index: testMatrix.index,
      groups: [],
      viewPoints
    });
  }
}
