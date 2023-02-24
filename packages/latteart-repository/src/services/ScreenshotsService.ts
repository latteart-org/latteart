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

import { TestResultEntity } from "@/entities/TestResultEntity";
import { getRepository } from "typeorm";
import { StaticDirectoryService } from "./StaticDirectoryService";
import { TimestampService } from "./TimestampService";

import path from "path";
import FileArchiver from "@/lib/FileArchiver";
import fs from "fs-extra";
import os from "os";

export class ScreenshotsService {
  public async getScreenshots(
    testResultId: string,
    tempDirectoryService: StaticDirectoryService,
    screenshotDirectoryService: StaticDirectoryService,
    timestampService: TimestampService
  ): Promise<string> {
    const testResult = await getRepository(TestResultEntity).findOne(
      testResultId,
      { relations: ["testSteps", "testSteps.screenshot"] }
    );
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
    const tmpDirPath = await fs.mkdtemp(path.join(os.tmpdir(), "latteart-"));
    const dirName = `screenshots_${timestampService.format("YYYYMMDD_HHmmss")}`;

    const dirPath = path.join(tmpDirPath, dirName);
    await fs.mkdir(dirPath);

    await Promise.all(
      screenshotFileNames.map(async (fileName, index) => {
        const filePath = screenshotDirectoryService.getJoinedPath(fileName);
        return await fs.copyFile(
          filePath,
          path.join(dirPath, `${index + 1}${path.extname(fileName)}`)
        );
      })
    );

    const tmpZipFilePath = await new FileArchiver(dirPath, {
      deleteSource: true,
    }).zip();

    const zipFileName = `screenshots_${
      testResult.name
    }_${timestampService.format("YYYYMMDD_HHmmss")}.zip`;
    await tempDirectoryService.moveFile(tmpZipFilePath, zipFileName);

    return tempDirectoryService.getFileUrl(zipFileName);
  }
}
