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

const RECORD_TEST_PURPOSE_FAILED_MESSAGE_KEY =
  "error.operation_history.record_test_purpose_failed";

export class RecordTestPurposeAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "testStepRepository" | "noteRepository" | "serviceUrl"
    >
  ) {}

  public async add(
    testResultId: string,
    testStepId: string,
    note: {
      summary: string;
      details: string;
    }
  ): Promise<ActionResult<Note>> {
    const result = await this.doAddTestPurpose(testResultId, testStepId, {
      summary: note.summary,
      details: note.details,
    });

    if (result.isFailure()) {
      return new ActionFailure({
        messageKey: RECORD_TEST_PURPOSE_FAILED_MESSAGE_KEY,
      });
    }

    return new ActionSuccess(result.data);
  }

  public async edit(
    testResultId: string,
    testStepId: string,
    note: {
      summary: string;
      details: string;
    }
  ): Promise<ActionResult<Note>> {
    const result = await this.doEditTestPurpose(testResultId, testStepId, {
      summary: note.summary,
      details: note.details,
    });

    if (result.isFailure()) {
      return new ActionFailure({
        messageKey: RECORD_TEST_PURPOSE_FAILED_MESSAGE_KEY,
      });
    }

    return new ActionSuccess(result.data);
  }

  private async doAddTestPurpose(
    testResultId: string,
    testStepId: string,
    intention: {
      summary: string;
      details: string;
    }
  ): Promise<RepositoryAccessResult<Note>> {
    // New note registration
    const postNotesResult =
      await this.repositoryContainer.noteRepository.postNotes(testResultId, {
        type: "intention",
        value: intention.summary,
        details: intention.details,
      });

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
      data: data,
    });
  }

  private async doEditTestPurpose(
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
        {
          type: "intention",
          value: intention.summary,
          details: intention.details,
        }
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
      data: data,
    });
  }
}
