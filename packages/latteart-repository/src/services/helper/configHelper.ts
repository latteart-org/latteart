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

import { OldStyleProjectConfig, ProjectConfig } from "@/interfaces/Configs";

export function parseProjectConfig(configText: string): ProjectConfig {
  const config = JSON.parse(configText) as
    | ProjectConfig
    | OldStyleProjectConfig;

  return {
    viewPointsPreset: config.viewPointsPreset,
    defaultTagList: config.defaultTagList,
    config: {
      autofillSetting: config.config.autofillSetting,
      autoOperationSetting: config.config.autoOperationSetting,
      screenDefinition: config.config.screenDefinition,
      coverage: config.config.coverage,
      captureMediaSetting:
        "captureMediaSetting" in config.config
          ? config.config.captureMediaSetting
          : {
              mediaType: "image",
              imageCompression: {
                format: config.config.imageCompression.isEnabled
                  ? "webp"
                  : "png",
              },
              captureArch: "polling",
            },
      testResultComparison: config.config.testResultComparison,
    },
  };
}
