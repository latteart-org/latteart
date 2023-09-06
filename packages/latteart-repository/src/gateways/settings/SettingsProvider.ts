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

import fs from "fs";
import Settings from "./Settings";
import { ScreenDefType, RunningMode, Locale } from "./SettingsEnum";
import * as Util from "./util";
import { ERR_MSG } from "./Constants";

/**
 * A class that handles settings.
 */
export class SettingsProvider {
  public settings: Settings = new Settings();

  /**
   * Read the configuration file.
   * If reading fails, throw Error.
   * @param filePath  Configuration file path
   */
  public loadFile(filePath: string): void {
    try {
      const stat = fs.statSync(filePath);
      if (!stat.isFile()) {
        return;
      }
    } catch (error) {
      return;
    }
    const readdata = JSON.parse(fs.readFileSync(filePath, "utf8"));
    this.merge(this.settings, readdata);
    this.validate(this.settings);
  }

  /**
   * Save the configuration file.
   * If saving fails, throw Error.
   * @param saveData  Saved data
   */
  public saveFile(filePath: string): void {
    fs.writeFileSync(filePath, JSON.stringify(this.settings, null, 2), "utf-8");
  }

  /**
   * Gets the setting value corresponding to the key string.
   * If there is no corresponding setting, undefined is returned.
   * @param keyPath  Key strings concatenated by periods
   * @returns Set value
   */
  public getSetting(keyPath: string): any {
    if (keyPath === "") {
      return this.settings;
    }

    const keys = keyPath.split(".");
    return Util.findValueRecursively(keys, this.settings);
  }

  /**
   * Set a new value to the setting value corresponding to the key string.
   * @param keyPath  Key strings concatenated by periods
   * @param value  New setting
   */
  public setSetting(keyPath: string, value: any): void {
    if (keyPath === "") {
      this.settings = value;
      return;
    }

    const keys = keyPath.split(".");
    const parentKeys = keys.slice(0, keys.length - 1);
    const parent = this.getSetting(parentKeys.join("."));

    if (parent === undefined) {
      return;
    }

    parent[keys[keys.length - 1]] = value;
  }

  /**
   * Validate the read file.
   * @param data  Read file data
   */
  private validate(data: Settings) {
    if (!data.config) {
      return;
    }
    if (
      data.config.screenDefinition &&
      data.config.screenDefinition.screenDefType
    ) {
      const screenDefType = data.config.screenDefinition
        .screenDefType as string;
      if (
        !Util.isIncludeEnum(screenDefType, ScreenDefType) &&
        screenDefType !== ""
      ) {
        throw new Error(
          `${ERR_MSG.SETTINGS.INVALID_SCREEN_DEF_TYPE} ${screenDefType}`
        );
      }
    }
    if (data.locale) {
      const locale = data.locale as string;
      if (!Util.isIncludeEnum(locale, Locale) && locale !== "") {
        throw new Error(`${ERR_MSG.SETTINGS.INVALID_LOCALE} ${locale}`);
      }
    }
    if (data.mode) {
      const mode = data.mode as string;
      if (!Util.isIncludeEnum(mode, RunningMode) && mode !== "") {
        throw new Error(`${ERR_MSG.SETTINGS.INVALID_MODE} ${mode}`);
      }
    }
  }

  /**
   * If a configuration file is set, the configuration parameters will be merged into the setting.
   * @param target  Object to merge
   * @param source  Merge source object
   */
  private merge(target: Settings, source: Settings) {
    if (source.locale && (source.locale as string) !== "") {
      target.locale = source.locale;
    }

    if (source.mode && (source.mode as string) !== "") {
      target.mode = source.mode;
    }

    if (source.debug) {
      if (source.debug.outputs && source.debug.outputs.dom) {
        target.debug.outputs.dom = source.debug.outputs.dom;
      }
      if (
        source.debug.saveItems &&
        source.debug.saveItems.keywordSet !== undefined
      ) {
        target.debug.saveItems.keywordSet = source.debug.saveItems.keywordSet;
      }
    }

    if (
      source.debug &&
      (source.debug.configureCaptureSettings === true ||
        source.debug.configureCaptureSettings === false)
    ) {
      target.debug.configureCaptureSettings =
        source.debug.configureCaptureSettings;
    }

    if (source.viewPointsPreset) {
      target.viewPointsPreset = source.viewPointsPreset;
    }

    if (source.defaultTagList) {
      target.defaultTagList = source.defaultTagList;
    }

    if (source.config && source.config.autofillSetting) {
      const sourceAutofillSetting = source.config.autofillSetting;

      if (sourceAutofillSetting.conditionGroups) {
        target.config.autofillSetting.conditionGroups =
          sourceAutofillSetting.conditionGroups;
      }
    }

    if (source.config && source.config.autoOperationSetting) {
      const sourceAutoOperationSetting = source.config.autoOperationSetting;

      if (sourceAutoOperationSetting.conditionGroups) {
        target.config.autoOperationSetting.conditionGroups =
          sourceAutoOperationSetting.conditionGroups;
      }
    }

    if (source.config && source.config.screenDefinition) {
      const sourceScreenDefinition = source.config.screenDefinition;

      if (
        sourceScreenDefinition.screenDefType &&
        (sourceScreenDefinition.screenDefType as string) !== ""
      ) {
        target.config.screenDefinition.screenDefType =
          sourceScreenDefinition.screenDefType;
      }

      if (source.config && source.config.screenDefinition.conditionGroups) {
        target.config.screenDefinition.conditionGroups =
          source.config.screenDefinition.conditionGroups;
      }
    }

    if (source.config && source.config.coverage) {
      const sourceCoverage = source.config.coverage;

      if (sourceCoverage.include && sourceCoverage.include.tags) {
        target.config.coverage.include.tags = sourceCoverage.include.tags;
      }
    }

    if (source.config && source.config.captureMediaSetting) {
      Object.assign(
        target.config.captureMediaSetting,
        source.config.captureMediaSetting
      );
    }

    if (source.captureSettings && source.captureSettings.ignoreTags) {
      target.captureSettings.ignoreTags = source.captureSettings.ignoreTags;
    }
  }
}
