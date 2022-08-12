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

import { WindowHandle } from "@/lib/operationHistory/types";
import { Module } from "vuex";
import { RootState } from "..";
import getters from "./getters";
import mutations from "./mutations";
import actions from "./actions";
import { CaptureConfig } from "@/lib/captureControl/CaptureConfig";
import Timer from "@/lib/common/Timer";

/**
 * Store for capture control.
 */
export interface CaptureControlState {
  /**
   * Whether it is capturing or not.
   */
  isCapturing: boolean;

  /**
   * Whether it is replaying or not.
   */
  isReplaying: boolean;

  /**
   * Whether it is resuming or not.
   */
  isResuming: boolean;

  /**
   * Whether it is paused or not.
   */
  isPaused: boolean;

  /**
   * Current window handles.
   */
  windowHandles: WindowHandle[];

  /**
   * Capture config.
   */
  config: CaptureConfig;

  /**
   * Capturing window information.
   */
  capturingWindowInfo: {
    currentWindow: string;
    availableWindows: WindowHandle[];
  };

  /**
   * Timer to measure capture time.
   */
  timer: Timer;

  /**
   * Whether it can go back to previous page or not on the test target browser.
   */
  canDoBrowserBack: boolean;

  /**
   * Whether it can go forward to next page or not on the test target browser.
   */
  canDoBrowserForward: boolean;

  /**
   * URL of the test target.
   */
  url: string;

  /**
   * Alert visible status
   */
  alertIsVisible: boolean;

  /**
   * Test option.
   */
  testOption: {
    firstTestPurpose: string;
    firstTestPurposeDetails: string;
    shouldRecordTestPurpose: boolean;
  };

  /**
   * Replay option.
   */
  replayOption: {
    testResultName: string;
    replayCaptureMode: boolean;
  };
}

const state: CaptureControlState = {
  isCapturing: false,
  isReplaying: false,
  isResuming: false,
  isPaused: false,
  windowHandles: [],
  config: new CaptureConfig(),
  capturingWindowInfo: {
    currentWindow: "",
    availableWindows: [],
  },
  timer: new Timer(),
  canDoBrowserBack: false,
  canDoBrowserForward: false,
  url: "",
  alertIsVisible: false,
  testOption: {
    firstTestPurpose: "",
    firstTestPurposeDetails: "",
    shouldRecordTestPurpose: false,
  },
  replayOption: {
    testResultName: "",
    replayCaptureMode: false,
  },
};

export const captureControl: Module<CaptureControlState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
