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

import { CoverageSource, ElementInfo, Operation } from "@/domain/types";

/**
 * Test step data for new registration.
 */
export type CreateTestStepDto = {
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
};

/**
 * Test step data for the specified ID.
 */
export type GetTestStepResponse = TestStep;

/**
 * Test step operation.
 */
export type TestStepOperation = Omit<Operation, "screenshot"> & {
  imageFileUrl: string;
};

/**
 * Test step coverage source.
 */
export type TestStepCoverageSource = CoverageSource;

/**
 * Registered test step and coverage data.
 */
export type CreateTestStepResponse = Pick<TestStep, "id" | "operation"> & {
  coverageSource: CoverageSource;
};

/**
 * Updated test step data.
 */
export type PatchTestStepResponse = TestStep;

/**
 * Test step data for update.
 */
export interface PatchTestStepDto {
  intention?: string | null;
  bugs?: string[];
  notices?: string[];
}

/**
 * Test step.
 */
export type TestStep = {
  id: string;
  operation: TestStepOperation;
  intention: string | null;
  bugs: string[];
  notices: string[];
};
