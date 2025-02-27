/**
 * Copyright 2025 NTT Corporation.
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
import { ConfigsService } from "./ConfigsService";
import { ExportFileRepositoryService } from "./ExportFileRepositoryService";
import { serializeTestResult } from "./helper/testResultExportHelper";
import { ProjectsService } from "./ProjectsService";
import { TestProgressService } from "./TestProgressService";
import { TestResultService } from "./TestResultService";
import { DataSource } from "typeorm";
import { TestHintPropEntity } from "@/entities/TestHintPropEntity";
import { TestHintEntity } from "@/entities/TestHintEntity";
import { convertMutationToExportData } from "./helper/mutationHelper";

export class ProjectExportService {
  constructor(private dataSource: DataSource) {}

  public async export(
    projectId: string,
    includeProject: boolean,
    includeTestResults: boolean,
    includeConfig: boolean,
    includeTestHints: boolean,
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

    const commentsExportData = includeTestResults
      ? await this.extractCommentsExportData()
      : [];

    const mutationsExportData = includeTestResults
      ? await this.extractMutationsExportData()
      : [];

    const testHintsExportData = includeTestHints
      ? await this.extractTestHintExportData()
      : null;

    const configExportData = includeConfig
      ? await this.extractConfigExportData(projectId, {
          configService: service.configService,
        })
      : null;
    return await service.exportFileRepositoryService.exportProject(
      exportProjectData,
      testResultsExportData,
      testHintsExportData,
      commentsExportData,
      mutationsExportData,
      configExportData
    );
  }

  private async extractTestResultsExportData(service: {
    testResultService: TestResultService;
  }) {
    const testResultEntities = await this.dataSource
      .getRepository(TestResultEntity)
      .find();
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
          await service.testResultService.collectAllScreenshots(testResult.id)
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

  private async extractMutationsExportData(): Promise<
    {
      testResultId: string;
      fileName: string;
      fileData: string;
    }[]
  > {
    return (
      await this.dataSource
        .getRepository(TestResultEntity)
        .find({ relations: ["mutations", "mutations.screenshot"] })
    ).map((testResult) => {
      return {
        testResultId: testResult.id,
        fileName: "mutations.json",
        fileData: JSON.stringify(
          (testResult.mutations ?? []).map((mutation) => {
            return convertMutationToExportData(testResult.id, mutation);
          })
        ),
      };
    });
  }

  private async extractCommentsExportData(): Promise<
    {
      testResultId: string;
      fileName: string;
      fileData: string;
    }[]
  > {
    return (
      await this.dataSource
        .getRepository(TestResultEntity)
        .find({ relations: ["comments"] })
    ).map((testResult) => {
      return {
        testResultId: testResult.id,
        fileName: "comments.json",
        fileData: JSON.stringify(
          (testResult.comments ?? []).map((comment) => {
            return {
              id: comment.id,
              testResult: testResult.id,
              value: comment.value,
              timestamp: comment.timestamp,
            };
          })
        ),
      };
    });
  }

  private async extractTestHintExportData() {
    const props = (
      await this.dataSource.getRepository(TestHintPropEntity).find()
    ).map((prop) => {
      return {
        id: prop.id,
        name: prop.name,
        type: prop.type,
        listItems: prop.listItems ? JSON.parse(prop.listItems) : [],
        index: prop.index,
      };
    });

    const data = (
      await this.dataSource.getRepository(TestHintEntity).find()
    ).map((hint) => {
      return {
        id: hint.id,
        value: hint.value,
        issues: JSON.parse(hint.issues),
        testMatrixName: hint.testMatrixName,
        groupName: hint.groupName,
        testTargetName: hint.testTargetName,
        viewPointName: hint.viewPointName,
        customs: JSON.parse(hint.customs),
        commentWords: JSON.parse(hint.commentWords),
        operationElements: JSON.parse(hint.operationElements),
        createdAt: hint.createdAt,
      };
    });

    return {
      fileName: "test-hints.json",
      data: JSON.stringify({ props, data }),
    };
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
