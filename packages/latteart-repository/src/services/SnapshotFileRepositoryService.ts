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
import { Project } from "@/interfaces/Projects";
import { TestResultService } from "./TestResultService";
import { ConfigsService } from "./ConfigsService";
import { TestStepService } from "./TestStepService";
import { NotesServiceImpl } from "./NotesService";
import { TestPurposeServiceImpl } from "./TestPurposeService";
import { IssueReportService } from "./IssueReportService";
import { DailyTestProgress, TestProgressService } from "./TestProgressService";
import { SnapshotConfig } from "@/interfaces/Configs";
import { convertToExportableConfig } from "@/services/helper/settingsConverter";
import { FileRepository } from "@/interfaces/fileRepository";
import { ViewerTemplate } from "@/interfaces/viewerTemplate";
import { Session } from "@/interfaces/Sessions";
import { Story } from "@/interfaces/Stories";

export interface SnapshotFileRepositoryService {
  write(project: Project, snapshotConfig: SnapshotConfig): Promise<string>;
}

export class SnapshotFileRepositoryServiceImpl
  implements SnapshotFileRepositoryService
{
  constructor(
    private service: {
      snapshotRepository: FileRepository;
      timestamp: TimestampService;
      testResult: TestResultService;
      testStep: TestStepService;
      note: NotesServiceImpl;
      testPurpose: TestPurposeServiceImpl;
      config: ConfigsService;
      issueReport: IssueReportService;
      attachedFileRepository: FileRepository;
      testProgress: TestProgressService;
      workingFileRepository: FileRepository;
      viewerTemplate: { snapshot: ViewerTemplate; history: ViewerTemplate };
    }
  ) {}

  public async write(
    project: Project,
    snapshotConfig: SnapshotConfig
  ): Promise<string> {
    const outputDirName = await this.outputProject(
      project,
      snapshotConfig.locale
    );

    const zipFilePath = await this.service.workingFileRepository.outputZip(
      outputDirName,
      true
    );

    const destPath = path.basename(zipFilePath);
    await this.service.snapshotRepository.moveFile(zipFilePath, destPath);

    return this.service.snapshotRepository.getFileUrl(destPath);
  }

  private async outputProject(project: Project, locale: string) {
    const timestamp = this.service.timestamp.format("YYYYMMDD_HHmmss");

    const outputDirPath = this.service.workingFileRepository.getFilePath(
      `snapshot_${timestamp}`
    );
    const outputDirName = `snapshot_${timestamp}`;

    await this.writeSnapshot(project, outputDirName, locale);

    // Report output
    await this.service.issueReport.writeReport(project, outputDirPath);

    return outputDirName;
  }

  private async writeSnapshot(
    project: Project,
    outputDirName: string,
    locale: string
  ): Promise<void> {
    const stories = await this.buildStoriesForSnapshot(project);

    const projectData = {
      testMatrices: project.testMatrices,
      stories,
    };

    // copy contents of "snapshot-viewer"
    await this.copySnapshotViewer(outputDirName);

    // copy contents of "history-viewer" (other than index.html)
    await this.copyHistoryViewer(outputDirName);

    const destDataDirPath = path.join(outputDirName, "data");

    // output config file
    await this.outputConfigFile(destDataDirPath, locale);

    // output project file
    await this.outputProjectFile(destDataDirPath, projectData);

    for (const story of stories) {
      if (!story.id) {
        continue;
      }

      for (const session of story.sessions) {
        if (!session.id) {
          continue;
        }

        if (session.attachedFiles && session.attachedFiles.length > 0) {
          await this.copyAttachments(
            story.id,
            session.id,
            session.attachedFiles,
            destDataDirPath
          );
        }

        if (session.testResultFiles && session.testResultFiles.length > 0) {
          await this.copyTestResult(story.id, session, destDataDirPath);
        }
      }
    }

    // output progress file
    const dailyProgresses =
      await this.service.testProgress.collectStoryDailyTestProgresses(
        stories.map((story) => story.id)
      );
    await this.outputTestProgressFile(destDataDirPath, dailyProgresses);
  }

  private async copyAttachments(
    storyId: string,
    sessionId: string,
    attachedFiles: {
      name: string;
      fileUrl: string;
    }[],
    outputDirPath: string
  ) {
    const destAttachedFilesDirPath = path.join(
      outputDirPath,
      storyId,
      sessionId,
      "attached"
    );

    for (const attachedFile of attachedFiles) {
      const attachedFileUrl = attachedFile.fileUrl;
      const attachedFileName = attachedFileUrl.split("/").slice(-1)[0];

      await this.service.workingFileRepository.copyFile(
        attachedFileName,
        path.join(destAttachedFilesDirPath, attachedFileName),
        "attachedFile"
      );
    }
  }

  private async copyTestResult(
    storyId: string,
    session: Session,
    outputDirPath: string
  ) {
    const destSessionPath = path.join(outputDirPath, storyId, session.id);

    const testResultIds = session.testResultFiles.map(({ id }) => id) ?? [];
    if (testResultIds.length === 0) {
      return;
    }
    const testResultId = testResultIds[0];
    const testStepIds = await this.service.testResult.collectAllTestStepIds(
      testResultId
    );

    const destTestResultPath = path.join(destSessionPath, "testResult");

    const testSteps = await Promise.all(
      testStepIds.map(async (testStepId) => {
        return this.service.testStep.getTestStep(testStepId);
      })
    );

    const history = await Promise.all(
      testSteps.map(async (testStep, index) => {
        const operation = {
          sequence: index + 1,
          input: testStep.operation.input,
          type: testStep.operation.type,
          elementInfo: testStep.operation.elementInfo,
          title: testStep.operation.title,
          url: testStep.operation.url,
          imageFileUrl: path.join(
            "testResult",
            path.basename(testStep.operation.imageFileUrl ?? "")
          ),
          timestamp: testStep.operation.timestamp,
          inputElements: testStep.operation.inputElements,
          windowHandle: testStep.operation.windowHandle,
          keywordTexts: testStep.operation.keywordTexts,
          isAutomatic: testStep.operation.isAutomatic,
        };

        await this.copyScreenshot(
          testStep.operation.imageFileUrl,
          destTestResultPath
        );

        const notes = (
          await Promise.all(
            testStep.notices.map(async (noteId) => {
              const note = await this.service.note.getNote(noteId);
              return note ? [note] : [];
            })
          )
        ).flat();
        const notices =
          (await Promise.all(
            notes.map(async (note) => {
              await this.copyScreenshot(note.imageFileUrl, destTestResultPath);

              return {
                sequence: index + 1,
                id: note.id,
                type: note.type,
                value: note.value,
                details: note.details,
                tags: note.tags,
                imageFileUrl: note.imageFileUrl
                  ? path.join("testResult", path.basename(note.imageFileUrl))
                  : "",
                timestamp: this.service.timestamp.unix().toString(),
              };
            })
          )) ?? [];

        const testPurposeId = testStep.intention;
        const intention = testPurposeId
          ? (await this.service.testPurpose.getTestPurpose(testPurposeId)) ??
            null
          : null;

        return {
          operation,
          bugs: [],
          notices,
          intention,
        };
      })
    );

    const testResult = await this.service.testResult.getTestResult(
      testResultId
    );

    const { config } = await this.service.config.getConfig("");
    const viewOption = {
      node: {
        unit: config.screenDefinition.screenDefType,
        definitions: config.screenDefinition.conditionGroups
          .filter(({ isEnabled }) => isEnabled)
          .map((group) => {
            return {
              name: group.screenName,
              conditions: group.conditions
                .filter(({ isEnabled }) => isEnabled)
                .map((condition) => {
                  return {
                    target: condition.definitionType,
                    method: condition.matchType,
                    value: condition.word,
                  };
                }),
            };
          }),
      },
    };

    const sequenceViewData = await this.service.testResult.generateSequenceView(
      testResultId,
      viewOption
    );

    const historyLogData = {
      history,
      coverageSources: testResult?.coverageSources ?? [],
    };

    // output log file
    await this.service.workingFileRepository.outputFile(
      path.join(destTestResultPath, "log.js"),
      `const historyLog = ${JSON.stringify(historyLogData)}`,
      "utf8"
    );

    // output sequence view file
    await this.service.workingFileRepository.outputFile(
      path.join(destTestResultPath, "sequence-view.js"),
      `const sequenceView = ${JSON.stringify(sequenceViewData)}`,
      "utf8"
    );

    // copy index.html of history-viewer
    await this.service.viewerTemplate.history.copyFile(
      this.service.workingFileRepository,
      "index.html",
      path.join(destSessionPath, "index.html")
    );
  }

  private async copyScreenshot(
    sourceImageFileUrl: string,
    destDirectoryName: string
  ) {
    if (!sourceImageFileUrl) {
      return;
    }

    const fileName = sourceImageFileUrl.split("/").slice(-1)[0];

    await this.service.workingFileRepository.copyFile(
      fileName,
      path.join(destDirectoryName, fileName),
      "screenshot"
    );
  }

  private buildStoriesForSnapshot(project: Project) {
    return Promise.all(
      project.stories.map(async (story) => {
        const sessions = await Promise.all(
          story.sessions.map(async (session, sessionIndex) => {
            const sessionIdAlias = `${sessionIndex + 1}`;

            const attachedFiles: {
              name: string;
              fileUrl: string;
            }[] =
              session.attachedFiles?.map((attachedFile) => {
                return {
                  name: attachedFile.name,
                  fileUrl: `data/${
                    story.id
                  }/${sessionIdAlias}/attached/${path.basename(
                    attachedFile?.fileUrl ?? ""
                  )}`,
                };
              }) ?? [];

            const testResultFiles: { name: string; id: string }[] =
              session.testResultFiles.map((testResultFile) => {
                return {
                  name: testResultFile.name,
                  id: testResultFile.id,
                };
              });

            const notes: {
              id: string;
              type: string;
              value: string;
              details: string;
              imageFileUrl: string;
              tags: string[];
            }[] = session.notes.map((note) => {
              return {
                id: note.id,
                type: note.type,
                value: note.value,
                details: note.details,
                imageFileUrl: `data/${
                  story.id
                }/${sessionIdAlias}/testResult/${path.basename(
                  note.imageFileUrl ?? ""
                )}`,
                tags: note.tags,
              };
            });

            const testResultFile = testResultFiles.at(0);

            const testResultId = testResultFile ? testResultFile.id : "";

            const testResult = await this.service.testResult.getTestResult(
              testResultId
            );

            const testPurposes: {
              id: string;
              type: string;
              value: string;
              details: string;
              imageFileUrl: string;
              tags: string[];
            }[] = (
              await Promise.all(
                testResult
                  ? testResult.testSteps.map(async ({ intention }) => {
                      if (!intention) {
                        return [];
                      }

                      return {
                        id: intention.id,
                        type: intention.type,
                        value: intention.value,
                        details: intention.details,
                        imageFileUrl: "",
                        tags: [],
                      };
                    })
                  : []
              )
            ).flat();

            return {
              index: session.index,
              name: session.name,
              id: sessionIdAlias,
              isDone: session.isDone,
              doneDate: session.doneDate,
              testItem: session.testItem,
              testerName: session.testerName,
              memo: session.memo,
              attachedFiles,
              testResultFiles,
              initialUrl: session.initialUrl,
              testPurposes,
              notes,
              testingTime: session.testingTime,
            };
          })
        );

        return {
          ...story,
          sessions,
        };
      })
    );
  }

  private async copySnapshotViewer(outputDirName: string) {
    // copy snapshot directory
    await this.service.viewerTemplate.snapshot.copyDir(
      this.service.workingFileRepository,
      outputDirName
    );
  }

  private async copyHistoryViewer(outputDirName: string) {
    // copy css files
    await this.service.viewerTemplate.history.copyFiles(
      this.service.workingFileRepository,
      "css",
      path.join(outputDirName, "css")
    );

    // copy fonts files
    await this.service.viewerTemplate.history.copyFiles(
      this.service.workingFileRepository,
      "fonts",
      path.join(outputDirName, "fonts")
    );

    // copy js files
    await this.service.viewerTemplate.history.copyFiles(
      this.service.workingFileRepository,
      "js",
      path.join(outputDirName, "js")
    );
  }

  private async outputConfigFile(outputDirPath: string, locale: string) {
    const tempConfig = await this.service.config.getConfig("");
    const config = convertToExportableConfig(tempConfig);
    const configWithLocale = {
      ...config,
      locale,
    };
    const settingsData = JSON.stringify(configWithLocale);
    await this.service.workingFileRepository.outputFile(
      path.join(outputDirPath, "latteart.config.js"),
      `const settings = ${settingsData}`,
      "utf8"
    );
  }

  private async outputProjectFile(
    outputDirPath: string,
    projectData: {
      testMatrices: {
        id: string;
        name: string;
        groups: {
          id: string;
          name: string;
          testTargets: {
            id: string;
            name: string;
            plans: { viewPointId: string; value: number }[];
          }[];
        }[];
        viewPoints: { id: string; name: string }[];
      }[];
      stories: Story[];
    }
  ) {
    await this.service.workingFileRepository.outputFile(
      path.join(outputDirPath, "project.js"),
      `const snapshot = ${JSON.stringify(projectData)}`,
      "utf8"
    );
  }

  private async outputTestProgressFile(
    outputDirPath: string,
    dailyProgresses: DailyTestProgress[]
  ) {
    await this.service.workingFileRepository.outputFile(
      path.join(outputDirPath, "progress.js"),
      `const dailyTestProgresses = ${JSON.stringify(dailyProgresses)}`,
      "utf8"
    );
  }
}
