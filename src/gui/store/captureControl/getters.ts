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

import { GetterTree } from "vuex";
import { CaptureControlState } from ".";
import { RootState } from "..";
import { PlatformName } from "@/lib/common/enum/SettingsEnum";

const getters: GetterTree<CaptureControlState, RootState> = {
  /**
   * Get device config from the State.
   * @param state State.
   * @returns Device config.
   */
  getDeviceConfig: (state) => () => {
    return state.config;
  },

  /**
   * Whether a mobile device is selected for testing or not.
   * @param state State.
   * @returns 'true': A mobile device is selected, 'false': A mobile device is not selected.
   */
  hasMobileDeviceSelected: (state) => () => {
    return state.config.platformName !== PlatformName.PC;
  },

  /**
   * Whether the test target URL is valid or not.
   * @param state State.
   * @returns 'true': The test target URL is valid, 'false': The test target URL is not valid.
   */
  urlIsValid: (state) => () => {
    try {
      new URL(state.url);
      return true;
    } catch (error) {
      return false;
    }
  },
};

export default getters;
