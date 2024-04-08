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

import type {
  DailyTestProgressForRepository,
  GraphView,
  RepositoryService,
  SequenceView,
  TestMatrixForRepository,
  TestResultViewOption
} from "latteart-client";
import type { Story } from "../testManagement/types";
import { CollectProgressDatasAction } from "../testManagement/actions/CollectProgressDatasAction";
import { ProjectFileRepository } from "./ProjectFileRepository";
import type { Timestamp } from "./Timestamp";
import { ReadProjectAction } from "../testManagement/actions/ReadProjectAction";
import { LoadHistoryAction } from "../operationHistory/actions/LoadHistoryAction";
import { parseHistoryLog } from "./util";
import type { OperationHistoryItem } from "../captureControl/OperationHistoryItem";
import type { ProjectSettings } from "./settings/Settings";
import { ReadSettingAction } from "./settings/ReadSettingAction";

export type DataLoader = {
  loadProjectSettings(): Promise<
    (Omit<ProjectSettings, "config"> & { config: Partial<ProjectSettings["config"]> }) | undefined
  >;
  loadProject(): Promise<
    { projectId: string; stories: Story[]; testMatrices: TestMatrixForRepository[] } | undefined
  >;
  loadProgressDatas(
    projectId: string,
    filter?: { period?: { since: Timestamp; until: Timestamp } }
  ): Promise<DailyTestProgressForRepository[]>;
  loadTestResult(testResultId: string): Promise<
    | {
        windows?: { windowHandle: string; title: string }[];
        testResultInfo?: {
          repositoryUrl: string;
          id: string;
          name: string;
          parentTestResultId: string;
        };
        testStepIds?: string[];
        historyItems: OperationHistoryItem[];
        url?: string;
        testingTime?: number;
      }
    | undefined
  >;
  loadSequenceView(
    testResultId: string,
    option?: TestResultViewOption
  ): Promise<SequenceView | undefined>;
  loadGraphView(
    testResultIds: string[],
    option?: TestResultViewOption
  ): Promise<GraphView | undefined>;
};

export class SnapshotDataLoader implements DataLoader {
  constructor(
    private source: {
      settings: unknown;
      testResult?: {
        historyLogs: unknown;
        sequenceViews: unknown;
        graphView: unknown;
      };
      project?: {
        stories: unknown;
        testMatrices: unknown;
        dailyTestProgresses: unknown;
      };
    }
  ) {}

  async loadProjectSettings(): Promise<
    (Omit<ProjectSettings, "config"> & { config: Partial<ProjectSettings["config"]> }) | undefined
  > {
    return this.source.settings as Omit<ProjectSettings, "config"> & {
      config: Partial<ProjectSettings["config"]>;
    };
  }

  async loadProject(): Promise<
    { projectId: string; stories: Story[]; testMatrices: TestMatrixForRepository[] } | undefined
  > {
    if (!this.source.project) {
      return { projectId: "", stories: [], testMatrices: [] };
    }

    return {
      projectId: "",
      stories: this.source.project.stories as Story[],
      testMatrices: this.source.project.testMatrices as TestMatrixForRepository[]
    };
  }

  async loadProgressDatas(
    projectId: string,
    filter?: { period?: { since: Timestamp; until: Timestamp } }
  ): Promise<DailyTestProgressForRepository[]> {
    if (!this.source.project) {
      return [];
    }

    const repositoryService = {
      projectRepository: new ProjectFileRepository(
        this.source.project.dailyTestProgresses as DailyTestProgressForRepository[]
      )
    };

    const result = await new CollectProgressDatasAction(repositoryService).collect(
      projectId,
      filter
    );

    if (result.isFailure()) {
      return [];
    }

    return result.data;
  }

  async loadTestResult(testResultId: string): Promise<
    | {
        windows?: { windowHandle: string; title: string }[];
        testResultInfo?: {
          repositoryUrl: string;
          id: string;
          name: string;
          parentTestResultId: string;
        };
        testStepIds?: string[];
        historyItems: OperationHistoryItem[];
        url?: string;
        testingTime?: number;
      }
    | undefined
  > {
    if (!this.source.testResult) {
      return;
    }

    const historyLog = (this.source.testResult.historyLogs as any).find(
      (historyLog: any) => historyLog.testResultId === testResultId
    );

    if (!historyLog) {
      return;
    }

    const historyItems = parseHistoryLog(historyLog.history);

    return { historyItems };
  }

  async loadSequenceView(
    testResultId: string,
    option?: TestResultViewOption
  ): Promise<SequenceView | undefined> {
    if (!this.source.testResult) {
      return;
    }

    return (this.source.testResult.sequenceViews as SequenceView[]).find(
      (view) => view.testResultId === testResultId
    );
  }

  async loadGraphView(
    testResultIds: string[],
    option?: TestResultViewOption
  ): Promise<GraphView | undefined> {
    if (!this.source.testResult) {
      return;
    }

    return this.source.testResult.graphView as GraphView;
  }
}

export class RepositoryDataLoader implements DataLoader {
  constructor(private repositoryService: RepositoryService) {}

  async loadProjectSettings(): Promise<
    (Omit<ProjectSettings, "config"> & { config: Partial<ProjectSettings["config"]> }) | undefined
  > {
    const result = await new ReadSettingAction().readProjectSettings(this.repositoryService);

    if (result.isFailure()) {
      return;
    }

    return result.data;
  }

  async loadProject(): Promise<
    { projectId: string; stories: Story[]; testMatrices: TestMatrixForRepository[] } | undefined
  > {
    const result = await new ReadProjectAction(this.repositoryService).read();

    if (result.isFailure()) {
      return;
    }

    return {
      projectId: result.data.projectId,
      stories: JSON.parse(JSON.stringify(result.data.stories)),
      testMatrices: result.data.testMatrices
    };
  }

  async loadProgressDatas(
    projectId: string,
    filter?: { period?: { since: Timestamp; until: Timestamp } }
  ): Promise<DailyTestProgressForRepository[]> {
    const result = await new CollectProgressDatasAction(this.repositoryService).collect(
      projectId,
      filter
    );

    if (result.isFailure()) {
      return [];
    }

    return result.data;
  }

  async loadTestResult(testResultId: string): Promise<
    | {
        windows?: { windowHandle: string; title: string }[];
        testResultInfo?: {
          repositoryUrl: string;
          id: string;
          name: string;
          parentTestResultId: string;
        };
        testStepIds?: string[];
        historyItems: OperationHistoryItem[];
        url?: string;
        testingTime?: number;
      }
    | undefined
  > {
    const result = await new LoadHistoryAction(this.repositoryService).loadHistory(testResultId);

    if (result.isFailure()) {
      return;
    }

    const windows = result.data.historyItems
      .map((operationWithNotes) => {
        return {
          windowHandle: operationWithNotes.operation?.windowHandle ?? "",
          title: operationWithNotes.operation?.title ?? ""
        };
      })
      .filter((window, index, array) => {
        const windowIndex = array.findIndex(
          ({ windowHandle }) => windowHandle === window.windowHandle
        );
        return windowIndex === index && window.windowHandle !== "";
      });
    const testResultInfo = {
      repositoryUrl: this.repositoryService.serviceUrl,
      id: result.data.testResultInfo.id,
      name: result.data.testResultInfo.name,
      parentTestResultId: result.data.testResultInfo.parentTestResultId ?? ""
    };
    const testStepIds = result.data.testStepIds;
    const historyItems = result.data.historyItems;
    const url = result.data.url;
    const testingTime = result.data.testingTime;

    return { windows, testResultInfo, testStepIds, historyItems, url, testingTime };
  }

  async loadSequenceView(
    testResultId: string,
    option?: TestResultViewOption
  ): Promise<SequenceView | undefined> {
    const testResult = this.repositoryService.createTestResultAccessor(testResultId);

    const generateSequenceViewResult = await testResult.generateSequenceView(option);

    if (generateSequenceViewResult.isFailure()) {
      return;
    }

    return generateSequenceViewResult.data;
  }

  async loadGraphView(
    testResultIds: string[],
    option?: TestResultViewOption
  ): Promise<GraphView | undefined> {
    const generateGraphViewResult =
      await this.repositoryService.testResultRepository.generateGraphView(testResultIds, option);

    if (generateGraphViewResult.isFailure()) {
      return;
    }

    const getTestResultsResult = await this.repositoryService.testResultRepository.getTestResults();

    if (getTestResultsResult.isFailure()) {
      return;
    }

    const nodes = await Promise.all(
      generateGraphViewResult.data.nodes.map(async (node) => {
        const { windowId, screenId, defaultValues } = node;
        const testSteps = await Promise.all(
          node.testSteps.map(async (testStep) => {
            const {
              id,
              type,
              input,
              targetElementId,
              noteIds,
              testPurposeId,
              pageUrl,
              pageTitle,
              timestamp,
              imageFileUrl,
              videoFrame,
              testResultId
            } = testStep;

            return {
              id,
              type,
              input,
              targetElementId,
              noteIds,
              testPurposeId,
              pageUrl,
              pageTitle,
              timestamp,
              imageFileUrl,
              videoFrame,
              testResultId
            };
          })
        );

        return { windowId, screenId, testSteps, defaultValues };
      })
    );

    const store = {
      ...generateGraphViewResult.data.store,
      notes: await Promise.all(
        generateGraphViewResult.data.store.notes.map(async (note) => {
          const { id, value, details, tags, imageFileUrl, timestamp, videoFrame } = note;

          return {
            id,
            value,
            details,
            tags,
            imageFileUrl,
            timestamp,
            videoFrame
          };
        })
      )
    };

    return { nodes, store };
  }
}
