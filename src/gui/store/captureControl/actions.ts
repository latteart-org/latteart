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

import { ActionTree } from "vuex";
import { CaptureControlState } from ".";
import { RootState } from "..";
import { WindowHandle, OperationWithNotes } from "@/lib/operationHistory/types";
import DeviceSettings from "@/lib/common/settings/DeviceSettings";
import { CaptureConfig } from "@/lib/captureControl/CaptureConfig";
import { Operation } from "@/lib/operationHistory/Operation";
import {
  CapturedOperation,
  CapturedScreenTransition,
} from "@/lib/operationHistory/CapturedOperation";
import { ResumeWindowHandlesAction } from "@/lib/captureControl/actions/ResumeWindowHandlesAction";
import { UpdateWindowHandlesAction } from "@/lib/captureControl/actions/UpdateWindowHandlesAction";
import { ReadDeviceSettingAction } from "@/lib/operationHistory/actions/setting/ReadDeviceSettingAction";
import { SaveDeviceSettingAction } from "@/lib/operationHistory/actions/setting/SaveDeviceSettingAction";
import { TimestampImpl } from "@/lib/common/Timestamp";

const actions: ActionTree<CaptureControlState, RootState> = {
  /**
   * Set device settings to the State.
   * @param context Action context.
   * @param payload.deviceSettings Device settings.
   */
  async setDeviceSettings(
    context,
    payload: { deviceSettings: DeviceSettings }
  ) {
    const config = payload.deviceSettings.config;

    await context.dispatch("writeDeviceSettings", {
      config: {
        browser: config.browser,
        platformName: config.platformName,
        waitTimeForStartupReload: config.waitTimeForStartupReload,
        platformVersion: config.platformVersion,
        executablePaths: config.executablePaths,
      },
    });
  },

  /**
   * Restore window handles from history.
   * @param context Action context.
   * @param payload.history History.
   */
  resumeWindowHandles(context, payload: { history: OperationWithNotes[] }) {
    new ResumeWindowHandlesAction({
      setWindowHandles: (windowHandles) => {
        context.commit("setWindowHandles", { windowHandles });
      },
      setIsResuming: (isResuming) => {
        context.commit("setIsResuming", { isResuming });
      },
    }).resume(payload.history.map(({ operation }) => operation));
  },

  /**
   * Set selectable window handles.
   * @param context Action context.
   * @param payload.availableWindowHandles Window handles.
   */
  updateWindowHandles(context, payload: { availableWindowHandles: string[] }) {
    new UpdateWindowHandlesAction({
      setWindowHandles: (windowHandles) => {
        context.commit("setWindowHandles", { windowHandles });
      },
    }).update(context.state.windowHandles, payload.availableWindowHandles);
  },

  /**
   * Acquires a list of devices connected to the terminal where the recording agent is located.
   * @param context Action context.
   * @param payload.platformName Platform name.
   */
  async recognizeDevices(
    context,
    payload: { platformName: string }
  ): Promise<
    {
      deviceName: string;
      modelNumber: string;
      osVersion: string;
    }[]
  > {
    const dispatcher = context.rootState.clientSideCaptureServiceDispatcher;

    const reply = await dispatcher.recognizeDevices(payload.platformName);

    if (reply.succeeded) {
      return reply.data ?? [];
    } else {
      const errorMessage = context.rootGetters.message(
        `error.capture_control.${reply.error!.code}`
      );
      throw new Error(errorMessage);
    }
  },

  /**
   * Load device settings from the repository.
   * @param context Action context.
   */
  async readDeviceSettings(context) {
    const result = await new ReadDeviceSettingAction(
      context.rootState.repositoryContainer
    ).readDeviceSettings();

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    await context.dispatch("setDeviceSettings", {
      deviceSettings: result.data,
    });
  },

  /**
   * Save device settings in the repository.
   * @param context Action context.
   * @param payload.config Capture config.
   */
  async writeDeviceSettings(
    context,
    payload: { config: Partial<CaptureConfig> }
  ) {
    const deviceSettings: DeviceSettings = {
      config: {
        platformName:
          payload.config.platformName ?? context.state.config.platformName,
        browser: payload.config.browser ?? context.state.config.browser,
        device: payload.config.device ?? context.state.config.device,
        platformVersion:
          payload.config.platformVersion ?? context.state.config.platformName,
        waitTimeForStartupReload:
          payload.config.waitTimeForStartupReload ??
          context.state.config.waitTimeForStartupReload,
        executablePaths:
          payload.config.executablePaths ??
          context.state.config.executablePaths,
      },
    };

    const result = await new SaveDeviceSettingAction(
      context.rootState.repositoryContainer
    ).saveDeviceSettings(deviceSettings);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    const captureConfig: CaptureConfig = {
      platformName: result.data.config.platformName
        ? result.data.config.platformName
        : context.state.config.platformName,
      browser: result.data.config.browser
        ? result.data.config.browser
        : context.state.config.browser,
      device: result.data.config.device,
      platformVersion: result.data.config.platformVersion,
      waitTimeForStartupReload: result.data.config.waitTimeForStartupReload,
      executablePaths: result.data.config.executablePaths,
    };

    context.commit("setCaptureConfig", { captureConfig });
  },

  /**
   * Replay operations.
   * @param context Action context.
   * @param payload.operations Operations.
   */
  async replayOperations(
    context,
    payload: { operations: Operation[] }
  ): Promise<void> {
    context.commit("setIsReplaying", { isReplaying: true });

    try {
      const initialUrl = payload.operations[0].url;

      const sourceTestResultId = (context.rootState as any).operationHistory
        .testResultInfo.id;

      const pauseCapturingIndex = payload.operations.findIndex((operation) => {
        return operation.type === "pause_capturing";
      });

      const operations =
        pauseCapturingIndex > 0
          ? payload.operations.slice(0, pauseCapturingIndex)
          : payload.operations;

      const replayOption = context.state.replayOption;

      if (replayOption.replayCaptureMode) {
        await context.dispatch("operationHistory/resetHistory", null, {
          root: true,
        });
        await context.dispatch(
          "operationHistory/createTestResult",
          {
            initialUrl,
            name: `${replayOption.testResultName}`,
            source: sourceTestResultId,
          },
          {
            root: true,
          }
        );
      }

      await context.dispatch("startCapture", {
        url: initialUrl,
        config: (context.rootState as any).operationHistory.config,
        operations,
        callbacks: {
          onChangeNumberOfWindows: () => {
            /* Do nothing */
          },
        },
      });
    } finally {
      context.commit("setIsReplaying", { isReplaying: false });
    }
  },

  /**
   * Stop replaying operations.
   * @param context Action context.
   */
  async forceQuitReplay(context) {
    context.dispatch("endCapture");
  },

  /**
   * Switch capturing window.
   * @param context Action context.
   * @param payload.to Destination window handle.
   */
  switchCapturingWindow(context, payload: { to: string }) {
    context.rootState.clientSideCaptureServiceDispatcher.switchCapturingWindow(
      payload.to
    );
  },

  switchCancel(context) {
    context.rootState.clientSideCaptureServiceDispatcher.switchCancel();
  },

  selectCapturingWindow(context) {
    context.rootState.clientSideCaptureServiceDispatcher.selectCapturingWindow();
  },

  /**
   * Go back to previous page on the test target browser.
   * @param context Action context.
   */
  browserBack(context) {
    context.rootState.clientSideCaptureServiceDispatcher.browserBack();
  },

  /**
   * Go forward to next page on the test target browser.
   * @param context Action context.
   */
  browserForward(context) {
    context.rootState.clientSideCaptureServiceDispatcher.browserForward();
  },

  /**
   * Pause capturing.
   * @param context Action context.
   */
  pauseCapturing(context) {
    context.rootState.clientSideCaptureServiceDispatcher.pauseCapturing();
  },

  /**
   * Resume capturing.
   * @param context Action context.
   */
  resumeCapturing(context) {
    context.rootState.clientSideCaptureServiceDispatcher.resumeCapturing();
  },

  /**
   * Run operations.
   * @param context Action context.
   * @param payload.operations Operations.
   */
  async runOperations(context, payload: { operations: Operation[] }) {
    const isReplayCaptureMode = (context.rootState as any).captureControl
      .replayOption.replayCaptureMode;
    const isReplaying = (context.rootState as any).captureControl.isReplaying;
    if (!isReplayCaptureMode && isReplaying) {
      context.commit(
        "operationHistory/selectOperation",
        { sequence: payload.operations[0].sequence },
        {
          root: true,
        }
      );
    }

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });

    const recordedWindowHandles = payload.operations
      .map((operation) => {
        return operation.windowHandle;
      })
      .filter((windowHandle, index, array) => {
        return array.indexOf(windowHandle) === index;
      });

    const replayWindowHandles: string[] = [];

    for (const [index, operation] of payload.operations.entries()) {
      if (index > 0) {
        if (!isReplayCaptureMode && isReplaying) {
          context.commit(
            "operationHistory/selectOperation",
            { sequence: operation.sequence },
            {
              root: true,
            }
          );
        }
        const previous = new TimestampImpl(
          payload.operations[index - 1].timestamp
        );
        const current = new TimestampImpl(payload.operations[index].timestamp);

        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, current.diff(previous));
        });
      }

      const availableWindows =
        context.state.capturingWindowInfo.availableWindows;
      for (const availableWindow of availableWindows) {
        if (!replayWindowHandles.includes(availableWindow.value)) {
          replayWindowHandles.push(availableWindow.value);
        }
      }

      const replayTargetOperation = (() => {
        if (operation.type !== "switch_window") {
          return operation;
        }

        const handleKey = recordedWindowHandles.indexOf(operation.input);

        if (handleKey === -1) {
          return operation;
        }

        const switchHandleId = replayWindowHandles[handleKey];
        return Operation.createFromOtherOperation({
          other: operation,
          overrideParams: { input: switchHandleId },
        });
      })();

      if (payload.operations[index + 1]?.type === "screen_transition") {
        await context.rootState.clientSideCaptureServiceDispatcher.runOperationAndScreenTransition(
          replayTargetOperation
        );
      } else if (replayTargetOperation.type !== "screen_transition") {
        await context.rootState.clientSideCaptureServiceDispatcher.runOperation(
          replayTargetOperation
        );
      }
    }
    context.dispatch("endCapture");
  },

  /**
   * Start capture.
   * @param context Action context.
   * @param payload.url Target URL.
   * @param payload.config Capture config.
   * @param payload.callbacks.onChangeNumberOfWindows
   * The callback when the number of opened windows on the test target browser.
   */
  async startCapture(
    context,
    payload: {
      url: string;
      config: CaptureConfig;
      operations?: Operation[];
      callbacks: {
        onChangeNumberOfWindows: () => void;
      };
    }
  ) {
    const config: CaptureConfig = Object.assign(
      payload.config,
      context.state.config
    );

    const replayOption = (context.rootState as any).captureControl.replayOption;

    const isReplaying = (context.rootState as any).captureControl.isReplaying;

    try {
      const reply =
        await context.rootState.clientSideCaptureServiceDispatcher.startCapture(
          payload.url,
          config,
          {
            onStart: async () => {
              context.dispatch("stopTimer");
              context.dispatch("startTimer");

              context.commit("setCapturing", { isCapturing: true });
              context.commit(
                "operationHistory/clearUnassignedIntentions",
                null,
                {
                  root: true,
                }
              );

              const testOption = (context.rootState as any).captureControl
                .testOption;

              if (testOption.firstTestPurpose) {
                const { sequence } = (context.rootState as any).operationHistory
                  .selectedOperationNote;

                context.commit(
                  "operationHistory/selectOperationNote",
                  {
                    selectedOperationNote: { sequence: null, index: null },
                  },
                  {
                    root: true,
                  }
                );

                await context.dispatch(
                  "operationHistory/saveIntention",
                  {
                    noteEditInfo: {
                      oldSequence: sequence ?? undefined,
                      newSequence: sequence ?? undefined,
                      note: testOption.firstTestPurpose,
                      noteDetails: testOption.firstTestPurposeDetails,
                      shouldTakeScreenshot: false,
                    },
                  },
                  {
                    root: true,
                  }
                );
              }

              if (isReplaying) {
                const operations = payload.operations;
                context.dispatch("runOperations", { operations });
              }
            },
            onGetOperation: async (capturedOperation: CapturedOperation) => {
              if (capturedOperation.type === "switch_window") {
                context.commit("setCurrentWindow", {
                  currentWindow: capturedOperation.input,
                });
              }

              if (!replayOption.replayCaptureMode && isReplaying) {
                return;
              }

              await context.dispatch(
                "operationHistory/registerOperation",
                {
                  operation: capturedOperation,
                },
                { root: true }
              );
            },
            onGetScreenTransition: async (
              capturedScreenTransition: CapturedScreenTransition
            ) => {
              if (!replayOption.replayCaptureMode && isReplaying) {
                return;
              }
              const capturedOperation = {
                input: "",
                type: "screen_transition",
                elementInfo: null,
                title: capturedScreenTransition.title,
                url: capturedScreenTransition.url,
                imageData: capturedScreenTransition.imageData,
                windowHandle: capturedScreenTransition.windowHandle,
                timestamp: capturedScreenTransition.timestamp,
                screenElements: [],
                pageSource: capturedScreenTransition.pageSource,
                inputElements: [],
              };

              await context.dispatch(
                "operationHistory/registerOperation",
                {
                  operation: capturedOperation,
                },
                { root: true }
              );
            },
            onChangeBrowserHistory: (browserStatus: {
              canGoBack: boolean;
              canGoForward: boolean;
            }) => {
              console.log(JSON.stringify(browserStatus));
              context.commit("setCanDoBrowserBack", {
                canDoBrowserBack: browserStatus.canGoBack,
              });
              context.commit("setCanDoBrowserForward", {
                canDoBrowserForward: browserStatus.canGoForward,
              });
            },
            onUpdateAvailableWindows: (updatedWindowsInfo: {
              windowHandles: string[];
              currentWindowHandle: string;
            }) => {
              if (updatedWindowsInfo.windowHandles.length === 0) {
                return;
              }

              context.dispatch("updateWindowHandles", {
                availableWindowHandles: updatedWindowsInfo.windowHandles,
              });

              context.commit("setAvailableWindows", {
                availableWindows: context.state.windowHandles.filter(
                  (windowHandle: WindowHandle) => {
                    return windowHandle.available;
                  }
                ),
              });

              context.commit("setCurrentWindow", {
                currentWindow: updatedWindowsInfo.currentWindowHandle,
              });

              if (updatedWindowsInfo.windowHandles.length > 1) {
                payload.callbacks.onChangeNumberOfWindows();
              }
            },
            onChangeAlertVisibility: (data: { isVisible: boolean }) => {
              context.commit("setAlertVisible", data);
            },
            onPause: () => {
              context.commit("setPaused", { isPaused: true });
            },
            onResume: () => {
              context.commit("setPaused", { isPaused: false });
            },
          },
          isReplaying
        );

      if (reply.error) {
        let errorCode: string;
        if (isReplaying) {
          errorCode =
            reply.error.code === "unknown_error"
              ? "run_operations_failed"
              : reply.error.code;
        } else {
          errorCode =
            reply.error.code === "unknown_error"
              ? "capture_failed"
              : reply.error.code;
        }
        const errorMessage = context.rootGetters.message(
          `error.capture_control.${errorCode}`
        );
        throw new Error(errorMessage);
      }
    } finally {
      context.dispatch("endCapture");

      context.commit("setCapturing", { isCapturing: false });
      context.commit("setPaused", { isPaused: false });
      context.commit("setCurrentWindow", { currentWindow: "" });
      context.commit("setAvailableWindows", { availableWindows: [] });
    }
  },

  /**
   * End capture.
   * @param context Action context.
   */
  endCapture(context) {
    context.dispatch("stopTimer");
    context.rootState.clientSideCaptureServiceDispatcher.endCapture();
  },

  /**
   * Start the timer to measure capture time.
   * @param context Action context.
   */
  startTimer(context) {
    context.state.timer.start();
  },

  /**
   * Stop the timer to measure capture time.
   * @param context Action context.
   */
  stopTimer(context) {
    context.state.timer.stop();
  },

  /**
   * Reset the timer to measure capture time.
   * @param context Action context.
   * @param payload.millis initial time.
   */
  resetTimer(context, payload?: { millis: number }) {
    context.state.timer.reset(payload?.millis);
  },

  /**
   * Take a screenshot of current screen on the test target browser.
   * @param context Action context.
   * @returns Screenshot.(base64)
   */
  async takeScreenshot(context) {
    if (!context.state.isCapturing) {
      return;
    }

    return await context.rootState.clientSideCaptureServiceDispatcher.takeScreenshot();
  },
};

export default actions;
