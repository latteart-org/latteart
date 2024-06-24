/**
 * Copyright 2024 NTT Corporation.
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
import { TestScriptModelGeneratorType } from "@/domain/testScriptGeneration/model";

export class JSTestSuiteCodeGenerator implements TestSuiteCodeGenerator {
  constructor(
    private modelGeneratorType: TestScriptModelGeneratorType,
    private nameGenerator: {
      pageObject: NameGenerator;
      method: NameGenerator;
    },
    private testCaseIdToDataSet: Map<string, TestDataSet>
  ) {}

  public generateFrom(
    useMultiLocator: boolean,
    ...testSuites: TestSuite[]
  ): string {
    const testCases = testSuites.flatMap((testSuite) => testSuite.testCases);

    const pageObjectImportString =
      JSTestSuiteCodeGenerator.generatePageObjectImportString(
        useMultiLocator,
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

    const testSuitesString = this.generateTestSuitesString(
      useMultiLocator,
      testSuites
    );

    return `\
${pageObjectImportString}

${testSuitesString}
`;
  }

  private static generatePageObjectImportString(
    useMultiLocator: boolean,
    ...pageObjectNames: string[]
  ) {
    const importText = pageObjectNames
      .map((pageObjectName) => {
        return `import ${pageObjectName} from './page_objects/${pageObjectName}.page';`;
      })
      .join("\n");

    return useMultiLocator
      ? 'import { enableMultiLocator, recordFix } from "multi-locator";\n' +
          importText
      : importText;
  }

  private generateTestSuitesString(
    useMultiLocator: boolean,
    testSuites: TestSuite[]
  ) {
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
  ${
    useMultiLocator
      ? `before(async () => {
    driver.setTimeout({ script: 600000 });
    driver = enableMultiLocator(driver);
  });

  after(async () => {
    await recordFix();
  });

  `
      : ""
  }beforeEach('open top page', async () => {
    await browser.url('${testSuite.topPageUrl}');
  });

${CodeFormatter.indentToAllLines(testCasesString, 2)}
});`;
      })
      .join("\n\n");
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

        return `\
${testCaseComment}it('${testCase.name}', async () => {
${CodeFormatter.indentToAllLines(scenarioString, 2)}
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
await new ${topPageObjectName}()
${CodeFormatter.indentToAllLines(methodCallsString, 2)};`;
  }

  private generateMethodCallsString(
    testDataSet: TestDataSet,
    methodCalls: MethodCall[]
  ) {
    if (testDataSet.variations.length === 0) {
      return "";
    }

    const methodArgumentGroups = testDataSet.variations[0].methodCallTestDatas;

    return methodCalls
      .map((methodCall, index) => {
        const methodArguments =
          methodArgumentGroups.find(
            ({ methodId }) => methodId === methodCall.methodId
          )?.methodArguments ?? [];

        const argumentGroupString =
          this.generateArgumentGroupString(methodArguments);

        const methodComment = methodCall.comment
          ? `// ${methodCall.comment}\n`
          : "";

        const argsString = this.generateArgsString(argumentGroupString);

        const methodName = this.nameGenerator.method.generate(
          methodCall.methodId
        );

        if (index === 0) {
          return `\
${methodComment}.${methodName}(${argsString})`;
        }

        return `\
${methodComment}.then((page) => page.${methodName}(${argsString}))`;
      })
      .join("\n");
  }

  private generateArgsString(argumentGroupString: string) {
    if (this.modelGeneratorType === TestScriptModelGeneratorType.Simple)
      return "";
    return argumentGroupString
      ? `\
{
${CodeFormatter.indentToAllLines(argumentGroupString, 2)}
}`
      : "";
  }

  private generateArgumentGroupString(
    methodArguments: { name: string; value: string }[]
  ) {
    return methodArguments
      .map(({ name, value }) => {
        return `${name}: '${value}'`;
      })
      .join(",\n");
  }
}
