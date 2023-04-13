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

import { GetterTree } from "vuex";
import { OperationHistoryState } from ".";
import { RootState } from "..";

const getters: GetterTree<OperationHistoryState, RootState> = {
  /**
   * Find an operation with notes from the history in the State by sequence number.
   * @param state State.
   * @returns Operation with notes.
   */
  findHistoryItem: (state) => (sequence: number) => {
    const operationWithNotes = state.history.find((item) => {
      return item.operation.sequence === sequence;
    });

    if (!operationWithNotes) {
      return operationWithNotes;
    }

    return {
      operation: operationWithNotes.operation,
      bugs: operationWithNotes.bugs,
      notices: operationWithNotes.notices,
      intention: operationWithNotes.intention,
    };
  },

  /**
   * Get operations from the State.
   * @param state State.
   * @returns Operations.
   */
  getOperations: (state) => () => {
    return state.history
      .map((item) => {
        return item.operation;
      })
      .filter((operation) => {
        return operation != null;
      });
  },

  /**
   * Returns true if there is a keywordSet in the history.
   * @param state  State.
   */
  hasKeywordSet: (state) => () => {
    return state.history.some((h) => !!h.operation.keywordSet?.size);
  },
};

export default getters;
