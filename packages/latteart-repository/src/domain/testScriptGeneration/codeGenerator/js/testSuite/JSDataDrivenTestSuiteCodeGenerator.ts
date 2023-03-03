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

import { MethodCall, Scenario, TestCase, TestSuite } from "../../../model";
import { CodeFormatter } from "../../CodeFormatter";
import { TestSuiteCodeGenerator } from "../../types";
import { TestDataSet } from "../../../testDataRepository";
import { NameGenerator } from "../../types";

export class JSDataDrivenTestSuiteCodeGenerator
  implements TestSuiteCodeGenerator
{
  constructor(
    private nameGenerator: {
      pageObject: NameGenerator;
      method: NameGenerator;
    },
    private testCaseIdToDataSet: Map<string, TestDataSet>
  ) {}

  public generateFrom(...testSuites: TestSuite[]): string {
    const testCases = testSuites.flatMap((testSuite) => testSuite.testCases);

    const pageObjectImportString = this.generatePageObjectImportString(
      ...testCases
        .map((testCase) => {
          const topPageObjectName = this.nameGenerator.pageObject.generate(
            testCase.scenario.methodCalls[0]?.pageObjectId ?? ""
          );

          return topPageObjectName;
        })
        .filter((pageObjectName, index, array) => {
          return array.indexOf(pageObjectName) === index;
        })
    );

    const testDataImportString = this.generateTestDataImportString(testCases);

    const testSuitesString = this.generateTestSuitesString(testSuites);

    return `\
${pageObjectImportString}
${testDataImportString}

${testSuitesString}
`;
  }

  private generatePageObjectImportString(...topPageObjectNames: string[]) {
    return topPageObjectNames
      .map((topPageObjectName) => {
        return `import ${topPageObjectName} from './page_objects/${topPageObjectName}.page';`;
      })
      .join("\n");
  }

  private generateTestSuitesString(testSuites: TestSuite[]) {
    return testSuites
      .map((testSuite) => {
        const testCasesString = this.generateTestCasesString(
          testSuite.testCases
        );

        const testSuiteComment = testSuite.comment
          ? `\
/**
${CodeFormatter.prependTextToAllLines(testSuite.comment, " * ")}
 */\n`
          : "";

        return `\
${testSuiteComment}describe('${testSuite.name}', () => {
  beforeEach('open top page', () => {
    browser.url('${testSuite.topPageUrl}');
  });

${CodeFormatter.indentToAllLines(testCasesString, 2)}
});`;
      })
      .join("\n\n");
  }

  private generateTestDataImportString(testCases: TestCase[]) {
    const testDataSetNamesString = testCases
      .map((testCase) => {
        return this.testCaseIdToDataSet.get(testCase.id)?.name ?? "";
      })
      .filter((name) => name)
      .filter((name, index, array) => array.indexOf(name) === index)
      .join(", ");

    return `import { ${testDataSetNamesString} } from './test_data/TestData';`;
  }

  private generateTestCasesString(testCases: TestCase[]) {
    return testCases
      .map((testCase) => {
        const testDataSet = this.testCaseIdToDataSet.get(testCase.id);

        if (!testDataSet) {
          return "";
        }

        const scenarioString = this.generateScenarioString(
          testDataSet,
          testCase.scenario
        );

        const testCaseComment = testCase.comment
          ? `\
/**
${CodeFormatter.prependTextToAllLines(testCase.comment, " * ")}
 */\n`
          : "";

        const testCaseString = `\
it(\`test data: \${JSON.stringify(data)}\`, () => {
${CodeFormatter.indentToAllLines(scenarioString, 2)}
});`;

        const testCaseGroupString = `\
${testDataSet.name}.forEach((data) => {
${CodeFormatter.indentToAllLines(testCaseString, 2)}
});`;

        return `\
${testCaseComment}describe('${testCase.name}', () => {
${CodeFormatter.indentToAllLines(testCaseGroupString, 2)}
});`;
      })
      .join("\n\n");
  }

  private generateScenarioString(testDataSet: TestDataSet, scenario: Scenario) {
    const methodCallsString = this.generateMethodCallsString(
      testDataSet,
      scenario.methodCalls
    );

    const topPageObjectName = this.nameGenerator.pageObject.generate(
      scenario.methodCalls[0]?.pageObjectId ?? ""
    );

    return `\
new ${topPageObjectName}()
${CodeFormatter.indentToAllLines(methodCallsString, 2)};`;
  }

  private generateMethodCallsString(
    testDataSet: TestDataSet,
    methodCalls: MethodCall[]
  ) {
    return methodCalls
      .map((methodCall) => {
        const methodCallTestDatas =
          testDataSet.variations[0]?.methodCallTestDatas.filter((data) => {
            return data.methodArguments.length > 0;
          }) ?? [];

        const methodCallTestDataName = (() => {
          const { methodId, pageObjectId } = methodCallTestDatas.find(
            ({ methodId }) => {
              return methodId === methodCall.methodId;
            }
          ) ?? { methodId: "", pageObjectId: "" };
          const pageObjectName =
            this.nameGenerator.pageObject.generate(pageObjectId);
          const methodName = this.nameGenerator.method.generate(methodId);

          return methodId && pageObjectId
            ? `${pageObjectName}_${methodName}`
            : "";
        })();

        const argumentGroupString = methodCallTestDataName
          ? `data.${methodCallTestDataName}`
          : "";

        const methodComment = methodCall.comment
          ? `// ${methodCall.comment}\n`
          : "";

        const methodName = this.nameGenerator.method.generate(
          methodCall.methodId
        );

        return `\
${methodComment}.${methodName}(${argumentGroupString})`;
      })
      .join("\n");
  }
}
