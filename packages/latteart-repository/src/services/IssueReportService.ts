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

import { Project } from "@/interfaces/Projects";
import { TestResultService } from "./TestResultService";
import { TestStepService } from "./TestStepService";
import { TestPurposeServiceImpl } from "./TestPurposeService";
import { NotesServiceImpl } from "./NotesService";
import { IssueReportOutputService } from "./IssueReportOutputService";

export interface IssueReportService {
  writeReport(project: Project, outputDirectoryPath: string): Promise<void>;
}

export class IssueReportServiceImpl implements IssueReportService {
  constructor(
    private service: {
      issueReportOutput: IssueReportOutputService;
      testResult: TestResultService;
      testStep: TestStepService;
      testPurpose: TestPurposeServiceImpl;
      note: NotesServiceImpl;
    }
  ) {}

  public async writeReport(
    project: Project,
    outputDirectoryPath: string
  ): Promise<void> {
    const reportSources = await this.buildReportSources(project);

    for (const report of reportSources) {
      this.service.issueReportOutput.output(outputDirectoryPath, report);
    }
  }

  private async buildReportSources(project: Project) {
    return Promise.all(
      project.testMatrices.map(async (testMatrix) => {
        const groups = testMatrix.groups.slice();

        const rowSources = groups.flatMap((group) => {
          return group.testTargets.flatMap((testTarget) => {
            return testTarget.plans.flatMap((plan) => {
              const targetViewPoint = testMatrix.viewPoints.find(
                (viewPoint) => {
                  return viewPoint.id === plan.viewPointId;
                }
              );

              const sessions =
                project.stories
                  .find((story) => {
                    return (
                      story.testMatrixId === testMatrix.id &&
                      story.viewPointId === plan.viewPointId &&
                      story.testTargetId === testTarget.id
                    );
                  })
                  ?.sessions.flatMap((session, index) => {
                    const testResultFiles = session.testResultFiles ?? [];

                    if (testResultFiles.length === 0) {
                      return [];
                    }

                    return [
                      {
                        sessionName: (index + 1).toString(),
                        tester: session.testerName,
                        memo: session.memo,
                        testResultId: testResultFiles[0].id,
                        groupName: group.name,
                        testTargetName: testTarget.name,
                        viewPointName: targetViewPoint?.name ?? "",
                      },
                    ];
                  }) ?? [];

              if (!targetViewPoint) {
                return [];
              }

              return sessions;
            });
          });
        });

        const rows = (
          await Promise.all(
            rowSources.map(async (rowSource) =>
              this.extractRowsFromRowSource(rowSource)
            )
          )
        ).flat();

        return {
          testMatrixName: testMatrix.name,
          rows,
        };
      })
    );
  }

  private async extractRowsFromRowSource(rowSource: {
    sessionName: string;
    tester: string;
    memo: string;
    testResultId: string;
    groupName: string;
    testTargetName: string;
    viewPointName: string;
  }) {
    const testStepIds = await this.service.testResult.collectAllTestStepIds(
      rowSource.testResultId
    );
    const testSteps: {
      intention: string | null;
      notices: string[];
    }[] = await Promise.all(
      testStepIds.map((testStepId) =>
        this.service.testStep.getTestStep(testStepId)
      )
    );

    const mergedTestSteps = testSteps.reduce(
      (acc, testStep, index) => {
        if (index > 0 && !testStep.intention) {
          acc[acc.length - 1].notices.push(...testStep.notices);
        } else {
          acc.push(testStep);
        }

        return acc;
      },
      new Array<{
        intention: string | null;
        notices: string[];
      }>()
    );

    return (
      await Promise.all(
        mergedTestSteps.map(async (testStep) => {
          const identifier = {
            groupName: rowSource.groupName,
            testTargetName: rowSource.testTargetName,
            viewPointName: rowSource.viewPointName,
            sessionName: rowSource.sessionName,
            tester: rowSource.tester,
            memo: rowSource.memo,
          };

          const testPurposeId = testStep.intention ?? "";
          const testPurpose = await this.service.testPurpose.getTestPurpose(
            testPurposeId
          );
          const identifierAndTestPurpose = {
            ...identifier,
            testPurposeValue: testPurpose?.value ?? "",
            testPurposeDetails: testPurpose?.details ?? "",
          };

          const noteIds = testStep.notices ?? [];
          const noteRows =
            noteIds.length > 0
              ? await Promise.all(
                  noteIds.map(async (noteId) => {
                    const note = await this.service.note.getNote(noteId);

                    return {
                      ...identifierAndTestPurpose,
                      noteValue: note?.value ?? "",
                      noteDetails: note?.details ?? "",
                      tags: note?.tags ? note.tags.join(",") : "",
                    };
                  })
                )
              : [
                  {
                    ...identifierAndTestPurpose,
                    noteValue: "",
                    noteDetails: "",
                    tags: "",
                  },
                ];

          return noteRows;
        })
      )
    ).flat();
  }
}
