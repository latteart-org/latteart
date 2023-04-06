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

import { SettingsProvider } from "./SettingsProvider";

/**
 * A utility that provides settings.
 */
export class SettingsUtility {
  public static get settingsProvider(): SettingsProvider {
    return this._settingsProvider;
  }

  /**
   * Read the configuration file.
   */
  public static loadFile(filePath: string): void {
    this._settingsProvider.loadFile(filePath);
  }

  public static saveFile(filePath: string): void {
    this._settingsProvider.saveFile(filePath);
  }

  /**
   * Get the setting value corresponding to the key character string.
   * If there is no corresponding setting, undefined is returned.
   * @param keyPath  Key strings concatenated by periods
   * @returns Set value
   */
  public static getSetting(keyPath: string): any {
    return this._settingsProvider.getSetting(keyPath);
  }

  /**
   * Set a new value to the setting value corresponding to the key string.
   * @param keyPath  Key strings concatenated by periods
   * @param value  New setting
   */
  public static setSetting(keyPath: string, value: any): any {
    return this._settingsProvider.setSetting(keyPath, value);
  }

  private static _settingsProvider = new SettingsProvider();
}
