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

import { OperationFilter } from "./OperationFilter";
import {
  PageObjectOperation,
  OperationType,
  ElementType,
} from "./PageObjectOperation";

export class UnnecessaryOperationFilter implements OperationFilter {
  public filter(operations: PageObjectOperation[]): PageObjectOperation[] {
    return operations.filter((operation) => {
      if (operation.type === OperationType.SwitchWindow) {
        return true;
      }

      if (operation.target.identifier === "") {
        return false;
      }

      if (operation.type === OperationType.Change) {
        return true;
      }

      return (
        operation.type === OperationType.Click &&
        [
          ElementType.RadioButton,
          ElementType.CheckBox,
          ElementType.Link,
        ].includes(operation.target.type)
      );
    });
  }
}
