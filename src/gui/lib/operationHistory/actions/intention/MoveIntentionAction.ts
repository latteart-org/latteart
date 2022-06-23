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

import { Note } from "../../Note";
import {
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

export interface MoveIntentionActionObserver {
  moveIntention(oldSequence: number, newIntention: Note): void;
  getTestStepId(sequence: number): string;
}

const MOVE_TEST_PURPOSE_FAILED_MESSAGE_KEY =
  "error.operation_history.move_test_purpose_failed";

export class MoveIntentionAction {
  constructor(
    private observer: MoveIntentionActionObserver,
    private repositoryContainer: Pick<
      RepositoryContainer,
      "testStepRepository" | "noteRepository" | "serviceUrl"
    >
  ) {}

  public async move(
    testResultId: string,
    fromSequence: number,
    destSequence: number
  ): Promise<ActionResult<void>> {
    const fromTestStepId = this.observer.getTestStepId(fromSequence);
    const destTestStepId = this.observer.getTestStepId(destSequence);

    const testStepsResult =
      await this.repositoryContainer.testStepRepository.getTestSteps(
        testResultId,
        fromTestStepId
      );

    if (testStepsResult.isFailure()) {
      return new ActionFailure({
        messageKey: MOVE_TEST_PURPOSE_FAILED_MESSAGE_KEY,
      });
    }

    const noteId = testStepsResult.data.intention;

    // Break the link of the move source.
    const patchTestStepsResult =
      await this.repositoryContainer.testStepRepository.patchTestSteps(
        testResultId,
        fromTestStepId,
        null
      );

    if (patchTestStepsResult.isFailure()) {
      return new ActionFailure({
        messageKey: MOVE_TEST_PURPOSE_FAILED_MESSAGE_KEY,
      });
    }

    // Link to the destination.
    await this.repositoryContainer.testStepRepository.patchTestSteps(
      testResultId,
      destTestStepId,
      noteId
    );

    const getNotesResult =
      await this.repositoryContainer.noteRepository.getNotes(
        testResultId,
        noteId
      );

    if (getNotesResult.isFailure()) {
      return new ActionFailure({
        messageKey: MOVE_TEST_PURPOSE_FAILED_MESSAGE_KEY,
      });
    }

    const note = getNotesResult.data;

    const serviceUrl = this.repositoryContainer.serviceUrl;
    const movedNote = note
      ? new Note({
          value: note.value,
          details: note.details,
          imageFilePath: note.imageFileUrl
            ? new URL(note.imageFileUrl, serviceUrl).toString()
            : "",
          tags: note.tags,
        })
      : null;

    if (movedNote) {
      this.observer.moveIntention(
        fromSequence,
        Note.createFromOtherNote({
          other: movedNote,
          overrideParams: { sequence: destSequence },
        })
      );
    }

    return new ActionSuccess(undefined);
  }
}
