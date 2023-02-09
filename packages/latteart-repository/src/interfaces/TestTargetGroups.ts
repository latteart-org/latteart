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

import { TestTarget } from "./TestTargets";

/**
 * Test target group.
 */
export interface TestTargetGroup {
  id: string;
  name: string;
  index: number;
  testTargets: TestTarget[];
}

/**
 * Test target group data for the specified ID.
 */
export type GetTestTargetGroupResponse = TestTargetGroup;

/**
 * Registered test target group data.
 */
export type PostTestTargetGroupResponse = TestTargetGroup;

/**
 * Updated test target group data.
 */
export type PatchTestTargetGroupResponse = TestTargetGroup;
