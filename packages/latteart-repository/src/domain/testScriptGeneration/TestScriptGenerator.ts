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

import { TestScript, TestScriptGenerationOption } from "./types";
import {
  TestScriptCodeGeneratorFactory,
  TestScriptCodeLanguage,
} from "./codeGenerator/TestScriptCodeGeneratorFactory";
import {
  CombinationGenerator,
  CombinationTestDataSelector,
  TemplateTestDataSelector,
  TestDataSelector,
  TestDataSet,
} from "./testDataRepository";
import { PageObject } from "./model";
import { TestDataRepositoryImpl } from "./testDataRepository/TestDataRepository";
import {
  TestScriptModelGeneratorFactory,
  TestScriptModelGeneratorType,
} from "./model";
import { MethodCall, TestSuite } from "./model";
import { TestScriptSourceOperation } from "./types";

export class TestScriptGenerator {
  constructor(private option: TestScriptGenerationOption) {}

  public generate(
    sources: { initialUrl: string; history: TestScriptSourceOperation[] }[]
  ): TestScript {
    const modelGeneratorType = this.option.optimized
      ? TestScriptModelGeneratorType.Optimized
      : TestScriptModelGeneratorType.Simple;

    const modelGenerator = new TestScriptModelGeneratorFactory(
      this.option
    ).create(modelGeneratorType);

    const model = modelGenerator.generate(sources);

    const testDataMaxGenerationNum = this.option.testData.useDataDriven
      ? this.option.testData.maxGeneration
      : 1;

    const testCaseIdToDataSet = this.buildTestCaseIdToDataSet(
      model.pageObjects,
      model.testSuites,
      testDataMaxGenerationNum
    );

    const pageObjectIdToDataSets = this.buildPageObjectIdToDataSets(
      model.pageObjects,
      testDataMaxGenerationNum > 0 ? 9999 : 0
    );

    const codeGenerator = new TestScriptCodeGeneratorFactory(
      modelGeneratorType,
      this.option.testData,
      testCaseIdToDataSet,
      pageObjectIdToDataSets,
      model.pageObjects
    ).create(TestScriptCodeLanguage.JavaScript);

    return codeGenerator.generateFrom(model);
  }

  private buildTestCaseIdToDataSet(
    pageObjects: PageObject[],
    testSuites: TestSuite[],
    testDataMaxGenerationNum: number
  ): Map<string, TestDataSet> {
    const testCases = testSuites.flatMap(({ testCases }) => testCases);

    const testDataSelector = this.createTestDataSelector(
      pageObjects,
      testDataMaxGenerationNum
    );

    return new Map(
      testCases.map((testCase, index) => {
        return [
          testCase.id,
          testDataSelector.select(
            testCase.scenario.methodCalls,
            `testDataSet${index + 1}`
          ),
        ];
      })
    );
  }

  private buildPageObjectIdToDataSets(
    pageObjects: PageObject[],
    testDataMaxGenerationNum: number
  ): Map<string, TestDataSet[]> {
    const testDataSelector = this.createTestDataSelector(
      pageObjects,
      testDataMaxGenerationNum
    );

    const pageObjectIdToMethodCalls: [string, MethodCall[]][] = pageObjects.map(
      (pageObject) => {
        const methodCalls = pageObject.methods.map((method) => {
          const methodCall: MethodCall = {
            pageObjectId: method.pageObjectId,
            methodId: method.id,
            returnPageObjectId: method.returnPageObjectId,
          };

          return methodCall;
        });

        return [pageObject.id, methodCalls];
      }
    );

    return new Map(
      pageObjectIdToMethodCalls.flatMap(([pageObjectId, methodCalls]) => {
        const testDataSets = methodCalls.map((methodCall, index) => {
          return testDataSelector.select(
            [methodCall],
            `testDataSet${index + 1}`
          );
        });

        const notEmptyTestDataSets = testDataSets.filter(
          (testDataSet) =>
            testDataSet.variations.filter((variation) => {
              return (
                variation.methodCallTestDatas.filter((data) => {
                  return data.methodArguments.length > 0;
                }).length > 0
              );
            }).length > 0
        );

        if (notEmptyTestDataSets.length === 0) {
          return [];
        }

        return [[pageObjectId, testDataSets]];
      })
    );
  }

  private createTestDataSelector(
    pageObjects: PageObject[],
    testDataMaxGenerationNum: number
  ): TestDataSelector {
    const methodIdToInputGroups = new Map(
      pageObjects.flatMap((pageObject) => {
        return [...pageObject.collectMethodInputVariations().entries()];
      })
    );

    const repository = new TestDataRepositoryImpl(methodIdToInputGroups);

    if (testDataMaxGenerationNum > 0) {
      const combinationGenerator = new CombinationGenerator(
        testDataMaxGenerationNum
      );

      return new CombinationTestDataSelector(repository, combinationGenerator);
    } else {
      return new TemplateTestDataSelector(repository);
    }
  }
}
