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

import { ScreenDefType, RunningMode, Locale } from "./SettingsEnum";

/**
 * Class that holds the setting value.
 */
export default class Settings {
  public locale: Locale;
  public mode: RunningMode;
  public debug: {
    outputs: {
      dom: boolean;
    };
    saveItems: {
      keywordSet: boolean;
    };
    configureCaptureSettings: boolean;
  };
  public viewPointsPreset: Array<{
    name: string;
    viewPoints: Array<{ name: string }>;
  }>;
  public defaultTagList: string[];
  public defaultTestHintProps: TestHintPropSetting[];
  public config: {
    autofillSetting: AutofillSetting;
    autoOperationSetting: AutoOperationSetting;
    screenDefinition: ScreenDefinition;
    coverage: Coverage;
    captureMediaSetting: CaptureMediaSetting;
    experimentalFeatureSetting: ExperimentalFeatureSetting;
  };
  public captureSettings: {
    ignoreTags: string[];
  };

  /**
   * constructor
   */
  constructor() {
    this.locale = Locale.Ja;
    this.mode = RunningMode.Debug;
    this.debug = {
      outputs: {
        dom: false,
      },
      saveItems: {
        keywordSet: false,
      },
      configureCaptureSettings: true,
    };
    this.viewPointsPreset = [];
    this.defaultTagList = [];
    this.defaultTestHintProps = [];
    this.config = {
      autofillSetting: {
        conditionGroups: [],
      },
      autoOperationSetting: {
        conditionGroups: [],
      },
      screenDefinition: {
        screenDefType: ScreenDefType.Title,
        conditionGroups: [],
      },
      coverage: {
        include: {
          tags: [],
        },
      },
      captureMediaSetting: {
        mediaType: "image",
        imageCompression: { format: "png" },
      },
      experimentalFeatureSetting: { captureArch: "polling" },
    };
    this.captureSettings = {
      ignoreTags: [],
    };
  }
}

/**
 * Autofill setting.
 */
export interface AutofillSetting {
  conditionGroups: AutofillConditionGroup[];
}

/**
 * Auto operation setting.
 */
export interface AutoOperationSetting {
  conditionGroups: AutoOperationConditionGroup[];
}

/**
 * Screen definition settings.
 */
export interface ScreenDefinition {
  screenDefType: ScreenDefType;
  conditionGroups: ScreenDefinitionConditionGroup[];
}

/**
 * HTML tags to include in coverage.
 */
export interface Coverage {
  include: {
    tags: string[];
  };
}

/**
 * Capture media settings.
 */
export interface CaptureMediaSetting {
  mediaType: "image" | "video";
  imageCompression: ImageCompression;
}

/**
 * Image compression settings.
 */
export interface ImageCompression {
  format: "png" | "webp";
}

/**
 * Autofill condition group.
 */
export interface AutofillConditionGroup {
  isEnabled: boolean;
  settingName: string;
  url: string;
  title: string;
  inputValueConditions: Array<AutofillCondition>;
}

/**
 * Autofill condition.
 */
export type AutofillCondition = {
  isEnabled: boolean;
  locatorType: string;
  locator: string;
  locatorMatchType: "equals" | "contains";
  inputValue: string;
  iframeIndex?: number;
};

/**
 * Auto operation condition group.
 */
export interface AutoOperationConditionGroup {
  isEnabled: boolean;
  settingName: string;
  details?: string;
  autoOperations: any[];
}

/**
 * Screen definition condition group.
 */
export interface ScreenDefinitionConditionGroup {
  isEnabled: boolean;
  screenName: string;
  conditions: Array<{
    isEnabled: boolean;
    definitionType: "url" | "title" | "keyword";
    word: string;
  }>;
}

/**
 * Experimental feature setting.
 */
export interface ExperimentalFeatureSetting {
  captureArch: "polling" | "push";
}

/**
 * TestHintProp initial value type
 */
export interface TestHintPropSetting {
  title: string;
  id: string;
  type: string;
  index: number;
  list?: { key: string; value: string }[];
}
