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

import { TestResultEntity } from "@/entities/TestResultEntity";
import { TimestampService } from "./TimestampService";
import path from "path";
import { FileRepository } from "@/interfaces/fileRepository";
import { convertToDownloadUrl } from "./helper/entityToResponse";
import { DataSource } from "typeorm";

export class ScreenshotsService {
  constructor(private dataSource: DataSource) {}

  public async getScreenshots(
    testResultId: string,
    fileRepository: FileRepository,
    workingFileRepository: FileRepository,
    timestampService: TimestampService
  ): Promise<string> {
    const testResult = await this.dataSource
      .getRepository(TestResultEntity)
      .findOne({
        where: { id: testResultId },
        relations: ["testSteps", "testSteps.screenshot"],
      });

    if (!testResult) {
      throw new Error(`TestResult not found.${testResultId}`);
    }
    if (!testResult.testSteps) {
      throw new Error(`TestSteps not found.${testResultId}`);
    }

    const screenshotFileNames = testResult.testSteps
      .sort((testStep1, testStep2) => {
        return testStep1.timestamp - testStep2.timestamp;
      })
      .map((testStep) => {
        return testStep.screenshot?.fileUrl.split("/")[1] ?? "";
      });
    const dirName = `screenshots_${timestampService.format("YYYYMMDD_HHmmss")}`;

    await Promise.all(
      screenshotFileNames.map(async (fileName, index) => {
        if (fileName === "") {
          return;
        }
        return await workingFileRepository.copyFile(
          fileName,
          path.join(dirName, `${index + 1}${path.extname(fileName)}`),
          "screenshot"
        );
      })
    );

    const tmpZipFilePath = await workingFileRepository.outputZip(dirName, true);

    const testResultName = convertToDownloadUrl(testResult.name);

    const zipFileName = `screenshots_${testResultName}_${timestampService.format(
      "YYYYMMDD_HHmmss"
    )}.zip`;
    await fileRepository.moveFile(tmpZipFilePath, zipFileName);

    return fileRepository.getFileUrl(zipFileName);
  }
}
