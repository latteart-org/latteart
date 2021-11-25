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

import Vue from "vue";
import { MutationTree } from "vuex";
import { CaptureControlState } from ".";
import { WindowHandle } from "@/lib/operationHistory/types";
import { PlatformName, Browser } from "@/lib/common/enum/SettingsEnum";
import { ExecutablePaths } from "@/lib/common/settings/DeviceSettings";

const mutations: MutationTree<CaptureControlState> = {
  /**
   * Empty current window handles in the State.
   * @param state State.
   */
  clearWindowHandles(state) {
    Vue.set(state, "windowHandles", []);
  },

  /**
   * Set whether it is capturing or not to the State.
   * @param state State.
   * @param payload.isCapturing Whether it is capturing or not.
   */
  setCapturing(state, payload: { isCapturing: boolean }) {
    state.isCapturing = payload.isCapturing;
  },

  /**
   * Set test target platform name to the State.
   * @param state State.
   * @param payload.platformName Platform name.
   */
  setPlatformName(state, payload: { platformName: PlatformName }) {
    state.config.platformName = payload.platformName;
  },

  /**
   * Set test target platform version to the State.
   * @param state State.
   * @param payload.platformVersion Platform version.
   */
  setPlatformVersion(state, payload: { platformVersion: string }) {
    state.config.platformVersion = payload.platformVersion;
    state.config = Object.assign({}, state.config);
  },

  /**
   * Set test target browser to the State.
   * @param state State.
   * @param payload.browser Browser.
   */
  setBrowser(state, payload: { browser: Browser }) {
    state.config.browser = payload.browser;
    state.config = Object.assign({}, state.config);
  },

  /**
   * Set selectable devices to the State.
   * @param state State.
   * @param payload.devices Devices.
   */
  setDevices(
    state,
    payload: {
      devices: Array<{
        deviceName: string;
        modelNumber: string;
        osVersion: string;
      }>;
    }
  ) {
    state.config.devices.splice(
      0,
      state.config.devices.length,
      ...payload.devices
    );
  },

  /**
   * Set test target device to the State.
   * @param state State.
   * @param payload.device Device.
   */
  setDevice(
    state,
    payload: {
      device: { deviceName: string; modelNumber: string; osVersion: string };
    }
  ) {
    state.config.device = payload.device;
    state.config = Object.assign({}, state.config);
  },

  /**
   * Set the time to reload at test start to the State.
   * @param state State.
   * @param payload The time to reload at test start.(s)
   */
  setWaitTimeForStartupReload(
    state,
    payload: { waitTimeForStartupReload: number }
  ) {
    state.config.waitTimeForStartupReload = payload.waitTimeForStartupReload;
    state.config = Object.assign({}, state.config);
  },

  /**
   * Set executable paths used for capture to the State.
   * @param state State.
   * @param payload.executablePaths Executable paths.
   */
  setExecutablePaths(state, payload: { executablePaths: ExecutablePaths }) {
    state.config.executablePaths = payload.executablePaths;
  },

  /**
   * Set window handles to the State.
   * @param state State.
   * @param payload.windowHandles Window handles.
   */
  setWindowHandles(state, payload: { windowHandles: WindowHandle[] }) {
    state.windowHandles = payload.windowHandles;
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
   * Set capture target window to the State.
   * @param state State.
   * @param payload.currentWindow Capture target window.
   */
  setCurrentWindow(state, payload: { currentWindow: string }) {
    state.capturingWindowInfo.currentWindow = payload.currentWindow;
  },

  /**
   * Set selectable windows to the State.
   * @param state State.
   * @param payload.availableWindows Selectable windows.
   */
  setAvailableWindows(state, payload: { availableWindows: WindowHandle[] }) {
    state.capturingWindowInfo.availableWindows = payload.availableWindows;
  },

  /**
   * Set whether it can go back to previous page or not on the test target browser.
   * @param state State.
   * @param payload.canDoBrowserBack Whether it can go back to previous page or not on the test target browser.
   */
  setCanDoBrowserBack(state, payload: { canDoBrowserBack: boolean }) {
    state.canDoBrowserBack = payload.canDoBrowserBack;
  },

  /**
   * Set whether it can go forward to next page or not on the test target browser.
   * @param state State.
   * @param payload.canDoBrowserForward Whether it can go forward to next page or not on the test target browser.
   */
  setCanDoBrowserForward(state, payload: { canDoBrowserForward: boolean }) {
    state.canDoBrowserForward = payload.canDoBrowserForward;
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
   * Set alert visible status
   * @param state  State.
   * @param payload  Alert visible status.
   */
  setAlertVisible(state, payload: { isVisible: boolean }) {
    state.alertIsVisible = payload.isVisible;
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
};

export default mutations;
