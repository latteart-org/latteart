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

import { OperationFilter, PageObjectOperation } from "./types";

export class DuplicateElementOperationFilter implements OperationFilter {
  /**
   * @param operations
   * @returns operations from which duplication removed (adopt last operation in sequence).
   */
  public filter(operations: PageObjectOperation[]): PageObjectOperation[] {
    return operations
      .reverse()
      .filter((operation: PageObjectOperation, index: number, array) => {
        if (operation.target.identifier === "") {
          return true;
        }

        const foundIndex = array.findIndex(({ target }) => {
          if (target.identifier === "") {
            return false;
          }

          return target.identifier === operation.target.identifier;
        });

        return foundIndex === index;
      }, [])
      .reverse();
  }
}
