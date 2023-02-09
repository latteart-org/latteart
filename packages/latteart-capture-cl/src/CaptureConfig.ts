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

/**
 * Platform name.
 */
export enum PlatformName {
  PC = "PC",
  Android = "Android",
  iOS = "iOS",
}

/**
 * Browser.
 */
export enum Browser {
  Chrome = "Chrome",
  Safari = "Safari",
  Edge = "Edge",
}

/**
 * Capture config.
 */
export class CaptureConfig {
  /**
   * Platform name.
   */
  public platformName: PlatformName = PlatformName.PC;

  /**
   * Browser name.
   */
  public browserName: Browser = Browser.Chrome;

  /**
   * Device information.
   */
  public device: { id: string; name: string; osVersion: string } = {
    id: "",
    name: "",
    osVersion: "",
  };

  /**
   * Platform version.
   */
  public platformVersion = "";

  /**
   * Wait time for startup reload.(s)
   */
  public waitTimeForStartupReload = 0;

  /**
   * Set the browser's headless mode.
   */
  public isHeadlessMode = false;

  /**
   * Constructor.
   * @param init The information for initialization.
   */
  constructor(init?: Partial<CaptureConfig>) {
    Object.assign(this, init);
  }
}
