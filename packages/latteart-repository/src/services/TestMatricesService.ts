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

import { ProjectEntity } from "@/entities/ProjectEntity";
import { TestMatrixEntity } from "@/entities/TestMatrixEntity";
import { ViewPointEntity } from "@/entities/ViewPointEntity";
import { TestMatrix } from "@/interfaces/TestMatrices";
import { TransactionRunner } from "@/TransactionRunner";
import { getRepository } from "typeorm";

export class TestMatricesService {
  public async get(testMatrixId: string): Promise<TestMatrix> {
    const testMatrix = await getRepository(TestMatrixEntity).findOne(
      testMatrixId,
      { relations: ["testTargetGroups", "viewPoints"] }
    );

    if (!testMatrix) {
      throw new Error(`TestMatrix not found. ${testMatrixId}`);
    }

    return this.testMatrixIdToResponse(testMatrix.id);
  }

  public async post(body: {
    projectId: string;
    name: string;
  }): Promise<TestMatrix> {
    const projectEntity = await getRepository(ProjectEntity).findOne(
      body.projectId,
      {
        relations: ["testMatrices"],
      }
    );
    if (!projectEntity) {
      throw new Error(`Project not found. ${body.projectId}`);
    }
    const nextIndex = projectEntity.testMatrices.length;
    const testMatrix = await getRepository(TestMatrixEntity).save(
      new TestMatrixEntity(body.name, nextIndex, projectEntity)
    );
    return this.testMatrixIdToResponse(testMatrix.id);
  }

  public async patch(
    testMatrixId: string,
    body: { name: string }
  ): Promise<TestMatrix> {
    const testMatrixRepository = getRepository(TestMatrixEntity);
    let testMatrix = await testMatrixRepository.findOne(testMatrixId);
    if (!testMatrix) {
      throw new Error(`TestMatrix not found. ${testMatrixId}`);
    }
    if (testMatrix.name !== body.name) {
      testMatrix.name = body.name;
      testMatrix = await testMatrixRepository.save(testMatrix);
    }
    return this.testMatrixIdToResponse(testMatrix.id);
  }

  public async delete(
    testMatrixId: string,
    transactionRunner: TransactionRunner
  ): Promise<void> {
    const testMatrixRepository = getRepository(TestMatrixEntity);
    const testMatrix = await testMatrixRepository.findOne(testMatrixId, {
      relations: ["project", "viewPoints"],
    });
    if (!testMatrix) {
      throw new Error(`TestMatrix not found. ${testMatrixId}`);
    }

    await transactionRunner.waitAndRun(async (transactionalEntityManager) => {
      await Promise.all(
        testMatrix.viewPoints.map(async (viewPoint) => {
          await transactionalEntityManager.delete(
            ViewPointEntity,
            viewPoint.id
          );
        })
      );
      await transactionalEntityManager.delete(TestMatrixEntity, testMatrixId);
      const project = await transactionalEntityManager.findOne(
        ProjectEntity,
        testMatrix.project.id,
        {
          relations: ["testMatrices"],
        }
      );
      if (!project) {
        throw new Error(`Project not found.: ${testMatrix.project.id}`);
      }

      await Promise.all(
        project.testMatrices
          .sort((testMatrix1, testMatrix2) => {
            return testMatrix1.index - testMatrix2.index;
          })
          .map(async (testMatrix, index) => {
            testMatrix.index = index;
            return await transactionalEntityManager.save(testMatrix);
          })
      );
    });

    return;
  }

  private async testMatrixIdToResponse(
    testMatrixId: string
  ): Promise<TestMatrix> {
    const testMatrix = await getRepository(TestMatrixEntity).findOne(
      testMatrixId,
      {
        relations: [
          "testTargetGroups",
          "testTargetGroups.testTargets",
          "viewPoints",
        ],
      }
    );
    if (!testMatrix) {
      throw new Error(`TestMatrix not found. ${testMatrix}`);
    }

    const orderByIndex = (val1: any, val2: any) => {
      return val1.index - val2.index;
    };

    return {
      id: testMatrix.id,
      name: testMatrix.name,
      index: testMatrix.index,
      groups: (testMatrix.testTargetGroups ?? [])
        .sort(orderByIndex)
        .map((group) => {
          return {
            id: group.id,
            name: group.name,
            index: group.index,
            testTargets: (group.testTargets ?? [])
              .sort(orderByIndex)
              .map((testTarget) => {
                return {
                  id: testTarget.id,
                  name: testTarget.name,
                  index: testTarget.index,
                  plans: JSON.parse(testTarget.text),
                };
              }),
          };
        }),
      viewPoints: (testMatrix.viewPoints ?? [])
        .sort(orderByIndex)
        .map((viewPoint, index) => {
          return {
            id: viewPoint.id,
            name: viewPoint.name,
            index,
            description: viewPoint.description ?? "",
          };
        }),
    };
  }
}
