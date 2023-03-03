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

import { ScreenTransition, ScreenTransitionGraph } from "./types";

export class ScreenTransitionGraphImpl implements ScreenTransitionGraph {
  constructor(private screenTransitions: ScreenTransition[]) {}

  public collectScreenTransitions(): ScreenTransition[] {
    return this.screenTransitions;
  }

  public toScreenNameGraph(): Map<string, Set<string>> {
    return this.screenTransitions.reduce(
      (
        acc,
        { sourceScreenName: sourceScreenName, destScreenName: destScreenName }
      ) => {
        if (!acc.has(sourceScreenName)) {
          acc.set(sourceScreenName, new Set());
        }

        if (destScreenName) {
          acc.get(sourceScreenName)?.add(destScreenName);
        }

        return acc;
      },
      new Map<string, Set<string>>()
    );
  }
}
