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

import {
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import { Note } from "../../Note";
import { convertNote } from "@/lib/eventDispatcher/replyDataConverter";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

const ADD_NOTICE_FAILED_MESSAGE_KEY = "error.operation_history.add_note_failed";

export class AddNoticeAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "noteRepository" | "testStepRepository" | "serviceUrl"
    >
  ) {}

  /**
   * Notice the test step with the specified sequence number and add information.
   * @param testResultId  Test result ID.
   * @param testStepId  Test step id of the target test step.
   * @param notice  Notice information to add.
   */
  public async addNotice(
    testResultId: string,
    testStepId: string,
    notice: {
      summary: string;
      details: string;
      tags: string[];
      imageData?: string;
    }
  ): Promise<ActionResult<{ notice: Note; index: number }>> {
    // New registration of note.

    const postNotesResult =
      await this.repositoryContainer.noteRepository.postNotes(testResultId, {
        type: "notice",
        value: notice.summary,
        details: notice.details,
        tags: notice.tags,
        imageData: notice.imageData,
      });

    if (postNotesResult.isFailure()) {
      return new ActionFailure({ messageKey: ADD_NOTICE_FAILED_MESSAGE_KEY });
    }

    const savedNote = postNotesResult.data;

    // Linking with testStep.
    const linkTestStepResult = await (async () => {
      const getTestStepsResult =
        await this.repositoryContainer.testStepRepository.getTestSteps(
          testResultId,
          testStepId
        );

      if (getTestStepsResult.isFailure()) {
        return getTestStepsResult;
      }

      const { notices: replyNotices } = getTestStepsResult.data;

      const notices = [...replyNotices, savedNote.id];
      const noteId = undefined;

      return await this.repositoryContainer.testStepRepository.patchTestSteps(
        testResultId,
        testStepId,
        noteId,
        undefined,
        notices
      );
    })();

    if (linkTestStepResult.isFailure()) {
      return new ActionFailure({ messageKey: ADD_NOTICE_FAILED_MESSAGE_KEY });
    }

    const savedTestStep = linkTestStepResult.data;

    const serviceUrl = this.repositoryContainer.serviceUrl;
    const data = {
      notice: convertNote(savedNote, serviceUrl),
      index: savedTestStep.notices.length - 1,
    };

    return new ActionSuccess(data);
  }
}
