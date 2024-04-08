/**
 * Copyright 2023 NTT Corporation.
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

import Timer from "@/lib/common/Timer";
import { convertInputValue } from "@/lib/common/util";
import type { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { AutofillTestAction } from "@/lib/operationHistory/actions/AutofillTestAction";
import type { AutoOperation, AutofillConditionGroup } from "@/lib/operationHistory/types";
import type {
  CaptureConfig,
  CaptureEventListeners,
  CaptureSession,
  Operation,
  ServiceResult,
  TestStep,
  TestStepNote
} from "latteart-client";
import { defineStore } from "pinia";
import { useRootStore } from "./root";
import { createVideoRecorder, type VideoRecorder } from "@/lib/captureControl/videoRecording";
import { convertNote, convertTestStepOperation } from "@/lib/common/replyDataConverter";
import type { NoteEditInfo } from "@/lib/captureControl/types";
import { useOperationHistoryStore } from "./operationHistory";
import InputValueTable from "@/lib/operationHistory/InputValueTable";

/**
 * Store for capture control.
 */
export type CaptureControlState = {
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
   * Test result name.
   */
  testResultName: string;

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
    autofillConditionGroups: AutofillConditionGroup[] | null;
    message?: string;
  } | null;

  /**
   * Dialogg to register autofill settings.
   */
  autofillRegisterDialogData: {
    title: string;
    url: string;
    message: string;
    inputElements: {
      xpath: string;
      attributes: { [key: string]: string };
      inputValue: string;
      iframeIndex?: number;
    }[];
    callback: () => void;
  } | null;

  /**
   * Whether window selector dialog is opened or not.
   */
  isWindowSelectorDialogOpened: boolean;

  /**
   * Dialog to display completion message.
   */
  completionDialogData: { title: string; message: string } | null;
};

export const useCaptureControlStore = defineStore("captureControl", {
  state: (): CaptureControlState => ({
    isCapturing: false,
    isReplaying: false,
    isResuming: false,
    isPaused: false,
    url: "",
    testResultName: "",
    testOption: {
      firstTestPurpose: "",
      firstTestPurposeDetails: "",
      shouldRecordTestPurpose: false
    },
    replayOption: {
      testResultName: "",
      resultSavingEnabled: false,
      comparisonEnabled: false
    },
    autofillSelectDialogData: null,
    autofillRegisterDialogData: null,
    timer: new Timer(),
    captureSession: null,
    isWindowSelectorDialogOpened: false,
    completionDialogData: null
  }),
  getters: {
    /**
     * Whether the test target URL is valid or not.
     * @param state State.
     * @returns 'true': The test target URL is valid, 'false': The test target URL is not valid.
     */
    urlIsValid: (state) => {
      try {
        new URL(state.url);
        return true;
      } catch (error) {
        return false;
      }
    }
  },
  actions: {
    /**
     * Acquires a list of devices connected to the terminal where the recording agent is located.
     * @param context Action context.
     * @param payload.platformName Platform name.
     */
    async recognizeDevices(payload: { platformName: string }): Promise<
      {
        deviceName: string;
        modelNumber: string;
        osVersion: string;
      }[]
    > {
      const rootStore = useRootStore();
      const captureCl = rootStore.captureClService;

      const result = await captureCl.recognizeDevices(payload.platformName);

      if (result.isFailure()) {
        const errorMessage = rootStore.message(`error.capture_control.${result.error.errorCode}`);
        throw new Error(errorMessage);
      }

      return result.data ?? [];
    },

    /**
     * Replay operations.
     * @param context Action context.
     * @param payload.operations Operations.
     */
    async replayOperations(payload: {
      initialUrl: string;
      filterPredicate?: (_: TestStep, index: number) => boolean;
    }): Promise<void> {
      this.isReplaying = true;

      try {
        const rootStore = useRootStore();

        if (!rootStore.repositoryService) {
          throw new Error("repository service is not active.");
        }

        const repositoryService = rootStore.repositoryService;

        const operationHistoryStore = useOperationHistoryStore();

        const parentTestResultId = operationHistoryStore.testResultInfo.id;

        const operations = await (async () => {
          const collectTestStepsResult = await repositoryService
            .createTestResultAccessor(parentTestResultId)
            .collectTestSteps();

          if (collectTestStepsResult.isFailure()) {
            const errorMessage = rootStore.message(`error.capture_control.run_operations_failed`);
            throw new Error(errorMessage);
          }
          return collectTestStepsResult.data
            .filter(payload.filterPredicate ?? (() => true))
            .map(({ operation }) => operation);
        })();

        const replayOption = this.replayOption;
        const destTestResult = replayOption.resultSavingEnabled
          ? await (async () => {
              try {
                operationHistoryStore.clearTestResult();
                operationHistoryStore.storingTestResultInfos = [];
                operationHistoryStore.clearScreenTransitionDiagramGraph();
                operationHistoryStore.clearElementCoverages();
                operationHistoryStore.inputValueTable = new InputValueTable();

                await operationHistoryStore.createTestResult({
                  initialUrl: payload.initialUrl,
                  name: replayOption.testResultName,
                  parentTestResultId
                });

                return repositoryService.createTestResultAccessor(
                  operationHistoryStore.testResultInfo.id
                );
              } catch (error) {
                const errorMessage = rootStore.message(
                  `error.capture_control.run_operations_failed`
                );
                throw new Error(errorMessage);
              }
            })()
          : undefined;

        const captureCl = rootStore.captureClService;
        const client = captureCl.createCaptureClient({
          testResult: destTestResult,
          config: {
            ...rootStore.deviceSettings,
            captureArch: rootStore.projectSettings.config.experimentalFeatureSetting.captureArch
          },
          eventListeners: this.createCaptureEventListeners()
        });

        const session = await (async () => {
          const startCaptureResult = await client.startCapture(payload.initialUrl, {
            compressScreenshots:
              rootStore.projectSettings.config.captureMediaSetting.imageCompression.format ===
              "webp"
          });
          if (startCaptureResult.isFailure()) {
            const errorMessage = rootStore.message(`error.capture_control.run_operations_failed`);
            throw new Error(errorMessage);
          }
          return startCaptureResult.data;
        })();

        this.captureSession = session;

        const preScript = async (_: unknown, index: number) => {
          operationHistoryStore.selectedOperationInfo = { sequence: index + 1, doScroll: false };
        };

        const runOperationsResult = await session
          .automate({ preScript })
          .runOperations(...operations);

        if (runOperationsResult.isFailure()) {
          const elementInfo = runOperationsResult.error.variables?.elementInfo
            ? JSON.parse(runOperationsResult.error.variables.elementInfo)
            : null;
          const operation = {
            title: runOperationsResult.error.variables?.title.substring(0, 60) ?? "",
            tag: elementInfo?.tagname ?? "",
            tagname: elementInfo?.attributes?.name ?? "",
            text: elementInfo?.text ? elementInfo.text.substring(0, 60) : "",
            type: runOperationsResult.error.variables?.type ?? "",
            input: convertInputValue(
              elementInfo,
              runOperationsResult.error.variables?.input ?? ""
            ).substring(0, 60)
          };
          const errorMessage = rootStore.message(
            `error.capture_control.run_operations_failed_details`,
            {
              title: operation.title,
              tag: operation.tag,
              tagname: operation.tagname,
              text: operation.text,
              type: operation.type,
              input: operation.input
            }
          );
          throw new Error(errorMessage);
        }
      } finally {
        this.endCapture();
        this.isReplaying = false;
      }
    },

    async runAutoOperations(payload: { operations: AutoOperation[] }): Promise<void> {
      if (!this.captureSession) {
        return;
      }

      const result = await this.captureSession
        .automate({ interval: 1000 })
        .runOperations(...payload.operations);

      if (result.isFailure()) {
        const elementInfo = result.error.variables?.elementInfo
          ? JSON.parse(result.error.variables.elementInfo)
          : null;
        const operation = {
          title: result.error.variables?.title.substring(0, 60) ?? "",
          tag: elementInfo?.tagname ?? "",
          tagname: elementInfo?.attributes?.name ?? "",
          text: elementInfo?.text ? elementInfo.text.substring(0, 60) : "",
          type: result.error.variables?.type ?? "",
          input: convertInputValue(elementInfo, result.error.variables?.input ?? "").substring(
            0,
            60
          )
        };

        const rootStore = useRootStore();

        const errorMessage = rootStore.message(
          `error.capture_control.run_operations_failed_details`,
          {
            title: operation.title,
            tag: operation.tag,
            tagname: operation.tagname,
            text: operation.text,
            type: operation.type,
            input: operation.input
          }
        );
        throw new Error(errorMessage);
      }
    },

    /**
     * Stop replaying operations.
     * @param context Action context.
     */
    async forceQuitReplay() {
      this.endCapture();
      this.isReplaying = false;
    },

    /**
     * Switch capturing window.
     * @param context Action context.
     * @param payload.to Destination window handle.
     */
    switchCapturingWindow(payload: { to: string }) {
      this.captureSession?.switchWindow(payload.to);
    },

    /**
     * Go back to previous page on the test target browser.
     * @param context Action context.
     */
    browserBack() {
      this.captureSession?.navigate().back();
    },

    /**
     * Go forward to next page on the test target browser.
     * @param context Action context.
     */
    browserForward() {
      this.captureSession?.navigate().forward();
    },

    /**
     * Pause capturing.
     * @param context Action context.
     */
    pauseCapturing() {
      this.captureSession?.pauseCapture();
    },

    /**
     * Resume capturing.
     * @param context Action context.
     */
    resumeCapturing() {
      this.captureSession?.resumeCapture();
    },

    async autofill(payload: { autofillConditionGroup: AutofillConditionGroup }) {
      const targetAndValues = payload.autofillConditionGroup.inputValueConditions
        .filter((inputValue) => inputValue.isEnabled)
        .map((condition) => {
          return {
            target: {
              locatorType: condition.locatorType,
              locator: condition.locator,
              locatorMatchType: condition.locatorMatchType,
              iframeIndex: condition.iframeIndex
            },
            value: condition.inputValue
          };
        });

      await this.captureSession?.automate().enterValues(...targetAndValues);
    },

    openAutofillDialog(payload: {
      targetPage: { title: string; url: string };
      beforeOperation: OperationForGUI;
    }) {
      const rootStore = useRootStore();

      const openAutofillSelectDialogCallBack = () => {
        if (
          rootStore.projectSettings.config.autofillSetting &&
          rootStore.viewSettings.autofill.autoPopupSelectionDialog &&
          rootStore.projectSettings.config.autofillSetting.conditionGroups.length > 0
        ) {
          const matchGroup = new AutofillTestAction().extractMatchingAutofillConditionGroup(
            rootStore.projectSettings.config.autofillSetting.conditionGroups,
            payload.targetPage.title,
            payload.targetPage.url
          );
          if (matchGroup.isFailure()) {
            throw new Error();
          }
          this.autofillSelectDialogData = {
            autofillConditionGroups: matchGroup.data,
            message: rootStore.message("autofill-select-dialog.message")
          };
        } else {
          this.autofillSelectDialogData = {
            autofillConditionGroups: null
          };
        }
      };

      if (
        rootStore.viewSettings.autofill.autoPopupRegistrationDialog &&
        payload.beforeOperation &&
        (payload.beforeOperation?.inputElements ?? []).length > 0
      ) {
        this.autofillRegisterDialogData = {
          title: payload.beforeOperation.title,
          url: payload.beforeOperation.url,
          message: rootStore.message("autofill-register-dialog.message"),
          inputElements:
            payload.beforeOperation.inputElements?.map((element) => {
              return {
                ...element,
                xpath: element.xpath.toLowerCase(),
                iframeIndex: element.iframe?.index,
                attributes: element.attributes,
                inputValue:
                  element.tagname === "INPUT" &&
                  ["checkbox", "radio"].includes(element.attributes.type)
                    ? element.checked === true
                      ? "on"
                      : "off"
                    : element.value ?? ""
              };
            }) ?? [],
          callback: openAutofillSelectDialogCallBack
        };
      } else {
        this.autofillRegisterDialogData = null;
        openAutofillSelectDialogCallBack();
      }
    },

    createCaptureEventListeners(
      payload: {
        callbacks?: {
          onEnd?: (error?: Error) => void;
        };
        videoRecorder?: VideoRecorder;
      } = {}
    ) {
      const rootStore = useRootStore();
      const operationHistoryStore = useOperationHistoryStore();

      const postRegisterOperation = async (data: { id: string; operation: OperationForGUI }) => {
        const { id, operation } = data;

        await payload.videoRecorder?.updateVideo();

        operationHistoryStore.testStepIds.push(id);
        const sequence = operationHistoryStore.testStepIds.indexOf(id) + 1;

        operation.sequence = sequence;

        operationHistoryStore.addHistory({
          entry: { operation, intention: null, bugs: null, notices: null }
        });
        operationHistoryStore.canUpdateModels = true;
      };

      const callbacks = {
        onEnd: () => undefined,
        ...payload.callbacks
      };

      const captureEventListeners: CaptureEventListeners = {
        onAddTestStep: async (testStep: { id: string; operation: Operation }) => {
          const beforeOperation =
            operationHistoryStore.history[operationHistoryStore.history.length - 1]?.operation;

          await postRegisterOperation({
            ...testStep,
            operation: convertTestStepOperation(testStep.operation)
          });

          if (testStep.operation.type === "screen_transition") {
            const { title, url } = testStep.operation;
            this.openAutofillDialog({
              targetPage: { title, url },
              beforeOperation
            });
          }
        },
        onAddNote: async (testStepNote: TestStepNote) => {
          const sequence = operationHistoryStore.testStepIds.indexOf(testStepNote.testStep.id) + 1;

          operationHistoryStore.setNotice({
            notice: convertNote(testStepNote.note, sequence),
            index: testStepNote.testStep.notices.length - 1
          });
          operationHistoryStore.canUpdateModels = true;
        },
        onAddTestPurpose: async (testStepNote: TestStepNote) => {
          const sequence = operationHistoryStore.testStepIds.indexOf(testStepNote.testStep.id) + 1;

          operationHistoryStore.setTestPurpose({
            intention: convertNote(testStepNote.note, sequence)
          });
          operationHistoryStore.canUpdateModels = true;
        },
        onAddWindow: async (windowHandle: string, title: string) => {
          operationHistoryStore.addWindow({ windowHandle, title });
        },
        onPause: async () => {
          this.isPaused = true;
        },
        onResume: async () => {
          this.isPaused = false;
        },
        onUpdateWindowTitle: async (windowHandle: string, title: string) => {
          operationHistoryStore.updateWindowTitle({ windowHandle, title });
        },
        onCurrentWindowHostNameChanged: async () => {
          this.isWindowSelectorDialogOpened = true;
        },
        onEnd: async (result: ServiceResult<void>) => {
          this.postEndCapture();

          if (result.isFailure()) {
            const errorMessage = rootStore.message(
              `error.capture_control.${result.error.errorCode}`
            );
            callbacks.onEnd(new Error(errorMessage));
            return;
          }

          callbacks.onEnd();
        }
      };

      return captureEventListeners;
    },

    /**
     * Start capture.
     * @param context Action context.
     * @param payload.url Target URL.
     * @param payload.callbacks Callbacks.
     */
    async startCapture(payload: {
      url: string;
      callbacks: {
        onEnd: (error?: Error) => void;
      };
    }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const operationHistoryStore = useOperationHistoryStore();

      const config: CaptureConfig = {
        ...rootStore.deviceSettings,
        captureArch: rootStore.projectSettings.config.experimentalFeatureSetting.captureArch
      };

      const testResult = rootStore.repositoryService.createTestResultAccessor(
        operationHistoryStore.testResultInfo.id
      );
      const mediaType = rootStore.projectSettings.config.captureMediaSetting.mediaType;

      const videoRecorder =
        (mediaType === "video" || config.captureArch === "push") && config.platformName === "PC"
          ? createVideoRecorder(testResult)
          : undefined;

      const captureCl = rootStore.captureClService;
      const client = captureCl.createCaptureClient({
        testResult,
        config,
        eventListeners: this.createCaptureEventListeners({
          callbacks: payload.callbacks,
          videoRecorder
        })
      });

      const testOption = this.testOption;
      const firstTestPurpose = testOption.shouldRecordTestPurpose
        ? {
            value: testOption.firstTestPurpose,
            details: testOption.firstTestPurposeDetails
          }
        : undefined;

      const result = await client.startCapture(payload.url, {
        compressScreenshots:
          rootStore.projectSettings.config.captureMediaSetting.imageCompression.format === "webp",
        firstTestPurpose
      });

      if (result.isFailure()) {
        const errorMessage = rootStore.message(`error.capture_control.${result.error.errorCode}`);
        payload.callbacks.onEnd(new Error(errorMessage));
        return;
      }

      const session = result.data;

      this.stopTimer();
      this.startTimer();

      this.isCapturing = true;
      this.captureSession = session;

      if (videoRecorder) {
        const startRecordingResult = await videoRecorder.startRecording();

        if (startRecordingResult.isFailure()) {
          const errorMessage = rootStore.message(
            startRecordingResult.error.messageKey,
            startRecordingResult.error.variables ?? {}
          );
          payload.callbacks.onEnd(new Error(errorMessage));
          return;
        }

        const recordingVideo = videoRecorder.recordingVideo;

        if (recordingVideo) {
          session.setRecordingVideo(recordingVideo);
        }
      }
    },

    /**
     * End capture.
     * @param context Action context.
     */
    endCapture() {
      if (!this.captureSession) {
        return;
      }

      try {
        this.captureSession.endCapture();
      } finally {
        this.postEndCapture();
      }
    },

    postEndCapture() {
      this.stopTimer();
      this.isCapturing = false;
      this.isWindowSelectorDialogOpened = false;
      this.isPaused = false;
      this.captureSession = null;
    },

    takeNote(payload: { noteEditInfo: NoteEditInfo }) {
      const rootStore = useRootStore();

      const note = {
        value: payload.noteEditInfo.note,
        details: payload.noteEditInfo.noteDetails,
        tags: payload.noteEditInfo.tags
      };

      const option = {
        screenshot: payload.noteEditInfo.shouldTakeScreenshot,
        compressScreenshot:
          payload.noteEditInfo.shouldTakeScreenshot &&
          rootStore.projectSettings.config.captureMediaSetting.imageCompression.format === "webp"
      };

      this.captureSession?.takeNote(note, option);
    },

    setNextTestPurpose(payload: { noteEditInfo: NoteEditInfo }) {
      if (this.captureSession) {
        this.captureSession.setNextTestPurpose({
          value: payload.noteEditInfo.note,
          details: payload.noteEditInfo.noteDetails
        });
      }
    },

    /**
     * Start the timer to measure capture time.
     * @param context Action context.
     */
    startTimer() {
      this.timer.start();
    },

    /**
     * Stop the timer to measure capture time.
     * @param context Action context.
     */
    stopTimer() {
      this.timer.stop();
    },

    /**
     * Reset the timer to measure capture time.
     * @param context Action context.
     * @param payload.millis initial time.
     */
    resetTimer(payload?: { millis: number }) {
      this.timer.reset(payload?.millis);
    }
  }
});
