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

import { CoverageSourceEntity } from "@/entities/CoverageSourceEntity";
import { NoteEntity } from "@/entities/NoteEntity";
import { ScreenshotEntity } from "@/entities/ScreenshotEntity";
import { TestPurposeEntity } from "@/entities/TestPurposeEntity";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { TestStepEntity } from "@/entities/TestStepEntity";
import {
  CreateTestResultDto,
  ListTestResultResponse,
  CreateTestResultResponse,
  GetTestResultResponse,
  PatchTestResultResponse,
  GetGraphViewResponse,
  ExportTestResultResponse,
  PatchTestResultDto,
} from "@/interfaces/TestResults";
import { TransactionRunner } from "@/TransactionRunner";
import { getRepository, In } from "typeorm";
import { TestStepService } from "./TestStepService";
import { TimestampService } from "./TimestampService";
import path from "path";
import ScreenDefFactory, {
  ScreenDefinitionConfig,
} from "@/domain/ScreenDefFactory";
import {
  generateSequenceView,
  SequenceView,
} from "@/domain/testResultViewGeneration/sequenceView";
import { ElementInfo, TestResultViewOption } from "@/domain/types";
import { FileRepository } from "@/interfaces/fileRepository";
import {
  createTestActions,
  isSameProcedure,
} from "@/domain/pageTesting/action";
import {
  assertPageStateEqual,
  PageAssertionOption,
} from "@/domain/pageTesting";
import {
  createReportSummary,
  createReport,
  outputReport,
  extractOperation,
} from "./helper/testResultComparisonHelper";
import { CompareTestResultsResponse } from "@/interfaces/TestResultComparison";
import { ServerError } from "@/ServerError";
import { generateGraphView } from "@/domain/testResultViewGeneration/graphView";
import { v4 as uuidv4 } from "uuid";
import { createLogger } from "@/logger/logger";
import { VideoEntity } from "@/entities/VideoEntity";

export type TestResultService = {
  getTestResultIdentifiers(): Promise<ListTestResultResponse[]>;

  getTestResult(id: string): Promise<GetTestResultResponse | undefined>;

  getTestResultForExport(
    id: string
  ): Promise<ExportTestResultResponse | undefined>;

  createTestResult(
    body: CreateTestResultDto,
    testResultId: string | null
  ): Promise<CreateTestResultResponse>;

  patchTestResult(params: {
    id: string;
    name?: string;
    startTime?: number;
    initialUrl?: string;
  }): Promise<PatchTestResultResponse>;

  collectAllTestStepIds(testResultId: string): Promise<string[]>;

  collectAllTestPurposeIds(testResultId: string): Promise<string[]>;

  collectAllTestStepScreenshots(
    testResultId: string
  ): Promise<{ id: string; fileUrl: string }[]>;

  generateSequenceView(
    testResultId: string,
    option?: TestResultViewOption
  ): Promise<SequenceView>;

  generateGraphView(
    testResultId: string,
    option?: TestResultViewOption
  ): Promise<GetGraphViewResponse>;

  compareTestResults(
    testResultId1: string,
    testResultId2: string,
    option?: PageAssertionOption
  ): Promise<CompareTestResultsResponse>;

  collectAllScreenshots(
    testResultId: string
  ): Promise<{ id: string; fileUrl: string }[]>;

  collectAllVideos(
    testResultId: string
  ): Promise<{ id: string; fileUrl: string }[]>;
};

export class TestResultServiceImpl implements TestResultService {
  constructor(
    private service?: {
      timestamp: TimestampService;
      testStep: TestStepService;
      screenshotFileRepository: FileRepository;
      workingFileRepository: FileRepository;
      compareReportRepository: FileRepository;
      videoFileRepository?: FileRepository;
    }
  ) {}

  public async getTestResultIdentifiers(): Promise<ListTestResultResponse[]> {
    const testResultEntities = await getRepository(TestResultEntity).find({
      relations: ["testPurposes", "testPurposes.testSteps"],
    });

    return testResultEntities
      .sort((a, b) => {
        const first =
          a.creationTimestamp === 0 ? a.startTimestamp : a.creationTimestamp;
        const second =
          b.creationTimestamp === 0 ? b.startTimestamp : b.creationTimestamp;

        return first - second;
      })
      .map((testResult) => {
        const testPurposes =
          testResult.testPurposes
            ?.sort((a, b) => {
              const first = a.testSteps?.at(0)?.timestamp ?? 0;
              const second = b.testSteps?.at(0)?.timestamp ?? 0;
              return first - second;
            })
            .map((testPurpose) => {
              return { value: testPurpose.title };
            }) ?? [];
        return {
          id: testResult.id,
          name: testResult.name,
          parentTestResultId: testResult.parentTestResultId,
          testingTime: testResult.testingTime,
          initialUrl: testResult.initialUrl,
          testPurposes,
          creationTimestamp: testResult.creationTimestamp,
        };
      });
  }

  public async getTestResult(
    id: string
  ): Promise<GetTestResultResponse | undefined> {
    const testResult = await this.getTestResultData(id);

    if (testResult) {
      return this.convertToTestResult(testResult);
    }
    return testResult;
  }

  public async getTestResultForExport(
    id: string
  ): Promise<ExportTestResultResponse | undefined> {
    return await this.getTestResultData(id);
  }

  public async createTestResult(
    body: CreateTestResultDto
  ): Promise<CreateTestResultResponse> {
    const startTimestamp = body.initialUrl
      ? this.service?.timestamp.epochMilliseconds()
      : 0;

    const lastUpdateTimestamp = -1;

    const testingTime = 0;

    const repository = getRepository(TestResultEntity);

    const newTestResult = await repository.save({
      name:
        body.name ??
        `session_${this.service?.timestamp.format("YYYYMMDD_HHmmss")}`,
      startTimestamp,
      lastUpdateTimestamp,
      initialUrl: body.initialUrl ?? "",
      testingTime,
      testSteps: [],
      coverageSources: [],
      testPurposes: [],
      notes: [],
      screenshots: [],
      parentTestResultId: body.parentTestResultId,
      creationTimestamp: this.service?.timestamp.epochMilliseconds(),
    });

    return {
      id: newTestResult.id,
      name: newTestResult.name,
    };
  }

  public async deleteTestResult(
    testResultId: string,
    transactionRunner: TransactionRunner,
    screenshotFileRepository: FileRepository,
    videoFileRepository: FileRepository
  ): Promise<void> {
    const screenshots = await this.collectAllScreenshots(testResultId);
    const videos = await this.collectAllVideos(testResultId);

    await transactionRunner.waitAndRun(async (transactionalEntityManager) => {
      await transactionalEntityManager.delete(NoteEntity, {
        testResult: { id: testResultId },
      });

      await transactionalEntityManager.delete(TestStepEntity, {
        testResult: { id: testResultId },
      });
      await transactionalEntityManager.delete(CoverageSourceEntity, {
        testResult: { id: testResultId },
      });
      await transactionalEntityManager.delete(TestPurposeEntity, {
        testResult: { id: testResultId },
      });

      await transactionalEntityManager.delete(TestResultEntity, testResultId);

      videos.forEach(async ({ id, fileUrl }) => {
        await transactionalEntityManager.delete(VideoEntity, id);
        videoFileRepository.removeFile(path.basename(fileUrl));
      });

      screenshots.forEach(async ({ id, fileUrl }) => {
        await transactionalEntityManager.delete(ScreenshotEntity, id);
        screenshotFileRepository.removeFile(path.basename(fileUrl));
      });
    });
    return;
  }

  public async patchTestResult(
    params: PatchTestResultDto & {
      id: string;
    }
  ): Promise<PatchTestResultResponse> {
    const id = params.id;
    const testResultEntity = await getRepository(
      TestResultEntity
    ).findOneOrFail(id, {
      relations: [
        "testSteps",
        "testSteps.screenshot",
        "testSteps.video",
        "testSteps.notes",
        "testSteps.notes.tags",
        "testSteps.notes.screenshot",
        "testSteps.notes.video",
        "testSteps.testPurpose",
      ],
    });

    const { coverageSources } = await getRepository(
      TestResultEntity
    ).findOneOrFail(id, {
      relations: ["coverageSources"],
    });

    if (params.initialUrl) {
      testResultEntity.initialUrl = params.initialUrl;
    }

    if (params.name) {
      testResultEntity.name = params.name;
    }

    if (params.startTime) {
      testResultEntity.startTimestamp = params.startTime;
    }

    const updatedTestResultEntity = await getRepository(TestResultEntity).save(
      testResultEntity
    );

    const testResult = await this.convertTestResultEntityToTestResult({
      coverageSources,
      ...updatedTestResultEntity,
    });

    return this.convertToTestResult(testResult);
  }

  public async collectAllTestStepIds(testResultId: string): Promise<string[]> {
    const testResultEntity = await getRepository(TestResultEntity).findOne(
      testResultId,
      {
        relations: ["testSteps"],
      }
    );

    return (
      testResultEntity?.testSteps
        ?.slice()
        .sort(
          (testStepA, testStepB) => testStepA.timestamp - testStepB.timestamp
        )
        .map((testStep) => testStep.id) ?? []
    );
  }

  public async collectAllTestPurposeIds(
    testResultId: string
  ): Promise<string[]> {
    const testResultEntity = await getRepository(TestResultEntity).findOne(
      testResultId
    );

    return testResultEntity?.testPurposeIds ?? [];
  }

  public async collectAllTestStepScreenshots(
    testResultId: string
  ): Promise<{ id: string; fileUrl: string }[]> {
    const testResultEntity = await getRepository(TestResultEntity).findOne(
      testResultId,
      {
        relations: ["testSteps", "testSteps.screenshot"],
      }
    );

    const screenshots =
      testResultEntity?.testSteps?.flatMap(({ screenshot }) => {
        if (!screenshot) {
          return [];
        }

        return [{ id: screenshot.id, fileUrl: screenshot.fileUrl }];
      }) ?? [];

    return screenshots;
  }

  public async generateSequenceView(
    testResultId: string,
    option: TestResultViewOption = { node: { unit: "title", definitions: [] } }
  ): Promise<SequenceView> {
    const screenDefinitionConfig: ScreenDefinitionConfig = {
      screenDefType: option.node.unit,
      conditionGroups: option.node.definitions.map((definition) => {
        return {
          isEnabled: true,
          screenName: definition.name,
          conditions: definition.conditions.map((condition) => {
            return {
              isEnabled: true,
              definitionType: condition.target,
              matchType: condition.method,
              word: condition.value,
            };
          }),
        };
      }),
    };

    const testResult = await this.getTestResult(testResultId);

    if (!testResult) {
      return { testResultId: "", windows: [], screens: [], scenarios: [] };
    }

    const screenDefFactory = new ScreenDefFactory(screenDefinitionConfig);
    const testStepWithScreenDefs = testResult.testSteps.map((testStep) => {
      return {
        ...testStep,
        screenDef:
          testStep.operation.type !== "start_capturing"
            ? screenDefFactory.create({
                url: testStep.operation.url,
                title: testStep.operation.title,
                keywordSet: new Set(
                  testStep.operation.keywordTexts?.map((keywordText) => {
                    return typeof keywordText === "string"
                      ? keywordText
                      : keywordText.value;
                  }) ?? []
                ),
              })
            : "",
      };
    });

    return generateSequenceView(testResultId, testStepWithScreenDefs);
  }

  public async generateGraphView(
    testResultIds: string | string[],
    option: TestResultViewOption = { node: { unit: "title", definitions: [] } }
  ): Promise<GetGraphViewResponse> {
    const screenDefinitionConfig: ScreenDefinitionConfig = {
      screenDefType: option.node.unit,
      conditionGroups: option.node.definitions.map((definition) => {
        return {
          isEnabled: true,
          screenName: definition.name,
          conditions: definition.conditions.map((condition) => {
            return {
              isEnabled: true,
              definitionType: condition.target,
              matchType: condition.method,
              word: condition.value,
            };
          }),
        };
      }),
    };

    const testResults = (
      await Promise.all(
        (Array.isArray(testResultIds) ? testResultIds : [testResultIds]).map(
          async (testResultId) => {
            const testResult = await this.getTestResult(testResultId);
            return testResult ? [testResult] : [];
          }
        )
      )
    ).flat();

    if (testResults.length === 0) {
      return {
        nodes: [],
        store: {
          windows: [],
          screens: [],
          elements: [],
          testPurposes: [],
          notes: [],
        },
      };
    }

    const screenDefFactory = new ScreenDefFactory(screenDefinitionConfig);
    const testStepForGraphViews = testResults
      .flatMap((testResult) => testResult.testSteps)
      .map((testStep) => {
        return {
          ...testStep,
          screenDef:
            testStep.operation.type !== "start_capturing"
              ? screenDefFactory.create({
                  url: testStep.operation.url,
                  title: testStep.operation.title,
                  keywordSet: new Set(
                    testStep.operation.keywordTexts?.map((keywordText) => {
                      return typeof keywordText === "string"
                        ? keywordText
                        : keywordText.value;
                    }) ?? []
                  ),
                })
              : "",
        };
      });

    const idGenerator = {
      generateScreenId: () => uuidv4(),
      generateElementId: () => uuidv4(),
    };

    const coverageSources = testResults.flatMap(
      (testResult) => testResult.coverageSources
    );

    const coverageSourceGroupedByScreenDef = coverageSources
      .map(({ url, title, screenElements }) => {
        const keywordTexts = screenElements
          .map((screenElement) => {
            return {
              tagname: screenElement.tagname,
              value: screenElement.textWithoutChildren ?? "",
            };
          })
          .filter(({ value }) => value);

        const screenDef = screenDefFactory.create({
          url,
          title,
          keywordSet: new Set(
            keywordTexts.map((keywordText) => {
              return typeof keywordText === "string"
                ? keywordText
                : keywordText.value;
            })
          ),
        });

        return {
          screenDef,
          screenElements: screenElements.map((element) => {
            return { pageUrl: url, pageTitle: title, ...element };
          }),
        };
      })
      .reduce(
        (
          acc: {
            screenDef: string;
            screenElements: (ElementInfo & {
              pageUrl: string;
              pageTitle: string;
            })[];
          }[],
          { screenDef, screenElements }
        ) => {
          const sameScreenDefItem = acc.find(
            (item) => item.screenDef === screenDef
          );

          if (sameScreenDefItem) {
            sameScreenDefItem.screenElements.push(...screenElements);
          } else {
            acc.push({ screenDef, screenElements });
          }

          return acc;
        },
        []
      );

    const graphView = generateGraphView(
      testStepForGraphViews,
      coverageSourceGroupedByScreenDef,
      idGenerator
    );

    const testStepEntities = await getRepository(TestStepEntity).find({
      where: {
        id: In(
          graphView.nodes.flatMap(({ testSteps }) =>
            testSteps.map(({ id }) => id)
          )
        ),
      },
      relations: ["screenshot", "video"],
    });

    const nodes = graphView.nodes.map((node) => {
      const testSteps = node.testSteps.map((testStep) => {
        const testStepEntity = testStepEntities.find(
          ({ id }) => id === testStep.id
        );
        const imageFileUrl = testStepEntity?.screenshot?.fileUrl;
        const videoFrame = testStepEntity?.video
          ? {
              url: testStepEntity.video.fileUrl,
              time: testStepEntity.videoTime ?? 0,
              width: testStepEntity.video.width,
              height: testStepEntity.video.height,
            }
          : undefined;

        return { ...testStep, imageFileUrl, videoFrame };
      });
      return { ...node, testSteps };
    });

    const notes = (
      await getRepository(NoteEntity).find({
        where: { id: In(graphView.store.notes.map(({ id }) => id)) },
        relations: ["tags", "screenshot", "video"],
      })
    ).map((noteEntity) => {
      const { id, value, details, timestamp } = noteEntity;
      const tags = noteEntity.tags?.map((tagEntity) => tagEntity.name);
      const imageFileUrl = noteEntity.screenshot?.fileUrl;
      const videoFrame = noteEntity.video
        ? {
            url: noteEntity.video.fileUrl,
            time: noteEntity.videoTime ?? 0,
            width: noteEntity.video.width,
            height: noteEntity.video.height,
          }
        : undefined;
      return { id, value, details, tags, imageFileUrl, timestamp, videoFrame };
    });

    const testPurposes = (
      await getRepository(TestPurposeEntity).find({
        where: { id: In(graphView.store.testPurposes.map(({ id }) => id)) },
      })
    ).map((testPurposeEntity) => {
      const { id, title: value, details } = testPurposeEntity;
      return { id, value, details };
    });

    return {
      nodes,
      store: { ...graphView.store, notes, testPurposes },
    };
  }

  public async compareTestResults(
    actualTestResultId: string,
    expectedTestResultId: string,
    option: PageAssertionOption = {}
  ): Promise<CompareTestResultsResponse> {
    const testStepRepository = getRepository(TestStepEntity);
    const findOption = {
      relations: ["screenshot", "video"],
      order: { timestamp: "ASC" as const },
    };
    const actualTestStepEntities = await testStepRepository.find({
      ...findOption,
      where: { testResult: actualTestResultId },
    });
    const expectedTestStepEntities = await testStepRepository.find({
      ...findOption,
      where: { testResult: expectedTestResultId },
    });

    if (!this.service) {
      throw new ServerError(500, {
        code: "comparison_targets_not_same_procedures",
      });
    }

    const { screenshotFileRepository } = this.service;

    const actualOperations = actualTestStepEntities.map((entity) => {
      return extractOperation(entity, screenshotFileRepository);
    });
    const expectedOperations = expectedTestStepEntities.map((entity) => {
      return extractOperation(entity, screenshotFileRepository);
    });

    const actualActions = createTestActions(...actualOperations);
    const expectedActions = createTestActions(...expectedOperations);

    if (!isSameProcedure(actualActions, expectedActions)) {
      createLogger().error("Comparison targets not same procedures.");
      createLogger().error(
        `expected: ${JSON.stringify(
          expectedActions.map(({ operation }) => operation)
        )}`
      );
      createLogger().error(
        `actual: ${JSON.stringify(
          actualActions.map(({ operation }) => operation)
        )}`
      );

      throw new ServerError(500, {
        code: "comparison_targets_not_same_procedures",
      });
    }

    const assertionResults = await Promise.all(
      expectedActions.map((expected, index) => {
        return assertPageStateEqual(
          { actual: actualActions[index].result, expected: expected.result },
          option
        );
      })
    );

    const testResultRepository = getRepository(TestResultEntity);
    const actualTestResult = await testResultRepository.findOneOrFail(
      actualTestResultId
    );
    const expectedTestResult = await testResultRepository.findOneOrFail(
      expectedTestResultId
    );

    const targetNames = {
      actual: actualTestResult.name,
      expected: expectedTestResult.name,
    };
    const report = createReport(targetNames, assertionResults);
    const summary = createReportSummary(report);
    const reportUrl = await outputReport(
      `compare_${this.service.timestamp.format("YYYYMMDD_HHmmss")}`,
      report,
      this.service.compareReportRepository,
      this.service.workingFileRepository
    );

    return { url: reportUrl, targetNames, summary };
  }

  private async getTestResultData(
    id: string
  ): Promise<ExportTestResultResponse | undefined> {
    try {
      const testResultEntity = await getRepository(
        TestResultEntity
      ).findOneOrFail(id, {
        relations: [
          "testSteps",
          "testSteps.screenshot",
          "testSteps.video",
          "testSteps.notes",
          "testSteps.notes.tags",
          "testSteps.notes.screenshot",
          "testSteps.notes.video",
          "testSteps.testPurpose",
        ],
      });
      const { coverageSources } = await getRepository(
        TestResultEntity
      ).findOneOrFail(id, {
        relations: ["coverageSources"],
      });

      return await this.convertTestResultEntityToTestResult({
        coverageSources,
        ...testResultEntity,
      });
    } catch (error) {
      return undefined;
    }
  }

  private async convertTestResultEntityToTestResult(
    testResultEntity: TestResultEntity
  ) {
    const testStepService = this.service?.testStep;

    const testSteps = testStepService
      ? await Promise.all(
          testResultEntity.testSteps
            ?.sort(function (first, second) {
              return first.timestamp - second.timestamp;
            })
            .map(async (testStep) => {
              const operation = await testStepService.getTestStepOperation(
                testStep.id
              );
              const notes =
                testStep.notes?.map((note) => {
                  return {
                    id: note.id,
                    type: "notice",
                    value: note.value,
                    details: note.details,
                    tags: note.tags?.map((tag) => tag.name) ?? [],
                    imageFileUrl: note.screenshot?.fileUrl ?? "",
                    timestamp: note.timestamp,
                    videoFrame: note.video
                      ? {
                          url: note.video.fileUrl,
                          time: note.videoTime ?? 0,
                          width: note.video.width,
                          height: note.video.height,
                        }
                      : undefined,
                  };
                }) ?? [];

              const testPurpose = testStep.testPurpose
                ? {
                    id: testStep.testPurpose.id,
                    type: "intention",
                    value: testStep.testPurpose.title,
                    details: testStep.testPurpose.details,
                    tags: [],
                    imageFileUrl: "",
                    timestamp: 0,
                  }
                : null;

              return {
                id: testStep.id,
                operation,
                intention: testPurpose,
                notices: notes,
                bugs: [],
              };
            }) ?? []
        )
      : [];

    const coverageSources =
      testResultEntity.coverageSources?.map((coverageSource) => {
        return {
          title: coverageSource.title,
          url: coverageSource.url,
          screenElements: JSON.parse(coverageSource.screenElements),
        };
      }) ?? [];

    return {
      id: testResultEntity.id,
      name: testResultEntity.name,
      startTimeStamp: testResultEntity.startTimestamp,
      lastUpdateTimeStamp: testResultEntity.lastUpdateTimestamp,
      initialUrl: testResultEntity.initialUrl,
      testingTime: testResultEntity.testingTime,
      testSteps,
      coverageSources,
      parentTestResultId: testResultEntity.parentTestResultId,
      creationTimestamp: testResultEntity.creationTimestamp,
    };
  }

  public async collectAllVideos(
    testResultId: string
  ): Promise<{ id: string; fileUrl: string }[]> {
    const testStepVideos = (
      await getRepository(TestStepEntity).find({
        relations: ["video"],
        where: { testResult: testResultId },
      })
    ).flatMap(({ video }) => (video ? [video] : []));

    const noteVideos = (
      await getRepository(NoteEntity).find({
        relations: ["video"],
        where: { testResult: testResultId },
      })
    ).flatMap(({ video }) => (video ? [video] : []));

    const videos = [...testStepVideos, ...noteVideos].filter(
      (video, index, array) => {
        return array.findIndex(({ id }) => id === video.id) === index;
      }
    );

    return videos.map(({ id, fileUrl }) => {
      return { id, fileUrl };
    });
  }

  public async collectAllScreenshots(
    testResultId: string
  ): Promise<{ id: string; fileUrl: string }[]> {
    const testStepScreenshots = (
      await getRepository(TestStepEntity).find({
        relations: ["screenshot"],
        where: { testResult: testResultId },
      })
    ).flatMap(({ screenshot }) => (screenshot ? [screenshot] : []));
    const noteScreenshots = (
      await getRepository(NoteEntity).find({
        relations: ["screenshot"],
        where: { testResult: testResultId },
      })
    ).flatMap(({ screenshot }) => (screenshot ? [screenshot] : []));

    const screenshots = [...testStepScreenshots, ...noteScreenshots].filter(
      (screenshot, index, array) => {
        return array.findIndex(({ id }) => id === screenshot.id) === index;
      }
    );

    return screenshots.map(({ id, fileUrl }) => {
      return { id, fileUrl };
    });
  }

  private convertToTestResult(testResult: ExportTestResultResponse) {
    return {
      id: testResult.id,
      name: testResult.name,
      startTimeStamp: testResult.startTimeStamp,
      lastUpdateTimeStamp: testResult.lastUpdateTimeStamp,
      initialUrl: testResult.initialUrl,
      testingTime: testResult.testingTime,
      testSteps: testResult.testSteps,
      coverageSources: testResult.coverageSources,
      parentTestResultId: testResult.parentTestResultId,
    };
  }
}
