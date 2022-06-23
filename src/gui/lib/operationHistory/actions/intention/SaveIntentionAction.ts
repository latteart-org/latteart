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

import { Sequential } from "./RecordIntentionAction";
import { ActionResult, ActionSuccess } from "@/lib/common/ActionResult";

export interface SaveIntentionActionObserver {
  recordIntention(intention: {
    testResultId: string;
    summary: string;
    details: string;
    sequence: number;
  }): Promise<void>;

  moveIntention(fromSequence: number, destSequence: number): Promise<void>;

  setUnassignedIntention(unassignedIntention: {
    sequence: number;
    note: string;
    noteDetails?: string;
  }): Promise<void>;
}

export interface IntentionInfo {
  note: string;
  noteDetails?: string;
  oldSequence?: number;
  newSequence?: number;
}

export class SaveIntentionAction {
  constructor(private observer: SaveIntentionActionObserver) {}

  public async save(
    testResultId: string,
    noteEditInfo: IntentionInfo,
    history: {
      operation: Sequential;
    }[]
  ): Promise<ActionResult<void>> {
    const { oldSequence, newSequence, note, noteDetails } = noteEditInfo;

    const sequence =
      oldSequence !== undefined
        ? oldSequence
        : (history[history.length - 1]?.operation.sequence ?? 0) + 1;

    if (!history.find((item) => item.operation.sequence === sequence)) {
      // If dest operation is not found, add it as a unassigned intention.
      await this.observer.setUnassignedIntention({
        sequence,
        note: noteEditInfo.note,
        noteDetails: noteEditInfo.noteDetails,
      });

      return new ActionSuccess(undefined);
    }

    await this.observer.recordIntention({
      testResultId,
      summary: note,
      details: noteDetails ?? "",
      sequence,
    });

    if (oldSequence !== undefined && newSequence !== undefined) {
      await this.observer.moveIntention(oldSequence, newSequence);
    }

    return new ActionSuccess(undefined);
  }
}
