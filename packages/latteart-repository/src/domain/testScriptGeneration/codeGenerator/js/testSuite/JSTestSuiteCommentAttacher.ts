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

import { TestSuite, TestCase } from "../../../model";
import { TestSuiteCommentAttacher } from "../../types";
import { MermaidScreenTransitionDiagram } from "../../../docGenerator/screenTransitionDiagram/MermaidScreenTransitionDiagram";
import { JSTestSuiteCommentGenerator } from "./JSTestSuiteCommentGenerator";
import { JSTestCaseCommentGenerator } from "./JSTestCaseCommentGenerator";
import {
  ScreenTransitionGraphImpl,
  ScreenTransitionGraph,
} from "../../../model";
import { NameGenerator } from "../../types";

export class JSTestSuiteCommentAttacher implements TestSuiteCommentAttacher {
  constructor(
    private nameGenerator: {
      pageObject: NameGenerator;
      method: NameGenerator;
    },
    private pageObjectFileExtention: string
  ) {}

  public attachComment(testSuite: TestSuite): TestSuite {
    const testSuiteGraph = this.buildTestSuiteGraph(testSuite);

    const testCases = this.attachTestCasesComment(
      testSuite.testCases,
      testSuite.name,
      testSuiteGraph
    );

    return {
      name: testSuite.name,
      topPageUrl: testSuite.topPageUrl,
      testCases,
      comment: new JSTestSuiteCommentGenerator().generateFrom(
        testSuite.name,
        new MermaidScreenTransitionDiagram(testSuiteGraph)
      ),
    };
  }

  private buildTestSuiteGraph(testSuite: TestSuite) {
    const screenTransitionPaths = testSuite.testCases.map((testCase) => {
      return testCase.scenario.methodCalls.map((methodCall) => {
        const sourceScreenName = methodCall.pageObjectId;
        const destScreenName = methodCall.returnPageObjectId;
        const trigger = this.nameGenerator.method.generate(methodCall.methodId);

        return { sourceScreenName, destScreenName, trigger };
      });
    });

    return new ScreenTransitionGraphImpl(screenTransitionPaths.flat());
  }

  private buildTestCaseGraph(testCase: TestCase) {
    const screenTransitions = testCase.scenario.methodCalls.map(
      (methodCall) => {
        const sourceScreenName = methodCall.pageObjectId;
        const destScreenName = methodCall.returnPageObjectId;
        const trigger = this.nameGenerator.method.generate(methodCall.methodId);

        return { sourceScreenName, destScreenName, trigger };
      }
    );

    return new ScreenTransitionGraphImpl(screenTransitions);
  }

  private attachTestCasesComment(
    testCases: TestCase[],
    testSuiteName: string,
    testSuiteGraph: ScreenTransitionGraph
  ) {
    return testCases.map((testCase) => {
      const testCaseGraph = this.buildTestCaseGraph(testCase);

      return {
        id: testCase.id,
        name: testCase.name,
        scenario: {
          methodCalls: testCase.scenario.methodCalls.map((methodCall) => {
            return {
              comment: `${methodCall.pageObjectId}${this.pageObjectFileExtention}`,
              ...methodCall,
            };
          }),
        },
        comment: new JSTestCaseCommentGenerator().generateFrom(
          testCase.name,
          testSuiteName,
          new MermaidScreenTransitionDiagram(testSuiteGraph, {
            strong: testCaseGraph,
          })
        ),
      };
    });
  }
}
