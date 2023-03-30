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

import { TestTargetGroup } from "./TestTargetGroups";
import { ProjectViewPoint, ViewPoint } from "./ViewPoints";

/**
 * Test matrix.
 */
export interface TestMatrix {
  id: string;
  name: string;
  index: number;
  groups: TestTargetGroup[];
  viewPoints: ViewPoint[];
}

/**
 * Test matrix data for the specified ID.
 */
export type GetTestMatrixResponse = TestMatrix;

/**
 * Registered test matrix data.
 */
export type PostTestMatrixResponse = TestMatrix;

/**
 * Updated test matrix data.
 */
export type PatchTestMatrixResponse = TestMatrix;

/**
 * Test matrix for project.
 */
export type ProjectTestMatrix = Omit<TestMatrix, "viewPoints"> & {
  viewPoints: ProjectViewPoint[];
};
