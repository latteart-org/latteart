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

import { TestMatrixEntity } from "@/entities/TestMatrixEntity";
import { TestTargetGroupEntity } from "@/entities/TestTargetGroupEntity";
import { TestTargetGroup } from "@/interfaces/TestTargetGroups";
import { TransactionRunner } from "@/TransactionRunner";
import { getRepository } from "typeorm";

export class TestTargetGroupsService {
  public async get(testTargetGroupId: string): Promise<TestTargetGroup> {
    const testTargetGroup = await getRepository(TestTargetGroupEntity).findOne(
      testTargetGroupId,
      { relations: ["testTargets"] }
    );

    if (!testTargetGroup) {
      throw new Error(`TestTargetGroup not found. ${testTargetGroupId}`);
    }

    return this.testTargetGroupIdEntityToResponse(testTargetGroup.id);
  }

  public async post(body: {
    testMatrixId: string;
    name: string;
  }): Promise<TestTargetGroup> {
    const testMatrix = await getRepository(TestMatrixEntity).findOne(
      body.testMatrixId,
      {
        relations: ["testTargetGroups"],
      }
    );
    if (!testMatrix) {
      throw new Error(`TestMatrix not found. ${body.testMatrixId}`);
    }
    const testTargetGroup = new TestTargetGroupEntity();
    testTargetGroup.name = body.name;
    testTargetGroup.index = testMatrix.testTargetGroups.length;
    testTargetGroup.testMatrix = testMatrix;

    const savedTestTargetGroup = await getRepository(
      TestTargetGroupEntity
    ).save(testTargetGroup);
    return this.testTargetGroupIdEntityToResponse(savedTestTargetGroup.id);
  }

  public async patch(
    testTargetGroupId: string,
    body: { name: string }
  ): Promise<TestTargetGroup> {
    const testTargetGroupRepository = getRepository(TestTargetGroupEntity);
    let testTargetGroup = await testTargetGroupRepository.findOne(
      testTargetGroupId
    );
    if (!testTargetGroup) {
      throw new Error(`TestTargetGroup not found. ${testTargetGroupId}`);
    }
    if (testTargetGroup.name !== body.name) {
      testTargetGroup.name = body.name;
      testTargetGroup = await testTargetGroupRepository.save(testTargetGroup);
    }
    return this.testTargetGroupIdEntityToResponse(testTargetGroup.id);
  }

  public async delete(
    testTargetGroupId: string,
    transactionRunner: TransactionRunner
  ): Promise<void> {
    const testTargetGroupRepository = getRepository(TestTargetGroupEntity);
    const testTargetGroup = await testTargetGroupRepository.findOne(
      testTargetGroupId,
      { relations: ["testMatrix"] }
    );

    if (!testTargetGroup) {
      throw new Error(`TestTargetGroup not found. ${testTargetGroupId}`);
    }

    await transactionRunner.waitAndRun(async (transactionalEntityManager) => {
      await transactionalEntityManager.delete(
        TestTargetGroupEntity,
        testTargetGroupId
      );
      const testMatrix = await transactionalEntityManager.findOne(
        TestMatrixEntity,
        testTargetGroup.testMatrix.id,
        { relations: ["testTargetGroups"] }
      );

      if (!testMatrix) {
        throw new Error(
          `TestMatrix not found.: ${testTargetGroup.testMatrix.id}`
        );
      }

      await Promise.all(
        testMatrix.testTargetGroups
          .sort((group1, group2) => {
            return group1.index - group2.index;
          })
          .map(async (testTargetGroup, index) => {
            testTargetGroup.index = index;
            return await transactionalEntityManager.save(testTargetGroup);
          })
      );
    });

    return;
  }

  private async testTargetGroupIdEntityToResponse(
    testTargetGroupId: string
  ): Promise<TestTargetGroup> {
    const testTargetGroup = await getRepository(TestTargetGroupEntity).findOne(
      testTargetGroupId,
      { relations: ["testTargets"] }
    );

    if (!testTargetGroup) {
      throw new Error(`TestTargetGroup not found. ${testTargetGroupId}`);
    }

    return {
      id: testTargetGroup.id,
      name: testTargetGroup.name,
      index: testTargetGroup.index,
      testTargets: (testTargetGroup.testTargets ?? [])
        .sort((testTarget1, testTarget2) => {
          return testTarget1.index - testTarget2.index;
        })
        .map((testTarget) => {
          return {
            id: testTarget.id,
            name: testTarget.name,
            index: testTarget.index,
            plans: JSON.parse(testTarget.text),
          };
        }),
    };
  }
}
