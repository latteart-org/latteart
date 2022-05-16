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

import { NoteRepository } from "@/lib/eventDispatcher/repositoryService/NoteRepository";
import { ActionResult } from "@/lib/common/ActionResult";
import { Note } from "../Note";
import { TestStepRepository } from "@/lib/eventDispatcher/repositoryService/TestStepRepository";
import { TestStepOperation } from "../types";

export interface NoticeMovable {
  readonly noteRepository: NoteRepository;
  readonly testStepRepository: TestStepRepository;
  readonly serviceUrl: string;
}

export class MoveNoticeAction {
  constructor(private dispatcher: NoticeMovable) {}

  /**
   * Update the position associated with the Notice.
   * @param testResultId  ID of the test result associated with the Notice.
   * @param from  Position of test result associated with Notice.
   * @param dest  Position of the test result to which you want to link the Notice.
   * @returns Updated notice information.
   */
  public async moveNotice(
    testResultId: string,
    from: { testStepId: string; index: number },
    dest: { testStepId: string }
  ): Promise<ActionResult<{ notice: Note; index: number }>> {
    // Break the link of the move source.
    const noteId = undefined;
    const bugs = undefined;
    const { notices: fromNotices } = (
      await this.dispatcher.testStepRepository.getTestSteps(
        testResultId,
        from.testStepId
      )
    ).data as {
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    };

    const filteredNotices = fromNotices.filter(
      (_: unknown, index: number) => index !== from.index
    );

    await (async () => {
      return this.dispatcher.testStepRepository.patchTestSteps(
        testResultId,
        from.testStepId,
        noteId,
        bugs,
        filteredNotices
      );
    })();

    // Link to the destination.
    const { notices: destNotices } = (
      await this.dispatcher.testStepRepository.getTestSteps(
        testResultId,
        dest.testStepId
      )
    ).data as {
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    };

    const notices = [...destNotices, fromNotices[from.index]];

    await this.dispatcher.testStepRepository.patchTestSteps(
      testResultId,
      dest.testStepId,
      noteId,
      bugs,
      notices
    );

    const reply = await this.dispatcher.noteRepository.getNotes(
      testResultId,
      fromNotices[from.index]
    );

    const note = reply.data as {
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    };

    const serviceUrl = this.dispatcher.serviceUrl;
    const data = {
      notice: new Note({
        value: note.value,
        details: note.details,
        imageFilePath: note.imageFileUrl
          ? new URL(note.imageFileUrl, serviceUrl).toString()
          : "",
        tags: note.tags,
      }),
      index: destNotices.length,
    };

    const error = reply.error ? { code: reply.error.code } : undefined;
    const result = {
      data,
      error,
    };

    return result;
  }
}
