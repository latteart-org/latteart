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

export { SequenceView } from "./sequenceViewGeneration";

/**
 * Test result.
 */
export type TestResult = {
  id: string;
  name: string;
  startTimeStamp: number;
  lastUpdateTimeStamp: number;
  initialUrl: string;
  testingTime: number;
  testSteps: TestStep[];
  coverageSources: {
    title: string;
    url: string;
    screenElements: ElementInfo[];
  }[];
};

/**
 * Test step.
 */
export type TestStep = {
  id: string;
  operation: Operation;
  intention: Note | null;
  bugs: Note[];
  notices: Note[];
};

export type Operation = {
  input: string;
  type: string;
  elementInfo: ElementInfo | null;
  title: string;
  url: string;
  timestamp: string;
  windowHandle: string;
  inputElements: ElementInfo[];
  keywordTexts?: string[];
  isAutomatic: boolean;
  scrollPosition?: { x: number; y: number };
  clientSize?: { width: number; height: number };
  screenshot?: { read: () => Promise<Image> };
};

/**
 * Note date.
 */
export type Note = {
  id: string;
  type: string;
  value: string;
  details: string;
  tags: string[];
  screenshot?: { read: () => Promise<Image> };
};

/**
 * Coverage source.
 */
export type CoverageSource = {
  title: string;
  url: string;
  screenElements: ElementInfo[];
};

/**
 * Element information.
 */
export type ElementInfo = {
  tagname: string;
  text?: string;
  xpath: string;
  value?: string;
  checked?: boolean;
  attributes: { [key: string]: string };
  boundingRect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  textWithoutChildren?: string;
};

/**
 * Test result view option.
 */
export type TestResultViewOption = {
  node: {
    unit: "title" | "url";
    definitions: {
      name: string;
      conditions: {
        target: "title" | "url" | "keyword";
        method: "contains" | "equals" | "regex";
        value: string;
      }[];
    }[];
  };
};

/**
 * Settings for test scripts.
 */
export type TestScriptOption = {
  optimized: boolean;
  testData: { useDataDriven: boolean; maxGeneration: number };
  view: TestResultViewOption;
  buttonDefinitions: {
    tagname: string;
    attribute?: { name: string; value: string };
  }[];
};

export type Image = {
  width: number;
  height: number;
  data: Buffer;
};
