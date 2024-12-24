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

export class LocalStorageSettingRepository {
  /**
   * Get locale information.
   * @returns Locale information.
   */
  public async getLocale(): Promise<RepositoryAccessResult<string>> {
    const tmpLocale = localStorage.getItem("latteart-config-locale");
    const locale = tmpLocale ?? "ja";

    return createRepositoryAccessSuccess({
      data: locale as string
    });
  }

  /**
   * Save locale information.
   * @param locale  locale information.
   * @returns Saved locale information.
   */
  public async putLocale(locale: string): Promise<RepositoryAccessResult<string>> {
    localStorage.setItem("latteart-config-locale", locale);

    return createRepositoryAccessSuccess({
      data: locale as string
    });
  }

  /**
   * Get device settings information.
   * @returns Device settings information
   */
  public async getDeviceSettings(): Promise<RepositoryAccessResult<{ config: DeviceSettings }>> {
    const tmpDeviceSettings = localStorage.getItem("latteart-config-deviceSettings");

    const deviceSettings = tmpDeviceSettings
      ? JSON.parse(tmpDeviceSettings)
      : {
          config: {
            platformName: "PC",
            browser: "Chrome",
            platformVersion: "",
            waitTimeForStartupReload: 0
          }
        };

    return createRepositoryAccessSuccess({
      data: deviceSettings as { config: DeviceSettings }
    });
  }

  /**
   * Save device settings information.
   * @param deviceSettings  Device settings information.
   * @returns  Saved device settings information.
   */
  public async putDeviceSettings(deviceSettings: {
    config: DeviceSettings;
  }): Promise<RepositoryAccessResult<{ config: DeviceSettings }>> {
    const tmpDeviceSettings = {
      config: {
        platformName: deviceSettings.config.platformName,
        browser: deviceSettings.config.browser,
        waitTimeForStartupReload: deviceSettings.config.waitTimeForStartupReload
      }
    };

    localStorage.setItem("latteart-config-deviceSettings", JSON.stringify(tmpDeviceSettings));

    return createRepositoryAccessSuccess({
      data: deviceSettings as { config: DeviceSettings }
    });
  }

  /**
   * Get test script option.
   * @returns Test script option.
   */
  public async getTestScriptOption(): Promise<
    RepositoryAccessResult<Pick<TestScriptOption, "buttonDefinitions">>
  > {
    const optionJson = localStorage.getItem("latteart-config-scriptGenerationOption");
    const option: Pick<TestScriptOption, "buttonDefinitions"> = optionJson
      ? JSON.parse(optionJson)
      : {};

    return createRepositoryAccessSuccess({
      data: option
    });
  }

  /**
   * Save test script option.
   * @param option  Test script option.
   * @returns Saved test script option.
   */
  public async putTestScriptOption(
    option: Pick<TestScriptOption, "buttonDefinitions">
  ): Promise<RepositoryAccessResult<Pick<TestScriptOption, "buttonDefinitions">>> {
    localStorage.setItem("latteart-config-scriptGenerationOption", JSON.stringify(option));

    return createRepositoryAccessSuccess({
      data: option
    });
  }

  /**
   * Save test hint settings information.
   * @param testHintSetting Test hint settings information.
   */
  putTestHintSetting(testHintSetting: TestHintSetting): void {
    localStorage.setItem("latteart-config-testHintSettings", JSON.stringify(testHintSetting));
  }

  /**
   * Get test hint settings information.
   * @returns Test hint settings.
   */
  getTestHintSetting(): TestHintSetting {
    const data = localStorage.getItem("latteart-config-testHintSettings");
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
      "latteart-config-captureMediaSetting",
      JSON.stringify(captureMediaSetting)
    );
  }

  /**
   * Get capture media settings information.
   * @returns Capture media settings information.
   */
  public getCaptureMediaSetting(): CaptureMediaSetting {
    const setting = localStorage.getItem("latteart-config-captureMediaSetting");
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
    localStorage.setItem("latteart-config-autofillSetting", JSON.stringify(autofillSetting));
  }

  /**
   * Get auto fill settings information.
   * @returns Auto fill settings information.
   */
  public getAutofillSetting(): AutofillSetting {
    const setting = localStorage.getItem("latteart-config-autofillSetting");
    if (setting === null) {
      return {
        autoPopupRegistrationDialog: true,
        autoPopupSelectionDialog: true,
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
      "latteart-config-autoOperationSetting",
      JSON.stringify(autoOperationSetting)
    );
  }

  /**
   * Get auto operation settings information.
   * @returns Auto operation settings information.
   */
  public getAutoOperationSetting(): AutoOperationSetting {
    const setting = localStorage.getItem("latteart-config-autoOperationSetting");
    if (setting === null) {
      return {
        conditionGroups: []
      };
    }
    return JSON.parse(setting);
  }
}
