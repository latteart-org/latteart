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

import { OperationForGUI } from "./OperationForGUI";
import { NoteForGUI } from "./NoteForGUI";
import {
  type Operation,
  type ElementInfo,
  type TestResultForRepository,
  type TestResultComparisonResultForRepository,
  type Note
} from "latteart-client";

/**
 * Operation history and Notes information.
 */
export interface OperationWithNotes {
  operation: OperationForGUI;
  intention: NoteForGUI | null;
  bugs: NoteForGUI[] | null;
  notices: NoteForGUI[] | null;
}

/**
 * Screen transition information.
 */
export interface ScreenTransition {
  source: {
    title: string;
    url: string;
    screenDef: string;
  };
  target: {
    title: string;
    url: string;
    screenDef: string;
  };
}

/**
 * Edge information.
 */
export interface Edge {
  source: {
    title: string;
    url: string;
    screenDef: string;
  };
  target: {
    title: string;
    url: string;
    screenDef: string;
  };
  operationHistory: OperationHistory;
}

/**
 * Screen definition.
 */
export interface ScreenDef {
  definition: string;
  alias: string;
}

/**
 * Window handle.
 */
export interface WindowInfo {
  text: string;
  value: string;
  title: string;
}

export interface RouterPushValueByName {
  name: string;
  params?: any;
}

export type OperationHistory = OperationWithNotes[];

export type MessageProvider = (message: string, args?: any) => string;

export type ScreenDefinitionType = "url" | "title" | "keyword";
export type ScreenMatchType = "contains" | "equals" | "regex";
export type LocatorMatchType = "equals" | "regex";

export type AutoPopupSettings = Omit<AutofillSetting, "conditionGroups">;

export interface AutofillSetting {
  autoPopupRegistrationDialog: boolean;
  autoPopupSelectionDialog: boolean;
  conditionGroups: AutofillConditionGroup[];
}

export interface AutofillConditionGroup {
  isEnabled: boolean;
  settingName: string;
  url: string;
  title: string;
  inputValueConditions: Array<AutofillCondition>;
}

export type AutofillCondition = {
  isEnabled: boolean;
  locatorType: "id" | "xpath";
  locator: string;
  locatorMatchType: LocatorMatchType;
  inputValue: string;
  iframeIndex?: number;
};

export interface AutoOperationSetting {
  conditionGroups: AutoOperationConditionGroup[];
}

export interface AutoOperationConditionGroup {
  isEnabled: boolean;
  settingName: string;
  details?: string;
  autoOperations: AutoOperation[];
}

export interface ScreenDefinitionConditionGroup {
  isEnabled: boolean;
  screenName: string;
  conditions: Array<{
    isEnabled: boolean;
    definitionType: ScreenDefinitionType;
    matchType: ScreenMatchType;
    word: string;
  }>;
}

export type TestResult = Omit<TestResultForRepository, "testSteps" | "coverageSources"> & {
  testSteps: {
    id: string;
    operation: Operation;
    intention: Note | null;
    bugs: Note[];
    notices: Note[];
  }[];
};

export type TestResultSummary = Pick<
  TestResultForRepository,
  "id" | "name" | "parentTestResultId" | "initialUrl" | "testingTime"
> & { testPurposes: { value: string }[]; creationTimestamp: number };

export type AutoOperation = {
  input: string;
  type: string;
  elementInfo: ElementInfo | null;
  title: string;
  url: string;
  timestamp: string;
  iframeIndex?: number;
};

export type OperationForReplay = AutoOperation & {
  sequence?: number;
  timestamp?: string;
  windowHandle?: string;
};

export interface NoteDialogInfo {
  value: string;
  details: string;
  index: number | null;
  tags: string[];
  imageFilePath: string;
  sequence: number;
  maxSequence: number;
  videoFilePath: string;
}

export type TestResultComparisonResult = TestResultComparisonResultForRepository;

export type ScreenImage = {
  background: { image: { url: string }; video?: { url: string; time: number } };
  overlay?: {
    width: number;
    height: number;
    offset?: { x?: number; y?: number };
    markerRect?: { top: number; left: number; width: number; height: number };
  };
};
