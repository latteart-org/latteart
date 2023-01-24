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

export type TestResultViewOptionForRepository = {
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

export type SequenceViewForRepository = {
  windows: { id: string; name: string }[];
  screens: { id: string; name: string }[];
  scenarios: {
    testPurpose?: { id: string; value: string; details?: string };
    nodes: SequenceViewNodeForRepository[];
  }[];
};

export type SequenceViewNodeForRepository = {
  windowId: string;
  screenId: string;
  testSteps: {
    id: string;
    type: string;
    input?: string;
    element?: { xpath: string; tagname: string; text: string };
    notes?: { id: string; value: string; details?: string; tags: string[] }[];
  }[];
  disabled?: boolean;
};

export type NoteForRepository = {
  id: string;
  type: string;
  value: string;
  details: string;
  imageFileUrl?: string | undefined;
  tags?: string[] | undefined;
};

export type CapturedOperationForRepository = {
  input: string;
  type: string;
  elementInfo: ElementInfoForRepository | null;
  title: string;
  url: string;
  imageData: string;
  windowHandle: string;
  timestamp: string;
  screenElements: ElementInfoForRepository[];
  pageSource: string;
  inputElements: ElementInfoForRepository[];
  keywordTexts: string[];
  isAutomatic?: boolean;
};

export type TestStepForRepository = {
  id: string;
  operation: OperationForRepository;
  intention: string | null;
  bugs: string[];
  notices: string[];
};

export type OperationForRepository = {
  input: string;
  type: string;
  elementInfo: ElementInfoForRepository | null;
  title: string;
  url: string;
  imageFileUrl: string;
  timestamp: string;
  inputElements: ElementInfoForRepository[];
  windowHandle: string;
  keywordTexts?: string[];
  isAutomatic: boolean;
};

export type ElementInfoForRepository = {
  tagname: string;
  text?: string;
  xpath: string;
  value?: string;
  checked?: boolean;
  attributes: { [key: string]: any };
};

export type CoverageSourceForRepository = {
  title: string;
  url: string;
  screenElements: ElementInfoForRepository[];
};

export type InputElementInfoForRepository = {
  title: string;
  url: string;
  inputElements: ElementInfoForRepository[];
};

export type SettingsForRepository = {
  viewPointsPreset: {
    id: string;
    name: string;
    viewPoints: {
      id: string;
      name: string;
      description: string;
      index: number;
    }[];
  }[];
  defaultTagList: string[];
  config: {
    autofillSetting: {
      conditionGroups: {
        isEnabled: boolean;
        settingName: string;
        url: string;
        title: string;
        inputValueConditions: {
          isEnabled: boolean;
          locatorType: "id" | "xpath";
          locator: string;
          locatorMatchType: "equals" | "regex";
          inputValue: string;
        }[];
      }[];
    };
    autoOperationSetting: {
      conditionGroups: {
        isEnabled: boolean;
        settingName: string;
        details?: string;
        autoOperations: {
          input: string;
          type: string;
          elementInfo: ElementInfoForRepository | null;
          title: string;
          url: string;
        }[];
      }[];
    };
    screenDefinition: {
      screenDefType: "title" | "url";
      conditionGroups: {
        isEnabled: boolean;
        screenName: string;
        conditions: {
          isEnabled: boolean;
          definitionType: "url" | "title" | "keyword";
          matchType: "contains" | "equals" | "regex";
          word: string;
        }[];
      }[];
    };
    coverage: { include: { tags: string[] } };
    imageCompression: { isEnabled: boolean; isDeleteSrcImage: boolean };
  };
};

export type DailyTestProgressForRepository = {
  date: string;
  storyProgresses: {
    storyId: string;
    testMatrixId: string;
    testTargetGroupId: string;
    testTargetId: string;
    viewPointId: string;
    plannedSessionNumber: number;
    completedSessionNumber: number;
    incompletedSessionNumber: number;
  }[];
};

export type TestManagementDataForRepository = {
  testMatrices: ManagedTestMatrixForRepository[];
  stories: ManagedStoryForRepository[];
};

export type ManagedTestMatrixForRepository = {
  id: string;
  name: string;
  groups: ManagedGroupForRepository[];
  viewPoints: ManagedViewPointForRepository[];
};

export type ManagedStoryForRepository = {
  id: string;
  index: number;
  testMatrixId: string;
  testTargetId: string;
  viewPointId: string;
  status: string;
  sessions: Array<ManagedSessionForRepository>;
};

export type ManagedGroupForRepository = {
  id: string;
  name: string;
  testTargets: Array<{
    id: string;
    name: string;
    plans: Array<{ viewPointId: string; value: number }>;
  }>;
};

export type ManagedViewPointForRepository = {
  id: string;
  name: string;
};

export type ManagedSessionForRepository = {
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
};

export type SessionForRepository = {
  name: string | undefined;
  id: string | undefined;
  isDone: boolean;
  doneDate: string;
  testItem: string;
  testerName: string;
  memo: string;
  attachedFiles: AttachedFileForRepository[];
  testResultFiles?: TestResultFileForRepository[];
  initialUrl: string;
  issues: IssueForRepository[];
  intentions: {
    value: string;
    details: string;
  }[];
  testingTime?: number;
};

export type AttachedFileForRepository = {
  name: string;
  fileUrl?: string;
  fileData?: string;
};

export type TestResultFileForRepository = {
  name: string;
  id: string;
};

export type IssueForRepository = {
  source: {
    type: string;
    sequence?: number;
    index: number;
  };
  status: string;
  ticketId: string;
  value: string;
  details: string;
  imageFilePath?: string;
};

export type StoryForRepository = {
  id: string;
  index: number;
  testMatrixId: string;
  testTargetId: string;
  viewPointId: string;
  status: string;
  sessions: SessionForRepository[];
};

export type TestMatrixForRepository = {
  id: string;
  name: string;
  index: number;
  groups: GroupForRepository[];
  viewPoints: ViewPointForRepository[];
};

export type GroupForRepository = {
  id: string;
  name: string;
  index: number;
  testTargets: TestTargetForRepository[];
};

export type TestTargetForRepository = {
  id: string;
  name: string;
  plans: PlanForRepository[];
  index: number;
};

export type PlanForRepository = {
  viewPointId: string;
  value: number;
};

export type ViewPointForRepository = {
  id: string;
  name: string;
  description: string;
  index: number;
};

export type TestResultForRepository = {
  id: string;
  name: string;
  startTimeStamp: number;
  lastUpdateTimeStamp: number;
  initialUrl: string;
  testingTime: number;
  testSteps: {
    id: string;
    operation: OperationForRepository;
    intention: ApiNoteForRepository | null;
    bugs: ApiNoteForRepository[];
    notices: ApiNoteForRepository[];
  }[];
  coverageSources: CoverageSourceForRepository[];
};

export type TestResultSummaryForRepository = Pick<
  TestResultForRepository,
  "id" | "name"
>;

export type ProjectForRepository = {
  id: string;
  name: string;
  testMatrices: TestMatrixForRepository[];
  stories: StoryDetailsForRepository[];
};

type ApiNoteForRepository = {
  id: string;
  type: string;
  value: string;
  details: string;
  imageFileUrl: string;
  tags: string[];
};

type StoryDetailsForRepository = {
  id: string;
  index: number;
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
    testResultFiles?: TestResultFileForRepository[];
    testerName: string;
    testingTime: number;
  }[];
};
