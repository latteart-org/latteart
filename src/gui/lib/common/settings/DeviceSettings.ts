/**
 * Copyright 2021 NTT Corporation.
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

import { PlatformName, Browser } from "../enum/SettingsEnum";

/**
 * Class that holds device-related configuration information.
 */
export default class DeviceSettings {
  /**
   * Device related setting information.
   */
  public config: {
    platformName: PlatformName | "";
    browser: Browser | "";
    device: {
      deviceName: string;
      modelNumber: string;
      osVersion: string;
    };
    platformVersion: string;
    waitTimeForStartupReload: number;
    executablePaths: ExecutablePaths;
  };

  /**
   * Constructor.
   */
  constructor() {
    this.config = {
      platformName: PlatformName.PC,
      browser: Browser.Chrome,
      device: {
        deviceName: "",
        modelNumber: "",
        osVersion: "",
      },
      platformVersion: "",
      waitTimeForStartupReload: 0,
      executablePaths: {
        browser: "",
        driver: "",
      },
    };
  }
}

export interface ExecutablePaths {
  browser: string;
  driver: string;
}
