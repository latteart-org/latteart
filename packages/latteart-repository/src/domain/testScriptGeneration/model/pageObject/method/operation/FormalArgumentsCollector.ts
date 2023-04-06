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

import { PageObjectOperation } from "./types";

export class FormalArgumentCollector {
  /**
   * @returns Set of Identifiers for Formal Arguments
   */
  public collect(operations: PageObjectOperation[]): Set<string> {
    const args: Set<string> = new Set();

    operations.forEach((op) => {
      const elem = op.target;
      const identifier = elem.identifier;

      if (op.type === "change") {
        args.add(identifier);
      } else if (elem.type === "RadioButton") {
        args.add(elem.identifier);
      } else if (elem.type === "CheckBox") {
        args.add(identifier);
      }
    });

    return args;
  }
}
