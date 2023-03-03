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

import { PageObjectOperation } from "../pageObject";

export class InputGroupCollector {
  public collectFrom(operations: PageObjectOperation[]): {
    [paramName: string]: string;
  } {
    // retain only final entered value.
    const map = operations.reduce((acc: Map<string, string>, op) => {
      const elem = op.target;

      if (op.type === "change") {
        acc.set(elem.identifier, `${this.escapeNewlineCharacters(op.input)}`);

        return acc;
      }

      if (elem.type === "RadioButton") {
        acc.set(elem.identifier, `${this.escapeNewlineCharacters(op.input)}`);

        return acc;
      }

      if (elem.type === "CheckBox") {
        const value = op.input === "on" ? "true" : "false";

        acc.set(elem.identifier, value);
      }

      return acc;
    }, new Map<string, string>());

    return Object.fromEntries(map.entries());
  }

  private escapeNewlineCharacters(before: string) {
    return before.replace(/\n/g, "\\n");
  }
}
