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

import { StoryEntity } from "@/entities/StoryEntity";
import { TestTargetEntity } from "@/entities/TestTargetEntity";
import { TestTargetGroupEntity } from "@/entities/TestTargetGroupEntity";
import { TestTarget } from "@/interfaces/TestTargets";
import { TransactionRunner } from "@/TransactionRunner";
import { getRepository } from "typeorm";
import { TestProgressServiceImpl } from "./TestProgressService";

export class TestTargetService {
  public async get(testTargetId: string): Promise<TestTarget> {
    const testTarget = await getRepository(TestTargetEntity).findOne(
      testTargetId,
      { relations: ["testTargetGroup"] }
    );

    if (!testTarget) {
      throw new Error(`TestTarget not found. ${testTargetId}`);
    }

    return this.testTargetIdToResponse(testTarget.id);
  }

  public async post(
    body: {
      testTargetGroupId: string;
      name: string;
    },
    transactionRunner: TransactionRunner
  ): Promise<TestTarget> {
    const testTargetGroup = await getRepository(TestTargetGroupEntity).findOne(
      body.testTargetGroupId,
      {
        relations: ["testTargets", "testMatrix", "testMatrix.viewPoints"],
      }
    );
    if (!testTargetGroup) {
      throw new Error(`TestTargetGroup not found. ${body.testTargetGroupId}`);
    }

    let savedTestTarget: TestTargetEntity;
    return (await transactionRunner.waitAndRun(
      async (transactionalEntityManager) => {
        const testTarget = new TestTargetEntity();
        testTarget.name = body.name;
        testTarget.index = testTargetGroup.testTargets.length;
        testTarget.text = JSON.stringify(
          testTargetGroup.testMatrix.sortedViewPoint().map((viewPoint) => {
            return {
              viewPointId: viewPoint.id,
              value: 0,
            };
          })
        );
        testTarget.testTargetGroup = testTargetGroup;

        savedTestTarget = await transactionalEntityManager.save(testTarget);

        if (!savedTestTarget) {
          throw new Error(`Save failed.`);
        }

        await Promise.all(
          testTargetGroup.testMatrix.viewPoints.map(async (viewPoint) => {
            const newStory = new StoryEntity();
            newStory.status = "out-of-scope";
            newStory.index = 0;
            newStory.planedSessionNumber = 0;
            newStory.testMatrix = testTargetGroup.testMatrix;
            newStory.viewPoint = viewPoint;
            newStory.testTarget = savedTestTarget as TestTargetEntity;
            await transactionalEntityManager.save(newStory);
          })
        );
        return await this.testTargetIdToResponse(savedTestTarget.id);
      }
    )) as TestTarget;
  }

  public async patch(
    projectId: string,
    testTargetId: string,
    body: {
      name?: string;
      index?: number;
      plans?: { viewPointId: string; value: number }[];
    },
    transactionRunner: TransactionRunner
  ): Promise<TestTarget> {
    const testTargetRepository = getRepository(TestTargetEntity);
    const testTarget = await testTargetRepository.findOne(testTargetId, {
      relations: ["stories"],
    });
    if (!testTarget) {
      throw new Error(`TestTargetnot found. ${testTargetId}`);
    }

    await transactionRunner.waitAndRun(async (transactionalEntityManager) => {
      if (body.name && body.name !== testTarget.name) {
        testTarget.name = body.name;
      }
      if (body.index !== undefined && body.index !== testTarget.index) {
        testTarget.index = body.index;
      }
      const text = body.plans ? JSON.stringify(body.plans) : null;
      if (text && text !== testTarget.text) {
        await Promise.all(
          (body.plans ?? []).map(async (newPlan) => {
            const targetStory = testTarget?.stories.find((story) => {
              return story.viewPointId === newPlan.viewPointId;
            });
            if (!targetStory) {
              return;
            }
            if (targetStory.status === "out-of-scope" && newPlan.value >= 1) {
              targetStory.status = "ng";
              await transactionalEntityManager.save(targetStory);
            }
            if (targetStory.status === "ng" && newPlan.value === 0) {
              targetStory.status = "out-of-scope";
              await transactionalEntityManager.save(targetStory);
            }
          })
        );
        testTarget.text = text;
      }
      await testTargetRepository.save(testTarget);
    });

    const storyIds = testTarget.stories.map((story) => story.id);

    await new TestProgressServiceImpl().saveTodayTestProgresses(
      projectId,
      ...storyIds
    );

    return await this.testTargetIdToResponse(testTarget.id);
  }

  public async delete(
    testTargetId: string,
    transactionRunner: TransactionRunner
  ): Promise<void> {
    const testTargetRepository = getRepository(TestTargetEntity);
    const testTarget = await testTargetRepository.findOne(testTargetId, {
      relations: ["testTargetGroup"],
    });
    if (!testTarget) {
      throw new Error(`TestTarget not found. ${testTargetId}`);
    }

    await transactionRunner.waitAndRun(async (transactionalEntityManager) => {
      await transactionalEntityManager.delete(TestTargetEntity, testTargetId);

      const testTargetGroup = await transactionalEntityManager.findOne(
        TestTargetGroupEntity,
        testTarget.testTargetGroup.id,
        { relations: ["testTargets"] }
      );
      if (!testTargetGroup) {
        throw new Error(
          `TestTarget not found. ${testTarget.testTargetGroup.id}`
        );
      }

      await Promise.all(
        testTargetGroup.testTargets
          .sort((t1, t2) => {
            return t1.index - t2.index;
          })
          .map(async (testTarget, index) => {
            testTarget.index = index;
            return await transactionalEntityManager.save(testTarget);
          })
      );
    });
    await getRepository(TestTargetEntity).delete(testTargetId);
    return;
  }

  private async testTargetIdToResponse(
    testTargetId: string
  ): Promise<TestTarget> {
    const testTarget = await getRepository(TestTargetEntity).findOne(
      testTargetId
    );
    if (!testTarget) {
      throw new Error(`TestTarget not found. ${testTargetId}`);
    }

    return {
      id: testTarget.id,
      name: testTarget.name,
      index: testTarget.index,
      plans: JSON.parse(testTarget.text) as unknown as {
        viewPointId: string;
        value: number;
      }[],
    };
  }
}
