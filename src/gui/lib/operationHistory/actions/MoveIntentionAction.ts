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

export interface MoveIntentionActionObserver {
  moveIntention(oldSequence: number, newIntention: Note): void;
  getTestStepId(sequence: number): string;
}

export interface IntentionMovable {
  moveIntention(
    testResultId: string,
    fromTestStepId: string,
    destTestStepId: string
  ): Promise<Reply<Note>>;
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

    const movedNote = (
      await this.dispatcher.moveIntention(
        testResultId,
        fromTestStepId,
        destTestStepId
      )
    ).data;

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
