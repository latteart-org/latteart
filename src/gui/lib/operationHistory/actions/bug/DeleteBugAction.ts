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
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

const DELETE_NOTE_FAILED_MESSAGE_KEY =
  "error.operation_history.delete_note_failed";

export class DeleteBugAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "testStepRepository" | "noteRepository" | "serviceUrl"
    >
  ) {}

  /**
   * Remove the bug.
   * @param testResultId  The id of the test result associated with the bug to be deleted.
   * @param testStepId  Test step id of test results related to the target bug.
   * @param index  Bug index.
   */
  public async deleteBug(
    testResultId: string,
    testStepId: string,
    index: number
  ): Promise<ActionResult<{ testStepId: string; index: number }>> {
    // Get noteId.
    const getTestStepsResult =
      await this.repositoryContainer.testStepRepository.getTestSteps(
        testResultId,
        testStepId
      );

    if (getTestStepsResult.isFailure()) {
      return new ActionFailure({ messageKey: DELETE_NOTE_FAILED_MESSAGE_KEY });
    }

    const { bugs } = getTestStepsResult.data;

    const noteId = bugs[index];

    // Delete note.
    const deleteNotesResult =
      await this.repositoryContainer.noteRepository.deleteNotes(
        testResultId,
        noteId
      );

    if (deleteNotesResult.isFailure()) {
      return new ActionFailure({ messageKey: DELETE_NOTE_FAILED_MESSAGE_KEY });
    }

    // Break the link.
    const filteredBugs = bugs.filter((_: unknown, i: number) => i !== index);
    const patchTestStepsResult =
      await this.repositoryContainer.testStepRepository.patchTestSteps(
        testResultId,
        testStepId,
        undefined,
        filteredBugs
      );

    if (patchTestStepsResult.isFailure()) {
      return new ActionFailure({ messageKey: DELETE_NOTE_FAILED_MESSAGE_KEY });
    }

    return new ActionSuccess({ testStepId, index });
  }
}
