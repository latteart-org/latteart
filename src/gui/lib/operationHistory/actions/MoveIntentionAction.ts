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

import { Note } from "../Note";
import { TestStepRepository } from "@/lib/eventDispatcher/repositoryService/TestStepRepository";
import { NoteRepository } from "@/lib/eventDispatcher/repositoryService/NoteRepository";
import { ActionResult } from "@/lib/common/ActionResult";

export interface MoveIntentionActionObserver {
  moveIntention(oldSequence: number, newIntention: Note): void;
  getTestStepId(sequence: number): string;
}

export interface IntentionMovable {
  readonly testStepRepository: TestStepRepository;
  readonly noteRepository: NoteRepository;
  readonly serviceUrl: string;
}

export class MoveIntentionAction {
  constructor(
    private observer: MoveIntentionActionObserver,
    private dispatcher: IntentionMovable
  ) {}

  public async move(
    testResultId: string,
    fromSequence: number,
    destSequence: number
  ): Promise<ActionResult<void>> {
    const fromTestStepId = this.observer.getTestStepId(fromSequence);
    const destTestStepId = this.observer.getTestStepId(destSequence);

    const noteId = (
      await this.dispatcher.testStepRepository.getTestSteps(
        testResultId,
        fromTestStepId
      )
    ).data!.intention;

    // Break the link of the move source.
    await this.dispatcher.testStepRepository.patchTestSteps(
      testResultId,
      fromTestStepId,
      null
    );

    // Link to the destination.
    await this.dispatcher.testStepRepository.patchTestSteps(
      testResultId,
      destTestStepId,
      noteId
    );

    const reply = await this.dispatcher.noteRepository.getNotes(
      testResultId,
      noteId
    );

    const note = reply.data as {
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    };

    const serviceUrl = this.dispatcher.serviceUrl;
    const movedNote = new Note({
      value: note.value,
      details: note.details,
      imageFilePath: note.imageFileUrl
        ? new URL(note.imageFileUrl, serviceUrl).toString()
        : "",
      tags: note.tags,
    });

    if (movedNote) {
      this.observer.moveIntention(
        fromSequence,
        Note.createFromOtherNote({
          other: movedNote,
          overrideParams: { sequence: destSequence },
        })
      );
    }

    return {};
  }
}
