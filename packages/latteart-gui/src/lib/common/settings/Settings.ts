/**
 * Copyright 2024 NTT Corporation.
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
  type SettingsForRepository,
  type SnapshotConfigForRepository,
  type TestScriptOption
} from "latteart-client";

export type ProjectSettings = SettingsForRepository;

export type Locale = "ja" | "en";

export type UserSettings = {
  captureMediaSetting: CaptureMediaSetting;
  autofillSetting: AutofillSetting;
  autoOperationSetting: AutoOperationSetting;
  testHintSetting: TestHintSetting;
  deviceSettings: DeviceSettings;
  testScriptOption: Pick<TestScriptOption, "buttonDefinitions">;
  repositoryUrls: string[];
};

export type ScreenDefinitionSetting = ProjectSettings["config"]["screenDefinition"];

export type CoverageSetting = ProjectSettings["config"]["coverage"];

export type DeviceSettings = {
  platformName: "PC" | "Android" | "iOS";
  browser: "Chrome" | "Edge" | "Safari";
  device?: {
    deviceName: string;
    modelNumber: string;
    osVersion: string;
  };
  platformVersion?: string;
  waitTimeForStartupReload: number;
};

export type SnapshotConfig = SnapshotConfigForRepository;

export type TestResultComparisonSetting = ProjectSettings["config"]["testResultComparison"];

export type TestHintSetting = {
  commentMatching: {
    target: "all" | "wordsOnPageOnly";
    extraWords: string[];
    excludedWords: string[];
  };
  defaultSearchSeconds: number;
};

export type ExperimentalFeatureSetting = ProjectSettings["config"]["experimentalFeatureSetting"];

export type CaptureMediaSetting = {
  mediaType: "image" | "video" | "video_and_image";
  imageCompression: {
    format: "png" | "webp";
  };
};

/**
 * Autofill setting.
 */
export type AutofillSetting = {
  autoPopupRegistrationDialog: boolean;
  autoPopupSelectionDialog: boolean;
  conditionGroups: AutofillConditionGroup[];
};

/**
 * Autofill condition group.
 */
export type AutofillConditionGroup = {
  isEnabled: boolean;
  settingName: string;
  url: string;
  title: string;
  inputValueConditions: Array<AutofillCondition>;
};

/**
 * Autofill condition.
 */
export type LocatorMatchType = "equals" | "regex";
export type AutofillCondition = {
  isEnabled: boolean;
  locatorType: "id" | "xpath";
  locator: string;
  locatorMatchType: LocatorMatchType;
  inputValue: string;
  iframeIndex?: number;
};

/**
 * Auto operation setting.
 */
export type AutoOperationSetting = {
  conditionGroups: AutoOperationConditionGroup[];
};

/**
 * Auto operation condition group.
 */
export type AutoOperationConditionGroup = {
  isEnabled: boolean;
  settingName: string;
  details?: string;
  autoOperations: any[];
};
