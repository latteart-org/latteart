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

import { ProjectConfig } from "@/interfaces/Configs";
import { CreateNoteResponse, GetNoteResponse } from "@/interfaces/Notes";
import { Session } from "@/interfaces/Sessions";
import { GetGraphViewResponse } from "@/interfaces/TestResults";
import { TestStepOperation } from "@/interfaces/TestSteps";
import path from "path";

export function createAttachedFiles(
  storyId: string,
  sessionIdAlias: string,
  attachedFiles: Session["attachedFiles"]
): Session["attachedFiles"] {
  return attachedFiles.map((attachedFile) => {
    return {
      name: attachedFile.name,
      fileUrl: `data/${storyId}/${sessionIdAlias}/attached/${path.basename(
        attachedFile?.fileUrl ?? ""
      )}`,
    };
  });
}

export function createTestResultFiles(
  testResultFiles: Session["testResultFiles"]
): Session["testResultFiles"] {
  return testResultFiles.map((testResultFile) => {
    return {
      name: testResultFile.name,
      id: testResultFile.id,
      initialUrl: testResultFile.initialUrl,
      testingTime: testResultFile.testingTime,
    };
  });
}

export function convertNotesForSnapshot(
  storyId: string,
  sessionIdAlias: string,
  notes: GetNoteResponse[]
): GetNoteResponse[] {
  return notes.map((note) => {
    return {
      id: note.id,
      type: note.type,
      value: note.value,
      details: note.details,
      imageFileUrl: note.imageFileUrl
        ? `data/${storyId}/${sessionIdAlias}/testResult/${path.basename(
            note.imageFileUrl ?? ""
          )}`
        : "",
      tags: note.tags,
      timestamp: note.timestamp,
      videoFrame: note.videoFrame
        ? {
            url: `data/${storyId}/${sessionIdAlias}/testResult/${path.basename(
              note.videoFrame.url ?? ""
            )}`,
            time: note.videoFrame.time,
            width: note.videoFrame.width,
            height: note.videoFrame.height,
          }
        : undefined,
      testResultId: note.testResultId,
    };
  });
}

export function convertTestStepsForSnapshot(
  testSteps: {
    operation: TestStepOperation;
    notices: CreateNoteResponse[];
    intention: CreateNoteResponse | null;
  }[]
) {
  return testSteps.map((testStep, index) => {
    const operation = {
      sequence: index + 1,
      input: testStep.operation.input,
      type: testStep.operation.type,
      elementInfo: testStep.operation.elementInfo,
      title: testStep.operation.title,
      url: testStep.operation.url,
      imageFileUrl:
        testStep.operation.imageFileUrl !== ""
          ? path.join(
              "testResult",
              path.basename(testStep.operation.imageFileUrl ?? "")
            )
          : "",
      timestamp: testStep.operation.timestamp,
      inputElements: testStep.operation.inputElements,
      windowHandle: testStep.operation.windowHandle,
      keywordTexts: testStep.operation.keywordTexts,
      isAutomatic: testStep.operation.isAutomatic,
      videoFrame: testStep.operation.videoFrame
        ? {
            url: path.join(
              "testResult",
              path.basename(testStep.operation.videoFrame.url ?? "")
            ),
            time: testStep.operation.videoFrame.time,
            width: testStep.operation.videoFrame.width,
            height: testStep.operation.videoFrame.height,
          }
        : undefined,
    };
    const notices = testStep.notices.map((notice) => {
      const imageFileUrl = notice.imageFileUrl
        ? path.join("testResult", path.basename(notice.imageFileUrl))
        : "";
      const videoFrame = notice.videoFrame
        ? {
            url: path.join(
              "testResult",
              path.basename(notice.videoFrame.url ?? "")
            ),
            time: notice.videoFrame.time,
            width: notice.videoFrame.width,
            height: notice.videoFrame.height,
          }
        : undefined;

      return {
        sequence: index + 1,
        id: notice.id,
        type: notice.type,
        value: notice.value,
        details: notice.details,
        tags: notice.tags,
        imageFileUrl,
        timestamp: notice.timestamp.toString(),
        videoFrame,
      };
    });

    return { operation, notices, intention: testStep.intention };
  });
}

export function convertGraphViewForSnapshot(
  graphViewData: GetGraphViewResponse
) {
  return {
    ...graphViewData,
    nodes: graphViewData.nodes.map((node) => {
      const testSteps = node.testSteps.map((testStep) => {
        const imageFileUrl = testStep.imageFileUrl
          ? path.join("testResult", path.basename(testStep.imageFileUrl ?? ""))
          : "";
        const videoFrame = testStep.videoFrame
          ? {
              url: path.join(
                "testResult",
                path.basename(testStep.videoFrame.url ?? "")
              ),
              time: testStep.videoFrame.time,
              width: testStep.videoFrame.width,
              height: testStep.videoFrame.height,
            }
          : undefined;

        return { ...testStep, imageFileUrl, videoFrame };
      });

      return { ...node, testSteps };
    }),
    store: {
      ...graphViewData.store,
      notes: graphViewData.store.notes.map((note) => {
        const imageFileUrl = note.imageFileUrl
          ? path.join("testResult", path.basename(note.imageFileUrl ?? ""))
          : "";
        const videoFrame = note.videoFrame
          ? {
              url: path.join(
                "testResult",
                path.basename(note.videoFrame.url ?? "")
              ),
              time: note.videoFrame.time,
              width: note.videoFrame.width,
              height: note.videoFrame.height,
            }
          : undefined;

        return { ...note, imageFileUrl, videoFrame };
      }),
    },
  };
}

export function convertViewOptionForSnapshot(config: ProjectConfig["config"]) {
  return {
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
}
