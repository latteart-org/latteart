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
import { getRepository } from "typeorm";
import { ConfigsService } from "./ConfigsService";
import { ExportFileRepositoryService } from "./ExportFileRepositoryService";
import { serializeTestResult } from "./helper/testResultExportHelper";
import { ProjectsService } from "./ProjectsService";
import { TestProgressService } from "./TestProgressService";
import { TestResultService } from "./TestResultService";

export class ProjectExportService {
  public async export(
    projectId: string,
    includeProject: boolean,
    includeTestResults: boolean,
    includeConfig: boolean,
    service: {
      projectService: ProjectsService;
      testResultService: TestResultService;
      configService: ConfigsService;
      exportFileRepositoryService: ExportFileRepositoryService;
      testProgressService: TestProgressService;
    }
  ): Promise<string> {
    const exportProjectData = includeProject
      ? await this.extractProjectExportData(projectId, {
          projectService: service.projectService,
          testProgressService: service.testProgressService,
        })
      : null;

    const testResultsExportData = includeTestResults
      ? await this.extractTestResultsExportData({
          testResultService: service.testResultService,
        })
      : [];

    const configExportData = includeConfig
      ? await this.extractConfigExportData(projectId, {
          configService: service.configService,
        })
      : null;
    return await service.exportFileRepositoryService.exportProject(
      exportProjectData,
      testResultsExportData,
      configExportData
    );
  }

  private async extractTestResultsExportData(service: {
    testResultService: TestResultService;
  }) {
    const testResultEntities = await getRepository(TestResultEntity).find();
    return await Promise.all(
      testResultEntities.map(async (testResultEntity) => {
        const testResult =
          await service.testResultService.getTestResultForExport(
            testResultEntity.id
          );
        if (!testResult) {
          throw new Error();
        }

        const fileData = (
          await service.testResultService.collectAllTestStepScreenshots(
            testResultEntity.id
          )
        ).concat(
          await service.testResultService.collectAllVideos(testResult.id)
        );

        const serializedTestResult = serializeTestResult(testResult);
        return {
          testResultId: testResult.id,
          testResultFile: { fileName: "log.json", data: serializedTestResult },
          fileData,
        };
      })
    );
  }

  private async extractProjectExportData(
    projectId: string,
    service: {
      projectService: ProjectsService;
      testProgressService: TestProgressService;
    }
  ) {
    const project = await service.projectService.getProject(projectId);
    (project as any).version = 1;
    const dailyProgresses =
      await service.testProgressService.collectStoryDailyTestProgresses(
        project.stories.map((story) => story.id)
      );

    return {
      projectId: project.id,
      projectFile: { fileName: "project.json", data: JSON.stringify(project) },
      stories: project.stories.map((story) => {
        return {
          storyId: story.id,
          sessions: story.sessions.map((session) => {
            return {
              sessionId: session.id,
              attachedFiles: session.attachedFiles.map((attachedFile) => {
                return {
                  fileUrl: attachedFile.fileUrl ?? "",
                };
              }),
            };
          }),
        };
      }),
      progressesFile: {
        fileName: "progress.json",
        data: JSON.stringify(dailyProgresses),
      },
    };
  }

  private async extractConfigExportData(
    projectId: string,
    service: {
      configService: ConfigsService;
    }
  ) {
    const config = await service.configService.getProjectConfig(projectId);

    return {
      fileName: "config.json",
      data: JSON.stringify(config, null, 2),
    };
  }
}
