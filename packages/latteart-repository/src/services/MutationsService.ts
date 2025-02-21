/**
 * Copyright 2025 NTT Corporation.
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

import { ScreenshotEntity } from "../entities/ScreenshotEntity";
import { TestResultEntity } from "../entities/TestResultEntity";
import { FileRepository } from "../interfaces/fileRepository";

import { DataSource } from "typeorm";
import {
  CreateMutationDto,
  CreateMutationResponse,
} from "../interfaces/Mutations";

import { MutationEntity } from "../entities/MutationEntity";
import { TransactionRunner } from "@/TransactionRunner";
import { ElementInfo } from "@/domain/types";
import { mergeCoverage } from "./helper/coverageHelper";
import { ImportMutationData } from "./helper/mutationHelper";
import path from "path";

export class MutationService {
  constructor(private dataSource: DataSource) {}

  public async createMutation(
    testResultId: string,
    requestBody: CreateMutationDto[],
    transactionRunner: TransactionRunner,
    screenshotFileRepository: FileRepository
  ): Promise<CreateMutationResponse[]> {
    return (await transactionRunner.waitAndRun(
      async (entityManager): Promise<CreateMutationResponse[]> => {
        const testResultEntity = await entityManager.findOne(TestResultEntity, {
          where: { id: testResultId },
          relations: ["coverageSources"],
        });

        if (!testResultEntity) {
          throw new Error("test result not found");
        }

        const elements: ElementInfo[] = [];
        requestBody.forEach((screenMutation) => {
          screenMutation.elementMutations.forEach((mutation) => {
            switch (mutation.type) {
              case "childElementAddition":
                elements.push(mutation.addedChildElement);
                break;
              case "attributeAddition":
              case "attributeRemoval":
              case "attributeChange":
              case "textContentAddition":
              case "textContentRemoval":
              case "textContentChange":
                elements.push(mutation.targetElement);
                break;
              default:
                break;
            }
          });
        });

        const screenMutation = requestBody[0];
        if (elements.length >= 1) {
          mergeCoverage(
            testResultEntity,
            elements,
            screenMutation.url,
            screenMutation.title
          );
        }
        const newTestResult = await entityManager.save(testResultEntity);

        let screenshotEntity: ScreenshotEntity | undefined;
        if (screenMutation.imageData) {
          const fileName = `mutation_${testResultId}_${screenMutation.timestamp}.png`;
          await screenshotFileRepository.outputFile(
            fileName,
            screenMutation.imageData,
            "base64"
          );
          const fileUrl = screenMutation.imageData
            ? screenshotFileRepository.getFileUrl(fileName)
            : "";

          screenshotEntity = await entityManager.save(ScreenshotEntity, {
            fileUrl,
          });
        }

        const results = [];
        for (const mutation of requestBody) {
          const mutationEntity = new MutationEntity();
          mutationEntity.testResult = newTestResult;
          mutationEntity.elementMutations = JSON.stringify(
            mutation.elementMutations
          );
          if (screenshotEntity) {
            mutationEntity.screenshot = screenshotEntity;
          }
          mutationEntity.timestamp = mutation.timestamp;
          mutationEntity.windowHandle = mutation.windowHandle;
          mutationEntity.scrollPositionX = mutation.scrollPosition.x;
          mutationEntity.scrollPositionY = mutation.scrollPosition.y;
          mutationEntity.clientSizeHeight = mutation.clientSize.height;
          mutationEntity.clientSizeWidth = mutation.clientSize.width;
          mutationEntity.url = mutation.url;
          mutationEntity.title = mutation.title;

          results.push(await entityManager.save(mutationEntity));
        }

        return results.map((result) => {
          return {
            id: result.id,
            testResultEntity: testResultEntity.id,
            elementMutations: JSON.parse(result.elementMutations),
            timestamp: result.timestamp,
            fileUrl: screenshotEntity?.fileUrl ?? "",
            windowHandle: result.windowHandle,
            url: result.url,
            title: result.title,
            scrollPosition: {
              x: result.scrollPositionX,
              y: result.scrollPositionY,
            },
            clientSize: {
              width: result.clientSizeWidth,
              height: result.clientSizeHeight,
            },
          };
        });
      }
    )) as CreateMutationResponse[];
  }

  public async getMutationEntities(
    testResultId: string
  ): Promise<MutationEntity[]> {
    return await this.dataSource.getRepository(MutationEntity).find({
      relations: ["screenshot"],
      where: { testResult: { id: testResultId } },
      order: { timestamp: "ASC" },
    });
  }

  public async importMutations(
    data: {
      testResultId: string;
      data: ImportMutationData[];
    }[],
    mutationImageFiles: {
      filePath: string;
      data: string | Buffer;
    }[],
    screenshotFileRepository: FileRepository
  ) {
    const testResultEntities = await this.dataSource
      .getRepository(TestResultEntity)
      .find();

    const mutationRepository = this.dataSource.getRepository(MutationEntity);
    const screenshotRepository =
      this.dataSource.getRepository(ScreenshotEntity);

    await Promise.all(
      data.map(async (mutationsData) => {
        const testResult = testResultEntities.find(
          (e) => e.id === mutationsData.testResultId
        );
        if (!testResult) {
          return;
        }
        await Promise.all(
          mutationsData.data.map(async (mutation) => {
            const oldFileName = path.basename(mutation.screenshot);

            const targetFile = mutationImageFiles.find(
              (file) => path.basename(file.filePath) === oldFileName
            );

            const mutationEntity = new MutationEntity();
            if (targetFile) {
              const fileName = `mutation_${testResult.id}_${mutation.timestamp}.png`;
              await screenshotFileRepository.outputFile(
                fileName,
                targetFile.data
              );

              const screenshotEntity = new ScreenshotEntity();
              screenshotEntity.fileUrl =
                screenshotFileRepository.getFileUrl(fileName);
              mutationEntity.screenshot =
                await screenshotRepository.save(screenshotEntity);
            }

            mutationEntity.testResult = testResult;
            mutationEntity.elementMutations = mutation.elementMutations;
            mutationEntity.timestamp = mutation.timestamp;
            mutationEntity.windowHandle = mutation.windowHandle;
            mutationEntity.scrollPositionX = mutation.scrollPositionX;
            mutationEntity.scrollPositionY = mutation.scrollPositionY;
            mutationEntity.clientSizeWidth = mutation.clientSizeWidth;
            mutationEntity.clientSizeHeight = mutation.clientSizeHeight;
            mutationEntity.url = mutation.url;
            mutationEntity.title = mutation.title;
            await mutationRepository.save(mutationEntity);
          })
        );
      })
    );
  }
}
