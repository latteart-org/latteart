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

import { AutofillConditionGroup } from "@/lib/operationHistory/types";
import { Module } from "vuex";
import { RootState } from "..";
import getters from "./getters";
import mutations from "./mutations";
import actions from "./actions";
import Timer from "@/lib/common/Timer";
import { CaptureSession } from "latteart-client";
import { ElementInfo } from "latteart-client";

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
   * Timer to measure capture time.
   */
  timer: Timer;

  /**
   * URL of the test target.
   */
  url: string;

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
    resultSavingEnabled: boolean;
    comparisonEnabled: boolean;
  };

  captureSession: CaptureSession | null;

  /**
   * Dialog to select autofill.
   */
  autofillSelectDialogData: {
    autofillConditionGroups: AutofillConditionGroup[];
    message: string;
  } | null;

  /**
   * Dialogg to register autofill settings.
   */
  autofillRegisterDialogData: {
    title: string;
    url: string;
    message: string;
    inputElements: ElementInfo[];
    callback: () => void;
  } | null;
}

const state: CaptureControlState = {
  isCapturing: false,
  isReplaying: false,
  isResuming: false,
  isPaused: false,
  url: "",
  testOption: {
    firstTestPurpose: "",
    firstTestPurposeDetails: "",
    shouldRecordTestPurpose: false,
  },
  replayOption: {
    testResultName: "",
    resultSavingEnabled: false,
    comparisonEnabled: false,
  },
  autofillSelectDialogData: null,
  autofillRegisterDialogData: null,
  timer: new Timer(),
  captureSession: null,
};

export const captureControl: Module<CaptureControlState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
