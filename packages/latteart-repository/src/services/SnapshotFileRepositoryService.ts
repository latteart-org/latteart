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
import fs from "fs-extra";
import { TimestampService } from "./TimestampService";
import FileArchiver from "@/lib/FileArchiver";
import { StaticDirectoryService } from "./StaticDirectoryService";
import os from "os";
import { Project } from "@/interfaces/Projects";
import { TestResultService } from "./TestResultService";
import { ConfigsService } from "./ConfigsService";
import { TestStepService } from "./TestStepService";
import { NotesServiceImpl } from "./NotesService";
import { TestPurposeServiceImpl } from "./TestPurposeService";
import { ImageFileRepositoryService } from "./ImageFileRepositoryService";
import { IssueReportService } from "./IssueReportService";
import { DailyTestProgress, TestProgressService } from "./TestProgressService";
import { SnapshotConfig } from "@/interfaces/Configs";
import { convertToExportableConfig } from "@/lib/settings/settingsConverter";

export interface SnapshotFileRepositoryService {
  write(project: Project, snapshotConfig: SnapshotConfig): Promise<string>;
}

export class SnapshotFileRepositoryServiceImpl
  implements SnapshotFileRepositoryService
{
  constructor(
    private service: {
      staticDirectory: StaticDirectoryService;
      imageFileRepository: ImageFileRepositoryService;
      timestamp: TimestampService;
      testResult: TestResultService;
      testStep: TestStepService;
      note: NotesServiceImpl;
      testPurpose: TestPurposeServiceImpl;
      config: ConfigsService;
      issueReport: IssueReportService;
      attachedFileRepository: StaticDirectoryService;
      testProgress: TestProgressService;
    },
    private template: {
      snapshotViewer: {
        path: string;
      };
      historyViewer: {
        path: string;
      };
    }
  ) {}

  public async write(
    project: Project,
    snapshotConfig: SnapshotConfig
  ): Promise<string> {
    const tmpProjectDirectoryPath = await this.outputProject(
      project,
      snapshotConfig.locale
    );

    const zipFilePath = await new FileArchiver(tmpProjectDirectoryPath, {
      deleteSource: true,
    }).zip();

    const destPath = path.basename(zipFilePath);
    await this.service.staticDirectory.moveFile(zipFilePath, destPath);

    return this.service.staticDirectory.getFileUrl(destPath);
  }

  private async outputProject(project: Project, locale: string) {
    const timestamp = this.service.timestamp.format("YYYYMMDD_HHmmss");

    const tmpDirPath = await fs.mkdtemp(path.join(os.tmpdir(), "latteart-"));

    const outputDirectoryPath = path.join(tmpDirPath, `snapshot_${timestamp}`);

    await this.writeSnapshot(project, outputDirectoryPath, locale);

    // Report output
    await this.service.issueReport.writeReport(project, outputDirectoryPath);

    return outputDirectoryPath;
  }

  private async writeSnapshot(
    project: Project,
    outputDirPath: string,
    locale: string
  ): Promise<void> {
    const stories = await this.buildStoriesForSnapshot(project);

    const projectData = {
      testMatrices: project.testMatrices,
      stories,
    };

    // copy contents of "snapshot-viewer"
    await this.copySnapshotViewer(outputDirPath);

    // copy contents of "history-viewer" (other than index.html)
    await this.copyHistoryViewer(outputDirPath);

    const destDataDirPath = path.join(outputDirPath, "data");

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

    await fs.promises.mkdir(destAttachedFilesDirPath, { recursive: true });

    for (const attachedFile of attachedFiles) {
      const attachedFileUrl = attachedFile.fileUrl;
      const attachedFileName = attachedFileUrl.split("/").slice(-1)[0];

      const attachedFilePath =
        this.service.attachedFileRepository.getJoinedPath(attachedFileName);

      await fs.copyFile(
        attachedFilePath,
        path.join(destAttachedFilesDirPath, attachedFileName)
      );
    }
  }

  private async copyTestResult(
    storyId: string,
    session: {
      id: string;
      attachedFiles: {
        name: string;
        fileUrl: string;
      }[];
      doneDate: string;
      isDone: boolean;
      issues: {
        details: string;
        source: {
          index: number;
          type: string;
        };
        status: string;
        ticketId: string;
        type: string;
        value: string;
      }[];
      memo: string;
      name: string;
      testItem: string;
      testResultFiles?: {
        name: string;
        path: string;
      }[];
      testerName: string;
      testingTime: number;
    },
    outputDirPath: string
  ) {
    const destSessionPath = path.join(outputDirPath, storyId, session.id);

    const testResultIds =
      session.testResultFiles?.map(({ path: id }) => id) ?? [];
    if (testResultIds.length === 0) {
      return;
    }
    const testResultId = testResultIds[0];
    const testStepIds = await this.service.testResult.collectAllTestStepIds(
      testResultId
    );

    const destTestResultPath = path.join(destSessionPath, "testResult");
    await fs.promises.mkdir(destTestResultPath, { recursive: true });

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
    await fs.outputFile(
      path.join(destTestResultPath, "log.js"),
      `const historyLog = ${JSON.stringify(historyLogData)}`,
      { encoding: "utf-8" }
    );

    // output sequence view file
    await fs.outputFile(
      path.join(destTestResultPath, "sequence-view.js"),
      `const sequenceView = ${JSON.stringify(sequenceViewData)}`,
      { encoding: "utf-8" }
    );

    // copy index.html of history-viewer
    await fs.copyFile(
      path.join(this.template.historyViewer.path, "index.html"),
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

    const operationScreenshotFileName = sourceImageFileUrl
      .split("/")
      .slice(-1)[0];
    const sourceScreenshotFilePath =
      this.service.imageFileRepository.getFilePath(operationScreenshotFileName);
    const destScreenshotFilePath = path.join(
      destDirectoryName,
      path.basename(sourceScreenshotFilePath)
    );
    await fs.copyFile(sourceScreenshotFilePath, destScreenshotFilePath);
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

            const testResultFiles:
              | {
                  name: string;
                  path: string;
                }[]
              | undefined =
              session.testResultFiles === undefined
                ? undefined
                : session.testResultFiles.map((testResultFile) => {
                    return {
                      name: testResultFile.name,
                      path: testResultFile.id,
                    };
                  });

            const issues: {
              type: string;
              value: string;
              details: string;
              status: string;
              ticketId: string;
              source: {
                type: string;
                index: number;
              };
              imageFilePath?: string;
              tags?: string[];
            }[] = session.issues.map((issue) => {
              return {
                type: issue.source.type,
                value: issue.value,
                details: issue.details,
                status: issue.status,
                ticketId: issue.ticketId,
                source: {
                  type: issue.source.type,
                  index: issue.source.index,
                },
                imageFilePath: `data/${
                  story.id
                }/${sessionIdAlias}/testResult/${path.basename(
                  issue.imageFilePath ?? ""
                )}`,
                tags: issue.tags ?? [],
              };
            });

            const testResultFile = testResultFiles?.at(0);

            const testResultId = testResultFile ? testResultFile.path : "";

            const testResult = await this.service.testResult.getTestResult(
              testResultId
            );

            const intentions: {
              value: string;
              details: string;
            }[] = (
              await Promise.all(
                testResult
                  ? testResult.testSteps.map(async ({ intention }) => {
                      if (!intention) {
                        return [];
                      }

                      return {
                        value: intention.value,
                        details: intention.details,
                      };
                    })
                  : []
              )
            ).flat();

            return {
              name: session.name,
              id: sessionIdAlias,
              isDone: session.isDone,
              doneDate: session.doneDate,
              testItem: session.testItem,
              testerName: session.testerName,
              memo: session.memo,
              attachedFiles,
              testResultFiles,
              issues,
              intentions,
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

  private async copySnapshotViewer(outputDirPath: string) {
    const viewerTemplatePath = this.template.snapshotViewer.path;

    await fs.mkdirp(outputDirPath);
    await fs.copyFile(
      path.join(viewerTemplatePath, "index.html"),
      path.join(outputDirPath, "index.html")
    );
    await this.copyViewer(viewerTemplatePath, outputDirPath);
  }

  private async copyHistoryViewer(outputDirPath: string) {
    await this.copyViewer(this.template.historyViewer.path, outputDirPath);
  }

  private async copyViewer(viewerTemplatePath: string, outputDirPath: string) {
    const destCssDirPath = path.join(outputDirPath, "css");
    await fs.mkdirp(destCssDirPath);
    const cssFiles = await fs.promises.readdir(
      path.join(viewerTemplatePath, "css")
    );
    for (const cssFile of cssFiles) {
      await fs.copyFile(
        path.join(viewerTemplatePath, "css", cssFile),
        path.join(destCssDirPath, cssFile)
      );
    }

    const destFontDirPath = path.join(outputDirPath, "fonts");
    await fs.mkdirp(destFontDirPath);
    const fontFiles = await fs.promises.readdir(
      path.join(viewerTemplatePath, "fonts")
    );
    for (const fontFile of fontFiles) {
      await fs.copyFile(
        path.join(viewerTemplatePath, "fonts", fontFile),
        path.join(destFontDirPath, fontFile)
      );
    }

    const destJsDirPath = path.join(outputDirPath, "js");
    await fs.mkdirp(destJsDirPath);
    const jsFiles = await fs.promises.readdir(
      path.join(viewerTemplatePath, "js")
    );
    for (const jsFile of jsFiles) {
      await fs.copyFile(
        path.join(viewerTemplatePath, "js", jsFile),
        path.join(destJsDirPath, jsFile)
      );
    }
  }

  private async outputConfigFile(outputDirPath: string, locale: string) {
    const tempConfig = await this.service.config.getConfig("");
    const config = convertToExportableConfig(tempConfig);
    const configWithLocale = {
      ...config,
      locale,
    };
    const settingsData = JSON.stringify(configWithLocale);
    await fs.outputFile(
      path.join(outputDirPath, "latteart.config.js"),
      `const settings = ${settingsData}`,
      { encoding: "utf-8" }
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
      stories: {
        id: string;
        testMatrixId: string;
        testTargetId: string;
        viewPointId: string;
        status: string;
        sessions: {
          name: string;
          id: string;
          isDone: boolean;
          doneDate: string;
          testItem: string;
          testerName: string;
          memo: string;
          attachedFiles: { name: string; fileUrl: string }[];
          testResultFiles: { name: string; path: string }[] | undefined;
          issues: {
            type: string;
            value: string;
            details: string;
            status: string;
            ticketId: string;
            source: { type: string; index: number };
            imageFilePath?: string;
            tags?: string[];
          }[];
          intentions: {
            value: string;
            details: string;
          }[];
          testingTime: number;
        }[];
      }[];
    }
  ) {
    await fs.outputFile(
      path.join(outputDirPath, "project.js"),
      `const snapshot = ${JSON.stringify(projectData)}`,
      { encoding: "utf-8" }
    );
  }

  private async outputTestProgressFile(
    outputDirPath: string,
    dailyProgresses: DailyTestProgress[]
  ) {
    await fs.outputFile(
      path.join(outputDirPath, "progress.js"),
      `const dailyTestProgresses = ${JSON.stringify(dailyProgresses)}`,
      { encoding: "utf-8" }
    );
  }
}
