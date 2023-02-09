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

import { NoteEntity } from "@/entities/NoteEntity";
import { ScreenshotEntity } from "@/entities/ScreenshotEntity";
import { TestPurposeEntity } from "@/entities/TestPurposeEntity";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { TestStepEntity } from "@/entities/TestStepEntity";
import {
  GetTestStepResponse,
  CreateTestStepDto,
  CreateTestStepResponse,
  PatchTestStepResponse,
  ElementInfo,
} from "@/interfaces/TestSteps";
import { getRepository } from "typeorm";
import { TimestampService } from "./TimestampService";
import { ImageFileRepositoryService } from "./ImageFileRepositoryService";
import { CoverageSourceEntity } from "@/entities/CoverageSourceEntity";
import { ConfigsService } from "./ConfigsService";

export interface TestStepService {
  getTestStep(testStepId: string): Promise<GetTestStepResponse>;

  createTestStep(
    testResultId: string,
    requestBody: CreateTestStepDto
  ): Promise<CreateTestStepResponse>;

  attachNotesToTestStep(
    testStepId: string,
    noteIds: string[]
  ): Promise<PatchTestStepResponse>;

  attachTestPurposeToTestStep(
    testStepId: string,
    testPurposeId: string | null
  ): Promise<PatchTestStepResponse>;

  getTestStepOperation(testStepId: string): Promise<{
    input: string;
    type: string;
    elementInfo: any;
    title: string;
    url: string;
    imageFileUrl: string;
    timestamp: string;
    inputElements: any;
    windowHandle: string;
    keywordTexts: any;
    isAutomatic: boolean;
  }>;

  getTestStepScreenshot(
    testStepId: string
  ): Promise<{ id: string; fileUrl: string }>;
}

export class TestStepServiceImpl implements TestStepService {
  constructor(
    private service: {
      imageFileRepository: ImageFileRepositoryService;
      timestamp: TimestampService;
      config: ConfigsService;
    }
  ) {}

  public async getTestStep(testStepId: string): Promise<GetTestStepResponse> {
    const testStepEntity = await this.getTestStepEntity(testStepId);

    return this.convertTestStepEntityToTestStep(testStepEntity);
  }

  public async createTestStep(
    testResultId: string,
    requestBody: CreateTestStepDto
  ): Promise<CreateTestStepResponse> {
    // update test result.
    const testResultEntity = await getRepository(
      TestResultEntity
    ).findOneOrFail(testResultId, {
      relations: ["coverageSources"],
    });

    const targetCoverageSource = testResultEntity.coverageSources?.find(
      (coverageSource) => {
        return (
          coverageSource.title === requestBody.title &&
          coverageSource.url === requestBody.url
        );
      }
    );
    if (targetCoverageSource) {
      const newElements: ElementInfo[] = [
        ...JSON.parse(targetCoverageSource.screenElements),
        ...(await this.removeIgnoreTagsFrom(requestBody.screenElements)),
      ];
      targetCoverageSource.screenElements = JSON.stringify(
        newElements.filter((newElement, index) => {
          return (
            newElements.findIndex((elem) => elem.xpath === newElement.xpath) ===
            index
          );
        })
      );
    } else {
      testResultEntity.coverageSources?.push(
        new CoverageSourceEntity({
          title: requestBody.title,
          url: requestBody.url,
          screenElements: JSON.stringify(requestBody.screenElements),
          testResult: testResultEntity,
        })
      );
    }

    // update testingTime and lastUpdateTimestamp
    const startTimeStamp = testResultEntity.startTimestamp;
    const lastUpdateTimeStamp = testResultEntity.lastUpdateTimestamp;
    const testStepTimeStamp = requestBody.timestamp;

    if (lastUpdateTimeStamp > startTimeStamp) {
      const testingTime = testStepTimeStamp - lastUpdateTimeStamp;
      testResultEntity.testingTime = testResultEntity.testingTime + testingTime;
    }
    testResultEntity.lastUpdateTimestamp = testStepTimeStamp;

    const savedTestResultEntity = await getRepository(TestResultEntity).save({
      ...testResultEntity,
    });

    // add test step.
    const newTestStepEntity = await getRepository(TestStepEntity).save({
      pageTitle: requestBody.title,
      pageUrl: requestBody.url,
      operationType: requestBody.type,
      operationInput: requestBody.input,
      operationElement: JSON.stringify(requestBody.elementInfo),
      inputElements: JSON.stringify(requestBody.inputElements),
      windowHandle: requestBody.windowHandle,
      keywordTexts: JSON.stringify(requestBody.keywordTexts ?? []),
      timestamp: requestBody.timestamp,
      testResult: savedTestResultEntity,
      isAutomatic: !!requestBody.isAutomatic,
    });
    const screenshot = new ScreenshotEntity({
      fileUrl: await this.service.imageFileRepository.writeBase64ToFile(
        `${newTestStepEntity.id}.png`,
        requestBody.imageData
      ),
      testResult: savedTestResultEntity,
    });
    newTestStepEntity.screenshot = screenshot;
    const savedTestStepEntity = await getRepository(TestStepEntity).save(
      newTestStepEntity
    );

    // result operation.
    const operation = await this.getOperationFromTestStepEntity(
      savedTestStepEntity
    );

    // result coverage source.
    const savedCoverageSourceEntity =
      savedTestResultEntity.coverageSources?.find(
        ({ url, title }) =>
          url === requestBody.url && title === requestBody.title
      );
    const coverageSource = {
      title: savedCoverageSourceEntity?.title ?? "",
      url: savedCoverageSourceEntity?.url ?? "",
      screenElements: savedCoverageSourceEntity
        ? JSON.parse(savedCoverageSourceEntity.screenElements)
        : [],
    };

    return {
      id: newTestStepEntity.id,
      operation,
      coverageSource,
    };
  }

  public async attachNotesToTestStep(
    testStepId: string,
    noteIds: string[]
  ): Promise<PatchTestStepResponse> {
    const testStepEntity = await this.getTestStepEntity(testStepId);

    const noteEntities = (
      await Promise.all(
        noteIds.map(async (noteId) => {
          const noteEntity = await getRepository(NoteEntity).findOne(noteId);

          return noteEntity ? [noteEntity] : [];
        })
      )
    ).flat();

    testStepEntity.notes = [...noteEntities];

    const updatedTestStepEntity = await getRepository(TestStepEntity).save(
      testStepEntity
    );

    return this.convertTestStepEntityToTestStep(updatedTestStepEntity);
  }

  public async attachTestPurposeToTestStep(
    testStepId: string,
    testPurposeId: string | null
  ): Promise<PatchTestStepResponse> {
    const testStepEntity = await this.getTestStepEntity(testStepId);

    const noteEntity = testPurposeId
      ? (await getRepository(TestPurposeEntity).findOne(testPurposeId)) ?? null
      : null;

    testStepEntity.testPurpose = noteEntity;

    const updatedTestStepEntity = await getRepository(TestStepEntity).save(
      testStepEntity
    );

    return this.convertTestStepEntityToTestStep(updatedTestStepEntity);
  }

  public async getTestStepOperation(testStepId: string): Promise<{
    input: string;
    type: string;
    elementInfo: any;
    title: string;
    url: string;
    imageFileUrl: string;
    timestamp: string;
    inputElements: any;
    windowHandle: string;
    keywordTexts: any;
    isAutomatic: boolean;
  }> {
    const testStepEntity = await getRepository(TestStepEntity).findOneOrFail(
      testStepId,
      {
        relations: ["screenshot"],
      }
    );

    return this.getOperationFromTestStepEntity(testStepEntity);
  }

  public async getTestStepScreenshot(
    testStepId: string
  ): Promise<{ id: string; fileUrl: string }> {
    const testStepEntity = await getRepository(TestStepEntity).findOne(
      testStepId,
      {
        relations: ["screenshot"],
      }
    );

    return {
      id: testStepEntity?.screenshot?.id ?? "",
      fileUrl: testStepEntity?.screenshot?.fileUrl ?? "",
    };
  }

  private async getOperationFromTestStepEntity(testStepEntity: TestStepEntity) {
    return {
      input: testStepEntity.operationInput,
      type: testStepEntity.operationType,
      elementInfo: JSON.parse(testStepEntity.operationElement),
      title: testStepEntity.pageTitle,
      url: testStepEntity.pageUrl,
      imageFileUrl: testStepEntity.screenshot?.fileUrl ?? "",
      timestamp: testStepEntity.timestamp.toString(),
      inputElements: JSON.parse(testStepEntity.inputElements),
      windowHandle: testStepEntity.windowHandle,
      keywordTexts: JSON.parse(testStepEntity.keywordTexts),
      isAutomatic: !!testStepEntity.isAutomatic,
    };
  }

  private async convertTestStepEntityToTestStep(entity: TestStepEntity) {
    return {
      id: entity.id,
      operation: await this.getOperationFromTestStepEntity(entity),
      intention: entity.testPurpose ? entity.testPurpose.id : null,
      bugs: [],
      notices: entity.notes?.map((note) => note.id) ?? [],
    };
  }

  private async getTestStepEntity(testStepId: string) {
    return getRepository(TestStepEntity).findOneOrFail(testStepId, {
      relations: ["notes", "testPurpose", "screenshot"],
    });
  }

  private async removeIgnoreTagsFrom(screenElements: ElementInfo[]) {
    const ignoreTags = (await this.service.config.getConfig("")).captureSettings
      .ignoreTags;

    return screenElements.filter((elmInfo) => {
      return !(
        ignoreTags.includes(elmInfo.tagname.toUpperCase()) ||
        ignoreTags.includes(elmInfo.tagname.toLowerCase())
      );
    });
  }
}
