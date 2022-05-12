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

export interface SessionsData {
  id: string;
  plan: number;
  done: number;
  status: string;
}

export interface TestMatrix {
  id: string;
  name: string;
  groups: Group[];
  viewPoints: ViewPoint[];
}

export interface Group {
  id: string;
  name: string;
  testTargets: TestTarget[];
}

export interface ViewPointsPreset {
  id: string;
  name: string;
  viewPoints: ViewPoint[];
}
export interface ViewPoint {
  id: string;
  name: string;
}

export interface TestTarget {
  id: string;
  name: string;
  plans: Plan[];
}

export interface Plan {
  viewPointId: string;
  value: number;
}

export interface Issue {
  source: {
    type: string;
    sequence: number;
    index: number;
  };
  status: string;
  ticketId: string;
  value: string;
  details: string;
}

export interface Story {
  id: string;
  testMatrixId: string;
  testTargetId: string;
  viewPointId: string;
  status: string;
  sessions: Session[];
}

export interface Session {
  name: string | undefined;
  id: string | undefined;
  isDone: boolean;
  doneDate: string;
  testItem: string;
  testerName: string;
  memo: string;
  attachedFiles: AttachedFile[];
  testResultFiles?: TestResultFile[];
  initialUrl: string;
  issues: Issue[];
  intentions: {
    value: string;
    details: string;
  }[];
  testingTime?: number;
}

export interface AttachedFile {
  name: string;
  fileUrl?: string;
  fileData?: string;
}

export interface TestResultFile {
  name: string;
  id: string;
}

export interface DeleteDialogObj {
  title: string;
  text: string;
  callback: () => void;
  closeCallback: () => void;
}

export interface DetailedExportDialogObj {
  groups: Group[];
  callback: (groupId: string, testTargetId: string) => void;
  closeCallback: () => void;
}

export interface DetailedReportObj {
  groupId: string;
  groupName: string;
  testTargetid: string;
  testTargetname: string;
  viewPointId: string;
  viewPointName: string;
}

export interface ProgressData {
  testMatrixId: string;
  testMatrixProgressDatas: TestMatrixProgressData[];
}
export interface TestMatrixProgressData {
  date: string;
  groups: GroupProgressData[];
}

export interface GroupProgressData {
  id: string;
  name: string;
  testTargets: TestTargetProgressData[];
}

export interface TestTargetProgressData {
  id: string;
  name: string;
  progress: {
    planNumber: number;
    completedNumber: number;
    incompletedNumber: number;
  };
}

export interface Project {
  id: string;
  name: string;
  testMatrices: {
    id: string;
    name: string;
    groups: {
      id: string;
      name: string;
      testTargets: {
        id: string;
        name: string;
        plans: {
          viewPointId: string;
          value: number;
        }[];
      }[];
    }[];
    viewPoints: {
      id: string;
      name: string;
    }[];
  }[];
  stories: StoryDetails[];
  progressDatas: ProgressData[];
}

interface StoryDetails {
  id: string;
  testMatrixId: string;
  testTargetId: string;
  viewPointId: string;
  status: string;
  sessions: {
    id: string;
    attachedFiles: {
      name: string;
      fileUrl?: string;
    }[];
    doneDate: string;
    isDone: boolean;
    issues: {
      details: string;
      source: {
        index: number;
        type: string;
      };
      status: string;
      ticketId: string;
      type: string;
      value: string;
    }[];
    memo: string;
    name: string;
    testItem: string;
    testResultFiles?: {
      name: string;
      id: string;
    }[];
    testerName: string;
    testingTime: number;
  }[];
}
