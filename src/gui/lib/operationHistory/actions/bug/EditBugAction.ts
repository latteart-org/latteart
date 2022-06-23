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

const EDIT_NOTE_FAILED_MESSAGE_KEY = "error.operation_history.edit_note_failed";

export class EditBugAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "noteRepository" | "testStepRepository" | "serviceUrl"
    >
  ) {}

  /**
   * Edit the bug.
   * @param testResultId  ID of the test result associated with the bug to be edited.
   * @param testStepId  Test step id of the test result associated with the target bug.
   * @param index  bug index.
   * @param bug  Contents to update the bug.
   * @returns Updated bug information.
   */
  public async editBug(
    testResultId: string,
    testStepId: string,
    index: number,
    bug: {
      summary: string;
      details: string;
    }
  ): Promise<ActionResult<{ bug: Note; index: number }>> {
    const getTestStepsResult =
      await this.repositoryContainer.testStepRepository.getTestSteps(
        testResultId,
        testStepId
      );

    if (getTestStepsResult.isFailure()) {
      return new ActionFailure({ messageKey: EDIT_NOTE_FAILED_MESSAGE_KEY });
    }

    const { bugs } = getTestStepsResult.data;

    const noteId: string = bugs[index];

    // note update
    const putNotesResult =
      await this.repositoryContainer.noteRepository.putNotes(
        testResultId,
        noteId,
        undefined,
        bug
      );

    if (putNotesResult.isFailure()) {
      return new ActionFailure({ messageKey: EDIT_NOTE_FAILED_MESSAGE_KEY });
    }

    const savedNote = putNotesResult.data;

    const serviceUrl = this.repositoryContainer.serviceUrl;
    const data = {
      bug: convertNoteWithoutId(savedNote, serviceUrl),
      index,
    };

    return new ActionSuccess(data);
  }
}
