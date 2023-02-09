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

import { GetterTree } from "vuex";
import { CaptureControlState } from ".";
import { RootState } from "..";

const getters: GetterTree<CaptureControlState, RootState> = {
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
