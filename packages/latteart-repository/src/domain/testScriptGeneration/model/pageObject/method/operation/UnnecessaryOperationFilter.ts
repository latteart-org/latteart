/**
 * Copyright 2025 NTT Corporation.
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

import { PageObjectOperation, OperationFilter } from "./types";

export class UnnecessaryOperationFilter implements OperationFilter {
  public filter(operations: PageObjectOperation[]): PageObjectOperation[] {
    return operations.filter((operation) => {
      if (operation.type === "skipped_operations") {
        return true;
      }

      if (operation.type === "switch_window") {
        return true;
      }

      if (operation.type === "accept_alert") {
        return true;
      }

      if (operation.type === "dismiss_alert") {
        return true;
      }

      if (operation.type === "browser_back") {
        return true;
      }

      if (operation.type === "browser_forward") {
        return true;
      }

      if (operation.target.identifier === "") {
        return false;
      }

      if (operation.type === "change") {
        return true;
      }

      return (
        operation.type === "click" &&
        ["RadioButton", "CheckBox", "Button", "Link"].includes(
          operation.target.type
        )
      );
    });
  }
}
