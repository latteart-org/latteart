/**
 * Copyright 2021 NTT Corporation.
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
  ProgressData,
  TestMatrix,
  TestTargetProgressData,
  TestMatrixProgressData,
  TestTarget,
} from "../types";

export interface Completable {
  isDone: boolean;
}

export interface StoryAchievement {
  id: string;
  sessions: Completable[];
}

export type Unixtime = number;

export interface ProgressDataTimestamp {
  value: Unixtime;
  isSameDayAs(other: Unixtime): boolean;
}

export class CalculateProgressDatasAction {
  public calculate(
    timestamp: ProgressDataTimestamp,
    testMatrices: TestMatrix[],
    stories: StoryAchievement[],
    oldProgressDatas: ProgressData[]
  ): ProgressData[] {
    return testMatrices.map((testMatrix) => {
      const testMatrixProgressData = this.buildTestMatrixProgressData(
        timestamp.value.toString(),
        testMatrix,
        stories
      );

      const oldTestMatrixProgressDatas =
        oldProgressDatas.find((data) => {
          return testMatrix.id === data.testMatrixId;
        })?.testMatrixProgressDatas ?? [];

      return {
        testMatrixId: testMatrix.id,
        testMatrixProgressDatas: this.updateTestMatrixProgressDatas(
          timestamp,
          testMatrixProgressData,
          oldTestMatrixProgressDatas
        ),
      };
    });
  }

  private updateTestMatrixProgressDatas(
    timestamp: ProgressDataTimestamp,
    testMatrixProgressData: TestMatrixProgressData,
    oldTestMatrixProgressDatas: TestMatrixProgressData[]
  ) {
    const sameDayProgressDataIndex = oldTestMatrixProgressDatas.findIndex(
      (testMatrixProgressData) => {
        return timestamp.isSameDayAs(Number(testMatrixProgressData.date));
      }
    );

    if (sameDayProgressDataIndex === -1) {
      return [...oldTestMatrixProgressDatas, testMatrixProgressData];
    } else {
      return oldTestMatrixProgressDatas.map((data, index) => {
        return index === sameDayProgressDataIndex
          ? testMatrixProgressData
          : data;
      });
    }
  }

  private buildTestMatrixProgressData(
    date: string,
    testMatrix: TestMatrix,
    stories: StoryAchievement[]
  ): TestMatrixProgressData {
    const groupProgressDatas = testMatrix.groups.map((group) => {
      return {
        id: group.id,
        name: group.name,
        testTargets: group.testTargets.map((testTarget) => {
          return this.buildTestTargetProgressData(
            testTarget,
            testMatrix.id,
            group.id,
            stories
          );
        }),
      };
    });

    return {
      date,
      groups: groupProgressDatas,
    };
  }

  private buildTestTargetProgressData(
    currentTestTarget: TestTarget,
    testMatrixId: string,
    groupId: string,
    stories: StoryAchievement[]
  ): TestTargetProgressData {
    return currentTestTarget.plans.reduce(
      (testTargetProgressData, plan) => {
        testTargetProgressData.progress.planNumber += plan.value;

        const story = stories.find(({ id }) => {
          return (
            id ===
            `${testMatrixId}_${plan.viewPointId}_${groupId}_${currentTestTarget.id}`
          );
        });

        for (const session of story?.sessions ?? []) {
          if (session.isDone) {
            testTargetProgressData.progress.completedNumber++;
          } else {
            testTargetProgressData.progress.incompletedNumber++;
          }
        }

        return testTargetProgressData;
      },
      {
        id: currentTestTarget.id,
        name: currentTestTarget.name,
        progress: {
          planNumber: 0,
          completedNumber: 0,
          incompletedNumber: 0,
        },
      }
    );
  }
}
