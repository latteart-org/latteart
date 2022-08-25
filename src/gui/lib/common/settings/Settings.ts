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

import { ScreenDefType, RunningMode, Locale } from "../enum/SettingsEnum";
import {
  AutofillSetting,
  ScreenDefinitionConditionGroup,
} from "@/lib/operationHistory/types";

/**
 * Class that holds the setting information of the tool.
 */
export default class Settings {
  /**
   * Locale.
   */
  public locale: Locale;

  /**
   * Boot mode.
   */
  public mode: RunningMode;

  /**
   * Advanced debug mode settings.
   */
  public debug: {
    outputs: {
      dom: boolean;
    };
    saveItems: {
      keywordSet: boolean;
    };
    configureCaptureSettings: boolean;
  };

  /**
   * ViewPoint presets.
   */
  public viewPointsPreset: Array<{
    name: string;
    viewPoints: Array<{ name: string }>;
  }>;

  /**
   * HTML tag list.
   */
  public defaultTagList: string[];

  /**
   * Setting information.
   */
  public config: {
    screenDefinition: ScreenDefinition;
    autofillSetting: AutofillSetting;
    coverage: Coverage;
    imageCompression: ImageCompression;
  };

  /**
   * Exclusion tag setting.
   */
  public captureSettings: {
    ignoreTags: string[];
  };

  /**
   * Constructor.
   */
  constructor() {
    this.locale = Locale.Ja;
    this.mode = RunningMode.Debug;
    this.debug = {
      outputs: {
        dom: false,
      },
      saveItems: {
        keywordSet: true,
      },
      configureCaptureSettings: true,
    };
    this.viewPointsPreset = [];
    this.defaultTagList = [];
    this.config = {
      autofillSetting: {
        autoPopupRegistrationDialog: false,
        autoPopupSelectionDialog: false,
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
      imageCompression: {
        isEnabled: true,
        isDeleteSrcImage: true,
      },
    };
    this.captureSettings = {
      ignoreTags: [],
    };
  }
}

export interface ScreenDefinition {
  screenDefType: ScreenDefType;
  conditionGroups: ScreenDefinitionConditionGroup[];
}

export interface Coverage {
  include: {
    tags: string[];
  };
}

export interface ImageCompression {
  isEnabled: boolean;
  isDeleteSrcImage: boolean;
}
