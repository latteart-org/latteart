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

/**
 * Element for test script generation.
 */
export type TestScriptSourceElement = {
  locator: string;
  tagname: string;
  text?: string;
  xpath: string;
  attributes: { [key: string]: string };
};

/**
 * Operation for test script generation.
 */
export type TestScriptSourceOperation = {
  /**
   * Input value.
   */
  input: string;
  /**
   * Operation type.
   */
  type: string;
  /**
   * Element information to be operated.
   */
  elementInfo: TestScriptSourceElement | null;
  /**
   * URL to be operated.
   */
  url: string;
  /**
   * Screen definition.
   */
  screenDef: string;
  /**
   * Screen image path.
   */
  imageFilePath: string;
};

export type TestScript = {
  pageObjects: {
    name: string;
    script: string;
  }[];
  testData: {
    name: string;
    testData: string;
  }[];
  testSuite: {
    name: string;
    spec: string;
  } | null;
  others: {
    name: string;
    script: string;
  }[];
};

export type TestScriptGenerationOption = {
  optimized: boolean;
  testData: { useDataDriven: boolean; maxGeneration: number };
  buttonDefinitions: {
    tagname: string;
    attribute?: { name: string; value: string };
  }[];
};
