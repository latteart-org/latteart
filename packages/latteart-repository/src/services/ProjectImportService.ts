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

import { ProjectEntity } from "@/entities/ProjectEntity";
import { ProgressData, Project } from "@/interfaces/Projects";
import { TestResultService } from "./TestResultService";
import path from "path";
import { readZip } from "@/gateways/zipReader";
import { TestPurposeService } from "./TestPurposeService";
import { NotesService } from "./NotesService";
import { TestMatrixEntity } from "@/entities/TestMatrixEntity";
import { TestTargetGroupEntity } from "@/entities/TestTargetGroupEntity";
import { TestTargetEntity } from "@/entities/TestTargetEntity";
import { ViewPointEntity } from "@/entities/ViewPointEntity";
import { StoryEntity } from "@/entities/StoryEntity";
import { SessionEntity } from "@/entities/SessionEntity";
import { AttachedFileEntity } from "@/entities/AttachedFilesEntity";
import { TimestampService } from "./TimestampService";
import { TestStepService } from "./TestStepService";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { TransactionRunner } from "@/TransactionRunner";
import { TestProgressEntity } from "@/entities/TestProgressEntity";
import { unixtimeToDate } from "@/domain/timeUtil";
import { DailyTestProgress } from "./TestProgressService";
import { TestResultImportService } from "./TestResultImportService";
import { ImportFileRepositoryServiceImpl } from "./ImportFileRepositoryService";
import { FileRepository } from "@/interfaces/fileRepository";

interface TestResultData {
  testResultId: string;
  testResultFile: { fileName: string; data: string };
  screenshots: { filePath: string; data: Buffer }[];
}

interface ProjectData {
  projectId: string;
  projectFile: { fileName: string; data: string };
  stories: {
    storyId: string;
    sessions: {
      sessionId: string;
      attachedFiles: {
        filePath: string;
        data: string;
      }[];
    }[];
  }[];
  progressesFile?: { fileName: string; data: string };
}

export class ProjectImportService {
  public async import(
    importFile: { data: string; name: string },
    includeProject: boolean,
    includeTestResults: boolean,
    service: {
      timestampService: TimestampService;
      testResultService: TestResultService;
      testStepService: TestStepService;
      screenshotFileRepository: FileRepository;
      attachedFileRepository: FileRepository;
      notesService: NotesService;
      testPurposeService: TestPurposeService;
      transactionRunner: TransactionRunner;
    }
  ): Promise<{ projectId: string }> {
    const testResultImportService = new TestResultImportService({
      importFileRepository: new ImportFileRepositoryServiceImpl(),
      screenshotFileRepository: service.screenshotFileRepository,
      timestamp: service.timestampService,
    });
    const { testResultFiles, projectFiles } = await this.readImportFile(
      importFile.data,
      {
        includeProject,
        includeTestResults,
      }
    );

    let testResultIdMap: Map<string, string> = new Map();
    let projectId = "";
    if (includeTestResults) {
      const testResultDatas = this.extractTestResultsData(testResultFiles);
      testResultIdMap = await this.importTestResults(testResultDatas, {
        testResultImportService,
      });
    }

    if (includeProject) {
      const projectData = this.extractProjectData(projectFiles);
      projectId = await this.importProject(projectData, testResultIdMap, {
        timestampService: service.timestampService,
        attachedFileRepository: service.attachedFileRepository,
        transactionRunner: service.transactionRunner,
      });
    }

    return { projectId };
  }

  private extractProjectData(
    files: {
      filePath: string;
      data: string | Buffer;
    }[]
  ): ProjectData {
    const projectData: ProjectData = {
      projectId: "",
      projectFile: { fileName: "", data: "" },
      stories: [],
    };
    for (const file of files) {
      const fileName = path.basename(file.filePath);
      const divs = file.filePath.split("/");
      const projectsDirIndex = divs.findIndex((div) => {
        return div === "projects";
      });
      if (fileName === "project.json") {
        projectData.projectId = divs[projectsDirIndex + 1];
        projectData.projectFile.fileName = "project.json";
        projectData.projectFile.data = file.data as string;
        continue;
      }
      if (fileName === "progress.json") {
        projectData.progressesFile = {
          fileName: "progress.json",
          data: file.data as string,
        };
        continue;
      }
      const storyId = divs[projectsDirIndex + 2];
      const sessionId = divs[projectsDirIndex + 3];

      let targetStory = projectData.stories.find((story) => {
        return story.storyId === storyId;
      });
      if (!targetStory) {
        targetStory = {
          storyId,
          sessions: [],
        };
        projectData.stories.push(targetStory);
      }

      let targetSession = targetStory.sessions.find((session) => {
        return session.sessionId === sessionId;
      });
      if (!targetSession) {
        targetSession = {
          sessionId,
          attachedFiles: [],
        };
        targetStory.sessions.push(targetSession);
      }
      const dataBuffer =
        typeof file.data === "string" ? Buffer.from(file.data) : file.data;
      targetSession.attachedFiles.push({
        filePath: file.filePath,
        data: dataBuffer.toString("base64"),
      });
    }

    return projectData;
  }

  private extractTestResultsData(
    testResultFiles: {
      filePath: string;
      data: string | Buffer;
    }[]
  ): TestResultData[] {
    const testResultMap: Map<string, TestResultData> = new Map();
    for (const testResultFile of testResultFiles) {
      const divs = testResultFile.filePath.split("/");
      const testResultPosition = divs.findIndex((div) => {
        return div === "test-results";
      });
      const testResultId = divs[testResultPosition + 1];

      const testResultObj: TestResultData = testResultMap.get(testResultId) ?? {
        testResultId,
        testResultFile: { fileName: "", data: "" },
        screenshots: [],
      };

      if (path.basename(testResultFile.filePath) === "log.json") {
        testResultObj.testResultFile = {
          fileName: testResultFile.filePath,
          data: testResultFile.data as string,
        };
      } else if (
        [".png", ".webp"].includes(path.extname(testResultFile.filePath)) &&
        typeof testResultFile.data !== "string"
      ) {
        testResultObj.screenshots.push({
          filePath: path.basename(testResultFile.filePath),
          data: testResultFile.data,
        });
      }
      testResultMap.set(testResultId, testResultObj);
    }

    const result = Array.from(testResultMap).map((testResult) => {
      return testResult[1];
    });

    return result;
  }

  private async importProject(
    projectData: ProjectData,
    testResultIdMap: Map<string, string>,
    service: {
      timestampService: TimestampService;
      transactionRunner: TransactionRunner;
      attachedFileRepository: FileRepository;
    }
  ): Promise<string> {
    const projectJson = JSON.parse(projectData.projectFile.data) as Project & {
      progressDatas?: ProgressData[];
    };
    const progressJson = projectData.progressesFile
      ? (JSON.parse(projectData.progressesFile.data) as DailyTestProgress[])
      : [];
    let projectId = "";

    // <oldId, newEntity(newId)>
    const testMatrixRelationMap: Map<string, TestMatrixEntity> = new Map();
    const groupIdRelationMap: Map<string, string> = new Map();
    const testTargetRelationMap: Map<string, string> = new Map();

    const newTestTargetProgressDatas =
      progressJson.length > 0
        ? progressJson.flatMap(({ date, storyProgresses }) => {
            return storyProgresses.map((story) => {
              return { date, storyProgresses: story };
            });
          })
        : undefined;

    const oldTestTargetProgressDatas =
      projectJson.progressDatas?.flatMap(({ testMatrixProgressDatas }) => {
        return testMatrixProgressDatas.flatMap(({ date, groups }) => {
          return groups.flatMap((group) => {
            return group.testTargets.map((testTarget) => {
              return {
                date,
                testTargetId: testTarget.id,
                plannedSessionNumber: testTarget.progress.planNumber,
                completedSessionNumber: testTarget.progress.completedNumber,
                incompletedSessionNumber: testTarget.progress.incompletedNumber,
              };
            });
          });
        });
      }) ?? [];

    await service.transactionRunner.waitAndRun(
      async (transactionalEntityManager) => {
        const projectEntity = await transactionalEntityManager.save(
          new ProjectEntity(projectJson.name)
        );
        projectId = projectEntity.id;

        for (const [
          testMatrixIndex,
          testMatrixBeforeSaving,
        ] of projectJson.testMatrices.entries()) {
          const newTestMatrixEntity = await transactionalEntityManager.save(
            new TestMatrixEntity(
              testMatrixBeforeSaving.name,
              testMatrixIndex,
              projectEntity
            )
          );

          testMatrixRelationMap.set(
            testMatrixBeforeSaving.id,
            newTestMatrixEntity
          );

          const viewPointMap: Map<string, ViewPointEntity> = new Map();
          for (const [
            index,
            viewPointBeforeSaving,
          ] of testMatrixBeforeSaving.viewPoints.entries()) {
            const viewPointEntity = new ViewPointEntity();
            viewPointEntity.name = viewPointBeforeSaving.name;
            viewPointEntity.description =
              viewPointBeforeSaving.description ?? "";
            viewPointEntity.index = index;
            viewPointEntity.testMatrices = [newTestMatrixEntity];
            console.log(viewPointEntity);
            const newViewPointEntity = await transactionalEntityManager.save(
              viewPointEntity
            );
            viewPointMap.set(viewPointBeforeSaving.id, newViewPointEntity);
          }

          for (const [
            groupIndex,
            groupBeforeSaving,
          ] of testMatrixBeforeSaving.groups.entries()) {
            const testTargetGroupEntity = new TestTargetGroupEntity();
            testTargetGroupEntity.name = groupBeforeSaving.name;
            testTargetGroupEntity.index = groupIndex;
            testTargetGroupEntity.testMatrix = newTestMatrixEntity;
            const groupEntity = await transactionalEntityManager.save(
              testTargetGroupEntity
            );
            groupIdRelationMap.set(groupBeforeSaving.id, groupEntity.id);

            for (const [
              testTargetIndex,
              testTargetBeforeSaving,
            ] of groupBeforeSaving.testTargets.entries()) {
              const testTargetEntity = new TestTargetEntity();
              testTargetEntity.name = testTargetBeforeSaving.name;
              const plans = testTargetBeforeSaving.plans.map((plan) => {
                return {
                  viewPointId: viewPointMap.get(plan.viewPointId)?.id ?? "",
                  value: plan.value,
                };
              });
              testTargetEntity.text = JSON.stringify(plans);
              testTargetEntity.index = testTargetIndex;
              testTargetEntity.testTargetGroup = groupEntity;
              const newTestTargetEntity = await transactionalEntityManager.save(
                testTargetEntity
              );
              testTargetRelationMap.set(
                testTargetBeforeSaving.id,
                newTestTargetEntity.id
              );

              let storyIndex = 0;
              for (const [oldViewPointId, newViewPointEntity] of viewPointMap) {
                storyIndex++;
                const storyBeforeSaving = projectJson.stories.find((story) => {
                  if (story.testMatrixId) {
                    return (
                      story.testMatrixId === testMatrixBeforeSaving.id &&
                      story.testTargetId === testTargetBeforeSaving.id &&
                      story.viewPointId === oldViewPointId
                    );
                  } else {
                    const projectV0IdList = story.id.split("_");
                    return (
                      projectV0IdList[0] === testMatrixBeforeSaving.id &&
                      projectV0IdList[3] === testTargetBeforeSaving.id &&
                      projectV0IdList[1] === oldViewPointId
                    );
                  }
                });
                if (!storyBeforeSaving) {
                  throw new Error(
                    `Story not found. testMatrixId: ${testMatrixBeforeSaving.id}, testTargetId: ${testTargetBeforeSaving.id}, viewPointId: ${oldViewPointId}`
                  );
                }

                const storyEntity = new StoryEntity();
                storyEntity.status = storyBeforeSaving.status;
                storyEntity.index = storyIndex;
                storyEntity.planedSessionNumber =
                  plans.find((plan) => plan.viewPointId === oldViewPointId)
                    ?.value ?? 0;
                storyEntity.testMatrix = newTestMatrixEntity;
                storyEntity.viewPoint = newViewPointEntity;
                storyEntity.testTarget = newTestTargetEntity;
                const newStoryEntity = await transactionalEntityManager.save(
                  storyEntity
                );

                const storyData = projectData.stories.find(
                  (s) => s.storyId === storyBeforeSaving.id
                );

                for (const [
                  sessionIndex,
                  sessionBeforeSaving,
                ] of storyBeforeSaving.sessions.entries()) {
                  const sessionData =
                    storyData?.sessions.find(
                      (s) => s.sessionId === sessionBeforeSaving.id
                    ) ?? undefined;
                  const testResultFiles = sessionBeforeSaving.testResultFiles;
                  const id =
                    (testResultFiles ?? []).length > 0
                      ? ((testResultFiles as any)[0].id as string)
                      : "";
                  const newTestResultId = testResultIdMap.get(id);
                  const testResult = await transactionalEntityManager.findOne(
                    TestResultEntity,
                    newTestResultId ?? ""
                  );
                  const sessionEntity = new SessionEntity({
                    name: sessionBeforeSaving.name,
                    memo: sessionBeforeSaving.memo,
                    index: sessionIndex,
                    testItem: sessionBeforeSaving.testItem,
                    testUser: sessionBeforeSaving.testerName,
                    testingTime: sessionBeforeSaving.testingTime,
                    doneDate: sessionBeforeSaving.doneDate,
                    story: newStoryEntity,
                    testResult: testResult ?? undefined,
                  });
                  const newSessionEntity =
                    await transactionalEntityManager.save(sessionEntity);

                  const attachedFileEntities: AttachedFileEntity[] = [];
                  for (const [
                    attachedFileIndex,
                    attachedFileBeforeSaving,
                  ] of sessionBeforeSaving.attachedFiles.entries()) {
                    if (!sessionData) {
                      break;
                    }
                    const attachedFileData =
                      sessionData.attachedFiles[attachedFileIndex];
                    const fileName = `${service.timestampService
                      .unix()
                      .toString()}_${attachedFileBeforeSaving.name}`;
                    await service.attachedFileRepository.outputFile(
                      fileName,
                      attachedFileData.data,
                      "base64"
                    );
                    const attachedFileImageUrl =
                      service.attachedFileRepository.getFileUrl(fileName);
                    attachedFileEntities.push(
                      new AttachedFileEntity({
                        session: newSessionEntity,
                        name: attachedFileBeforeSaving.name,
                        fileUrl: attachedFileImageUrl,
                      })
                    );
                  }
                  newSessionEntity.attachedFiles = attachedFileEntities;
                  await transactionalEntityManager.save(newSessionEntity);
                }

                if (storyIndex === 1 && oldTestTargetProgressDatas.length > 0) {
                  const progressDatas = oldTestTargetProgressDatas.filter(
                    ({ testTargetId }) =>
                      testTargetBeforeSaving.id === testTargetId
                  );

                  for (const progressData of progressDatas) {
                    const testProgressEntity = new TestProgressEntity();
                    testProgressEntity.plannedSessionNumber =
                      progressData.plannedSessionNumber;
                    (testProgressEntity.completedSessionNumber =
                      progressData.completedSessionNumber),
                      (testProgressEntity.incompletedSessionNumber =
                        progressData.incompletedSessionNumber),
                      (testProgressEntity.story = newStoryEntity),
                      (testProgressEntity.date = unixtimeToDate(
                        parseInt(progressData.date, 10)
                      )),
                      await transactionalEntityManager.save(testProgressEntity);
                  }
                }

                if (newTestTargetProgressDatas) {
                  const progressDatas = newTestTargetProgressDatas.filter(
                    ({ storyProgresses }) =>
                      testTargetBeforeSaving.id ===
                        storyProgresses.testTargetId &&
                      oldViewPointId === storyProgresses.viewPointId
                  );
                  const testProgressEntity = new TestProgressEntity();
                  for (const progressData of progressDatas) {
                    testProgressEntity.plannedSessionNumber =
                      progressData.storyProgresses.plannedSessionNumber;
                    (testProgressEntity.completedSessionNumber =
                      progressData.storyProgresses.completedSessionNumber),
                      (testProgressEntity.incompletedSessionNumber =
                        progressData.storyProgresses.incompletedSessionNumber),
                      (testProgressEntity.story = newStoryEntity),
                      (testProgressEntity.date = new Date(progressData.date)),
                      await transactionalEntityManager.save(testProgressEntity);
                  }
                }
              }
            }
          }
        }
      }
    );

    return projectId;
  }

  private async importTestResults(
    testResultDatas: TestResultData[],
    service: {
      testResultImportService: TestResultImportService;
    }
  ): Promise<Map<string, string>> {
    const savedTestResultIds =
      await service.testResultImportService.saveImportFileDatas(
        ...testResultDatas.map((data) => {
          return {
            importFileData: {
              testResultFile: data.testResultFile,
              screenshots: data.screenshots,
            },
            testResultId: data.testResultId,
          };
        })
      );

    return new Map(
      savedTestResultIds.flatMap<[string, string]>(
        ({ newTestResultId, oldTestResultId }) => {
          if (!oldTestResultId) {
            return [];
          }

          return [[oldTestResultId, newTestResultId]];
        }
      )
    );
  }

  private async readImportFile(
    base64FileData: string,
    option: {
      includeProject: boolean;
      includeTestResults: boolean;
    }
  ) {
    const decoded = Buffer.from(base64FileData, "base64");
    const files = await readZip(decoded);

    const testResultFiles = files.filter((file) => {
      return file.filePath.includes("test-results");
    });
    const projectFiles = files.filter((file) => {
      return file.filePath.includes("projects");
    });

    if (testResultFiles.length === 0 && projectFiles.length === 0) {
      throw Error("Invalid project data file.");
    }

    if (option.includeTestResults && testResultFiles.length === 0) {
      throw new Error("Test result information does not exist.");
    }

    if (option.includeProject && projectFiles.length === 0) {
      throw new Error("Project information does not exist.");
    }

    return {
      testResultFiles,
      projectFiles,
    };
  }
}
