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

import { TestResultService } from "./TestResultService";
import { ExportFileRepositoryService } from "./ExportFileRepositoryService";
import path from "path";
import { GetTestResultResponse } from "@/interfaces/TestResults";

export type HistoryItemExportDataV1 = {
  testStep: {
    timestamp: string;
    imageFileUrl: string;
    windowInfo: {
      windowHandle: string;
    };
    pageInfo: {
      title: string;
      url: string;
      keywordTexts: string[];
    };
    operation: {
      input: string;
      type: string;
      elementInfo: {
        tagname: string;
        text: string;
        xpath: string;
        value: string;
        checked: boolean;
        attributes: {
          [key: string]: string;
        };
      } | null;
      isAutomatic?: boolean;
    };
    inputElements: {
      tagname: string;
      text: string;
      xpath: string;
      value: string;
      checked: boolean;
      attributes: {
        [key: string]: string;
      };
    }[];
  };
  testPurpose: string | null;
  notes: string[];
};

export type TestResultExportDataV2 = Omit<
  TestResultExportDataV1,
  "endTimeStamp"
> & { lastUpdateTimeStamp: number; testingTime: number };

export type TestResultExportDataV1 = {
  version: number;
  name: string;
  sessionId: string;
  startTimeStamp: number;
  endTimeStamp: number;
  initialUrl: string;
  history: {
    [k: string]: HistoryItemExportDataV1;
  };
  notes: {
    id: string;
    type: string;
    value: string;
    details: string;
    imageFileUrl: string;
    tags: string[];
  }[];
  coverageSources: {
    title: string;
    url: string;
    screenElements: {
      tagname: string;
      text: string;
      xpath: string;
      value: string;
      checked: boolean;
      attributes: {
        [key: string]: string;
      };
    }[];
  }[];
};

export interface ExportService {
  exportTestResult(testResultId: string): Promise<{ url: string }>;
  serializeTestResult(testResult: GetTestResultResponse): string;
}

export class ExportServiceImpl implements ExportService {
  constructor(
    private service: {
      testResult: TestResultService;
      exportFileRepository: ExportFileRepositoryService;
    }
  ) {}

  public async exportTestResult(
    testResultId: string
  ): Promise<{ url: string }> {
    console.log(testResultId);

    const screenshots =
      await this.service.testResult.collectAllTestStepScreenshots(testResultId);

    const testResult = await this.service.testResult.getTestResult(
      testResultId
    );

    if (!testResult) {
      throw Error(`Test result not found: ${testResultId}`);
    }

    const serializedTestResult = this.serializeTestResult(testResult);

    const url = await this.service.exportFileRepository.exportTestResult({
      name: testResult.name,
      testResultFile: { fileName: "log.json", data: serializedTestResult },
      screenshots,
    });

    return { url };
  }

  public serializeTestResult(testResult: GetTestResultResponse): string {
    const convertImageFileUrl = (beforeUrl: string) => {
      return path.basename(beforeUrl);
    };

    const { historyEntries, notes } = testResult.testSteps.reduce(
      (acc, testStep, index) => {
        const testStepEntry: [number, HistoryItemExportDataV1] = [
          index + 1,
          {
            testStep: {
              timestamp: testStep.operation.timestamp,
              imageFileUrl: convertImageFileUrl(
                testStep.operation.imageFileUrl
              ),
              windowInfo: {
                windowHandle: testStep.operation.windowHandle,
              },
              pageInfo: {
                title: testStep.operation.title,
                url: testStep.operation.url,
                keywordTexts: testStep.operation.keywordTexts ?? [],
              },
              operation: {
                input: testStep.operation.input,
                type: testStep.operation.type,
                elementInfo: testStep.operation.elementInfo,
                isAutomatic: testStep.operation.isAutomatic,
              },
              inputElements: testStep.operation.inputElements,
            },
            testPurpose: testStep.intention?.id ?? null,
            notes: [
              ...testStep.bugs.map((bug) => bug.id),
              ...testStep.notices.map((notice) => notice.id),
            ],
          },
        ];

        const testPurposes = testStep.intention ? [testStep.intention] : [];

        const notes = [
          ...testPurposes,
          ...[...testStep.notices, ...testStep.bugs].map((note) => {
            return {
              ...note,
              imageFileUrl: convertImageFileUrl(note.imageFileUrl),
            };
          }),
        ];

        acc.historyEntries.push(testStepEntry);
        acc.notes.push(...notes);

        return acc;
      },
      {
        historyEntries: Array<[number, HistoryItemExportDataV1]>(),
        notes: Array<{
          id: string;
          type: string;
          value: string;
          details: string;
          imageFileUrl: string;
          tags: string[];
        }>(),
      }
    );

    const history = Object.fromEntries(historyEntries);

    const data: TestResultExportDataV2 = {
      version: 2,
      name: testResult.name,
      sessionId: testResult.id,
      startTimeStamp: testResult.startTimeStamp,
      lastUpdateTimeStamp: testResult.lastUpdateTimeStamp,
      initialUrl: testResult.initialUrl,
      testingTime: testResult.testingTime,
      history,
      notes,
      coverageSources: testResult.coverageSources,
    };

    return JSON.stringify(data);
  }
}
