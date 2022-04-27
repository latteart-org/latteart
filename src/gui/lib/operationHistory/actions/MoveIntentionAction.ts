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
import { Reply } from "@/lib/captureControl/Reply";
import { TestStepOperation } from "../types";

export interface MoveIntentionActionObserver {
  moveIntention(oldSequence: number, newIntention: Note): void;
  getTestStepId(sequence: number): string;
}

export interface IntentionMovable {
  getTestSteps(
    testResultId: string,
    testStepId: string
  ): Promise<
    Reply<{
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    }>
  >;
  patchTestSteps(
    testResultId: string,
    testStepId: string,
    noteId: string | null
  ): Promise<
    Reply<{
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    }>
  >;
  getNotes(testResultId: string, noteId: string | null): Promise<Reply<Note>>;
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
  ): Promise<void> {
    const fromTestStepId = this.observer.getTestStepId(fromSequence);
    const destTestStepId = this.observer.getTestStepId(destSequence);

    const noteId =
      (await this.dispatcher.getTestSteps(testResultId, fromTestStepId)).data
        ?.intention ?? null;

    // Break the link of the move source.
    await this.dispatcher.patchTestSteps(testResultId, fromTestStepId, null);

    // Link to the destination.
    await this.dispatcher.patchTestSteps(testResultId, destTestStepId, noteId);

    const movedNote = (await this.dispatcher.getNotes(testResultId, noteId))
      .data;

    if (movedNote) {
      this.observer.moveIntention(
        fromSequence,
        Note.createFromOtherNote({
          other: movedNote,
          overrideParams: { sequence: destSequence },
        })
      );
    }
  }
}
