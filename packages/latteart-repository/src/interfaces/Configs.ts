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

import { ScreenDefinitionConfig } from "../domain/ScreenDefFactory";
import {
  AutofillSetting,
  AutoOperationSetting,
  Coverage,
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
 * Settings registered in the database.
 */
export type BackendConfig = ProjectConfig & ServerConfig;

/**
 * Settings for the server.
 */
type ServerConfig = {
  config: {
    imageCompression: {
      command: string;
    };
  };
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
    autofillSetting: AutofillSetting;
    autoOperationSetting: AutoOperationSetting;
    screenDefinition: ScreenDefinitionConfig;
    coverage: Coverage;
    imageCompression: {
      isEnabled: boolean;
      isDeleteSrcImage: boolean;
    };
  };
};
