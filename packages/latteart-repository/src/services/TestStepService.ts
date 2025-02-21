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
} from "@/interfaces/TestSteps";
import { TimestampService } from "./TimestampService";
import { CoverageSourceEntity } from "@/entities/CoverageSourceEntity";
import { ConfigsService } from "./ConfigsService";
import { ElementInfo } from "@/domain/types";
import { FileRepository } from "@/interfaces/fileRepository";
import {
  coverageSourceEntityToResponse,
  testStepEntityToResponse,
  convertToTestStepOperation,
} from "./helper/entityToResponse";
import { SettingsUtility } from "@/gateways/settings/SettingsUtility";
import { VideoEntity } from "@/entities/VideoEntity";
import { DataSource } from "typeorm";
import { mergeCoverage } from "./helper/coverageHelper";

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

  getTestStepOperation(
    testStepId: string
  ): Promise<GetTestStepResponse["operation"]>;

  getTestStepScreenshot(
    testStepId: string
  ): Promise<{ id: string; fileUrl: string }>;
}

export class TestStepServiceImpl implements TestStepService {
  constructor(
    private dataSource: DataSource,
    private service: {
      screenshotFileRepository: FileRepository;
      timestamp: TimestampService;
      config: ConfigsService;
    }
  ) {}

  public async getTestStep(testStepId: string): Promise<GetTestStepResponse> {
    const testStepEntity = await this.getTestStepEntity(testStepId);

    return testStepEntityToResponse(testStepEntity);
  }

  public async createTestStep(
    testResultId: string,
    requestBody: CreateTestStepDto
  ): Promise<CreateTestStepResponse> {
    // update test result.
    const testResultEntity = await this.dataSource
      .getRepository(TestResultEntity)
      .findOneOrFail({
        where: { id: testResultId },
        relations: ["coverageSources"],
      });

    const screenElements = requestBody.screenElements
      .map((screenElement) => {
        return screenElement.elements.map((element) => {
          return screenElement.iframeIndex === undefined
            ? element
            : {
                ...element,
                iframe: {
                  index: screenElement.iframeIndex,
                },
              };
        });
      })
      .flat();

    const inputElements = this.createInputElements(screenElements);

    mergeCoverage(
      testResultEntity,
      screenElements,
      requestBody.url,
      requestBody.title
    );

    // update testingTime and lastUpdateTimestamp
    const savedTestResultEntity = await this.updateTestResultTimeStamp(
      testResultEntity,
      requestBody.timestamp
    );

    // add test step.
    const keywordTexts = screenElements
      .map((screenElement) => {
        return {
          tagname: screenElement.tagname,
          value: screenElement.textWithoutChildren ?? "",
        };
      })
      .filter(({ value }) => value);
    const newTestStepEntity = await this.dataSource
      .getRepository(TestStepEntity)
      .save({
        pageTitle: requestBody.title,
        pageUrl: requestBody.url,
        operationType: requestBody.type,
        operationInput: requestBody.input,
        operationElement: JSON.stringify(requestBody.elementInfo),
        inputElements: JSON.stringify(inputElements),
        windowHandle: requestBody.windowHandle,
        keywordTexts: JSON.stringify(keywordTexts),
        timestamp: requestBody.timestamp,
        testResult: savedTestResultEntity,
        isAutomatic: !!requestBody.isAutomatic,
        scrollPositionX: requestBody.scrollPosition?.x,
        scrollPositionY: requestBody.scrollPosition?.y,
        clientSizeWidth: requestBody.clientSize?.width,
        clientSizeHeight: requestBody.clientSize?.height,
      });

    if (requestBody.imageData) {
      const fileName = `${newTestStepEntity.id}.png`;
      await this.service.screenshotFileRepository.outputFile(
        fileName,
        requestBody.imageData,
        "base64"
      );
      const screenshot = new ScreenshotEntity({
        fileUrl: this.service.screenshotFileRepository.getFileUrl(fileName),
      });
      newTestStepEntity.screenshot = screenshot;
    }

    if (requestBody.videoId) {
      const video = await this.dataSource
        .getRepository(VideoEntity)
        .findOneByOrFail({
          id: requestBody.videoId,
        });
      newTestStepEntity.video = video;
      newTestStepEntity.videoTime = requestBody.videoTime ?? 0;
    }

    const savedTestStepEntity = await this.dataSource
      .getRepository(TestStepEntity)
      .save(newTestStepEntity);

    // result operation.
    const operation = convertToTestStepOperation(savedTestStepEntity);

    // result coverage source.
    const savedCoverageSourceEntity =
      savedTestResultEntity.coverageSources?.find(
        ({ url, title }) =>
          url === requestBody.url && title === requestBody.title
      );
    const coverageSource = coverageSourceEntityToResponse(
      savedCoverageSourceEntity
    );

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
          const noteEntity = await this.dataSource
            .getRepository(NoteEntity)
            .findOneBy({
              id: noteId,
            });

          return noteEntity ? [noteEntity] : [];
        })
      )
    ).flat();

    testStepEntity.notes = [...noteEntities];

    const updatedTestStepEntity = await this.dataSource
      .getRepository(TestStepEntity)
      .save(testStepEntity);

    return testStepEntityToResponse(updatedTestStepEntity);
  }

  public async attachTestPurposeToTestStep(
    testStepId: string,
    testPurposeId: string | null
  ): Promise<PatchTestStepResponse> {
    const testStepEntity = await this.getTestStepEntity(testStepId);

    const noteEntity = testPurposeId
      ? ((await this.dataSource.getRepository(TestPurposeEntity).findOneBy({
          id: testPurposeId,
        })) ?? null)
      : null;

    testStepEntity.testPurpose = noteEntity;

    const updatedTestStepEntity = await this.dataSource
      .getRepository(TestStepEntity)
      .save(testStepEntity);

    return testStepEntityToResponse(updatedTestStepEntity);
  }

  public async getTestStepOperation(
    testStepId: string
  ): Promise<GetTestStepResponse["operation"]> {
    const testStepEntity = await this.dataSource
      .getRepository(TestStepEntity)
      .findOneOrFail({
        where: { id: testStepId },
        relations: ["screenshot", "video"],
      });

    return convertToTestStepOperation(testStepEntity);
  }

  public async getTestStepScreenshot(
    testStepId: string
  ): Promise<{ id: string; fileUrl: string }> {
    const testStepEntity = await this.dataSource
      .getRepository(TestStepEntity)
      .findOne({
        where: { id: testStepId },
        relations: ["screenshot", "video"],
      });

    return {
      id: testStepEntity?.screenshot?.id ?? "",
      fileUrl: testStepEntity?.screenshot?.fileUrl ?? "",
    };
  }

  private async getTestStepEntity(testStepId: string) {
    return this.dataSource.getRepository(TestStepEntity).findOneOrFail({
      where: { id: testStepId },
      relations: ["notes", "testPurpose", "screenshot", "video"],
    });
  }

  private async updateTestResultTimeStamp(
    testResultEntity: TestResultEntity,
    testStepTimeStamp: number
  ) {
    const startTimeStamp = testResultEntity.startTimestamp;
    const lastUpdateTimeStamp = testResultEntity.lastUpdateTimestamp;

    if (lastUpdateTimeStamp > startTimeStamp) {
      const testingTime = testStepTimeStamp - lastUpdateTimeStamp;
      testResultEntity.testingTime = testResultEntity.testingTime + testingTime;
    }

    testResultEntity.lastUpdateTimestamp = testStepTimeStamp;

    return await this.dataSource.getRepository(TestResultEntity).save({
      ...testResultEntity,
    });
  }

  private createInputElements(screenElements: ElementInfo[]) {
    const inputElementsFilter = (elmInfo: ElementInfo) => {
      let expected = false;
      switch (elmInfo.tagname.toLowerCase()) {
        case "input":
          if (
            !!elmInfo.attributes.type &&
            elmInfo.attributes.type !== "button" &&
            elmInfo.attributes.type !== "submit"
          ) {
            expected = true;
          }
          break;
        case "select":
        case "textarea":
          expected = true;
          break;
        default:
          break;
      }
      return expected;
    };
    return [...screenElements.filter(inputElementsFilter).flat()];
  }
}
