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
import {
  AutofillConditionGroup,
  AutoOperation,
  OperationForReplay,
} from "@/lib/operationHistory/types";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { AutofillTestAction } from "@/lib/operationHistory/actions/AutofillTestAction";
import { OperationHistoryState } from "../operationHistory/index";
import {
  convertTestStepOperation,
  convertNote,
} from "@/lib/common/replyDataConverter";
import { ServiceResult, CaptureEventListeners } from "latteart-client";
import {
  TestStep,
  TestStepNote,
  CoverageSource,
  Operation,
  CaptureConfig,
} from "latteart-client";
import { NoteEditInfo } from "@/lib/captureControl/types";
import { DeviceSettings } from "@/lib/common/settings/Settings";

const actions: ActionTree<CaptureControlState, RootState> = {
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
    const captureCl = context.rootState.captureClService;

    const result = await captureCl.recognizeDevices(payload.platformName);

    if (result.isFailure()) {
      const errorMessage = context.rootGetters.message(
        `error.capture_control.${result.error.errorCode}`
      );
      throw new Error(errorMessage);
    }

    return result.data ?? [];
  },

  /**
   * Replay operations.
   * @param context Action context.
   * @param payload.operations Operations.
   */
  async replayOperations(
    context,
    payload: {
      initialUrl: string;
      filterPredicate?: (_: TestStep, index: number) => boolean;
    }
  ): Promise<void> {
    context.commit("setIsReplaying", { isReplaying: true });

    try {
      const operationHistoryState: OperationHistoryState = (
        context.rootState as any
      ).operationHistory;

      const parentTestResultId = operationHistoryState.testResultInfo.id;

      const operations = await (async () => {
        const collectTestStepsResult = await context.rootState.repositoryService
          .createTestResultAccessor(parentTestResultId)
          .collectTestSteps();

        if (collectTestStepsResult.isFailure()) {
          const errorMessage = context.rootGetters.message(
            `error.capture_control.run_operations_failed`
          );
          throw new Error(errorMessage);
        }
        return collectTestStepsResult.data
          .filter(payload.filterPredicate ?? (() => true))
          .map(({ operation }) => operation);
      })();

      const replayOption = context.state.replayOption;
      const destTestResult = replayOption.resultSavingEnabled
        ? await (async () => {
            try {
              await context.dispatch("operationHistory/resetHistory", null, {
                root: true,
              });

              await context.dispatch(
                "operationHistory/createTestResult",
                {
                  initialUrl: payload.initialUrl,
                  name: replayOption.testResultName,
                  parentTestResultId,
                },
                {
                  root: true,
                }
              );

              const operationHistoryState: OperationHistoryState = (
                context.rootState as any
              ).operationHistory;

              return context.rootState.repositoryService.createTestResultAccessor(
                operationHistoryState.testResultInfo.id
              );
            } catch (error) {
              const errorMessage = context.rootGetters.message(
                `error.capture_control.run_operations_failed`
              );
              throw new Error(errorMessage);
            }
          })()
        : undefined;

      const captureCl = context.rootState.captureClService;
      const client = captureCl.createCaptureClient({
        testResult: destTestResult,
        config: context.rootState.deviceSettings,
        eventListeners: await context.dispatch("createCaptureEventListeners"),
      });

      const session = await (async () => {
        const startCaptureResult = await client.startCapture(
          payload.initialUrl,
          {
            compressScreenshots:
              context.rootState.projectSettings.config.imageCompression
                .isEnabled,
          }
        );
        if (startCaptureResult.isFailure()) {
          const errorMessage = context.rootGetters.message(
            `error.capture_control.run_operations_failed`
          );
          throw new Error(errorMessage);
        }
        return startCaptureResult.data;
      })();

      context.commit("setCaptureSession", { session });

      const preScript = async (_: unknown, index: number) => {
        context.commit(
          "operationHistory/selectOperation",
          { sequence: index + 1 },
          { root: true }
        );
      };

      const runOperationsResult = await session
        .automate({ preScript })
        .runOperations(...operations);

      if (runOperationsResult.isFailure()) {
        const errorMessage = context.rootGetters.message(
          `error.capture_control.run_operations_failed`
        );
        throw new Error(errorMessage);
      }
    } finally {
      context.dispatch("endCapture");
      context.commit("setIsReplaying", { isReplaying: false });
    }
  },

  async runAutoOperations(
    context,
    payload: { operations: AutoOperation[] }
  ): Promise<void> {
    if (!context.state.captureSession) {
      return;
    }

    const operations = convertOperationsForReplay(payload.operations);

    const result = await context.state.captureSession
      .automate({ interval: 1000 })
      .runOperations(...operations);

    if (result.isFailure()) {
      const errorMessage = context.rootGetters.message(
        `error.capture_control.run_auto_operations_failed`
      );
      throw new Error(errorMessage);
    }
  },

  /**
   * Stop replaying operations.
   * @param context Action context.
   */
  async forceQuitReplay(context) {
    context.dispatch("endCapture");
    context.commit("setIsReplaying", { isReplaying: false });
  },

  /**
   * Switch capturing window.
   * @param context Action context.
   * @param payload.to Destination window handle.
   */
  switchCapturingWindow(context, payload: { to: string }) {
    context.state.captureSession?.switchWindow(payload.to);
  },

  switchCancel(context) {
    context.state.captureSession?.unprotectWindows();
  },

  selectCapturingWindow(context) {
    context.state.captureSession?.protectWindows();
  },

  /**
   * Go back to previous page on the test target browser.
   * @param context Action context.
   */
  browserBack(context) {
    context.state.captureSession?.navigate().back();
  },

  /**
   * Go forward to next page on the test target browser.
   * @param context Action context.
   */
  browserForward(context) {
    context.state.captureSession?.navigate().forward();
  },

  /**
   * Pause capturing.
   * @param context Action context.
   */
  pauseCapturing(context) {
    context.state.captureSession?.pauseCapture();
  },

  /**
   * Resume capturing.
   * @param context Action context.
   */
  resumeCapturing(context) {
    context.state.captureSession?.resumeCapture();
  },

  async autofill(
    context,
    payload: { autofillConditionGroup: AutofillConditionGroup }
  ) {
    const targetAndValues = payload.autofillConditionGroup.inputValueConditions
      .filter((inputValue) => inputValue.isEnabled)
      .map((condition) => {
        return {
          target: {
            locatorType: condition.locatorType,
            locator: condition.locator,
            locatorMatchType: condition.locatorMatchType,
          },
          value: condition.inputValue,
        };
      });

    await context.state.captureSession
      ?.automate()
      .enterValues(...targetAndValues);
  },

  openAutofillDialog(
    context,
    payload: {
      targetPage: { title: string; url: string };
      beforeOperation: OperationForGUI;
    }
  ) {
    const openAutofillSelectDialogCallBack = () => {
      if (
        context.rootState.projectSettings.config.autofillSetting &&
        context.rootState.viewSettings.autofill.autoPopupSelectionDialog &&
        context.rootState.projectSettings.config.autofillSetting.conditionGroups
          .length > 0
      ) {
        const matchGroup =
          new AutofillTestAction().extractMatchingAutofillConditionGroup(
            context.rootState.projectSettings.config.autofillSetting
              .conditionGroups,
            payload.targetPage.title,
            payload.targetPage.url
          );
        if (matchGroup.isFailure()) {
          throw new Error();
        }
        context.commit(
          "captureControl/setAutofillSelectDialog",
          {
            dialogData: {
              autofillConditionGroups: matchGroup.data,
              message: context.rootGetters.message(
                "autofill-select-dialog.message"
              ),
            },
          },
          { root: true }
        );
      } else {
        context.commit(
          "captureControl/setAutofillSelectDialog",
          {
            autofillConditionGroups: null,
          },
          { root: true }
        );
      }
    };

    if (
      context.rootState.viewSettings.autofill.autoPopupRegistrationDialog &&
      payload.beforeOperation &&
      (payload.beforeOperation?.inputElements ?? []).length > 0
    ) {
      context.commit(
        "captureControl/setAutofillRegisterDialog",
        {
          title: payload.beforeOperation.title,
          url: payload.beforeOperation.url,
          message: context.rootGetters.message(
            "autofill-register-dialog.message"
          ),
          inputElements: payload.beforeOperation.inputElements?.map(
            (element) => {
              return {
                ...element,
                xpath: element.xpath.toLowerCase(),
              };
            }
          ),
          callback: openAutofillSelectDialogCallBack,
        },
        { root: true }
      );
    } else {
      context.commit("captureControl/setAutofillRegisterDialog", null, {
        root: true,
      });
      openAutofillSelectDialogCallBack();
    }
  },

  createCaptureEventListeners(
    context,
    payload: {
      callbacks?: {
        onEnd?: (error?: Error) => void;
      };
    } = {}
  ) {
    const postRegisterOperation = async (data: {
      id: string;
      operation: OperationForGUI;
      coverageSource: CoverageSource;
    }) => {
      const { id, operation, coverageSource } = data;

      const operationHistoryState: OperationHistoryState = (
        context.rootState as any
      ).operationHistory;

      context.commit(
        "operationHistory/addTestStepId",
        { testStepId: id },
        { root: true }
      );
      const sequence = operationHistoryState.testStepIds.indexOf(id) + 1;

      operation.sequence = sequence;

      context.commit(
        "operationHistory/addHistory",
        {
          entry: { operation, intention: null, bugs: null, notices: null },
        },
        { root: true }
      );
      context.commit(
        "operationHistory/registerCoverageSource",
        {
          coverageSource,
        },
        { root: true }
      );
      context.commit(
        "operationHistory/setCanUpdateModels",
        {
          canUpdateModels: true,
        },
        { root: true }
      );
    };

    const callbacks = {
      onEnd: () => undefined,
      ...payload.callbacks,
    };

    const captureEventListeners: CaptureEventListeners = {
      onAddTestStep: async (testStep: {
        id: string;
        operation: Operation;
        coverageSource: CoverageSource;
      }) => {
        const operationHistoryState: OperationHistoryState = (
          context.rootState as any
        ).operationHistory;
        const beforeOperation =
          operationHistoryState.history[
            operationHistoryState.history.length - 1
          ]?.operation;

        await postRegisterOperation({
          ...testStep,
          operation: convertTestStepOperation(testStep.operation),
        });

        if (testStep.operation.type === "screen_transition") {
          const { title, url } = testStep.operation;

          context.dispatch("openAutofillDialog", {
            targetPage: { title, url },
            beforeOperation,
          });
        }
      },
      onAddNote: async (testStepNote: TestStepNote) => {
        const operationHistoryState: OperationHistoryState = (
          context.rootState as any
        ).operationHistory;
        const sequence =
          operationHistoryState.testStepIds.indexOf(testStepNote.testStep.id) +
          1;

        context.commit(
          "operationHistory/setNotice",
          {
            notice: convertNote(testStepNote.note, sequence),
            index: testStepNote.testStep.notices.length - 1,
          },
          { root: true }
        );
        context.commit(
          "operationHistory/setCanUpdateModels",
          { canUpdateModels: true },
          { root: true }
        );
      },
      onAddTestPurpose: async (testStepNote: TestStepNote) => {
        const operationHistoryState: OperationHistoryState = (
          context.rootState as any
        ).operationHistory;
        const sequence =
          operationHistoryState.testStepIds.indexOf(testStepNote.testStep.id) +
          1;

        context.commit(
          "operationHistory/setTestPurpose",
          {
            intention: convertNote(testStepNote.note, sequence),
          },
          { root: true }
        );
        context.commit(
          "operationHistory/setCanUpdateModels",
          { canUpdateModels: true },
          { root: true }
        );
      },
      onAddWindow: async (windowHandle: string) => {
        context.commit(
          "operationHistory/addWindow",
          { windowHandle },
          { root: true }
        );
      },
      onPause: async () => {
        context.commit("setPaused", { isPaused: true });
      },
      onResume: async () => {
        context.commit("setPaused", { isPaused: false });
      },
      onEnd: async (result: ServiceResult<void>) => {
        context.dispatch("postEndCapture");

        if (result.isFailure()) {
          const errorMessage = context.rootGetters.message(
            `error.capture_control.${result.error.errorCode}`
          );
          callbacks.onEnd(new Error(errorMessage));
          return;
        }

        callbacks.onEnd();
      },
    };

    return captureEventListeners;
  },

  /**
   * Start capture.
   * @param context Action context.
   * @param payload.url Target URL.
   * @param payload.config Capture config.
   * The callback when the number of opened windows on the test target browser.
   */
  async startCapture(
    context,
    payload: {
      url: string;
      config: DeviceSettings;
      callbacks: {
        onEnd: (error?: Error) => void;
      };
    }
  ) {
    const config: CaptureConfig = Object.assign(
      payload.config,
      context.rootState.deviceSettings
    );

    try {
      const operationHistoryState: OperationHistoryState = (
        context.rootState as any
      ).operationHistory;

      const captureCl = context.rootState.captureClService;
      const testResult =
        context.rootState.repositoryService.createTestResultAccessor(
          operationHistoryState.testResultInfo.id
        );
      const client = captureCl.createCaptureClient({
        testResult,
        config,
        eventListeners: await context.dispatch("createCaptureEventListeners", {
          callbacks: payload.callbacks,
        }),
      });

      const result = await client.startCapture(payload.url, {
        compressScreenshots:
          context.rootState.projectSettings.config.imageCompression.isEnabled,
      });

      if (result.isFailure()) {
        const errorMessage = context.rootGetters.message(
          `error.capture_control.${result.error.errorCode}`
        );
        payload.callbacks.onEnd(new Error(errorMessage));
        return;
      }

      const session = result.data;
      const testOption = (context.rootState as any).captureControl.testOption;

      if (testOption.firstTestPurpose) {
        context.commit(
          "operationHistory/selectOperationNote",
          { selectedOperationNote: { sequence: null, index: null } },
          { root: true }
        );

        session.setNextTestPurpose({
          value: testOption.firstTestPurpose,
          details: testOption.firstTestPurposeDetails,
        });
      }

      context.dispatch("stopTimer");
      context.dispatch("startTimer");

      context.commit("setCapturing", { isCapturing: true });
      context.commit("setCaptureSession", { session });
    } catch (error) {
      context.dispatch("endCapture");
    }
  },

  /**
   * End capture.
   * @param context Action context.
   */
  endCapture(context) {
    if (!context.state.captureSession) {
      return;
    }

    try {
      context.state.captureSession.endCapture();
    } finally {
      context.dispatch("postEndCapture");
    }
  },

  postEndCapture(context) {
    context.dispatch("stopTimer");
    context.commit("setCapturing", { isCapturing: false });
    context.commit("setPaused", { isPaused: false });
    context.commit("deleteCaptureSession");
  },

  takeNote(context, payload: { noteEditInfo: NoteEditInfo }) {
    const note = {
      value: payload.noteEditInfo.note,
      details: payload.noteEditInfo.noteDetails,
      tags: payload.noteEditInfo.tags,
    };

    const option = {
      screenshot: payload.noteEditInfo.shouldTakeScreenshot,
      compressScreenshot:
        payload.noteEditInfo.shouldTakeScreenshot &&
        context.rootState.projectSettings.config.imageCompression.isEnabled,
    };

    context.state.captureSession?.takeNote(note, option);
  },

  setNextTestPurpose(context, payload: { noteEditInfo: NoteEditInfo }) {
    if (context.state.captureSession) {
      context.state.captureSession.setNextTestPurpose({
        value: payload.noteEditInfo.note,
        details: payload.noteEditInfo.noteDetails,
      });
    }
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
};

export default actions;

function convertOperationsForReplay(operations: OperationForReplay[]) {
  const pauseCapturingIndex = operations.findIndex((operation) => {
    return operation.type === "pause_capturing";
  });

  const tempOperations =
    pauseCapturingIndex > 0
      ? operations.slice(0, pauseCapturingIndex)
      : operations;

  const a = tempOperations.filter((tempOperation) => {
    return !(
      tempOperation.type === "click" &&
      tempOperation.elementInfo?.attributes.type === "date"
    );
  });

  return a;
}
