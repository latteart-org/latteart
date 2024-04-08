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
import { type TestMatrix } from "@/lib/testManagement/types";

export class UpdateTestMatrixAction {
  public async updateTestMatrix(
    payload: {
      projectId: string;
      newTestMatrix: { id: string; name: string };
      newViewPoints: {
        name: string;
        description: string;
        index: number;
        id: string | null;
      }[];
      oldTestMatrix: TestMatrix;
    },
    repositoryService: Pick<
      RepositoryService,
      "testMatrixRepository" | "viewPointRepository" | "projectRepository"
    >
  ): Promise<ActionResult<TestMatrix[]>> {
    if (payload.newTestMatrix.name !== payload.oldTestMatrix.name) {
      const testMatrixResult = await repositoryService.testMatrixRepository.patchTestMatrix(
        payload.newTestMatrix.id,
        payload.newTestMatrix.name
      );
      if (testMatrixResult.isFailure()) {
        return new ActionFailure({
          messageKey: testMatrixResult.error.message ?? ""
        });
      }
    }

    await Promise.all(
      payload.newViewPoints.map(async (newViewPoint) => {
        if (!newViewPoint.id) {
          const result = await repositoryService.viewPointRepository.postViewPoint({
            testMatrixId: payload.oldTestMatrix.id,
            name: newViewPoint.name,
            description: newViewPoint.description,
            index: newViewPoint.index
          });
          if (result.isFailure()) {
            return new ActionFailure({
              messageKey: result.error.message ?? ""
            });
          }
          return result.data;
        }
        const oldViewPoint = payload.oldTestMatrix.viewPoints.find((v) => v.id === newViewPoint.id);
        if (!oldViewPoint) {
          throw new Error();
        }
        if (
          newViewPoint.id &&
          (newViewPoint.name !== oldViewPoint.name ||
            newViewPoint.description !== oldViewPoint.description ||
            newViewPoint.index !== oldViewPoint.index)
        ) {
          const result = await repositoryService.viewPointRepository.patchViewPoint(
            newViewPoint.id,
            {
              name: newViewPoint.name,
              description: newViewPoint.description,
              index: newViewPoint.index
            }
          );
          if (result.isFailure()) {
            return new ActionFailure({
              messageKey: result.error.message ?? ""
            });
          }
          return result.data;
        }
        return newViewPoint;
      })
    );

    const deleteList = payload.oldTestMatrix.viewPoints.filter((oldViewPoint) => {
      return !payload.newViewPoints.find((newViewPoint) => {
        return oldViewPoint.id === newViewPoint.id;
      });
    });

    await Promise.all(
      deleteList.map(async (viewPoint) => {
        return await repositoryService.viewPointRepository.deleteViewPoint(viewPoint.id);
      })
    );

    const projectResult = await repositoryService.projectRepository.getProject(payload.projectId);

    if (projectResult.isFailure()) {
      return new ActionFailure({
        messageKey: projectResult.error.message ?? ""
      });
    }
    return new ActionSuccess(projectResult.data.testMatrices);
  }
}
