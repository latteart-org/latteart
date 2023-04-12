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

import { CoverageSourceEntity } from "@/entities/CoverageSourceEntity";
import { NoteEntity } from "@/entities/NoteEntity";
import { ScreenshotEntity } from "@/entities/ScreenshotEntity";
import { SessionEntity } from "@/entities/SessionEntity";
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
import { TestResultViewOption } from "@/domain/types";
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
} from "./helper/testResultCompareHelper";
import { CompareTestResultsResponse } from "@/interfaces/TestResultComparison";
import { ServerError } from "@/ServerError";
import { generateGraphView } from "@/domain/testResultViewGeneration/graphView";
import { v4 as uuidv4 } from "uuid";

export interface TestResultService {
  getTestResultIdentifiers(): Promise<ListTestResultResponse[]>;

  getTestResult(id: string): Promise<GetTestResultResponse | undefined>;

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
}

export class TestResultServiceImpl implements TestResultService {
  constructor(
    private service: {
      timestamp: TimestampService;
      testStep: TestStepService;
      screenshotFileRepository: FileRepository;
      workingFileRepository: FileRepository;
      compareReportRepository: FileRepository;
    }
  ) {}

  public async getTestResultIdentifiers(): Promise<ListTestResultResponse[]> {
    const testResultEntities = await getRepository(TestResultEntity).find();

    return testResultEntities.map((testResult) => {
      return {
        id: testResult.id,
        name: testResult.name,
        parentTestResultId: testResult.parentTestResultId,
      };
    });
  }

  public async getTestResult(
    id: string
  ): Promise<GetTestResultResponse | undefined> {
    try {
      const testResultEntity = await getRepository(
        TestResultEntity
      ).findOneOrFail(id, {
        relations: [
          "testSteps",
          "testSteps.screenshot",
          "testSteps.notes",
          "testSteps.notes.tags",
          "testSteps.notes.screenshot",
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

  public async createTestResult(
    body: CreateTestResultDto,
    testResultId: string | null
  ): Promise<CreateTestResultResponse> {
    const createTimestamp = body.initialUrl
      ? this.service.timestamp.epochMilliseconds()
      : 0;
    const startTimestamp = body.startTimeStamp ?? createTimestamp;

    const lastUpdateTimestamp = -1;

    const testingTime = 0;

    const repository = getRepository(TestResultEntity);

    const newTestResult = await repository.save({
      name:
        body.name ??
        `session_${this.service.timestamp.format("YYYYMMDD_HHmmss")}`,
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
    });

    if (testResultId) {
      const oldTestResult = await repository.findOne(testResultId);
      const sessionRepository = getRepository(SessionEntity);
      sessionRepository.update(
        { testResult: oldTestResult },
        { testResult: newTestResult }
      );
    }

    return {
      id: newTestResult.id,
      name: newTestResult.name,
    };
  }

  public async deleteTestResult(
    testResultId: string,
    transactionRunner: TransactionRunner,
    screenshotFileRepository: FileRepository
  ): Promise<void> {
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

      const fileUrls = (
        await transactionalEntityManager.find(ScreenshotEntity, {
          testResult: { id: testResultId },
        })
      ).map((screenshot) => screenshot.fileUrl);

      await transactionalEntityManager.delete(ScreenshotEntity, {
        testResult: { id: testResultId },
      });
      await transactionalEntityManager.delete(TestResultEntity, testResultId);

      fileUrls.forEach((fileUrl) => {
        screenshotFileRepository.removeFile(path.basename(fileUrl));
      });
    });
    return;
  }

  public async patchTestResult(params: {
    id: string;
    name?: string;
    startTime?: number;
    initialUrl?: string;
  }): Promise<PatchTestResultResponse> {
    const id = params.id;
    const testResultEntity = await getRepository(
      TestResultEntity
    ).findOneOrFail(id, {
      relations: [
        "testSteps",
        "testSteps.screenshot",
        "testSteps.notes",
        "testSteps.notes.tags",
        "testSteps.notes.screenshot",
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

    return this.convertTestResultEntityToTestResult({
      coverageSources,
      ...updatedTestResultEntity,
    });
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
      return { windows: [], screens: [], scenarios: [] };
    }

    const screenDefFactory = new ScreenDefFactory(screenDefinitionConfig);
    const testStepWithScreenDefs = testResult.testSteps.map((testStep) => {
      return {
        ...testStep,
        screenDef: screenDefFactory.create({
          url: testStep.operation.url,
          title: testStep.operation.title,
          keywordSet: new Set(
            testStep.operation.keywordTexts?.map((keywordText) => {
              return typeof keywordText === "string"
                ? keywordText
                : keywordText.value;
            }) ?? []
          ),
        }),
      };
    });

    return generateSequenceView(testStepWithScreenDefs);
  }

  public async generateGraphView(
    testResultId: string,
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

    const testResult = await this.getTestResult(testResultId);

    if (!testResult) {
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
    const testStepWithScreenDefs = testResult.testSteps.map((testStep) => {
      return {
        ...testStep,
        screenDef: screenDefFactory.create({
          url: testStep.operation.url,
          title: testStep.operation.title,
          keywordSet: new Set(
            testStep.operation.keywordTexts?.map((keywordText) => {
              return typeof keywordText === "string"
                ? keywordText
                : keywordText.value;
            }) ?? []
          ),
        }),
      };
    });

    const idGenerator = {
      generateScreenId: () => uuidv4(),
      generateElementId: () => uuidv4(),
    };

    const graphView = generateGraphView(
      testStepWithScreenDefs,
      testResult.coverageSources,
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
      relations: ["screenshot"],
    });

    const nodes = graphView.nodes.map((node) => {
      const testSteps = node.testSteps.map((testStep) => {
        const imageFileUrl = testStepEntities.find(
          ({ id }) => id === testStep.id
        )?.screenshot?.fileUrl;

        return { ...testStep, imageFileUrl };
      });
      return { ...node, testSteps };
    });

    const notes = (
      await getRepository(NoteEntity).find({
        where: { id: In(graphView.store.notes.map(({ id }) => id)) },
        relations: ["tags", "screenshot"],
      })
    ).map((noteEntity) => {
      const { id, value, details } = noteEntity;
      const tags = noteEntity.tags?.map((tagEntity) => tagEntity.name);
      const imageFileUrl = noteEntity.screenshot?.fileUrl;
      return { id, value, details, tags, imageFileUrl };
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
      relations: ["screenshot"],
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

    const actualOperations = actualTestStepEntities.map((entity) => {
      return extractOperation(entity, this.service.screenshotFileRepository);
    });
    const expectedOperations = expectedTestStepEntities.map((entity) => {
      return extractOperation(entity, this.service.screenshotFileRepository);
    });

    const actualActions = createTestActions(...actualOperations);
    const expectedActions = createTestActions(...expectedOperations);

    if (!isSameProcedure(actualActions, expectedActions)) {
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

  private async convertTestResultEntityToTestResult(
    testResultEntity: TestResultEntity
  ) {
    const testSteps = await Promise.all(
      testResultEntity.testSteps
        ?.sort(function (first, second) {
          return first.timestamp - second.timestamp;
        })
        .map(async (testStep) => {
          const operation = await this.service.testStep.getTestStepOperation(
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
    );

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
    };
  }
}
