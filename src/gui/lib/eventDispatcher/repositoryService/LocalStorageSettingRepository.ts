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
  RepositoryAccessResult,
  RepositoryAccessSuccess,
} from "@/lib/captureControl/Reply";
import DeviceSettings from "@/lib/common/settings/DeviceSettings";

export class LocalStorageSettingRepository {
  /**
   * Get locale information.
   * @returns Locale information.
   */
  public async getLocale(): Promise<RepositoryAccessResult<string>> {
    const tmpLocale = localStorage.getItem("locale");
    const locale = tmpLocale ?? "ja";

    return new RepositoryAccessSuccess({
      data: locale as string,
    });
  }

  /**
   * Save locale information.
   * @param locale  locale information.
   * @returns Saved locale information.
   */
  public async putLocale(
    locale: string
  ): Promise<RepositoryAccessResult<string>> {
    localStorage.setItem("locale", locale);

    return new RepositoryAccessSuccess({
      data: locale as string,
    });
  }

  /**
   * Get device settings information.
   * @returns Device settings information
   */
  public async getDeviceSettings(): Promise<
    RepositoryAccessResult<DeviceSettings>
  > {
    const tmpDeviceSettings = localStorage.getItem("deviceSettings");

    const deviceSettings = tmpDeviceSettings
      ? JSON.parse(tmpDeviceSettings)
      : {
          config: {
            platformName: "PC",
            browser: "Chrome",
            waitTimeForStartupReload: 0,
          },
        };

    return new RepositoryAccessSuccess({
      data: deviceSettings as DeviceSettings,
    });
  }

  /**
   * Save device settings information.
   * @param deviceSettings  Device settings information.
   * @returns  Saved device settings information.
   */
  public async putDeviceSettings(
    deviceSettings: DeviceSettings
  ): Promise<RepositoryAccessResult<DeviceSettings>> {
    const tmpDeviceSettings = {
      config: {
        platformName: deviceSettings.config.platformName,
        browser: deviceSettings.config.browser,
        waitTimeForStartupReload:
          deviceSettings.config.waitTimeForStartupReload,
      },
    };

    localStorage.setItem("deviceSettings", JSON.stringify(tmpDeviceSettings));

    return new RepositoryAccessSuccess({
      data: deviceSettings as DeviceSettings,
    });
  }
}
