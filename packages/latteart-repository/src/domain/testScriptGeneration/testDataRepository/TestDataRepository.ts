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

import { PageObjectMethodIdToInputVariations } from "../model";
import { MethodArgumentGroup } from "./types";
import { MethodCall } from "../model/testSuite";

export type TestDataRepository = {
  collectScenarioArguments(...methodCalls: MethodCall[]): {
    pageObjectId: string;
    methodId: string;
    testDataVariations: MethodArgumentGroup[];
  }[];
};

export class TestDataRepositoryImpl implements TestDataRepository {
  constructor(
    private methodIdToInputVariations: PageObjectMethodIdToInputVariations
  ) {}

  public collectScenarioArguments(...methodCalls: MethodCall[]): {
    pageObjectId: string;
    methodId: string;
    testDataVariations: MethodArgumentGroup[];
  }[] {
    const methodArgumentVariations = methodCalls.reduce(
      (acc, { pageObjectId, methodId }) => {
        const variations = this.methodIdToInputVariations.get(methodId) ?? [];

        const testDataVariations = variations.map((methodArguments) => {
          return Object.entries(methodArguments).map(([name, value]) => {
            return { name, value };
          });
        });

        acc.push({
          pageObjectId,
          methodId,
          testDataVariations,
        });

        return acc;
      },
      new Array<{
        pageObjectId: string;
        methodId: string;
        testDataVariations: MethodArgumentGroup[];
      }>()
    );

    return methodArgumentVariations;
  }
}
