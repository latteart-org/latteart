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
  ScreenElementsPerIframe,
} from "@/interfaces/TestSteps";
import { getRepository } from "typeorm";
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
    const testResultEntity = await getRepository(
      TestResultEntity
    ).findOneOrFail(testResultId, {
      relations: ["coverageSources"],
    });

    const screenElements = requestBody.screenElementsPerIframe
      .map((e) => {
        return e.screenElements.map((e2) => {
          e2.iframeIndex = e.iframeIndex;
          return e2;
        });
      })
      .flat();

    const inputElements = this.createInputElements(requestBody);

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
        ...(await this.removeIgnoreTagsFrom(screenElements)),
      ];
      targetCoverageSource.screenElements = JSON.stringify(
        newElements.filter((newElement, index) => {
          return (
            newElements.findIndex(
              (elem) =>
                elem.xpath + elem.iframeIndex ===
                newElement.xpath + newElement.iframeIndex
            ) === index
          );
        })
      );
    } else {
      testResultEntity.coverageSources?.push(
        new CoverageSourceEntity({
          title: requestBody.title,
          url: requestBody.url,
          screenElements: JSON.stringify(screenElements),
          testResult: testResultEntity,
        })
      );
    }

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
    const newTestStepEntity = await getRepository(TestStepEntity).save({
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
      iframeIndex: requestBody.iframeIndex,
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
        testResult: savedTestResultEntity,
      });
      newTestStepEntity.screenshot = screenshot;
    }

    const savedTestStepEntity = await getRepository(TestStepEntity).save(
      newTestStepEntity
    );

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
          const noteEntity = await getRepository(NoteEntity).findOne(noteId);

          return noteEntity ? [noteEntity] : [];
        })
      )
    ).flat();

    testStepEntity.notes = [...noteEntities];

    const updatedTestStepEntity = await getRepository(TestStepEntity).save(
      testStepEntity
    );

    return testStepEntityToResponse(updatedTestStepEntity);
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

    return testStepEntityToResponse(updatedTestStepEntity);
  }

  public async getTestStepOperation(
    testStepId: string
  ): Promise<GetTestStepResponse["operation"]> {
    const testStepEntity = await getRepository(TestStepEntity).findOneOrFail(
      testStepId,
      {
        relations: ["screenshot"],
      }
    );

    return convertToTestStepOperation(testStepEntity);
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

  private async getTestStepEntity(testStepId: string) {
    return getRepository(TestStepEntity).findOneOrFail(testStepId, {
      relations: ["notes", "testPurpose", "screenshot"],
    });
  }

  private async removeIgnoreTagsFrom(screenElements: ElementInfo[]) {
    const ignoreTags = SettingsUtility.getSetting(
      "captureSettings.ignoreTags"
    ) as string[];

    return screenElements.filter((elmInfo) => {
      return !(
        ignoreTags.includes(elmInfo.tagname.toUpperCase()) ||
        ignoreTags.includes(elmInfo.tagname.toLowerCase())
      );
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

    return await getRepository(TestResultEntity).save({
      ...testResultEntity,
    });
  }

  private createInputElements(requestBody: CreateTestStepDto) {
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
    return [
      ...requestBody.inputElements
        .filter(inputElementsFilter)
        .map((elmInfo) => {
          return {
            ...elmInfo,
            iframeIndex: requestBody.iframeIndex,
          };
        }),
      ...requestBody.screenElementsPerIframe
        .map((elemsWithIframeIndex) => {
          return elemsWithIframeIndex.screenElements
            .filter(inputElementsFilter)
            .map((elem) => {
              return {
                ...elem,
                iframeIndex: elemsWithIframeIndex.iframeIndex,
              };
            });
        })
        .flat(),
    ];
  }
}
