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

import { type ActionResult, ActionFailure, ActionSuccess } from "@/lib/common/ActionResult";
import { LocalStorageSettingRepository } from "@/lib/common/LocalStorageSettingRepository";
import { type DeviceSettings } from "@/lib/common/settings/Settings";
import { type ViewSettings } from "@/lib/common/settings/Settings";
import { type TestScriptOption } from "latteart-client";

const READ_SETTING_FAILED_MESSAGE_KEY = "error.common.get_settings_failed";
const SAVE_SETTING_FAILED_MESSAGE_KEY = "error.common.save_settings_failed";
const READ_DEVICE_SETTING_FAILED_MESSAGE_KEY = "error.capture_control.get_device_settings_failed";
const SAVE_DEVICE_SETTING_FAILED_MESSAGE_KEY = "error.capture_control.save_device_settings_failed";

export class ReadLocaleAction {
  public async readLocale(): Promise<ActionResult<string>> {
    const getLocaleResult = await new LocalStorageSettingRepository().getLocale();

    if (getLocaleResult.isFailure()) {
      return new ActionFailure({ messageKey: READ_SETTING_FAILED_MESSAGE_KEY });
    }

    return new ActionSuccess(getLocaleResult.data);
  }
}

export class SaveLocaleAction {
  public async saveLocale(locale: string): Promise<ActionResult<string>> {
    const putLocaleResult = await new LocalStorageSettingRepository().putLocale(locale);

    if (putLocaleResult.isFailure()) {
      return new ActionFailure({ messageKey: SAVE_SETTING_FAILED_MESSAGE_KEY });
    }

    return new ActionSuccess(putLocaleResult.data);
  }
}

export class ReadDeviceSettingAction {
  public async readDeviceSettings(): Promise<ActionResult<{ config: DeviceSettings }>> {
    const getDeviceSettingsResult = await new LocalStorageSettingRepository().getDeviceSettings();

    if (getDeviceSettingsResult.isFailure()) {
      return new ActionFailure({
        messageKey: READ_DEVICE_SETTING_FAILED_MESSAGE_KEY
      });
    }

    return new ActionSuccess(getDeviceSettingsResult.data);
  }
}

export class SaveDeviceSettingAction {
  public async saveDeviceSettings(deviceSettings: {
    config: DeviceSettings;
  }): Promise<ActionResult<{ config: DeviceSettings }>> {
    const putDeviceSettingsResult = await new LocalStorageSettingRepository().putDeviceSettings(
      deviceSettings
    );

    if (putDeviceSettingsResult.isFailure()) {
      return new ActionFailure({
        messageKey: SAVE_DEVICE_SETTING_FAILED_MESSAGE_KEY
      });
    }

    return new ActionSuccess(putDeviceSettingsResult.data);
  }
}

export class ReadUserSettingAction {
  public async readViewSettings(): Promise<ActionResult<ViewSettings>> {
    const result = await new LocalStorageSettingRepository().getViewSettings();

    if (result.isFailure()) {
      return new ActionFailure({ messageKey: READ_SETTING_FAILED_MESSAGE_KEY });
    }

    return new ActionSuccess(result.data);
  }

  public async readTestScriptOption(): Promise<
    ActionResult<Pick<TestScriptOption, "buttonDefinitions">>
  > {
    const getTestScriptOptionResult =
      await new LocalStorageSettingRepository().getTestScriptOption();

    if (getTestScriptOptionResult.isFailure()) {
      return new ActionFailure({ messageKey: READ_SETTING_FAILED_MESSAGE_KEY });
    }

    return new ActionSuccess(getTestScriptOptionResult.data);
  }
}

export class SaveUserSettingAction {
  public async saveViewSettings(settings: ViewSettings): Promise<ActionResult<ViewSettings>> {
    const result = await new LocalStorageSettingRepository().putViewSettings(settings);

    if (result.isFailure()) {
      return new ActionFailure({ messageKey: SAVE_SETTING_FAILED_MESSAGE_KEY });
    }

    return new ActionSuccess(result.data);
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
