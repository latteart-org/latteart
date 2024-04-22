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

import { type ProjectSettings, type ViewSettings } from "@/lib/common/settings/Settings";
import { type ActionResult, ActionFailure, ActionSuccess } from "@/lib/common/ActionResult";
import { type RepositoryService, type TestScriptOption } from "latteart-client";
import { LocalStorageSettingRepository } from "@/lib/common/LocalStorageSettingRepository";

const SAVE_SETTING_FAILED_MESSAGE_KEY = "error.common.save_settings_failed";

export class SaveSettingAction {
  public async saveProjectSettings(
    settings: ProjectSettings,
    repositoryService: Pick<RepositoryService, "settingRepository">
  ): Promise<ActionResult<ProjectSettings>> {
    const putSettingsRequest = {
      ...settings,
      config: {
        ...settings.config,
        autofillSetting: {
          conditionGroups: settings.config.autofillSetting.conditionGroups
        }
      }
    };
    const putSettingsResult =
      await repositoryService.settingRepository.putSettings(putSettingsRequest);

    if (putSettingsResult.isFailure()) {
      return new ActionFailure({ messageKey: SAVE_SETTING_FAILED_MESSAGE_KEY });
    }

    const savedSettings = {
      ...putSettingsResult.data,
      config: {
        ...putSettingsResult.data.config,
        autofillSetting: {
          ...putSettingsResult.data.config.autofillSetting
        }
      }
    };

    return new ActionSuccess(savedSettings);
  }

  public async saveViewSettings(settings: ViewSettings): Promise<ActionResult<ViewSettings>> {
    const putAutoPopupSettingsResult =
      await new LocalStorageSettingRepository().putAutoPopupSettings(settings.autofill);

    if (putAutoPopupSettingsResult.isFailure()) {
      return new ActionFailure({ messageKey: SAVE_SETTING_FAILED_MESSAGE_KEY });
    }

    return new ActionSuccess({
      autofill: putAutoPopupSettingsResult.data
    });
  }

  public async saveTestScriptOption(
    option: Pick<TestScriptOption, "buttonDefinitions">
  ): Promise<ActionResult<Pick<TestScriptOption, "buttonDefinitions">>> {
    const putTestScriptOptionResult = await new LocalStorageSettingRepository().putTestScriptOption(
      option
    );

    if (putTestScriptOptionResult.isFailure()) {
      return new ActionFailure({ messageKey: SAVE_SETTING_FAILED_MESSAGE_KEY });
    }

    return new ActionSuccess(putTestScriptOptionResult.data);
  }
}
