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

import { type AutoPopupSettings } from "@/lib/operationHistory/types";
import {
  type RepositoryAccessResult,
  createRepositoryAccessSuccess,
  type TestScriptOption
} from "latteart-client";
import { type DeviceSettings } from "./settings/Settings";

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
   * Get autoPopup settings information.
   * @returns autoPopup settings information
   */
  public async getAutoPopupSettings(): Promise<RepositoryAccessResult<AutoPopupSettings>> {
    const tmpAutoPopupSettings = localStorage.getItem("latteart-config-autoPopupSettings");

    const autoPopupSettings = tmpAutoPopupSettings
      ? JSON.parse(tmpAutoPopupSettings)
      : {
          autoPopupRegistrationDialog: false,
          autoPopupSelectionDialog: false
        };

    return createRepositoryAccessSuccess({
      data: autoPopupSettings as AutoPopupSettings
    });
  }

  /**
   * Save autoPopup settings information.
   * @param autoPopupSettings  AutoPopup settings information.
   * @returns  Saved autoPopup settings information.
   */
  public async putAutoPopupSettings(
    autoPopupSettings: AutoPopupSettings
  ): Promise<RepositoryAccessResult<AutoPopupSettings>> {
    const tmpAutoPopupSettings = {
      autoPopupRegistrationDialog: autoPopupSettings.autoPopupRegistrationDialog,
      autoPopupSelectionDialog: autoPopupSettings.autoPopupSelectionDialog
    };

    localStorage.setItem("latteart-config-autoPopupSettings", JSON.stringify(tmpAutoPopupSettings));

    return createRepositoryAccessSuccess({
      data: autoPopupSettings as AutoPopupSettings
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
}
