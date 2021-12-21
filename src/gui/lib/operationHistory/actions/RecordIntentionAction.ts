/**
 * Copyright 2021 NTT Corporation.
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

export interface RecordIntentionActionObserver {
  setIntention(value: Note): void;
  getTestStepId(sequence: number): string;
}

export interface IntentionRecordable {
  editIntention(
    testResultId: string,
    testStepId: string,
    intention: {
      summary: string;
      details: string;
    }
  ): Promise<Reply<Note>>;

  addIntention(
    testResultId: string,
    testStepId: string,
    intention: {
      summary: string;
      details: string;
    }
  ): Promise<Reply<Note>>;
}

export interface Sequential {
  sequence: number;
}

export class RecordIntentionAction {
  constructor(
    private observer: RecordIntentionActionObserver,
    private repositoryServiceDispatcher: IntentionRecordable
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
  ): Promise<void> {
    const historyHasTargetIntention = history.find((item) => {
      return item.intention?.sequence === note.sequence;
    });

    const testStepId = this.observer.getTestStepId(note.sequence);

    const reply = historyHasTargetIntention
      ? await this.repositoryServiceDispatcher.editIntention(
          note.testResultId,
          testStepId,
          {
            summary: note.summary,
            details: note.details,
          }
        )
      : await this.repositoryServiceDispatcher.addIntention(
          note.testResultId,
          testStepId,
          {
            summary: note.summary,
            details: note.details,
          }
        );

    if (reply.data) {
      this.observer.setIntention(
        Note.createFromOtherNote({
          other: reply.data,
          overrideParams: { sequence: note.sequence },
        })
      );
    }
  }
}
