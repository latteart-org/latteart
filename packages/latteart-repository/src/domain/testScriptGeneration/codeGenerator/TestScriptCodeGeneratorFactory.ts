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

import { JSTestScriptCodeGenerator } from "./js/JSTestScriptCodeGenerator";
import { JSPageObjectCodeGenerator } from "./js/pageObject/JSPageObjectCodeGenerator";
import { JSTestDataCodeGenerator } from "./js/testData/JSTestDataCodeGenerator";
import { JSDataDrivenTestSuiteCodeGenerator } from "./js/testSuite/JSDataDrivenTestSuiteCodeGenerator";
import { JSTestSuiteCodeGenerator } from "./js/testSuite/JSTestSuiteCodeGenerator";
import { TestScriptCodeGenerator } from "./types";
import { TestDataSet } from "../testDataRepository";
import { PageObject } from "../model";
import { JSPageObjectNameGenerator } from "./js/pageObject/JSPageObjectNameGenerator";
import { JSPageObjectMethodNameGenerator } from "./js/pageObject/JSPageObjectMethodNameGenerator";
import { JSSimplePageObjectCodeGenerator } from "./js/pageObject/JSSimplePageObjectCodeGenerator";
import { TestScriptModelGeneratorType } from "../model";

export enum TestScriptCodeLanguage {
  JavaScript,
}

export class TestScriptCodeGeneratorFactory {
  constructor(
    private modelGeneratorType: TestScriptModelGeneratorType,
    private testDataOption: {
      useDataDriven: boolean;
    },
    private testCaseIdToDataSet: Map<string, TestDataSet>,
    private pageObjectIdToDataSets: Map<string, TestDataSet[]>,
    private pageObjects: PageObject[]
  ) {}

  public create(language: TestScriptCodeLanguage): TestScriptCodeGenerator {
    switch (language) {
      default: {
        const jsPageObjectNameGenerator = new JSPageObjectNameGenerator(
          this.pageObjects
        );
        const jsNameGenerator = {
          pageObject: jsPageObjectNameGenerator,
          method: new JSPageObjectMethodNameGenerator(
            this.pageObjects,
            jsPageObjectNameGenerator
          ),
        };

        if (this.modelGeneratorType === TestScriptModelGeneratorType.Simple) {
          return new JSTestScriptCodeGenerator(
            {
              pageObject: new JSSimplePageObjectCodeGenerator(jsNameGenerator),
              testSuite: new JSTestSuiteCodeGenerator(
                this.modelGeneratorType,
                jsNameGenerator,
                this.testCaseIdToDataSet
              ),
              testData: null,
            },
            jsNameGenerator,
            this.testCaseIdToDataSet,
            this.pageObjectIdToDataSets
          );
        } else {
          return new JSTestScriptCodeGenerator(
            {
              pageObject: new JSPageObjectCodeGenerator(jsNameGenerator),
              testSuite: this.testDataOption.useDataDriven
                ? new JSDataDrivenTestSuiteCodeGenerator(
                    jsNameGenerator,
                    this.testCaseIdToDataSet
                  )
                : new JSTestSuiteCodeGenerator(
                    this.modelGeneratorType,
                    jsNameGenerator,
                    this.testCaseIdToDataSet
                  ),
              testData: this.testDataOption.useDataDriven
                ? new JSTestDataCodeGenerator(jsNameGenerator)
                : null,
            },
            jsNameGenerator,
            this.testCaseIdToDataSet,
            this.pageObjectIdToDataSets
          );
        }
      }
    }
  }
}
