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

import {
  TestSuite,
  TestScriptModel,
  ScreenTransitionGraphImpl,
  invalidOperationTypeExists,
} from "../../model";
import {
  TestScriptCodeGenerator,
  TestSuiteCodeGenerator,
  PageObjectCodeGenerator,
} from "../types";
import { JSTestDataCodeGenerator } from "./testData/JSTestDataCodeGenerator";
import { JSTestSuiteCommentAttacher } from "./testSuite/JSTestSuiteCommentAttacher";
import { JSPageObjectCommentAttacher } from "./pageObject/JSPageObjectCommentAttacher";
import { TestDataSet } from "../../testDataRepository";
import { TestScript } from "../../types";
import { JSDocReadmeGenerator } from "./other/JSDocReadmeGenerator";
import { JSPageObjectNameGenerator } from "./pageObject/JSPageObjectNameGenerator";
import { JSPageObjectMethodNameGenerator } from "./pageObject/JSPageObjectMethodNameGenerator";

export class JSTestScriptCodeGenerator implements TestScriptCodeGenerator {
  constructor(
    private codeGenerator: {
      pageObject: PageObjectCodeGenerator;
      testSuite: TestSuiteCodeGenerator;
      testData: JSTestDataCodeGenerator | null;
    },
    private nameGenerator: {
      pageObject: JSPageObjectNameGenerator;
      method: JSPageObjectMethodNameGenerator;
    },
    private testCaseNameToDataSet: Map<string, TestDataSet>,
    private pageObjectIdToDataSets: Map<string, TestDataSet[]>
  ) {}

  public generateFrom(model: TestScriptModel): TestScript {
    const pageObjectFileExtension = ".page.js";

    const testSuites = model.testSuites.map((testSuite) => {
      return new JSTestSuiteCommentAttacher(
        this.nameGenerator,
        pageObjectFileExtension
      ).attachComment(testSuite);
    });

    const pageObjectCommentAttacher = new JSPageObjectCommentAttacher(
      this.nameGenerator,
      model.pageObjects
    );

    return {
      pageObjects: model.pageObjects.map((pageObject) => {
        const pageObjectAttachedComments =
          pageObjectCommentAttacher.attachComment(
            pageObject,
            this.buildTestSuiteGraph(testSuites)
          );

        return {
          name: `${this.nameGenerator.pageObject.generate(
            pageObject.id
          )}${pageObjectFileExtension}`,
          script: this.codeGenerator.pageObject.generateFrom(
            pageObjectAttachedComments
          ),
        };
      }),
      testData: this.codeGenerator.testData
        ? this.generateTestDataCodes(this.codeGenerator.testData)
        : [],
      testSuite:
        testSuites.flatMap((testSuite) => testSuite.testCases).length !== 0
          ? {
              name: "test.spec.js",
              spec: this.codeGenerator.testSuite.generateFrom(...testSuites),
            }
          : null,
      others: [
        {
          name: "readme.md",
          script: new JSDocReadmeGenerator().generate(
            new Map(
              testSuites.map((testSuite) => {
                return [testSuite.name, testSuite.topPageUrl];
              })
            ),
            model.pageObjects.map(({ id, methods }) => {
              const invalidTypeExists = methods.some((method) => {
                return method.operations.some((operation) => {
                  return invalidOperationTypeExists(operation.type);
                });
              });
              return {
                name: id,
                alias: this.nameGenerator.pageObject.generate(id),
                invalidTypeExists: invalidTypeExists,
              };
            })
          ),
        },
      ],
    };
  }

  private generateTestDataCodes(codeGenerator: JSTestDataCodeGenerator) {
    return [
      ...[...this.pageObjectIdToDataSets.entries()].map(
        ([pageObjectId, testDataSets]) => {
          const pageObjectName =
            this.nameGenerator.pageObject.generate(pageObjectId);

          return {
            name: `${pageObjectName}TestData.js`,
            testData: codeGenerator.generateFrom(...testDataSets),
          };
        }
      ),
      {
        name: "TestData.js",
        testData: codeGenerator.generateFrom(
          ...[...this.testCaseNameToDataSet.values()]
        ),
      },
    ].filter((testDataCode) => {
      return testDataCode.testData.trimEnd();
    });
  }

  private buildTestSuiteGraph(testSuites: TestSuite[]) {
    const screenTransitionPaths = testSuites
      .flatMap((testSuite) => testSuite.testCases)
      .map((testCase) => {
        return testCase.scenario.methodCalls.map((methodCall) => {
          const sourceScreenName = methodCall.pageObjectId;
          const destScreenName = methodCall.returnPageObjectId;
          const trigger = this.nameGenerator.method.generate(
            methodCall.methodId
          );

          return { sourceScreenName, destScreenName, trigger };
        });
      });

    return new ScreenTransitionGraphImpl(screenTransitionPaths.flat());
  }
}
