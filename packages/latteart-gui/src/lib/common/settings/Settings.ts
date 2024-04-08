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

import { type SettingsForRepository, type SnapshotConfigForRepository } from "latteart-client";

export type ProjectSettings = SettingsForRepository;

export type ScreenDefinitionSetting = ProjectSettings["config"]["screenDefinition"];

export type CoverageSetting = ProjectSettings["config"]["coverage"];

export type CaptureMediaSetting = ProjectSettings["config"]["captureMediaSetting"];

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

export type ViewSettings = {
  autofill: {
    autoPopupRegistrationDialog: boolean;
    autoPopupSelectionDialog: boolean;
  };
};

export type SnapshotConfig = SnapshotConfigForRepository;

export type TestResultComparisonSetting = ProjectSettings["config"]["testResultComparison"];

export type ExperimentalFeatureSetting = ProjectSettings["config"]["experimentalFeatureSetting"];
