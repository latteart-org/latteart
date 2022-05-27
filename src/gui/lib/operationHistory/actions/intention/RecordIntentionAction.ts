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
import { Reply, ReplyImpl } from "@/lib/captureControl/Reply";
import { TestStepOperation } from "../../types";
import { ActionResult } from "@/lib/common/ActionResult";
import { convertNoteWithoutId } from "@/lib/eventDispatcher/replyDataConverter";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

export interface RecordIntentionActionObserver {
  setIntention(value: Note): void;
  getTestStepId(sequence: number): string;
}

export interface Sequential {
  sequence: number;
}

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

    const reply = historyHasTargetIntention
      ? await this.editIntention(note.testResultId, testStepId, {
          summary: note.summary,
          details: note.details,
        })
      : await this.addIntention(note.testResultId, testStepId, {
          summary: note.summary,
          details: note.details,
        });

    if (reply.data) {
      this.observer.setIntention(
        Note.createFromOtherNote({
          other: reply.data,
          overrideParams: { sequence: note.sequence },
        })
      );
    }
    return {};
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
  ): Promise<Reply<Note>> {
    // New note registration
    const reply = await this.repositoryContainer.noteRepository.postNotes(
      testResultId,
      intention
    );
    const savedNote = reply.data ?? undefined;

    if (!savedNote) {
      return new ReplyImpl({ status: reply.status, data: undefined });
    }

    await this.repositoryContainer.testStepRepository.patchTestSteps(
      testResultId,
      testStepId,
      savedNote?.id
    );

    const serviceUrl = this.repositoryContainer.serviceUrl;
    const data = new Note({
      value: savedNote.value,
      details: savedNote.details,
      imageFilePath: savedNote.imageFileUrl
        ? new URL(savedNote.imageFileUrl, serviceUrl).toString()
        : "",
      tags: savedNote.tags,
    });

    return new ReplyImpl({ status: reply.status, data: data });
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
  ): Promise<Reply<Note>> {
    // Get noteId.
    const { intention: noteId } = (
      await this.repositoryContainer.testStepRepository.getTestSteps(
        testResultId,
        testStepId
      )
    ).data as {
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    };

    // Note update.
    const reply = await this.repositoryContainer.noteRepository.putNotes(
      testResultId,
      noteId as string,
      intention
    );

    if (!reply.data) {
      return new ReplyImpl({ status: reply.status, data: undefined });
    }

    const savedNote = reply.data as {
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    };

    const serviceUrl = this.repositoryContainer.serviceUrl;
    const data = convertNoteWithoutId(savedNote, serviceUrl);

    return new ReplyImpl({ status: reply.status, data: data });
  }
}
