/**
 * Copyright 2023 NTT Corporation.
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
 * Test target.
 */
export interface TestTarget {
  id: string;
  name: string;
  index: number;
  plans: {
    viewPointId: string;
    value: number;
  }[];
}

/**
 * Test target data for the specified ID.
 */
export type GetTestTargetResponse = TestTarget;

/**
 * Registered test target data.
 */
export type PostTestTargetResponse = TestTarget;

/**
 * Updated test target data.
 */
export type PatchTestTargetResponse = TestTarget;
