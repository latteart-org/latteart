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
 * Test step data for new registration.
 */
export type CreateTestStepDto = CapturedOperation;

/**
 * Test step data for the specified ID.
 */
export type GetTestStepResponse = TestStep;

/**
 * Registered test step and coverage data.
 */
export type CreateTestStepResponse = {
  id: string;
  operation: Operation;
  coverageSource: CoverageSource;
};

/**
 * Updated test step data.
 */
export type PatchTestStepResponse = TestStep;

/**
 * Coverage source.
 */
export interface CoverageSource {
  title: string;
  url: string;
  screenElements: ElementInfo[];
}

/**
 * Element information.
 */
export interface ElementInfo {
  tagname: string;
  text?: string | null;
  xpath: string;
  value?: any;
  checked?: boolean;
  attributes: { [key: string]: any };
}

/**
 * Captured operation.
 */
interface CapturedOperation {
  input: string;
  type: string;
  elementInfo: ElementInfo | null;
  title: string;
  url: string;
  imageData: string;
  windowHandle: string;
  screenElements: ElementInfo[];
  inputElements: ElementInfo[];
  keywordTexts?: string[];
  timestamp: number;
  pageSource: string;
  isAutomatic?: boolean;
}

/**
 * Operation.
 */
interface Operation {
  input: string;
  type: string;
  elementInfo: ElementInfo | null;
  title: string;
  url: string;
  imageFileUrl: string;
  timestamp: string;
  inputElements: ElementInfo[];
  windowHandle: string;
  keywordTexts?: string[];
  isAutomatic: boolean;
}

/**
 * Test step.
 */
interface TestStep {
  id: string;
  operation: Operation;
  intention: string | null;
  bugs: string[];
  notices: string[];
}

/**
 * Test step data for update.
 */
export interface PatchTestStepDto {
  intention?: string | null;
  bugs?: string[];
  notices?: string[];
}
