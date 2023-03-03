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

import { NoteEntity } from "@/entities/NoteEntity";
import { ProjectEntity } from "@/entities/ProjectEntity";
import { SessionEntity } from "@/entities/SessionEntity";
import { StoryEntity } from "@/entities/StoryEntity";
import { TestMatrixEntity } from "@/entities/TestMatrixEntity";
import { TestStepEntity } from "@/entities/TestStepEntity";
import { Project } from "@/interfaces/Projects";
import { Session } from "@/interfaces/Sessions";
import { Story } from "@/interfaces/Stories";
import { TestMatrix } from "@/interfaces/TestMatrices";
import { TestStep, TestStepOperation } from "@/interfaces/TestSteps";
import { TestPurposeEntity } from "@/entities/TestPurposeEntity";
import { GetNoteResponse } from "@/interfaces/Notes";

export const storyEntityToResponse = (story: StoryEntity): Story => {
  return {
    id: story.id,
    index: story.index,
    testMatrixId: story.testMatrixId,
    testTargetId: story.testTargetId,
    viewPointId: story.viewPointId,
    status: story.status,
    sessions: story.sessions
      .map((session) => {
        return sessionEntityToResponse(session);
      })
      .sort((a, b) => a.index - b.index),
  };
};

const noteEntityToResponse = (note: NoteEntity): GetNoteResponse => {
  const testStep = note.testSteps ? note.testSteps[0] : undefined;
  const tags = note.tags?.map((tag) => tag.name) ?? [];
  return {
    id: note.id,
    type: "notice",
    value: note.value,
    details: note.details,
    imageFileUrl:
      note.screenshot?.fileUrl ?? testStep?.screenshot?.fileUrl ?? "",
    tags,
  };
};

const testPurposeEntityToResponse = (
  testPurpose: TestPurposeEntity
): GetNoteResponse => {
  return {
    id: testPurpose.id,
    type: "intention",
    value: testPurpose.title,
    details: testPurpose.details,
    imageFileUrl: "",
    tags: [],
  };
};

export const sessionEntityToResponse = (session: SessionEntity): Session => {
  const sortedNotes =
    session.testResult?.notes?.slice().sort((a, b) => {
      const stepA = a.testSteps ? a.testSteps[0] : undefined;
      const stepB = b.testSteps ? b.testSteps[0] : undefined;

      const result = (stepA?.timestamp ?? 0) - (stepB?.timestamp ?? 0);

      if (result !== 0) {
        return result;
      }

      return a.timestamp - b.timestamp;
    }) ?? [];

  return {
    index: session.index,
    name: session.name,
    id: session.id,
    isDone: !!session.doneDate,
    doneDate: session.doneDate,
    testItem: session.testItem,
    testerName: session.testUser,
    memo: session.memo,
    attachedFiles:
      session.attachedFiles
        ?.sort((a, b) => {
          return (a.createdDate as Date).toLocaleString() >
            (b.createdDate as Date).toLocaleString()
            ? 1
            : -1;
        })
        .map((attachedFile) => {
          return {
            name: attachedFile.name,
            fileUrl: attachedFile.fileUrl,
          };
        }) ?? [],
    testResultFiles: session.testResult
      ? [
          {
            name: session.testResult?.name ?? "",
            id: session.testResult?.id ?? "",
          },
        ]
      : [],
    initialUrl: session.testResult?.initialUrl ?? "",
    testPurposes:
      session.testResult?.testPurposes?.map((testPurpose) => {
        return testPurposeEntityToResponse(testPurpose);
      }) ?? [],
    notes: sortedNotes.map((note) => {
      return noteEntityToResponse(note);
    }),
    testingTime: session.testResult?.testingTime ?? 0,
  };
};

export const projectEntityToResponse = (project: ProjectEntity): Project => {
  const stories: Project["stories"] = [];
  for (const testMatrix of project.testMatrices) {
    for (const story of testMatrix.stories) {
      stories.push(storyEntityToResponse(story));
    }
  }

  const ascSortFunc = (a: any, b: any) => (a.index > b.index ? 1 : -1);

  return {
    id: project.id,
    name: project.name,
    testMatrices: project.testMatrices.sort(ascSortFunc).map((testMatrix) => {
      return {
        id: testMatrix.id,
        name: testMatrix.name,
        index: testMatrix.index,
        groups: testMatrix.testTargetGroups
          .sort(ascSortFunc)
          .map((testTargetGroup) => {
            return {
              id: testTargetGroup.id,
              name: testTargetGroup.name,
              index: testTargetGroup.index,
              testTargets: testTargetGroup.testTargets
                .sort(ascSortFunc)
                .map((testTarget) => {
                  const plans = JSON.parse(testTarget.text) as {
                    value: number;
                    viewPointId: string;
                  }[];
                  for (const v of testMatrix.viewPoints) {
                    if (!plans.find((plan) => plan.viewPointId === v.id)) {
                      plans.push({
                        viewPointId: v.id,
                        value: 0,
                      });
                    }
                  }
                  return {
                    id: testTarget.id,
                    name: testTarget.name,
                    index: testTarget.index,
                    plans,
                  };
                }),
            };
          }),
        viewPoints: testMatrix.sortedViewPoint().map((viewPoint) => {
          return {
            id: viewPoint.id,
            name: viewPoint.name,
            index: viewPoint.index,
            description: viewPoint.description ?? "",
          };
        }),
      };
    }),
    stories,
  };
};

export const testMatrixEntityToResponse = (
  testMatrixEntity: TestMatrixEntity
): TestMatrix => {
  const orderByIndex = (val1: any, val2: any) => {
    return val1.index - val2.index;
  };

  return {
    id: testMatrixEntity.id,
    name: testMatrixEntity.name,
    index: testMatrixEntity.index,
    groups: (testMatrixEntity.testTargetGroups ?? [])
      .sort(orderByIndex)
      .map((group) => {
        return {
          id: group.id,
          name: group.name,
          index: group.index,
          testTargets: (group.testTargets ?? [])
            .sort(orderByIndex)
            .map((testTarget) => {
              return {
                id: testTarget.id,
                name: testTarget.name,
                index: testTarget.index,
                plans: JSON.parse(testTarget.text),
              };
            }),
        };
      }),
    viewPoints: (testMatrixEntity.viewPoints ?? [])
      .sort(orderByIndex)
      .map((viewPoint, index) => {
        return {
          id: viewPoint.id,
          name: viewPoint.name,
          index,
          description: viewPoint.description ?? "",
        };
      }),
  };
};

export const convertTestStepEntityToResponse = (
  testStepEntity: TestStepEntity
): TestStep => {
  return {
    id: testStepEntity.id,
    operation: convertToTestStepOperation(testStepEntity),
    intention: testStepEntity.testPurpose
      ? testStepEntity.testPurpose.id
      : null,
    bugs: [],
    notices: testStepEntity.notes?.map((note) => note.id) ?? [],
  };
};

export const convertToTestStepOperation = (
  testStepEntity: TestStepEntity
): TestStepOperation => {
  return {
    input: testStepEntity.operationInput,
    type: testStepEntity.operationType,
    elementInfo: JSON.parse(testStepEntity.operationElement),
    title: testStepEntity.pageTitle,
    url: testStepEntity.pageUrl,
    imageFileUrl: testStepEntity.screenshot?.fileUrl ?? "",
    timestamp: testStepEntity.timestamp.toString(),
    inputElements: JSON.parse(testStepEntity.inputElements),
    windowHandle: testStepEntity.windowHandle,
    keywordTexts: JSON.parse(testStepEntity.keywordTexts),
    isAutomatic: !!testStepEntity.isAutomatic,
  };
};
