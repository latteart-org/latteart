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

const MOVE_NOTICE_FAILED_MESSAGE_KEY =
  "error.operation_history.move_note_failed";

export class MoveNoticeAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "noteRepository" | "testStepRepository" | "serviceUrl"
    >
  ) {}

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
    const getTestStepsResult =
      await this.repositoryContainer.testStepRepository.getTestSteps(
        testResultId,
        from.testStepId
      );

    if (getTestStepsResult.isFailure()) {
      return new ActionFailure({ messageKey: MOVE_NOTICE_FAILED_MESSAGE_KEY });
    }

    const { notices: fromNotices } = getTestStepsResult.data;

    const filteredNotices = fromNotices.filter(
      (_: unknown, index: number) => index !== from.index
    );

    const patchTestStepsResult = await (async () => {
      return this.repositoryContainer.testStepRepository.patchTestSteps(
        testResultId,
        from.testStepId,
        noteId,
        bugs,
        filteredNotices
      );
    })();

    if (patchTestStepsResult.isFailure()) {
      return new ActionFailure({ messageKey: MOVE_NOTICE_FAILED_MESSAGE_KEY });
    }

    // Link to the destination.
    const getTestStepsResult2 =
      await this.repositoryContainer.testStepRepository.getTestSteps(
        testResultId,
        dest.testStepId
      );

    if (getTestStepsResult2.isFailure()) {
      return new ActionFailure({ messageKey: MOVE_NOTICE_FAILED_MESSAGE_KEY });
    }

    const { notices: destNotices } = getTestStepsResult2.data;

    const notices = [...destNotices, fromNotices[from.index]];

    const patchTestStepsResult2 =
      await this.repositoryContainer.testStepRepository.patchTestSteps(
        testResultId,
        dest.testStepId,
        noteId,
        bugs,
        notices
      );

    if (patchTestStepsResult2.isFailure()) {
      return new ActionFailure({ messageKey: MOVE_NOTICE_FAILED_MESSAGE_KEY });
    }

    const getNotesResult =
      await this.repositoryContainer.noteRepository.getNotes(
        testResultId,
        fromNotices[from.index]
      );

    if (getNotesResult.isFailure()) {
      return new ActionFailure({ messageKey: MOVE_NOTICE_FAILED_MESSAGE_KEY });
    }

    const note = getNotesResult.data;

    const serviceUrl = this.repositoryContainer.serviceUrl;
    const data = {
      notice: convertNoteWithoutId(note, serviceUrl),
      index: destNotices.length,
    };

    return new ActionSuccess(data);
  }
}
