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

import { Story } from "@/interfaces/Stories";
import { ProjectTestMatrix } from "@/interfaces/TestMatrices";
import { TestTargetGroup } from "@/interfaces/TestTargetGroups";
import { TestTarget } from "@/interfaces/TestTargets";
import { NotesService } from "../NotesService";
import { TestPurposeService } from "../TestPurposeService";
import { TestResultService } from "../TestResultService";
import { TestStepService } from "../TestStepService";

export function createRowSources(
  group: TestTargetGroup,
  testTarget: TestTarget,
  plan: { viewPointId: string; value: number },
  testMatrix: ProjectTestMatrix,
  stories: Story[]
): RowSource[] {
  const targetViewPoint = testMatrix.viewPoints.find((viewPoint) => {
    return viewPoint.id === plan.viewPointId;
  });

  if (!targetViewPoint) {
    return [];
  }

  const session =
    stories
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
            viewPointName: targetViewPoint.name,
          },
        ];
      }) ?? [];

  return session;
}

export async function extractRowsFromRowSource(
  rowSource: RowSource,
  service: {
    testResult: TestResultService;
    testStep: TestStepService;
    testPurpose: TestPurposeService;
    note: NotesService;
  }
): Promise<ExtractRow[]> {
  const testStepIds = await service.testResult.collectAllTestStepIds(
    rowSource.testResultId
  );
  const testSteps: {
    intention: string | null;
    notices: string[];
  }[] = await Promise.all(
    testStepIds.map((testStepId) => service.testStep.getTestStep(testStepId))
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
        const testPurpose = await service.testPurpose.getTestPurpose(
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
                  const note = await service.note.getNote(noteId);

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

type RowSource = {
  sessionName: string;
  tester: string;
  memo: string;
  testResultId: string;
  groupName: string;
  testTargetName: string;
  viewPointName: string;
};

type ExtractRow = {
  noteValue: string;
  noteDetails: string;
  tags: string;
  testPurposeValue: string;
  testPurposeDetails: string;
  groupName: string;
  testTargetName: string;
  viewPointName: string;
  sessionName: string;
  tester: string;
  memo: string;
};
