/**
 * Copyright 2023 NTT Corporation.
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

import { type OperationHistory } from "./types";
import { NoteForGUI } from "./NoteForGUI";

/**
 * Performs operation history conversion processing.
 */
export default class OperationHistorySelector {
  private origin: OperationHistory;

  /**
   * Constructor.
   * @param from  Operation history.
   */
  constructor(from: OperationHistory) {
    this.origin = from;
  }

  /**
   * Group by intention.
   * @returns Grouped operation history
   */
  public groupByIntention(): {
    intention: NoteForGUI | null;
    history: OperationHistory;
  }[] {
    return this.origin.reduce(
      (acc, current) => {
        if (!current.intention && acc.length > 0) {
          acc[acc.length - 1].history.push(current);

          return acc;
        }

        acc.push({
          intention: current.intention,
          history: [current]
        });

        return acc;
      },
      Array<{
        intention: NoteForGUI | null;
        history: OperationHistory;
      }>()
    );
  }
}
