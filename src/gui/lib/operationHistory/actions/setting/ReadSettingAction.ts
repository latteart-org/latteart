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

import Settings from "@/lib/common/settings/Settings";
import {
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

const READ_SETTING_FAILED_MESSAGE_KEY = "error.common.get_settings_failed";

export class ReadSettingAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "settingRepository" | "localStorageSettingRepository"
    >
  ) {}

  public async readSettings(): Promise<ActionResult<Settings>> {
    const getSettingsResult =
      await this.repositoryContainer.settingRepository.getSettings();
    const getAutoPopupSettingsResult =
      await this.repositoryContainer.localStorageSettingRepository.getAutoPopupSettings();

    if (
      getSettingsResult.isFailure() ||
      getAutoPopupSettingsResult.isFailure()
    ) {
      return new ActionFailure({ messageKey: READ_SETTING_FAILED_MESSAGE_KEY });
    }

    const settings = {
      ...getSettingsResult.data,
      config: {
        ...getSettingsResult.data.config,
        autofillSetting: {
          ...getSettingsResult.data.config.autofillSetting,
          ...getAutoPopupSettingsResult.data,
        },
      },
    };

    return new ActionSuccess(settings);
  }
}
