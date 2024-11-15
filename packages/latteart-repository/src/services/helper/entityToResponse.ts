/**
 * Copyright 2024 NTT Corporation.
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
import {
  TestStep,
  TestStepCoverageSource,
  TestStepOperation,
} from "@/interfaces/TestSteps";
import { TestPurposeEntity } from "@/entities/TestPurposeEntity";
import {
  GetNoteResponse,
  GetTestPurposeResponse,
  NoteWithTimeResponse,
} from "@/interfaces/Notes";
import { CoverageSourceEntity } from "@/entities/CoverageSourceEntity";
import { ElementInfo } from "@/domain/types";
import { TestHintEntity } from "@/entities/TestHintEntity";
import { Custom, TestHint, TestHintProp } from "@/interfaces/TestHints";
import { TestHintPropEntity } from "@/entities/TestHintPropEntity";

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
  const noteVideo = note.video
    ? {
        url: note.video.fileUrl,
        time: note.videoTime ?? 0,
        width: note.video.width,
        height: note.video.height,
      }
    : undefined;
  const operationVideo = testStep?.video
    ? {
        url: testStep.video.fileUrl,
        time: testStep.videoTime ?? 0,
        width: testStep.video.width,
        height: testStep.video.height,
      }
    : undefined;
  return {
    id: note.id,
    type: "notice",
    value: note.value,
    details: note.details,
    imageFileUrl:
      note.screenshot?.fileUrl ?? testStep?.screenshot?.fileUrl ?? "",
    tags,
    timestamp: note.timestamp ?? 0,
    videoFrame: noteVideo ?? operationVideo,
    testResultId: note.testResultId ?? "",
  };
};

const mergeTestpurposeAndNotes = (
  testResultId: string,
  notes?: NoteEntity[],
  testPurposes?: TestPurposeEntity[]
): NoteWithTimeResponse[] => {
  const tmpTestPurposes =
    testPurposes?.map((testPurpose) => {
      return {
        id: testPurpose.id,
        type: "intention",
        value: testPurpose.title,
        details: testPurpose.details,
        imageFileUrl: "",
        tags: [],
        timestamp: testPurpose.testSteps
          ? testPurpose.testSteps[0].timestamp
          : 0,
        testResultId,
      };
    }) ?? [];

  const tmpNotes =
    notes?.map((note) => {
      const testStep = note.testSteps ? note.testSteps[0] : undefined;
      const tags = note.tags?.map((tag) => tag.name) ?? [];
      const noteVideo = note.video
        ? {
            url: note.video.fileUrl,
            time: note.videoTime ?? 0,
            width: note.video.width,
            height: note.video.height,
          }
        : undefined;
      const operationVideo = testStep?.video
        ? {
            url: testStep.video.fileUrl,
            time: testStep.videoTime ?? 0,
            width: testStep.video.width,
            height: testStep.video.height,
          }
        : undefined;
      return {
        id: note.id,
        type: "notice",
        value: note.value,
        details: note.details,
        imageFileUrl:
          note.screenshot?.fileUrl ?? testStep?.screenshot?.fileUrl ?? "",
        tags,
        timestamp: testStep?.timestamp ?? 0,
        videoFrame: noteVideo ?? operationVideo,
        testResultId,
      };
    }) ?? [];

  return [...tmpTestPurposes, ...tmpNotes].sort((a, b) => {
    return a.timestamp - b.timestamp;
  });
};

const convertToTestPurposes = (
  testResultId: string,
  notes: NoteWithTimeResponse[]
): GetTestPurposeResponse[] => {
  return notes.reduce((acc, note, index) => {
    if (index === 0 && note.type !== "intention") {
      acc.push({
        id: "empty",
        type: "intention",
        value: "",
        details: "",
        imageFileUrl: "",
        tags: [],
        notes: [
          {
            id: note.id,
            type: note.type,
            value: note.value,
            details: note.details,
            imageFileUrl: note.imageFileUrl,
            tags: note.tags,
            timestamp: note.timestamp,
            videoFrame: note.videoFrame,
            testResultId,
          },
        ],
        timestamp: 0,
        testResultId,
      });
    } else if (note.type === "intention") {
      acc.push({
        id: note.id,
        type: note.type,
        value: note.value,
        details: note.details,
        imageFileUrl: note.imageFileUrl,
        tags: note.tags,
        notes: [],
        timestamp: 0,
        testResultId,
      });
    } else if (note.type === "notice") {
      acc[acc.length - 1].notes.push({
        id: note.id,
        type: note.type,
        value: note.value,
        details: note.details,
        imageFileUrl: note.imageFileUrl,
        tags: note.tags,
        timestamp: note.timestamp,
        videoFrame: note.videoFrame,
        testResultId,
      });
    }

    return acc;
  }, new Array<GetTestPurposeResponse>());
};

export const testPurposeEntityToResponse = (
  testPurpose: TestPurposeEntity
): GetNoteResponse => {
  return {
    id: testPurpose.id,
    type: "intention",
    value: testPurpose.title,
    details: testPurpose.details,
    imageFileUrl: "",
    tags: [],
    timestamp: 0,
    testResultId: testPurpose.testResult?.id ?? "",
  };
};

export const sessionEntityToResponse = (session: SessionEntity): Session => {
  const testPurposes: GetTestPurposeResponse[] = [];
  const notes: GetNoteResponse[] = [];
  session.testResults.forEach((testResult) => {
    const mergedNotes = mergeTestpurposeAndNotes(
      testResult.id,
      testResult?.notes,
      testResult?.testPurposes
    );
    convertToTestPurposes(testResult.id, mergedNotes).forEach((p) =>
      testPurposes.push(p)
    );

    const sortedNotes =
      testResult?.notes?.slice().sort((a, b) => {
        const stepA = a.testSteps ? a.testSteps[0] : undefined;
        const stepB = b.testSteps ? b.testSteps[0] : undefined;

        const result = (stepA?.timestamp ?? 0) - (stepB?.timestamp ?? 0);

        if (result !== 0) {
          return result;
        }

        return a.timestamp - b.timestamp;
      }) ?? [];

    sortedNotes.forEach((note) => {
      notes.push(noteEntityToResponse(note));
    });
  });

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
    testResultFiles: session.testResults.map((result) => {
      return {
        name: result?.name ?? "",
        id: result?.id ?? "",
        initialUrl: result?.initialUrl ?? "",
        testingTime: result?.testingTime ?? 0,
      };
    }),
    testPurposes,
    notes,
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

export const testStepEntityToResponse = (
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
  const elementInfo: Partial<ElementInfo> = JSON.parse(
    testStepEntity.operationElement === "null"
      ? "{}"
      : testStepEntity.operationElement
  );
  const inputElements: ElementInfo[] = JSON.parse(testStepEntity.inputElements);
  const keywordTexts: (string | { tagname: string; value: string })[] =
    JSON.parse(testStepEntity.keywordTexts);

  return {
    input: testStepEntity.operationInput,
    type: testStepEntity.operationType,
    elementInfo:
      Object.keys(elementInfo).length > 0 ? (elementInfo as ElementInfo) : null,
    title: testStepEntity.pageTitle,
    url: testStepEntity.pageUrl,
    imageFileUrl: testStepEntity.screenshot?.fileUrl ?? "",
    timestamp: testStepEntity.timestamp.toString(),
    inputElements,
    windowHandle: testStepEntity.windowHandle,
    keywordTexts,
    isAutomatic: !!testStepEntity.isAutomatic,
    scrollPosition:
      testStepEntity.scrollPositionX != null &&
      testStepEntity.scrollPositionY != null
        ? {
            x: testStepEntity.scrollPositionX,
            y: testStepEntity.scrollPositionY,
          }
        : undefined,
    clientSize:
      testStepEntity.clientSizeWidth != null &&
      testStepEntity.clientSizeHeight != null
        ? {
            width: testStepEntity.clientSizeWidth,
            height: testStepEntity.clientSizeHeight,
          }
        : undefined,
    videoFrame: testStepEntity.video
      ? {
          url: testStepEntity.video.fileUrl,
          time: testStepEntity.videoTime ?? 0,
          width: testStepEntity.video.width,
          height: testStepEntity.video.height,
        }
      : undefined,
  };
};

export const coverageSourceEntityToResponse = (
  coverageSourceEntity?: CoverageSourceEntity
): TestStepCoverageSource => {
  return {
    title: coverageSourceEntity?.title ?? "",
    url: coverageSourceEntity?.url ?? "",
    screenElements: coverageSourceEntity
      ? JSON.parse(coverageSourceEntity.screenElements)
      : [],
  };
};

export const convertToDownloadUrl = (text: string): string => {
  return text
    .replace(/:/g, "")
    .replace(/"/g, "")
    .replace(/</g, "")
    .replace(/>/g, "")
    .replace(/#/g, "")
    .replace(/%/g, "")
    .replace(/\*/g, "")
    .replace(/\|/g, "")
    .replace(/\?/g, "")
    .replace(/\\/g, "")
    .replace(/\//g, "");
};

export const testHintEntityToResponse = (
  testHintEntity: TestHintEntity
): TestHint => {
  const customs = JSON.parse(testHintEntity.customs) as Custom[];
  const commentWords = JSON.parse(testHintEntity.commentWords) as string[];
  const operationElements =
    testHintEntity.operationElements === ""
      ? []
      : JSON.parse(testHintEntity.operationElements);
  const issues = JSON.parse(testHintEntity.issues) as string[];
  return {
    id: testHintEntity.id,
    value: testHintEntity.value,
    testMatrixName: testHintEntity.testMatrixName,
    groupName: testHintEntity.groupName,
    testTargetName: testHintEntity.testTargetName,
    viewPointName: testHintEntity.viewPointName,
    customs,
    commentWords,
    operationElements,
    issues,
    createdAt: testHintEntity.createdAt.getTime(),
  };
};

export const testHintPropEntityToResponse = (
  testHintHeaderEntity: TestHintPropEntity
): TestHintProp => {
  let listItems = undefined;
  if (testHintHeaderEntity.listItems) {
    listItems = JSON.parse(testHintHeaderEntity.listItems);
  }

  return {
    name: testHintHeaderEntity.name,
    id: testHintHeaderEntity.id,
    type: testHintHeaderEntity.type,
    listItems,
  };
};
