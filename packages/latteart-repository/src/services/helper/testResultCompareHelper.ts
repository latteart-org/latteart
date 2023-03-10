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

import {
  PageAssertionResult,
  PageOperation,
  PageState,
} from "@/domain/pageTesting";
import { TestStepEntity } from "@/entities/TestStepEntity";
import { FileRepository } from "@/interfaces/fileRepository";
import { readPNG, writePNG } from "./imageHelper";
import path from "path";
import { convertToTestStepOperation } from "./entityToResponse";

export type TestResultCompareReport = {
  targetNames: { actual: string; expected: string };
  result: {
    isOk: boolean;
    steps: (Omit<PageAssertionResult, "items"> & {
      items: Omit<PageAssertionResult["items"], "screenshot"> & {
        screenshot?: { isOk: boolean; diffFilePath?: string };
      };
    })[];
  };
  screenshots: { filePath: string; data: Buffer }[];
};

export type TestResultCompareReportSummary = {
  isOk: boolean;
  steps: {
    isOk: boolean;
    items: {
      title?: { isOk: boolean };
      url?: { isOk: boolean };
      elementTexts?: { isOk: boolean };
      screenshot?: { isOk: boolean };
    };
    errors?: "invalid_screenshot"[];
  }[];
};

export function extractOperation(
  testStepEntity: TestStepEntity,
  screenshotFileRepository: Pick<FileRepository, "readFile">
): PageOperation & PageState {
  const testStepOperation = convertToTestStepOperation(testStepEntity);

  const screenshot = testStepOperation.imageFileUrl
    ? {
        read: async () => {
          const buffer = (await screenshotFileRepository.readFile(
            path.basename(testStepOperation.imageFileUrl)
          )) as Buffer;

          return readPNG(buffer);
        },
      }
    : undefined;

  return {
    input: testStepEntity.operationInput,
    type: testStepEntity.operationType,
    elementInfo: testStepOperation.elementInfo,
    title: testStepEntity.pageTitle,
    url: testStepEntity.pageUrl,
    elementTexts:
      testStepOperation.keywordTexts?.map((keywordText) => {
        return typeof keywordText === "string"
          ? { tagname: "", value: keywordText }
          : keywordText;
      }) ?? [],
    screenshot,
  };
}

export function createReport(
  targetNames: { actual: string; expected: string },
  assertionResults: PageAssertionResult[]
): TestResultCompareReport {
  return assertionResults.reduce(
    (acc: TestResultCompareReport, assertionResult, index) => {
      if (!assertionResult.isOk) {
        acc.result.isOk = false;
      }

      const screenshot = ((screenshot) => {
        if (!screenshot) {
          return;
        }

        if (!screenshot.diff) {
          return { isOk: screenshot.isOk };
        }

        const data = writePNG(screenshot.diff);
        const imageFilePath = path.join("screenshots", `${index + 1}.png`);
        acc.screenshots.push({ filePath: imageFilePath, data });

        return { isOk: screenshot.isOk, diffFilePath: imageFilePath };
      })(assertionResult.items.screenshot);

      const { title, url, elementTexts } = assertionResult.items;

      acc.result.steps.push({
        ...assertionResult,
        items: {
          title,
          url,
          elementTexts,
          screenshot,
        },
      });

      return acc;
    },
    { targetNames, result: { isOk: true, steps: [] }, screenshots: [] }
  );
}

export function createReportSummary(
  report: Pick<TestResultCompareReport, "targetNames" | "result">
): TestResultCompareReportSummary {
  return {
    isOk: report.result.isOk,
    steps: report.result.steps.map((step) => {
      const { title, url, elementTexts, screenshot } = step.items;

      return {
        ...step,
        items: {
          title: title ? { isOk: title.isOk } : undefined,
          url: url ? { isOk: url.isOk } : undefined,
          elementTexts: elementTexts ? { isOk: elementTexts.isOk } : undefined,
          screenshot: screenshot ? { isOk: screenshot.isOk } : undefined,
        },
      };
    }),
  };
}

export async function outputReport(
  reportName: string,
  report: TestResultCompareReport,
  fileRepository: FileRepository,
  workingFileRepository: FileRepository
): Promise<string> {
  const resultFilePath = path.join(reportName, `result.json`);
  const data = {
    targetNames: report.targetNames,
    result: report.result,
  };
  await workingFileRepository.outputJSON(resultFilePath, data);

  for (const screenshot of report.screenshots) {
    const destPath = path.join(reportName, screenshot.filePath);
    await workingFileRepository.outputFile(destPath, screenshot.data);
  }

  const zipFilePath = await workingFileRepository.outputZip(reportName, true);

  const destPath = path.basename(zipFilePath);
  await fileRepository.moveFile(zipFilePath, destPath);

  return fileRepository.getFileUrl(destPath);
}
