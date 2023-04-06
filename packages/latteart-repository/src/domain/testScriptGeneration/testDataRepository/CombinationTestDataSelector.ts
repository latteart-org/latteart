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

import { TestDataSelector, TestDataSet, MethodCallTestData } from "./types";
import { MethodCall } from "../model/testSuite";
import { CombinationGenerator } from "./CombinationGenerator";
import { TestDataRepository } from "./TestDataRepository";

export class CombinationTestDataSelector implements TestDataSelector {
  constructor(
    private repository: TestDataRepository,
    private combinationGenerator: CombinationGenerator
  ) {}

  public select(methodCalls: MethodCall[], dataSetName: string): TestDataSet {
    const methodArgumentVariations = this.repository.collectScenarioArguments(
      ...methodCalls
    );

    const datas: MethodCallTestData[][] = methodArgumentVariations.map(
      ({ pageObjectId, methodId, testDataVariations }) => {
        return testDataVariations.map((methodArguments) => {
          return { pageObjectId, methodId, methodArguments };
        });
      }
    );

    const combined = this.combinationGenerator.generate(...datas);

    const variations = combined.map((methodCallTestDatas) => {
      return { methodCallTestDatas };
    });

    return { name: dataSetName, variations };
  }
}
