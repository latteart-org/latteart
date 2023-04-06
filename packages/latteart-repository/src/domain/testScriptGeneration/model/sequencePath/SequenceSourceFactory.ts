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

import { TestScriptSourceOperation } from "../../types";

export type SequenceSource = {
  screenDef: string;
  operations: TestScriptSourceOperation[];
  url: string;
  imageUrl: string;
};

export class SequenceSourceFactory {
  public create(histories: TestScriptSourceOperation[][]): SequenceSource[][] {
    return histories.map((operations) => {
      return operations.reduce((acc: SequenceSource[], operation) => {
        if (acc.length === 0 || operation.type === "screen_transition") {
          acc.push({
            screenDef: operation.screenDef,
            operations: [],
            url: operation.url,
            imageUrl: operation.imageFilePath,
          });
        }

        if (operation.type !== "screen_transition") {
          acc[acc.length - 1].operations.push(operation);
        }

        return acc;
      }, []);
    });
  }
}
