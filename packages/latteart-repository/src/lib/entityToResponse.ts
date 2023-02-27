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
import { SessionEntity } from "@/entities/SessionEntity";
import { StoryEntity } from "@/entities/StoryEntity";
import { TestPurposeEntity } from "@/entities/TestPurposeEntity";
import { Note } from "@/interfaces/Notes";
import { Session } from "@/interfaces/Sessions";
import { Story } from "@/interfaces/Stories";

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

const noteEntityToResponse = (note: NoteEntity): Note => {
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

const testPurposeEntityToResponse = (testPurpose: TestPurposeEntity): Note => {
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
