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

import { CodeFormatter } from "../../CodeFormatter";
import { TestDataCodeGenerator } from "../../types";
import { MethodCallTestData, TestDataSet } from "../../../testDataRepository";
import { NameGenerator } from "../../types";

export class JSTestDataCodeGenerator implements TestDataCodeGenerator {
  constructor(
    private nameGenerator: {
      pageObject: NameGenerator;
      method: NameGenerator;
    }
  ) {}

  public generateFrom(...testDataSets: TestDataSet[]): string {
    return (
      testDataSets
        .map((testDataSet) => {
          const notEmptyVariations = testDataSet.variations.filter(
            (variation) => {
              return (
                variation.methodCallTestDatas.filter((data) => {
                  return data.methodArguments.length > 0;
                }).length > 0
              );
            }
          );

          const variationsString = notEmptyVariations
            .map((variation) => {
              return this.generateTestDataVariationString(
                variation.methodCallTestDatas
              );
            })
            .join(",\n");

          return `\
export const ${testDataSet.name} = [
${CodeFormatter.indentToAllLines(
  variationsString === "" ? "{}" : variationsString,
  2
)}
];`;
        })
        .filter((testDataSetString) => {
          return testDataSetString;
        })
        .join("\n\n") + "\n"
    );
  }

  private generateTestDataVariationString(
    methodArgumentGroups: MethodCallTestData[]
  ) {
    const methodDatasString = methodArgumentGroups
      .filter((group) => group.methodArguments.length > 0)
      .map((group) => {
        return this.generateMethodDatasString(group);
      })
      .join(",\n");

    return `\
{
${CodeFormatter.indentToAllLines(methodDatasString, 2)}
}`;
  }

  private generateMethodDatasString(methodArgumentGroup: MethodCallTestData) {
    const argumentsString = methodArgumentGroup.methodArguments
      .map(({ name, value }) => `${name}: '${value}'`)
      .join(",\n");

    const pageObjectName = this.nameGenerator.pageObject.generate(
      methodArgumentGroup.pageObjectId
    );
    const methodName = this.nameGenerator.method.generate(
      methodArgumentGroup.methodId
    );

    const methodArgumentGroupName = `${pageObjectName}_${methodName}`;

    return `\
${methodArgumentGroupName}: {
${CodeFormatter.indentToAllLines(argumentsString, 2)}
}`;
  }
}
