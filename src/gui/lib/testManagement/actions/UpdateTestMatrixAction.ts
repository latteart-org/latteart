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

import { Story, TestMatrix } from "@/lib/testManagement/types";

export interface UpdateTestMatrixMutationObserver {
  saveManagedData(data: {
    stories: Story[];
    testMatrices: TestMatrix[];
  }): Promise<TestMatrix[]>;
  addNewStory(): Promise<void>;
}

interface IaddedViewPointWithTestMatrixId {
  name: string;
  id: string | null;
  testMatrixId: string;
}

export class UpdateTestMatrixAction {
  constructor(private observer: UpdateTestMatrixMutationObserver) {}

  public async updateTestMatrix(
    testMatrices: TestMatrix[],
    stories: Story[],
    updateMatrixData: {
      id: string;
      name: string;
      viewPoints: Array<{
        name: string;
        id: string | null;
      }>;
    }
  ): Promise<void> {
    let addedViewPointsWithTestMatrixId: IaddedViewPointWithTestMatrixId[] = [];
    const newTestMatrices = testMatrices.map((testMatrix) => {
      if (testMatrix.id !== updateMatrixData.id) {
        return testMatrix;
      }

      addedViewPointsWithTestMatrixId = updateMatrixData.viewPoints
        .filter((newViewPoint) => {
          return !newViewPoint.id;
        })
        .map((newViewPoint) => {
          return {
            ...newViewPoint,
            testMatrixId: testMatrix.id,
          };
        });

      const groups = testMatrix.groups.map((group) => {
        group.testTargets = group.testTargets.map((testTarget) => {
          testTarget.plans = testTarget.plans.filter((plan) => {
            return updateMatrixData.viewPoints.some((viewPoint) => {
              return plan.viewPointId === viewPoint.id;
            });
          });

          return testTarget;
        });
        return group;
      });

      return {
        id: testMatrix.id,
        name: updateMatrixData.name,
        groups,
        viewPoints: updateMatrixData.viewPoints,
      };
    });

    const newStories = stories.filter((story) => {
      return newTestMatrices
        .map((newTestMatrix) => {
          return newTestMatrix.viewPoints;
        })
        .flat()
        .some((viewPoint) => {
          return story.viewPointId === viewPoint.id;
        });
    });
    const updatedTestMatrices = await this.observer.saveManagedData({
      testMatrices: newTestMatrices as TestMatrix[],
      stories: newStories,
    });

    await this.addNewStories(
      updatedTestMatrices,
      addedViewPointsWithTestMatrixId
    );

    return;
  }

  private async addNewStories(
    testMatrices: TestMatrix[],
    addedViewPointsWithTestMatrixId: IaddedViewPointWithTestMatrixId[]
  ): Promise<void> {
    for (const testMatrix of testMatrices) {
      const viewPointToAddToThisTestMatrix = addedViewPointsWithTestMatrixId.filter(
        (addedViewPoint) => {
          return testMatrix.id === addedViewPoint.testMatrixId;
        }
      );
      if (!viewPointToAddToThisTestMatrix.length) {
        continue;
      }

      const newViewPoints = testMatrix.viewPoints.slice(
        -viewPointToAddToThisTestMatrix.length
      );
      for (const group of testMatrix.groups) {
        for (const testTarget of group.testTargets) {
          for (const newViewPoint of newViewPoints) {
            await this.observer.addNewStory();
          }
        }
      }
    }
  }
}
