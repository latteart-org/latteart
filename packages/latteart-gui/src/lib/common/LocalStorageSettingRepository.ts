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
  type RepositoryAccessResult,
  createRepositoryAccessSuccess,
  type TestScriptOption
} from "latteart-client";
import {
  type AutofillSetting,
  type AutoOperationSetting,
  type CaptureMediaSetting,
  type DeviceSettings,
  type TestHintSetting
} from "./settings/Settings";

const LOCAL_STORAGE_KEY_LOCALE = "latteart-user-settings-locale";
const LOCAL_STORAGE_KEY_DEVICE_SETTINGS = "latteart-user-settings-deviceSettings";
const LOCAL_STORAGE_KEY_SCRIPT_GENERATION_OPTION = "latteart-user-settings-scriptGenerationOption";
const LOCAL_STORAGE_KEY_TEST_HINT_SETTINGS = "latteart-user-settings-testHintSettings";
const LOCAL_STORAGE_KEY_CAPTURE_MEDIA_SETTINGS = "latteart-user-settings-captureMediaSettings";
const LOCAL_STORAGE_KEY_AUTOFILL_SETTING = "latteart-user-settings-autofillSetting";
const LOCAL_STORAGE_KEY_AUTO_OPERATION_SETTING = "latteart-user-settings-autoOperationSetting";

export class LocalStorageSettingRepository {
  /**
   * Get locale information.
   * @returns Locale information.
   */
  public getLocale(): "ja" | "en" {
    const tmpLocale = localStorage.getItem(LOCAL_STORAGE_KEY_LOCALE) as "ja" | "en" | null;
    const locale = tmpLocale ?? "ja";
    return locale;
  }

  /**
   * Save locale information.
   * @param locale  locale information.
   * @returns Saved locale information.
   */
  public putLocale(locale: string): RepositoryAccessResult<string> {
    localStorage.setItem(LOCAL_STORAGE_KEY_LOCALE, locale);

    return createRepositoryAccessSuccess({
      data: locale as string
    });
  }

  /**
   * Get device settings information.
   * @returns Device settings information
   */
  public getDeviceSettings(): DeviceSettings {
    const tmpDeviceSettings = localStorage.getItem(LOCAL_STORAGE_KEY_DEVICE_SETTINGS);

    const deviceSettings = tmpDeviceSettings
      ? JSON.parse(tmpDeviceSettings)
      : {
          platformName: "PC",
          browser: "Chrome",
          platformVersion: "",
          waitTimeForStartupReload: 0
        };

    return deviceSettings;
  }

  /**
   * Save device settings information.
   * @param deviceSettings  Device settings information.
   * @returns  Saved device settings information.
   */
  public putDeviceSettings(deviceSettings: DeviceSettings): RepositoryAccessResult<DeviceSettings> {
    const tmpDeviceSettings = {
      platformName: deviceSettings.platformName,
      browser: deviceSettings.browser,
      waitTimeForStartupReload: deviceSettings.waitTimeForStartupReload
    };

    localStorage.setItem(LOCAL_STORAGE_KEY_DEVICE_SETTINGS, JSON.stringify(tmpDeviceSettings));

    return createRepositoryAccessSuccess({
      data: deviceSettings
    });
  }

  /**
   * Get test script option.
   * @returns Test script option.
   */
  public getTestScriptOption(): Pick<TestScriptOption, "buttonDefinitions"> {
    const optionJson = localStorage.getItem(LOCAL_STORAGE_KEY_SCRIPT_GENERATION_OPTION);
    const option: Pick<TestScriptOption, "buttonDefinitions"> = optionJson
      ? JSON.parse(optionJson)
      : {};

    return option;
  }

  /**
   * Save test script option.
   * @param option  Test script option.
   * @returns Saved test script option.
   */
  public putTestScriptOption(
    option: Pick<TestScriptOption, "buttonDefinitions">
  ): Pick<TestScriptOption, "buttonDefinitions"> {
    localStorage.setItem(LOCAL_STORAGE_KEY_SCRIPT_GENERATION_OPTION, JSON.stringify(option));

    return option;
  }

  /**
   * Save test hint settings information.
   * @param testHintSetting Test hint settings information.
   */
  putTestHintSetting(testHintSetting: TestHintSetting): void {
    localStorage.setItem(LOCAL_STORAGE_KEY_TEST_HINT_SETTINGS, JSON.stringify(testHintSetting));
  }

  /**
   * Get test hint settings information.
   * @returns Test hint settings.
   */
  getTestHintSetting(): TestHintSetting {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY_TEST_HINT_SETTINGS);
    return data
      ? JSON.parse(data)
      : {
          commentMatching: { target: "all", extraWords: [], excludedWords: [] },
          defaultSearchSeconds: 30
        };
  }

  /**
   * Save capture media settings information.
   * @param captureMediaSetting Capture media settings information.
   */
  public putCaptureMediaSetting(captureMediaSetting: CaptureMediaSetting) {
    localStorage.setItem(
      LOCAL_STORAGE_KEY_CAPTURE_MEDIA_SETTINGS,
      JSON.stringify(captureMediaSetting)
    );
  }

  /**
   * Get capture media settings information.
   * @returns Capture media settings information.
   */
  public getCaptureMediaSetting(): CaptureMediaSetting {
    const setting = localStorage.getItem(LOCAL_STORAGE_KEY_CAPTURE_MEDIA_SETTINGS);
    if (setting === null) {
      return {
        mediaType: "image",
        imageCompression: {
          format: "png"
        }
      };
    }
    return JSON.parse(setting);
  }

  /**
   * Save auto fill settings information.
   * @param autofillSetting  Auto fill settings information.
   */
  public putAutofillSetting(autofillSetting: AutofillSetting): void {
    localStorage.setItem(LOCAL_STORAGE_KEY_AUTOFILL_SETTING, JSON.stringify(autofillSetting));
  }

  /**
   * Get auto fill settings information.
   * @returns Auto fill settings information.
   */
  public getAutofillSetting(): AutofillSetting {
    const setting = localStorage.getItem(LOCAL_STORAGE_KEY_AUTOFILL_SETTING);
    if (setting === null) {
      return {
        autoPopupRegistrationDialog: false,
        autoPopupSelectionDialog: false,
        conditionGroups: []
      };
    }
    return JSON.parse(setting);
  }

  /**
   * Save auto operation settings information.
   * @param autoOperationSetting  Auto operation settings information.
   */
  public putAutoOperationSetting(autoOperationSetting: AutoOperationSetting): void {
    localStorage.setItem(
      LOCAL_STORAGE_KEY_AUTO_OPERATION_SETTING,
      JSON.stringify(autoOperationSetting)
    );
  }

  /**
   * Get auto operation settings information.
   * @returns Auto operation settings information.
   */
  public getAutoOperationSetting(): AutoOperationSetting {
    const setting = localStorage.getItem(LOCAL_STORAGE_KEY_AUTO_OPERATION_SETTING);
    if (setting === null) {
      return {
        conditionGroups: []
      };
    }
    return JSON.parse(setting);
  }
}
