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

import { TestDataSelector, TestDataSet } from "./types";
import { MethodCall } from "../model/testSuite";
import { TestDataRepository } from "./TestDataRepository";

export class TemplateTestDataSelector implements TestDataSelector {
  constructor(private repository: TestDataRepository) {}

  public select(methodCalls: MethodCall[], dataSetName: string): TestDataSet {
    const methodArgumentVariations = this.repository.collectScenarioArguments(
      ...methodCalls
    );

    const methodCallTestDatas = methodArgumentVariations
      .filter(({ testDataVariations }) => {
        return testDataVariations.length > 0;
      })
      .map(({ pageObjectId, methodId, testDataVariations }) => {
        const methodArguments = testDataVariations[0].map(({ name }) => {
          return { name, value: "" };
        });

        return {
          pageObjectId,
          methodId,
          methodArguments,
        };
      });

    return {
      name: dataSetName,
      variations: [{ methodCallTestDatas }],
    };
  }
}
