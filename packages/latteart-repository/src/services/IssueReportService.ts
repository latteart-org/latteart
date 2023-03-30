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
import { TestPurposeService } from "./TestPurposeService";
import { NotesService } from "./NotesService";
import { IssueReportCreator } from "@/interfaces/issueReportCreator";
import {
  createRowSources,
  extractRowsFromRowSource,
} from "./helper/issueReportHelper";

export interface IssueReportService {
  writeReport(project: Project, outputDirectoryPath: string): Promise<void>;
}

export class IssueReportServiceImpl implements IssueReportService {
  constructor(
    private service: {
      issueReportCreator: IssueReportCreator;
      testResult: TestResultService;
      testStep: TestStepService;
      testPurpose: TestPurposeService;
      note: NotesService;
    }
  ) {}

  public async writeReport(
    project: Project,
    outputDirectoryPath: string
  ): Promise<void> {
    const reportSources = await this.buildReportSources(project);

    for (const report of reportSources) {
      this.service.issueReportCreator.output(outputDirectoryPath, report);
    }
  }

  private async buildReportSources(project: Project) {
    return Promise.all(
      project.testMatrices.map(async (testMatrix) => {
        const groups = testMatrix.groups.slice();

        const rowSources = groups.flatMap((group) => {
          return group.testTargets.flatMap((testTarget) => {
            return testTarget.plans.flatMap((plan) => {
              return createRowSources(
                group,
                testTarget,
                plan,
                testMatrix,
                project.stories
              );
            });
          });
        });

        const rows = (
          await Promise.all(
            rowSources.map(async (rowSource) =>
              extractRowsFromRowSource(rowSource, { ...this.service })
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
}
