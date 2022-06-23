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
import { convertNoteWithoutId } from "@/lib/eventDispatcher/replyDataConverter";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

const EDIT_NOTICE_FAILED_MESSAGE_KEY =
  "error.operation_history.edit_note_failed";

export class EditNoticeAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "noteRepository" | "testStepRepository" | "serviceUrl"
    >
  ) {}

  /**
   * Edit Notice.
   * @param testResultId  ID of the test result associated with the notice to be edited.
   * @param testStepId  Test step id of the test result associated with the target Notice.
   * @param index  Notice index
   * @param notice  Update contents of notice.
   * @returns Updated notice information.
   */
  public async editNotice(
    testResultId: string,
    testStepId: string,
    index: number,
    notice: {
      summary: string;
      details: string;
      tags: string[];
    }
  ): Promise<ActionResult<{ notice: Note; index: number }>> {
    const intention = undefined;
    const bug = undefined;

    const getTestStepsResult =
      await this.repositoryContainer.testStepRepository.getTestSteps(
        testResultId,
        testStepId
      );

    if (getTestStepsResult.isFailure()) {
      return new ActionFailure({ messageKey: EDIT_NOTICE_FAILED_MESSAGE_KEY });
    }

    const { notices } = getTestStepsResult.data;

    const noteId: string = notices[index];

    // Note update
    const putNotesResult =
      await this.repositoryContainer.noteRepository.putNotes(
        testResultId,
        noteId,
        intention,
        bug,
        notice
      );

    if (putNotesResult.isFailure()) {
      return new ActionFailure({ messageKey: EDIT_NOTICE_FAILED_MESSAGE_KEY });
    }

    const savedNote = putNotesResult.data;

    const serviceUrl = this.repositoryContainer.serviceUrl;
    const data = {
      notice: convertNoteWithoutId(savedNote, serviceUrl),
      index,
    };

    return new ActionSuccess(data);
  }
}
