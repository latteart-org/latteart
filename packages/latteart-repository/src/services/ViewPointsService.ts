/**
 * Copyright 2024 NTT Corporation.
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
import { TestMatrixEntity } from "@/entities/TestMatrixEntity";
import { ViewPointEntity } from "@/entities/ViewPointEntity";
import { ViewPoint } from "@/interfaces/ViewPoints";
import { TransactionRunner } from "@/TransactionRunner";
import { DataSource } from "typeorm";

export class ViewPointsService {
  constructor(private dataSource: DataSource) {}

  public async get(viewPointId: string): Promise<ViewPoint> {
    const viewPoint = await this.dataSource
      .getRepository(ViewPointEntity)
      .findOneBy({
        id: viewPointId,
      });

    if (!viewPoint) {
      throw new Error(`ViewPoint not found. ${viewPointId}`);
    }

    return this.viewPointEntityToResponse(viewPoint);
  }

  public async post(
    body: {
      testMatrixId: string;
      index: number;
      name: string;
      description: string;
    },
    transactionRunner: TransactionRunner
  ): Promise<ViewPoint> {
    const testMatrix = await this.dataSource
      .getRepository(TestMatrixEntity)
      .findOne({
        where: {
          id: body.testMatrixId,
        },
        relations: [
          "testTargetGroups",
          "testTargetGroups.testTargets",
          "viewPoints",
        ],
      });
    if (!testMatrix) {
      throw new Error(`TestMatrix not found. ${body.testMatrixId}`);
    }

    return (await transactionRunner.waitAndRun(
      async (transactionalEntityManager) => {
        const viewPoint = new ViewPointEntity();
        viewPoint.name = body.name;
        viewPoint.index = body.index;
        viewPoint.description = body.description;
        viewPoint.testMatrices = [testMatrix];

        const savedViewPoint = await transactionalEntityManager.save(viewPoint);

        if (!savedViewPoint) {
          throw new Error(`Save failed.`);
        }

        await Promise.all(
          testMatrix.testTargetGroups.map(async (testTargetGroup) => {
            await Promise.all(
              testTargetGroup.testTargets.map(async (testTarget) => {
                const newStory = new StoryEntity();
                newStory.status = "out-of-scope";
                newStory.index = 0;
                newStory.planedSessionNumber = 0;
                newStory.testMatrix = testMatrix;
                newStory.viewPoint = viewPoint;
                newStory.testTarget = testTarget;
                await transactionalEntityManager.save(newStory);
              })
            );
          })
        );
        return this.viewPointEntityToResponse(savedViewPoint);
      }
    )) as unknown as ViewPoint;
  }

  public async patch(
    viewPointId: string,
    body: { name?: string; description?: string; index?: number }
  ): Promise<ViewPoint> {
    const viewPointRepository = this.dataSource.getRepository(ViewPointEntity);
    const viewPoint = await viewPointRepository.findOneBy({ id: viewPointId });
    if (!viewPoint) {
      throw new Error(`ViewPoint found. ${viewPointId}`);
    }

    if (body.name && viewPoint.name !== body.name) {
      viewPoint.name = body.name;
    }

    if (body.description && viewPoint.description !== body.description) {
      viewPoint.description = body.description;
    }

    if (body.index !== undefined && viewPoint.index !== body.index) {
      viewPoint.index = body.index;
    }

    const savedViewPoint = await viewPointRepository.save(viewPoint);

    return this.viewPointEntityToResponse(savedViewPoint);
  }

  public async delete(viewPointId: string): Promise<void> {
    await this.dataSource.getRepository(ViewPointEntity).delete(viewPointId);
    return;
  }

  private viewPointEntityToResponse(viewPoint: ViewPointEntity): ViewPoint {
    return {
      id: viewPoint.id,
      name: viewPoint.name,
      index: viewPoint.index,
      description: viewPoint.description ?? "",
    };
  }
}
