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
  BackendConfig,
  ExportableConfig,
  ProjectConfig,
} from "@/interfaces/Configs";

export function convertToExportableConfig(
  settings: BackendConfig
): ExportableConfig {
  return {
    config: {
      ...settings.config,
      imageCompression: {
        isEnabled: settings.config.imageCompression.isEnabled,
        isDeleteSrcImage: settings.config.imageCompression.isDeleteSrcImage,
      },
    },
    defaultTagList: settings.defaultTagList,
    viewPointsPreset: settings.viewPointsPreset,
  };
}

export function convertToConfigText(
  text: string,
  projectConfig: ProjectConfig,
  command: string
): string {
  const configText = JSON.parse(text) as BackendConfig;
  const settings: BackendConfig = {
    ...projectConfig,
    config: {
      ...projectConfig.config,
      imageCompression: {
        ...projectConfig.config.imageCompression,
        command,
      },
    },
    captureSettings: configText.captureSettings,
  };

  return JSON.stringify(settings);
}
