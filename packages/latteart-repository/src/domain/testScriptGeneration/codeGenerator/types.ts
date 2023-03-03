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

import { ScreenTransitionDiagram } from "../docGenerator";
import {
  ScreenTransitionGraph,
  TestScriptModel,
  TestSuite,
  PageObjectOperation,
  PageObject,
} from "../model";
import { TestDataSet } from "../testDataRepository";
import { TestScript } from "../types";

export type TestSuiteCommentAttacher = {
  attachComment(testSuite: TestSuite): TestSuite;
};

export type TestCaseCommentGenerator = {
  generateFrom(
    testCaseName: string,
    testSuiteName: string,
    diagram: ScreenTransitionDiagram
  ): string;
};

export type TestSuiteCommentGenerator = {
  generateFrom(name: string, diagram: ScreenTransitionDiagram): string;
};

export type PageObjectMethodCommentGenerator = {
  generateFrom(
    name: string,
    operations: PageObjectOperation[],
    destPageObject: {
      name: string;
      imageUrl: string;
    }
  ): string;
};

export type PageObjectCommentAttacher = {
  attachComment(
    pageObject: PageObject,
    testSuiteGraph: ScreenTransitionGraph
  ): PageObject;
};

export type PageObjectCommentGenerator = {
  generateFrom(
    name: string,
    description: string,
    imageUrl: string,
    diagram: ScreenTransitionDiagram
  ): string;
};

export type TestSuiteCodeGenerator = {
  generateFrom(...testSuites: TestSuite[]): string;
};

export type TestScriptCodeGenerator = {
  generateFrom(testScriptModel: TestScriptModel): TestScript;
};

export type TestDataCodeGenerator = {
  generateFrom(...testDataSets: TestDataSet[]): string;
};

export type PageObjectCodeGenerator = {
  generateFrom(pageObject: PageObject): string;
};

export type NameGenerator = {
  generate(id: string): string;
};
