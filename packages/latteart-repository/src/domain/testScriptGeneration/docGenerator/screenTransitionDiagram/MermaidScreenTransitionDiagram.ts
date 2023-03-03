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

import { ScreenTransitionDiagram } from "./types";
import { ScreenTransitionGraph, ScreenTransition } from "../../model";

enum LineType {
  Normal,
  Strong,
}

export class MermaidScreenTransitionDiagram implements ScreenTransitionDiagram {
  constructor(
    private graph: ScreenTransitionGraph,
    private decoration: { strong?: ScreenTransitionGraph } = {}
  ) {}

  public toString(): string {
    const keyToLine = new Map<string, string>();

    for (const screenTransition of this.graph.collectScreenTransitions()) {
      const line = this.buildLine(screenTransition, LineType.Normal);

      keyToLine.set(line.key, line.value);
    }

    for (const screenTransition of this.decoration.strong?.collectScreenTransitions() ??
      []) {
      const line = this.buildLine(screenTransition, LineType.Strong);

      keyToLine.set(line.key, line.value);
    }

    return `\
graph TD;
${Array.from(keyToLine.values())
  .map((line) => `  ${line}`)
  .join("\n")}`;
  }

  public strong(part: ScreenTransitionGraph): void {
    this.decoration.strong = part;
  }

  private buildLine(
    screenTransition: ScreenTransition,
    type: LineType
  ): { key: string; value: string } {
    const { sourceScreenName, destScreenName, trigger } = screenTransition;

    const triggerText =
      type === LineType.Strong && trigger ? `|${trigger}|` : "";
    const arrow = type === LineType.Strong ? "==>" : "-->";

    return {
      key: `${sourceScreenName}_${destScreenName}_${trigger}`,
      value: `${sourceScreenName} ${arrow} ${triggerText}${destScreenName};`,
    };
  }
}
