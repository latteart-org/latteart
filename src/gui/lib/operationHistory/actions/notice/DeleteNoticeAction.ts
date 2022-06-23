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

const DELETE_NOTICE_FAILED_MESSAGE_KEY =
  "error.operation_history.delete_note_failed";

export class DeleteNoticeAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "testStepRepository" | "noteRepository" | "serviceUrl"
    >
  ) {}

  /**
   * Delete Notice.
   * @param testResultId  The id of the test result associated with the Notice to be deleted.
   * @param testStepId  Test step id of the test result associated with the target Notice.
   * @param index  Notice index.
   */
  public async deleteNotice(
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
      return new ActionFailure({
        messageKey: DELETE_NOTICE_FAILED_MESSAGE_KEY,
      });
    }

    const { notices } = getTestStepsResult.data;

    const noteId = notices[index];

    // Delete note.
    const deleteNotesResult =
      await this.repositoryContainer.noteRepository.deleteNotes(
        testResultId,
        noteId
      );

    if (deleteNotesResult.isFailure()) {
      return new ActionFailure({
        messageKey: DELETE_NOTICE_FAILED_MESSAGE_KEY,
      });
    }

    // Break the link.
    const filteredNotices = notices.filter(
      (_: unknown, i: number) => i !== index
    );

    const patchTestStepsResult =
      await this.repositoryContainer.testStepRepository.patchTestSteps(
        testResultId,
        testStepId,
        undefined,
        undefined,
        filteredNotices
      );

    if (patchTestStepsResult.isFailure()) {
      return new ActionFailure({
        messageKey: DELETE_NOTICE_FAILED_MESSAGE_KEY,
      });
    }

    const data = { testStepId, index };

    return new ActionSuccess(data);
  }
}
