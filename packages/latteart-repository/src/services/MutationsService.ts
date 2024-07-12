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

        const fileName = `mutation_${testResultId}_${screenMutation.timestamp}.png`;
        await screenshotFileRepository.outputFile(
          fileName,
          screenMutation.imageData,
          "base64"
        );
        const fileUrl = screenMutation.imageData
          ? screenshotFileRepository.getFileUrl(fileName)
          : "";

        const screenshotEntity = await entityManager.save(ScreenshotEntity, {
          fileUrl,
        });

        const results = [];
        for (const mutation of requestBody) {
          const mutationEntity = new MutationEntity();
          mutationEntity.testResult = newTestResult;
          mutationEntity.elementMutations = JSON.stringify(
            mutation.elementMutations
          );
          mutationEntity.screenshot = screenshotEntity;
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
            fileUrl: screenshotEntity.fileUrl,
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
}
