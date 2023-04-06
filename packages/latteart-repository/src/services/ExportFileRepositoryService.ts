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

import path from "path";
import { TimestampService } from "./TimestampService";
import { FileRepository } from "@/interfaces/fileRepository";

interface exportProjectData {
  projectId: string;
  projectFile: { fileName: string; data: string };
  stories: {
    storyId: string;
    sessions: {
      sessionId: string;
      attachedFiles: {
        fileUrl: string;
      }[];
    }[];
  }[];
  progressesFile: { fileName: string; data: string };
}
interface exportTestResultData {
  testResultId: string;
  testResultFile: { fileName: string; data: string };
  screenshots: { id: string; fileUrl: string }[];
}
export interface ExportFileRepositoryService {
  exportProject(
    project: exportProjectData | null,
    testResults: exportTestResultData[]
  ): Promise<string>;

  exportTestResult(testResult: {
    name: string;
    testResultFile: { fileName: string; data: string };
    screenshots: { id: string; fileUrl: string }[];
  }): Promise<string>;
}

export class ExportFileRepositoryServiceImpl
  implements ExportFileRepositoryService
{
  constructor(
    private service: {
      exportFileRepository: FileRepository;
      workingFileRepository: FileRepository;
      timestamp: TimestampService;
    }
  ) {}

  public async exportProject(
    project: exportProjectData | null,
    testResults: exportTestResultData[]
  ): Promise<string> {
    const timestamp = this.service.timestamp.format("YYYYMMDD_HHmmss");
    const outputDirName = `project_${timestamp}`;

    if (project) {
      await this.outputProjectFiles(
        path.join(outputDirName, "projects"),
        project
      );
    }

    if (testResults.length > 0) {
      const testResultsDirPath = path.join(outputDirName, "test-results");
      await Promise.all(
        testResults.map(async (testResult) => {
          await this.outputTestResultFiles(testResultsDirPath, testResult);
        })
      );
    }

    const zipFilePath = await this.service.workingFileRepository.outputZip(
      outputDirName,
      false
    );
    console.log("<< completed zip!! >>");

    await this.service.exportFileRepository.moveFile(
      zipFilePath,
      path.basename(zipFilePath)
    );
    console.log("<< completed move!! >>");

    return this.service.exportFileRepository.getFileUrl(
      path.basename(zipFilePath)
    );
  }

  public async outputProjectFiles(
    projectsDirPath: string,
    project: exportProjectData
  ): Promise<void> {
    const projectPath = path.join(projectsDirPath, project.projectId);
    await this.service.workingFileRepository.outputFile(
      path.join(projectPath, project.projectFile.fileName),
      project.projectFile.data
    );

    await this.service.workingFileRepository.outputFile(
      path.join(projectPath, project.progressesFile.fileName),
      project.progressesFile.data
    );

    await Promise.all(
      project.stories.map(async (story) => {
        await Promise.all(
          story.sessions.map(async (session) => {
            await Promise.all(
              session.attachedFiles.map(async (attachedFile) => {
                if (attachedFile.fileUrl) {
                  const distAttachedDirPath = path.join(
                    projectPath,
                    story.storyId,
                    session.sessionId,
                    "attached"
                  );

                  const fileName = attachedFile.fileUrl.split("/").slice(-1)[0];

                  await this.service.workingFileRepository.copyFile(
                    fileName,
                    path.join(distAttachedDirPath, fileName),
                    "attachedFile"
                  );
                }
                return;
              })
            );
          })
        );
      })
    );
  }

  public async outputTestResultFiles(
    testResultsDirPath: string,
    testResult: exportTestResultData
  ): Promise<void> {
    const testResultPath = path.join(
      testResultsDirPath,
      testResult.testResultId
    );
    console.log(
      `log.json: ${path.join(
        testResultPath,
        testResult.testResultFile.fileName
      )}`
    );
    await this.service.workingFileRepository.outputFile(
      path.join(testResultPath, testResult.testResultFile.fileName),
      testResult.testResultFile.data
    );

    await Promise.all(
      testResult.screenshots.map(async (screenshot) => {
        const fileName = screenshot.fileUrl.split("/").slice(-1)[0];

        return await this.service.workingFileRepository.copyFile(
          fileName,
          path.join(testResultPath, "screenshot", fileName),
          "screenshot"
        );
      })
    ).catch((e) => {
      console.log(e);
      throw e;
    });
  }

  public async exportTestResult(testResult: {
    name: string;
    testResultFile: { fileName: string; data: string };
    screenshots: { id: string; fileUrl: string }[];
  }): Promise<string> {
    const outputDirName = await this.outputFiles(testResult);

    const zipFilePath = await this.service.workingFileRepository.outputZip(
      outputDirName,
      true
    );

    const timestamp = this.service.timestamp.format("YYYYMMDD_HHmmss");

    const exportFileName = `${testResult.name}_${timestamp}.zip`;

    await this.service.exportFileRepository.moveFile(
      zipFilePath,
      exportFileName
    );

    return this.service.exportFileRepository.getFileUrl(exportFileName);
  }

  private async outputFiles(testResult: {
    name: string;
    testResultFile: { fileName: string; data: string };
    screenshots: { id: string; fileUrl: string }[];
  }) {
    const outputDirName = `test_result`;
    await this.service.workingFileRepository.outputFile(
      path.join(outputDirName, testResult.testResultFile.fileName),
      testResult.testResultFile.data
    );

    const screenshotFileNames = testResult.screenshots.map(({ fileUrl }) => {
      return fileUrl.split("/").slice(-1)[0];
    });

    await Promise.all(
      screenshotFileNames.map((fileName) => {
        return this.service.workingFileRepository.copyFile(
          fileName,
          path.join(outputDirName, path.basename(fileName)),
          "screenshot"
        );
      })
    );

    return outputDirName;
  }
}
