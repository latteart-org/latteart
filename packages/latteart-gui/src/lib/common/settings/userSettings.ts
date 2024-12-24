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
import {
  type AutofillSetting,
  type AutoOperationSetting,
  type CaptureMediaSetting,
  type DeviceSettings,
  type TestHintSetting
} from "@/lib/common/settings/Settings";
import { type TestScriptOption } from "latteart-client";

const READ_SETTING_FAILED_MESSAGE_KEY = "error.common.get_settings_failed";
const SAVE_SETTING_FAILED_MESSAGE_KEY = "error.common.save_settings_failed";
const READ_DEVICE_SETTING_FAILED_MESSAGE_KEY = "error.capture_control.get_device_settings_failed";
const SAVE_DEVICE_SETTING_FAILED_MESSAGE_KEY = "error.capture_control.save_device_settings_failed";

export async function readLocale(): Promise<ActionResult<string>> {
  const getLocaleResult = await new LocalStorageSettingRepository().getLocale();

  if (getLocaleResult.isFailure()) {
    return new ActionFailure({ messageKey: READ_SETTING_FAILED_MESSAGE_KEY });
  }

  return new ActionSuccess(getLocaleResult.data);
}

export async function saveLocale(locale: string): Promise<ActionResult<string>> {
  const putLocaleResult = await new LocalStorageSettingRepository().putLocale(locale);

  if (putLocaleResult.isFailure()) {
    return new ActionFailure({ messageKey: SAVE_SETTING_FAILED_MESSAGE_KEY });
  }

  return new ActionSuccess(putLocaleResult.data);
}

export async function readDeviceSettings(): Promise<ActionResult<{ config: DeviceSettings }>> {
  const getDeviceSettingsResult = await new LocalStorageSettingRepository().getDeviceSettings();

  if (getDeviceSettingsResult.isFailure()) {
    return new ActionFailure({
      messageKey: READ_DEVICE_SETTING_FAILED_MESSAGE_KEY
    });
  }

  return new ActionSuccess(getDeviceSettingsResult.data);
}

export async function saveDeviceSettings(deviceSettings: {
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

export async function readTestScriptOption(): Promise<
  ActionResult<Pick<TestScriptOption, "buttonDefinitions">>
> {
  const getTestScriptOptionResult = await new LocalStorageSettingRepository().getTestScriptOption();

  if (getTestScriptOptionResult.isFailure()) {
    return new ActionFailure({ messageKey: READ_SETTING_FAILED_MESSAGE_KEY });
  }

  return new ActionSuccess(getTestScriptOptionResult.data);
}

export async function saveTestScriptOption(
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

export function saveCaptureMediaSettings(
  captureMediaSetting: CaptureMediaSetting
): ActionResult<void> {
  return new ActionSuccess(
    new LocalStorageSettingRepository().putCaptureMediaSetting(captureMediaSetting)
  );
}

export function readCaptureMediaSettings(): ActionResult<CaptureMediaSetting> {
  return new ActionSuccess(new LocalStorageSettingRepository().getCaptureMediaSetting());
}

export function saveAutofillSetting(autofillSetting: AutofillSetting): ActionResult<void> {
  return new ActionSuccess(new LocalStorageSettingRepository().putAutofillSetting(autofillSetting));
}

export function readAutofillSetting(): ActionResult<AutofillSetting> {
  return new ActionSuccess(new LocalStorageSettingRepository().getAutofillSetting());
}

export function saveAutoOperationSetting(
  autoOperationSetting: AutoOperationSetting
): ActionResult<void> {
  return new ActionSuccess(
    new LocalStorageSettingRepository().putAutoOperationSetting(autoOperationSetting)
  );
}

export function readAutoOperationSetting(): ActionResult<AutoOperationSetting> {
  return new ActionSuccess(new LocalStorageSettingRepository().getAutoOperationSetting());
}

export function readTestHintSetting(): ActionResult<TestHintSetting> {
  return new ActionSuccess(new LocalStorageSettingRepository().getTestHintSetting());
}

export function saveTestHintSetting(testHintSetting: TestHintSetting): ActionResult<void> {
  return new ActionSuccess(new LocalStorageSettingRepository().putTestHintSetting(testHintSetting));
}
