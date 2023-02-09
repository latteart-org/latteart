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
import { Session } from "@/interfaces/Sessions";
import { Story } from "@/interfaces/Stories";

type issue = {
  details: string;
  source: {
    index: number;
    type: string;
  };
  status: string;
  ticketId: string;
  type: string;
  value: string;
  imageFilePath?: string;
  tags?: string[];
};

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

const noteEntityToResponse = (note: NoteEntity): issue => {
  const testStep = note.testSteps ? note.testSteps[0] : undefined;
  return {
    details: note.details,
    source: {
      index: 0,
      type: "notice",
    },
    status: note.tags?.find((tag) => {
      return tag.name === "reported";
    })
      ? "reported"
      : note.tags?.find((tag) => {
          return tag.name === "invalid";
        })
      ? "invalid"
      : "",
    ticketId: "",
    type: "notice",
    value: note.value,
    imageFilePath:
      note.screenshot?.fileUrl ?? testStep?.screenshot?.fileUrl ?? "",
    tags: note.tags
      ? note.tags.map((tag) => {
          return tag.name;
        })
      : [],
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
    id: session.id,
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
    doneDate: session.doneDate,
    isDone: !!session.doneDate,
    issues: sortedNotes.map((note) => {
      return noteEntityToResponse(note);
    }),
    memo: session.memo,
    name: session.name,
    testItem: session.testItem,
    testResultFiles: session.testResult
      ? [
          {
            name: session.testResult?.name ?? "",
            id: session.testResult?.id ?? "",
          },
        ]
      : [],
    testerName: session.testUser,
    testingTime: session.testResult?.testingTime ?? 0,
  };
};
