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

import { ScreenTransitionGraphImpl } from "./ScreenTransitionGraph";
import { ScreenTransition } from "./types";

export interface ScreenTransitionGraphBuilder {
  build(screenDefs: string[]): Map<string, Set<string>>;
}

export class ScreenTransitionGraphBuilderImpl
  implements ScreenTransitionGraphBuilder
{
  public build(screenDefs: string[]): Map<string, Set<string>> {
    const screenTransitions: ScreenTransition[] = screenDefs.reduce(
      (acc: ScreenTransition[], current, index, array) => {
        acc.push({
          sourceScreenName: current,
          destScreenName: array[index + 1] ?? "",
        });

        return acc;
      },
      []
    );

    return new ScreenTransitionGraphImpl(screenTransitions).toScreenNameGraph();
  }
}
