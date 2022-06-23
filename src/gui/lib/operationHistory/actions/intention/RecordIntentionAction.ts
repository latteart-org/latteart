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
  RepositoryAccessResult,
  RepositoryAccessSuccess,
} from "@/lib/captureControl/Reply";
import {
  ActionResult,
  ActionSuccess,
  ActionFailure,
} from "@/lib/common/ActionResult";
import { convertNoteWithoutId } from "@/lib/eventDispatcher/replyDataConverter";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

export interface RecordIntentionActionObserver {
  setIntention(value: Note): void;
  getTestStepId(sequence: number): string;
}

export interface Sequential {
  sequence: number;
}

const RECORD_TEST_PURPOSE_FAILED_MESSAGE_KEY =
  "error.operation_history.record_test_purpose_failed";

export class RecordIntentionAction {
  constructor(
    private observer: RecordIntentionActionObserver,
    private repositoryContainer: Pick<
      RepositoryContainer,
      "testStepRepository" | "noteRepository" | "serviceUrl"
    >
  ) {}

  public async record(
    history: {
      intention: Sequential | null;
    }[],
    note: {
      testResultId: string;
      sequence: number;
      summary: string;
      details: string;
    }
  ): Promise<ActionResult<void>> {
    const historyHasTargetIntention = history.find((item) => {
      return item.intention?.sequence === note.sequence;
    });

    const testStepId = this.observer.getTestStepId(note.sequence);

    const editIntentionResult = historyHasTargetIntention
      ? await this.editIntention(note.testResultId, testStepId, {
          summary: note.summary,
          details: note.details,
        })
      : await this.addIntention(note.testResultId, testStepId, {
          summary: note.summary,
          details: note.details,
        });

    if (editIntentionResult.isFailure()) {
      return new ActionFailure({
        messageKey: RECORD_TEST_PURPOSE_FAILED_MESSAGE_KEY,
      });
    }

    if (editIntentionResult.data) {
      this.observer.setIntention(
        Note.createFromOtherNote({
          other: editIntentionResult.data,
          overrideParams: { sequence: note.sequence },
        })
      );
    }
    return new ActionSuccess(undefined);
  }
  /**
   * Add intention information to the test step with the specified sequence number.
   * @param testResultId  Test result ID
   * @param testStepId  Test step id of the target test step.
   * @param intention  Intention information to add
   * @returns Added intention information.
   */
  private async addIntention(
    testResultId: string,
    testStepId: string,
    intention: {
      summary: string;
      details: string;
    }
  ): Promise<RepositoryAccessResult<Note>> {
    // New note registration
    const postNotesResult =
      await this.repositoryContainer.noteRepository.postNotes(
        testResultId,
        intention
      );

    if (postNotesResult.isFailure()) {
      return postNotesResult;
    }

    const savedNote = postNotesResult.data;

    const patchTestStepsResult =
      await this.repositoryContainer.testStepRepository.patchTestSteps(
        testResultId,
        testStepId,
        savedNote?.id
      );

    if (patchTestStepsResult.isFailure()) {
      return patchTestStepsResult;
    }

    const serviceUrl = this.repositoryContainer.serviceUrl;
    const data = new Note({
      value: savedNote.value,
      details: savedNote.details,
      imageFilePath: savedNote.imageFileUrl
        ? new URL(savedNote.imageFileUrl, serviceUrl).toString()
        : "",
      tags: savedNote.tags,
    });

    return new RepositoryAccessSuccess({
      status: patchTestStepsResult.status,
      data: data,
    });
  }

  /**
   * Edit the intention information of the specified sequence number.
   * @param testResultId  Test result ID.
   * @param testStepId  Test step id of the target test step.
   * @param intention  Intention information to edit.
   * @returns Edited intention information.
   */
  private async editIntention(
    testResultId: string,
    testStepId: string,
    intention: {
      summary: string;
      details: string;
    }
  ): Promise<RepositoryAccessResult<Note>> {
    // Get noteId.
    const getTestStepsResult =
      await this.repositoryContainer.testStepRepository.getTestSteps(
        testResultId,
        testStepId
      );

    if (getTestStepsResult.isFailure()) {
      return getTestStepsResult;
    }

    const { intention: noteId } = getTestStepsResult.data;

    // Note update.
    const putNotesResult =
      await this.repositoryContainer.noteRepository.putNotes(
        testResultId,
        noteId as string,
        intention
      );

    if (putNotesResult.isFailure()) {
      return putNotesResult;
    }

    const savedNote = putNotesResult.data as {
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    };

    const serviceUrl = this.repositoryContainer.serviceUrl;
    const data = convertNoteWithoutId(savedNote, serviceUrl);

    return new RepositoryAccessSuccess({
      status: putNotesResult.status,
      data: data,
    });
  }
}
