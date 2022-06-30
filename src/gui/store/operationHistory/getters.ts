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
import { Operation } from "@/lib/operationHistory/Operation";
import ScreenDefFactory from "@/lib/operationHistory/ScreenDefFactory";
import { OperationWithNotes } from "@/lib/operationHistory/types";
import OperationHistorySelector from "@/lib/operationHistory/OperationHistorySelector";
import ScreenHistory from "@/lib/operationHistory/ScreenHistory";

const getters: GetterTree<OperationHistoryState, RootState> = {
  /**
   * Get config from the State.
   * @param state State.
   * @returns Config.
   */
  getConfig: (state) => () => {
    return JSON.parse(JSON.stringify(state.config));
  },

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

    const screenDefCreator = new ScreenDefFactory(
      state.config.screenDefinition
    );
    const { title, url, keywordSet } = operationWithNotes.operation;
    const screenDef = screenDefCreator.createFrom(title, url, keywordSet);

    return {
      operation: Operation.createFromOtherOperation({
        other: operationWithNotes.operation,
        overrideParams: {
          screenDef,
        },
      }),
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
   * Get operation with notes history from the State.
   * @param state State.
   * @returns Operation with notes history.
   */
  getHistory: (state) => () => {
    const screenDefCreator = new ScreenDefFactory(
      state.config.screenDefinition
    );

    return state.history.map((item) => {
      const { title, url, keywordSet } = item.operation;

      const screenDef = screenDefCreator.createFrom(title, url, keywordSet);
      const operation = Operation.createFromOtherOperation({
        other: item.operation,
        overrideParams: {
          screenDef,
        },
      });

      return {
        operation,
        intention: item.intention,
        bugs: item.bugs,
        notices: item.notices,
      };
    });
  },

  /**
   * Get screen transition informations that transition from selected screen.
   * @param state State.
   * @param getHistory The function to get operation with notes history from the State.
   * @returns Screen transition informations that transition from selected screen.
   */
  getSelectedScreenTransitions: (state, { getHistory }) => () => {
    const operationHistory: OperationWithNotes[] = getHistory();
    const coverageSources = state.coverageSources;

    const groupedHistory = new OperationHistorySelector(
      operationHistory
    ).groupByIntention();

    return groupedHistory.map((item) => {
      const screenHistory = ScreenHistory.createFromOperationHistory(
        item.history,
        coverageSources
      );
      const transitions = screenHistory
        .collectScreenTransitions(state.selectedScreenDef)
        .map((transition) => {
          return {
            sourceScreenDef: transition.source.screenDef,
            targetScreenDef: transition.target.screenDef,
            history: transition.history.filter(({ operation }) => {
              return operation.windowHandle === state.selectedWindowHandle;
            }),
            screenElements: transition.screenElements,
            inputElements: transition.inputElements,
          };
        })
        .filter((transition) => {
          return transition.history.length > 0;
        })
        .filter((transition) => {
          if (state.selectedScreenTransition) {
            if (
              transition.sourceScreenDef !==
              state.selectedScreenTransition.source.screenDef
            ) {
              return false;
            }

            if (
              transition.targetScreenDef !==
              state.selectedScreenTransition.target.screenDef
            ) {
              return false;
            }
          }

          return true;
        });

      return {
        intention: item.intention?.value ?? "",
        transitions,
      };
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
