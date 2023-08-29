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

import {
  SerializeElementInfo,
  TestResultExportDataV3,
  HistoryItemExportDataV3,
} from "@/interfaces/exportData";
import { ExportTestResultResponse } from "@/interfaces/TestResults";
import path from "path";

export function serializeTestResult(
  testResult: ExportTestResultResponse
): string {
  const { historyEntries, notes } = testResult.testSteps.reduce(
    (acc, testStep, index) => {
      const testStepEntry: [number, HistoryItemExportDataV3] = [
        index + 1,
        {
          testStep: {
            timestamp: testStep.operation.timestamp,
            imageFileUrl: convertImageFileUrl(testStep.operation.imageFileUrl),
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
              elementInfo: testStep.operation.elementInfo
                ? convertToExportableElement(testStep.operation.elementInfo)
                : null,
              isAutomatic: testStep.operation.isAutomatic,
              scrollPosition: testStep.operation.scrollPosition,
              clientSize: testStep.operation.clientSize,
              videoFrame: testStep.operation.videoFrame,
            },
            inputElements: testStep.operation.inputElements.map((element) =>
              convertToExportableElement(element)
            ),
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
      historyEntries: Array<[number, HistoryItemExportDataV3]>(),
      notes: Array<TestResultExportDataV3["notes"][0]>(),
    }
  );

  const history = Object.fromEntries(historyEntries);

  const data: TestResultExportDataV3 = {
    version: 3,
    name: testResult.name,
    sessionId: testResult.id,
    startTimeStamp: testResult.startTimeStamp,
    lastUpdateTimeStamp: testResult.lastUpdateTimeStamp,
    initialUrl: testResult.initialUrl,
    testingTime: testResult.testingTime,
    history,
    notes,
    coverageSources: testResult.coverageSources.map((coverageSource) => {
      return {
        title: coverageSource.title,
        url: coverageSource.url,
        screenElements: coverageSource.screenElements.map((element) =>
          convertToExportableElement(element)
        ),
      };
    }),
    creationTimestamp: testResult.creationTimestamp,
  };

  return JSON.stringify(data);
}

function convertImageFileUrl(beforeUrl: string) {
  return path.basename(beforeUrl);
}

function convertToExportableElement(element: SerializeElementInfo) {
  return {
    tagname: element.tagname,
    text: element.text ?? "",
    xpath: element.xpath,
    value: element.value ?? "",
    checked: element.checked ?? false,
    attributes: element.attributes,
    boundingRect: element.boundingRect,
    innerHeight: element.innerHeight,
    innerWidth: element.innerWidth,
    outerHeight: element.outerHeight,
    outerWidth: element.outerWidth,
    textWithoutChildren: element.textWithoutChildren ?? "",
    iframe: element.iframe,
  };
}
