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

import { MethodSelector } from "./types";
import { ScenarioFactory } from "./ScenarioFactory";
import { TestSuite } from "./types";
import { PageObject } from "../pageObject";
import { ScreenTransitionPathBuilder } from "./screenTransitionPath";
import { SequencePath } from "../sequencePath";

export class TestSuiteFactory {
  constructor(
    private methodSelector: MethodSelector,
    private screenTransitionPathBuilder?: ScreenTransitionPathBuilder
  ) {}

  public create(
    initialUrl: string,
    sequencePaths: SequencePath[],
    pageObjects: PageObject[],
    name: string
  ): TestSuite {
    const screenDefPaths = sequencePaths.map((sequencePath) => {
      return sequencePath.map((sequence) => sequence.className);
    });

    const screenTransitionPaths =
      this.screenTransitionPathBuilder?.build(screenDefPaths) ?? screenDefPaths;

    const scenarioFactory = new ScenarioFactory();

    return {
      name,
      topPageUrl: initialUrl,
      testCases: screenTransitionPaths.flatMap((screenDefs) => {
        if (screenDefs.length === 0) {
          return [];
        }

        const methods = this.methodSelector.selectMethods(
          pageObjects,
          screenDefs
        );

        const testCase = {
          id: `${methods.map((method) => method.id).join("_")}`,
          name: screenDefs.join(` -> `),
          scenario: scenarioFactory.create(methods),
        };

        return [testCase];
      }),
    };
  }
}
