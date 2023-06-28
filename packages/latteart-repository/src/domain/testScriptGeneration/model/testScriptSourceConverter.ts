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

import { TestScriptSourceOperation } from "../types";

export function markSkippedOperations(operations: TestScriptSourceOperation[]) {
  let isPauseCapturing = false;

  return operations.reduce(
    (acc: TestScriptSourceOperation[], operation, index, array) => {
      if (operation.type === "pause_capturing") {
        isPauseCapturing = true;

        return [...acc, { ...operation, type: "skipped_operations" }];
      }

      if (operation.type === "resume_capturing") {
        isPauseCapturing = false;

        if (acc.at(-1)?.type !== "skipped_operations") {
          return [...acc, { ...operation, type: "skipped_operations" }];
        }

        return acc;
      }

      const nextOperation = array.at(index + 1);
      if (
        isPauseCapturing &&
        operation.type === "screen_transition" &&
        nextOperation &&
        nextOperation?.type !== "resume_capturing"
      ) {
        return [
          ...acc,
          operation,
          { ...operation, type: "skipped_operations" },
        ];
      }

      return [...acc, operation];
    },
    []
  );
}
