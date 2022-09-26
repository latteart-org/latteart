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

export interface TestManagementData {
  testMatrices: ManagedTestMatrix[];
  stories: ManagedStory[];
}

export interface ManagedTestMatrix {
  id: string;
  name: string;
  groups: ManagedGroup[];
  viewPoints: ManagedViewPoint[];
}

export interface ManagedSequences {
  viewPoint: number;
  testMatrix: number;
  group: number;
  testTarget: number;
  session: { [key: string]: number };
}

export interface ManagedViewPoint {
  id: string;
  name: string;
}

export interface ManagedGroup {
  id: string;
  name: string;
  testTargets: Array<{
    id: string;
    name: string;
    plans: Array<{ viewPointId: string; value: number }>;
  }>;
}

export interface ManagedStory {
  id: string;
  index: number;
  testMatrixId: string;
  testTargetId: string;
  viewPointId: string;
  status: string;
  sessions: Array<ManagedSession>;
}

export interface ManagedSession {
  name: string | undefined;
  id: string | undefined;
  isDone: boolean;
  doneDate: string;
  testItem: string;
  testerName: string;
  memo: string;
  attachedFiles?: Array<{
    name: string;
    fileUrl?: string;
    fileData?: string;
  }>;
  testResultFiles?: Array<{ name: string; id: string }>;
  issues: Array<{
    type: string;
    value: string;
    details: string;
    status: string;
    ticketId: string;
    source: { type: string; index: number };
  }>;
  testingTime?: number;
}
