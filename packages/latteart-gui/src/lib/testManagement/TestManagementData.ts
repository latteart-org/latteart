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

import {
  TestManagementDataForRepository,
  ManagedTestMatrixForRepository,
  ManagedViewPointForRepository,
  ManagedGroupForRepository,
  ManagedStoryForRepository,
  ManagedSessionForRepository,
} from "latteart-client";

export type TestManagementData = TestManagementDataForRepository;

export type ManagedTestMatrix = ManagedTestMatrixForRepository;

export type ManagedSequences = {
  viewPoint: number;
  testMatrix: number;
  group: number;
  testTarget: number;
  session: { [key: string]: number };
};

export type ManagedViewPoint = ManagedViewPointForRepository;

export type ManagedGroup = ManagedGroupForRepository;

export type ManagedStory = ManagedStoryForRepository;

export type ManagedSession = ManagedSessionForRepository;
