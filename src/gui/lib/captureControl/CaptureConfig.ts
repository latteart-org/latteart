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

import { PlatformName, Browser } from "../../lib/common/enum/SettingsEnum";
import { ExecutablePaths } from "@/lib/common/settings/DeviceSettings";

/**
 * A class that holds the necessary setting information at the time of capture.
 */
export class CaptureConfig {
  /**
   * Platform name.
   */
  public platformName: PlatformName;

  /**
   * Browser name.
   */
  public browser: Browser;

  /**
   * Device information.
   */
  public device: { deviceName: string; modelNumber: string; osVersion: string };

  /**
   * Platform version.
   */
  public platformVersion: string;

  /**
   * Time to reload (s).
   */
  public waitTimeForStartupReload: number;

  /**
   * Execution path.
   */
  public executablePaths: ExecutablePaths;

  /**
   * Constructor.
   */
  constructor() {
    this.platformName = PlatformName.PC;
    this.browser = Browser.Chrome;
    this.device = {
      deviceName: "",
      modelNumber: "",
      osVersion: "",
    };
    this.platformVersion = "";
    this.waitTimeForStartupReload = 0;
    this.executablePaths = {
      browser: "",
      driver: "",
    };
  }
}
