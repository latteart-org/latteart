/**
 * Copyright 2025 NTT Corporation.
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

import { ScreenDefinitionConfig } from "../domain/ScreenDefFactory";
import {
  Coverage,
  ExperimentalFeatureSetting,
} from "../gateways/settings/Settings";

/**
 * Data for setting update.
 */
export type PutConfigDto = ExportableConfig;

/**
 * Updated configuration data.
 */
export type PutConfigResponse = ExportableConfig;

/**
 * Current setting data.
 */
export type GetConfigResponse = ExportableConfig;

/**
 * Configuration data for export.
 */
export type ExportableConfig = ProjectConfig;

/**
 * Settings added when exporting a snapshot.
 */
export type SnapshotConfig = { locale: string };

/**
 * Settings for the server.
 */
export type ServerConfig = {
  captureSettings: {
    ignoreTags: string[];
  };
};

/**
 * Project settings.
 */
export type ProjectConfig = {
  viewPointsPreset: Array<{
    id: string;
    name: string;
    viewPoints: Array<{ name: string; description: string }>;
  }>;
  defaultTagList: string[];
  config: {
    screenDefinition: ScreenDefinitionConfig;
    coverage: Coverage;
    testResultComparison: {
      excludeItems: {
        isEnabled: boolean;
        values: ("title" | "url" | "elementTexts" | "screenshot")[];
      };
      excludeElements: {
        isEnabled: boolean;
        values: { tagname: string }[];
      };
    };
    experimentalFeatureSetting: ExperimentalFeatureSetting;
  };
};

/**
 * Old style project settings.
 */
export type OldStyleProjectConfig = Omit<ProjectConfig, "config"> & {
  config: Omit<
    ProjectConfig["config"],
    "captureMediaSetting" | "experimentalFeatureSetting"
  > & {
    imageCompression: { isEnabled: boolean; isDeleteSrcImage: boolean };
  };
};
