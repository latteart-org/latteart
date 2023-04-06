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

import { MutationTree } from "vuex";
import { CaptureControlState } from ".";
import { AutofillConditionGroup } from "@/lib/operationHistory/types";
import { CaptureSession } from "latteart-client";
import { ElementInfo } from "latteart-client";

const mutations: MutationTree<CaptureControlState> = {
  /**
   * Set whether it is capturing or not to the State.
   * @param state State.
   * @param payload.isCapturing Whether it is capturing or not.
   */
  setCapturing(state, payload: { isCapturing: boolean }) {
    state.isCapturing = payload.isCapturing;
  },

  /**
   * Set whether it is replaying or not to the State.
   * @param state State.
   * @param payload.isReplaying Whether it is replaying or not.
   */
  setIsReplaying(state, payload: { isReplaying: boolean }) {
    state.isReplaying = payload.isReplaying;
  },

  /**
   * Set whether it is resuming or not to the State.
   * @param state State.
   * @param payload.isResuming Whether it is resuming or not.
   */
  setIsResuming(state, payload: { isResuming: boolean }) {
    state.isResuming = payload.isResuming;
  },

  /**
   * Set test target URL to the State.
   * @param state State.
   * @param payload.url Test target URL.
   */
  setUrl(state, payload: { url: string }) {
    state.url = payload.url;
  },

  /**
   * Sets the status of whether the capture is paused.
   * @param state  State.
   * @param payload  Status of whether capture is suspended.
   */
  setPaused(state, payload: { isPaused: boolean }) {
    state.isPaused = payload.isPaused;
  },

  /**
   * Set test option.
   * @param state State.
   * @param payload.testOption test option.
   */
  setTestOption(
    state,
    payload: {
      testOption: {
        firstTestPurpose: string;
        firstTestPurposeDetails: string;
        shouldRecordTestPurpose: boolean;
      };
    }
  ) {
    state.testOption = payload.testOption;
  },

  /**
   * Set replay option.
   * @param state State.
   * @param payload.replayOption replay option.
   */
  setReplayOption(
    state,
    payload: {
      replayOption: {
        testResultName: string;
        resultSavingEnabled: boolean;
        comparisonEnabled: boolean;
      };
    }
  ) {
    state.replayOption = payload.replayOption;
  },

  setCaptureSession(state, payload: { session: CaptureSession }) {
    state.captureSession = payload.session;
  },

  deleteCaptureSession(state) {
    state.captureSession = null;
  },

  setAutofillSelectDialog(
    state,
    payload: {
      dialogData: {
        autofillConditionGroups: AutofillConditionGroup[];
        message: string;
      } | null;
    }
  ) {
    state.autofillSelectDialogData = payload.dialogData;
  },

  setAutofillRegisterDialog(
    state,
    payload: {
      title: string;
      url: string;
      message: string;
      inputElements: ElementInfo[];
      callback: () => void;
    } | null
  ) {
    state.autofillRegisterDialogData = payload;
  },
};

export default mutations;
