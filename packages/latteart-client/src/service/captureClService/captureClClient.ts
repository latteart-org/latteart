/**
 * Copyright 2024 NTT Corporation.
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

import {
  Operation,
  CaptureConfig,
  CapturedOperation,
  RunnableOperation,
  Video,
  CapturedScreenTransition,
  ScreenMutation,
} from "../types";
import {
  ServiceResult,
  ServiceFailure,
  ServiceSuccess,
  ServiceError,
} from "../result";
import { TestResultAccessor } from "../repositoryService";
import { CaptureClServerAdapter } from "../../gateway/captureCl/captureClServerAdapter";
import {
  CaptureClClient,
  CaptureEventListeners,
  CaptureSession,
} from "./types";
import { CaptureCLServerError } from "../../gateway/captureCl";

export class CaptureClClientImpl implements CaptureClClient {
  constructor(
    private captureCl: CaptureClServerAdapter,
    private option: {
      testResult?: TestResultAccessor;
      videoRecorder?: { getCapturingVideo(): Promise<Video> };
      config: CaptureConfig;
      eventListeners: CaptureEventListeners;
    }
  ) {}

  async startCapture(
    url: string,
    option: {
      compressScreenshots?: boolean;
      firstTestPurpose?: { value: string; details?: string };
    } = {}
  ): Promise<ServiceResult<CaptureSession>> {
    const compressScreenshots = option?.compressScreenshots ?? false;

    return this.startCaptureSession({
      url,
      option: {
        compressScreenshots,
        firstTestPurpose: option.firstTestPurpose,
      },
    });
  }

  private async startCaptureSession(payload: {
    url: string;
    option: {
      compressScreenshots: boolean;
      firstTestPurpose?: { value: string; details?: string };
    };
  }) {
    const session = new CaptureSessionImpl(
      this.captureCl,
      this.option.eventListeners,
      {
        testResult: this.option.testResult,
        videoRecorder: this.option.videoRecorder,
      }
    );

    const result = await session.startCapture({
      ...payload,
      config: this.option.config,
    });

    if (result.isFailure()) {
      return result;
    }

    return new ServiceSuccess(session);
  }
}

class CaptureSessionImpl implements CaptureSession {
  constructor(
    private captureCl: CaptureClServerAdapter,
    private eventListeners: CaptureEventListeners,
    private option: {
      testResult?: TestResultAccessor;
      videoRecorder?: { getCapturingVideo(): Promise<Video> };
    } = {}
  ) {}

  private errors: ServiceError[] = [];
  private pendingTestPurposes: { value: string; details?: string }[] = [];
  private lastTestStepId: string | undefined;
  private recordingVideo?: Video & { startTimestamp: number };

  private browserState: {
    windowHandles: string[];
    currentWindowHandle: string;
    canNavigateBack: boolean;
    canNavigateForward: boolean;
    isAlertVisible: boolean;
  } = {
    windowHandles: [],
    currentWindowHandle: "",
    canNavigateBack: false,
    canNavigateForward: false,
    isAlertVisible: false,
  };

  private isAutomated = false;

  public get windowHandles(): readonly string[] {
    return this.browserState.windowHandles;
  }

  public get currentWindowHandle(): string {
    return this.browserState.currentWindowHandle;
  }

  public get canNavigateBack(): boolean {
    return this.browserState.canNavigateBack;
  }

  public get canNavigateForward(): boolean {
    return this.browserState.canNavigateForward;
  }

  public get isAlertVisible(): boolean {
    return this.browserState.isAlertVisible;
  }

  async startCapture(payload: {
    url: string;
    config: CaptureConfig;
    option: {
      compressScreenshots: boolean;
      firstTestPurpose?: { value: string; details?: string };
    };
  }) {
    const captureClErrors: ServiceError[] = [];

    const convertToServiceError = (serverError: CaptureCLServerError) => {
      if (serverError.code === "detect_devices_failed") {
        return {
          errorCode: serverError.code,
          message: "Detect devices failed.",
        };
      }
      if (serverError.code === "invalid_url") {
        return {
          errorCode: serverError.code,
          message: "Invalid URL.",
        };
      }
      if (serverError.code === "web_driver_version_mismatch") {
        return {
          errorCode: serverError.code,
          message: "Web Driver version mismatched.",
        };
      }
      if (serverError.code === "connection_refused") {
        return {
          errorCode: serverError.code,
          message: "Connection refused.",
        };
      }
      if (serverError.code === "web_driver_not_ready") {
        return {
          errorCode: serverError.code,
          message: "Web Driver not ready.",
        };
      }
      if (serverError.code === "appium_not_started") {
        return {
          errorCode: serverError.code,
          message: "Appium not started.",
        };
      }
      if (serverError.code === "device_not_connected") {
        return {
          errorCode: serverError.code,
          message: "Device not connected.",
        };
      }
      if (serverError.code === "invalid_operation") {
        return {
          errorCode: serverError.code,
          message: "Invalid operation.",
        };
      }
      if (serverError.code === "element_not_found") {
        return {
          errorCode: serverError.code,
          message: "Element not found.",
        };
      }
      if (serverError.code === "element_not_interactable") {
        return {
          errorCode: serverError.code,
          message: "Element not interactable.",
        };
      }
      if (serverError.code === "client_side_capture_service_not_found") {
        return {
          errorCode: serverError.code,
          message: "Client side capture service is not found.",
        };
      }

      const otherError: ServiceError = {
        errorCode: "capture_failed",
        message: "Capture failed.",
      };
      return otherError;
    };

    const result = await this.captureCl.startCapture(
      payload.url,
      payload.config,
      {
        onGetOperation: async (capturedOperation: CapturedOperation) => {
          if (!this.option.testResult) {
            return;
          }

          if (capturedOperation.type === "switch_window") {
            this.browserState.currentWindowHandle = capturedOperation.input;
          }

          const result = await this.option.testResult.addOperation(
            {
              ...capturedOperation,
              imageData: capturedOperation.imageData,
              videoId: this.recordingVideo?.id,
              videoTime: this.recordingVideo
                ? (parseInt(capturedOperation.timestamp) -
                    this.recordingVideo.startTimestamp) /
                  1000
                : undefined,
              isAutomatic: this.isAutomated,
            },
            {
              compressScreenshot: payload.option.compressScreenshots,
            }
          );

          if (result.isFailure()) {
            captureClErrors.push(result.error);
            this.endCapture();
            return;
          }

          this.lastTestStepId = result.data.id;

          if (this.eventListeners.onAddTestStep) {
            this.eventListeners.onAddTestStep(result.data);
          }

          const testPurpose = this.pendingTestPurposes.pop();

          if (!testPurpose) {
            return;
          }

          const addTestPurposeResult =
            await this.option.testResult.addTestPurposeToTestStep(
              testPurpose,
              result.data.id
            );

          if (addTestPurposeResult.isFailure()) {
            captureClErrors.push(addTestPurposeResult.error);
            this.endCapture();
            return;
          }

          if (this.eventListeners.onAddTestPurpose) {
            this.eventListeners.onAddTestPurpose(addTestPurposeResult.data);
          }
        },
        onGetMutation: async (
          screenMutations: ScreenMutation[]
        ): Promise<void> => {
          if (!this.option.testResult) {
            return;
          }
          await this.option.testResult.addMutations(screenMutations);
        },
        onGetScreenTransition: async (
          capturedScreenTransition: CapturedScreenTransition
        ) => {
          if (!this.option.testResult) {
            return;
          }

          const result = await this.option.testResult.addOperation(
            {
              ...capturedScreenTransition,
              imageData: capturedScreenTransition.imageData,
              type: "screen_transition",
              input: "",
              elementInfo: null,
              videoId: this.recordingVideo?.id,
              videoTime: this.recordingVideo
                ? (parseInt(capturedScreenTransition.timestamp) -
                    this.recordingVideo.startTimestamp) /
                  1000
                : undefined,
              isAutomatic: this.isAutomated,
            },
            { compressScreenshot: payload.option.compressScreenshots }
          );

          if (result.isFailure()) {
            captureClErrors.push(result.error);
            this.endCapture();
            return;
          }

          if (this.eventListeners.onUpdateWindowTitle) {
            this.eventListeners.onUpdateWindowTitle(
              capturedScreenTransition.windowHandle,
              capturedScreenTransition.title
            );
          }

          this.lastTestStepId = result.data.id;

          if (this.eventListeners.onAddTestStep) {
            this.eventListeners.onAddTestStep(result.data);
          }

          const testPurpose = this.pendingTestPurposes.pop();

          if (!testPurpose) {
            return;
          }

          const addTestPurposeResult =
            await this.option.testResult.addTestPurposeToTestStep(
              testPurpose,
              result.data.id
            );

          if (addTestPurposeResult.isFailure()) {
            captureClErrors.push(addTestPurposeResult.error);
            this.endCapture();
            return;
          }

          if (this.eventListeners.onAddTestPurpose) {
            this.eventListeners.onAddTestPurpose(addTestPurposeResult.data);
          }
        },
        onChangeBrowserHistory: (browserHistoryState: {
          canGoBack: boolean;
          canGoForward: boolean;
        }) => {
          this.browserState = {
            ...this.browserState,
            ...{
              canNavigateBack: browserHistoryState.canGoBack,
              canNavigateForward: browserHistoryState.canGoForward,
            },
          };
        },
        onUpdateWindows: async (updateInfo: {
          windows: { windowHandle: string; url: string; title: string }[];
          currentWindowHandle: string;
          currentWindowHostNameChanged: boolean;
          timestamp: number;
        }) => {
          const newWindow = updateInfo.windows.find(
            ({ windowHandle }) =>
              !this.browserState.windowHandles.includes(windowHandle)
          );

          this.browserState = {
            ...this.browserState,
            windowHandles: updateInfo.windows.map(
              ({ windowHandle }) => windowHandle
            ),
            currentWindowHandle: updateInfo.currentWindowHandle,
          };

          if (
            this.eventListeners.onCurrentWindowHostNameChanged &&
            updateInfo.currentWindowHostNameChanged
          ) {
            this.eventListeners.onCurrentWindowHostNameChanged();
          }

          if (!newWindow) {
            return;
          }

          if (this.eventListeners.onAddWindow) {
            this.eventListeners.onAddWindow(
              newWindow.windowHandle,
              newWindow.title
            );
          }

          if (this.option.testResult) {
            const result = await this.option.testResult.addOperation(
              {
                type: "open_window",
                url: newWindow.url,
                timestamp: `${updateInfo.timestamp}`,
                isAutomatic: this.isAutomated,
                title: "",
                imageData: "",
                windowHandle: "",
                screenElements: [],
                pageSource: "",
                scrollPosition: { x: 0, y: 0 },
                clientSize: { width: 0, height: 0 },
                input: "",
                elementInfo: null,
              },
              { compressScreenshot: false }
            );

            if (result.isFailure()) {
              captureClErrors.push(result.error);
              this.endCapture();
              return;
            }

            if (this.eventListeners.onAddTestStep) {
              this.eventListeners.onAddTestStep(result.data);
            }
          }
        },
        onChangeAlertVisibility: (data: { isVisible: boolean }) => {
          this.browserState = {
            ...this.browserState,
            ...{ isAlertVisible: data.isVisible },
          };
        },
        onPause: () => {
          if (this.eventListeners.onPause) {
            this.eventListeners.onPause();
          }
        },
        onResume: () => {
          if (this.eventListeners.onResume) {
            this.eventListeners.onResume();
          }
        },
        onError: (serverError: CaptureCLServerError) => {
          const error: ServiceError = convertToServiceError(serverError);

          captureClErrors.push(error);

          this.endCapture();
        },
        onEnd: async () => {
          const allErrors = [...this.errors, ...captureClErrors];
          if (allErrors.length > 0) {
            this.eventListeners.onEnd(
              new ServiceFailure(allErrors[allErrors.length - 1])
            );

            return;
          }

          this.eventListeners.onEnd(new ServiceSuccess(undefined));
        },
      }
    );

    if (result.error) {
      const error = convertToServiceError(result.error);
      return new ServiceFailure(error);
    }

    if (result.data && this.option.testResult) {
      const addOperationResult = await this.option.testResult.addOperation(
        {
          type: "start_capturing",
          url: payload.url,
          timestamp: `${result.data.startTimestamp}`,
          isAutomatic: this.isAutomated,
          title: "",
          imageData: "",
          windowHandle: "",
          screenElements: [],
          pageSource: "",
          scrollPosition: { x: 0, y: 0 },
          clientSize: { width: 0, height: 0 },
          input: "",
          elementInfo: null,
        },
        { compressScreenshot: false }
      );

      if (addOperationResult.isFailure()) {
        return new ServiceFailure(addOperationResult.error);
      }

      if (this.eventListeners.onAddTestStep) {
        this.eventListeners.onAddTestStep(addOperationResult.data);
      }

      if (!payload.option.firstTestPurpose) {
        return new ServiceSuccess(undefined);
      }

      const addTestPurposeResult =
        await this.option.testResult.addTestPurposeToTestStep(
          payload.option.firstTestPurpose,
          addOperationResult.data.id
        );

      if (addTestPurposeResult.isFailure()) {
        captureClErrors.push(addTestPurposeResult.error);
        this.endCapture();
        return new ServiceFailure(addTestPurposeResult.error);
      }

      if (this.eventListeners.onAddTestPurpose) {
        this.eventListeners.onAddTestPurpose(addTestPurposeResult.data);
      }
    }

    return new ServiceSuccess(undefined);
  }

  endCapture() {
    if (!this.captureCl.isCapturing) {
      return;
    }

    this.captureCl.endCapture();

    this.errors = [];
    this.pendingTestPurposes = [];
    this.lastTestStepId = undefined;
    this.browserState = {
      windowHandles: [],
      currentWindowHandle: "",
      canNavigateBack: false,
      canNavigateForward: false,
      isAlertVisible: false,
    };
    this.isAutomated = false;
    this.recordingVideo = undefined;
  }

  takeNote(
    note: { value: string; details?: string; tags?: string[] },
    option?: { screenshot?: boolean; compressScreenshot?: boolean }
  ) {
    (async () => {
      if (!this.option.testResult) {
        console.warn("No Test result.");

        this.errors.push({
          errorCode: "add_note_failed",
          message: "Add Note failed.",
        });
        this.endCapture();
        return;
      }

      if (!this.lastTestStepId) {
        console.warn("No Test Step saved.");

        this.errors.push({
          errorCode: "add_note_failed",
          message: "Add Note failed.",
        });
        this.endCapture();
        return;
      }

      const imageData: string | undefined = option?.screenshot
        ? await this.captureCl.takeScreenshot()
        : undefined;

      const timestamp = new Date().getTime();

      const videoData =
        option?.screenshot && this.recordingVideo
          ? {
              videoId: this.recordingVideo.id,
              videoTime:
                (timestamp - this.recordingVideo.startTimestamp) / 1000,
            }
          : undefined;

      const result = await this.option.testResult.addNoteToTestStep(
        {
          ...note,
          imageData,
          timestamp,
          ...videoData,
        },
        this.lastTestStepId,
        option
      );

      if (result.isFailure()) {
        this.errors.push(result.error);
        this.endCapture();
        return;
      }

      if (this.eventListeners.onAddNote) {
        this.eventListeners.onAddNote(result.data);
      }
    })();
  }

  setNextTestPurpose(testPurpose: { value: string; details?: string }) {
    this.pendingTestPurposes.splice(0, this.pendingTestPurposes.length, {
      ...testPurpose,
    });
  }

  async runOperation(operation: RunnableOperation) {
    const result = await this.captureCl.runOperation({
      input: operation.input,
      type: operation.type,
      elementInfo: operation.elementInfo,
      clientSize: operation.clientSize,
      scrollPosition: operation.scrollPosition,
    });

    if (result.error) {
      const error: ServiceError = {
        errorCode: "run_operation_failed",
        message: "Run Operation failed.",
        variables: {
          title: operation.title ?? "",
          input: operation.input,
          type: operation.type,
          elementInfo: operation.elementInfo
            ? JSON.stringify(operation.elementInfo)
            : "",
        },
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    return new ServiceSuccess(undefined);
  }

  async runOperationAndWait(operation: RunnableOperation) {
    const result = await this.captureCl.runOperationAndScreenTransition({
      input: operation.input,
      type: operation.type,
      elementInfo: operation.elementInfo,
      clientSize: operation.clientSize,
      scrollPosition: operation.scrollPosition,
    });

    if (result.error) {
      const error: ServiceError = {
        errorCode: "run_operation_failed",
        message: "Run Operation failed.",
        variables: {
          title: operation.title ?? "",
          input: operation.input,
          type: operation.type,
          elementInfo: operation.elementInfo
            ? JSON.stringify(operation.elementInfo)
            : "",
        },
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    return new ServiceSuccess(undefined);
  }

  automate(
    option: {
      preScript?: (
        operation: RunnableOperation,
        index: number
      ) => Promise<void>;
      interval?: number;
    } = {}
  ) {
    const executeAction = async <T>(
      action: () => Promise<ServiceResult<T>>
    ) => {
      this.isAutomated = true;

      const result = await action();

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 2000);
      });

      this.isAutomated = false;

      return result;
    };

    const runOperations = (...operations: RunnableOperation[]) => {
      return executeAction(async () => {
        const runTargets = collectRunTargets(...operations);

        const recordedWindowHandles = runTargets
          .map(({ operation }) => {
            return operation.windowHandle;
          })
          .filter((windowHandle, index, array) => {
            return array.indexOf(windowHandle) === index;
          });
        const replayWindowHandles: string[] = [];

        for (const [index, runTarget] of runTargets.entries()) {
          if (option.preScript) {
            await option.preScript(runTarget.operation, runTarget.index);
          }

          if (index === 0) {
            await new Promise<void>((resolve) => {
              setTimeout(() => {
                resolve();
              }, 1000);
            });
          } else {
            const intervalTime = (() => {
              const previous = runTargets.at(index - 1)?.operation.timestamp;
              const current = runTarget.operation.timestamp;

              if (!previous || !current) {
                return 0;
              }

              return (
                option.interval ??
                parseInt(current, 10) - parseInt(previous, 10)
              );
            })();

            await new Promise<void>((resolve) => {
              setTimeout(() => {
                resolve();
              }, intervalTime);
            });
          }

          const windowHandles = this.windowHandles;
          for (const windowHandle of windowHandles) {
            if (!replayWindowHandles.includes(windowHandle)) {
              replayWindowHandles.push(windowHandle);
            }
          }

          const runTargetOperation = (() => {
            if (runTarget.operation.type !== "switch_window") {
              return runTarget.operation;
            }

            const handleKey = recordedWindowHandles.indexOf(
              runTarget.operation.input
            );

            if (handleKey === -1) {
              return runTarget.operation;
            }

            const switchHandleId = replayWindowHandles[handleKey];
            return {
              ...runTarget.operation,
              input: switchHandleId,
            };
          })();

          if (runTargetOperation.type === "screen_transition") {
            continue;
          }

          const nextOperation = runTargets.at(index + 1);

          const result =
            nextOperation?.operation.type === "screen_transition"
              ? await this.runOperationAndWait(runTargetOperation)
              : await this.runOperation(runTargetOperation);

          if (result.isFailure()) {
            return result;
          }
        }

        return new ServiceSuccess(undefined);
      });
    };

    const enterValues = (
      ...targetAndValues: {
        target: {
          locatorType: "id" | "xpath";
          locator: string;
          locatorMatchType: "equals" | "regex";
          iframeIndex?: number;
        };
        value: string;
      }[]
    ) => {
      return executeAction(async () => {
        const result = await this.captureCl.enterValues(...targetAndValues);

        if (result.error) {
          const error: ServiceError = {
            errorCode: "enter_values_failed",
            message: "Enter values failed.",
          };
          console.error(error.message);
          return new ServiceFailure(error);
        }

        return new ServiceSuccess(undefined);
      });
    };

    return {
      runOperations,
      enterValues,
    };
  }

  navigate() {
    const captureCl = this.captureCl;

    return {
      back(): void {
        captureCl.browserBack();
      },
      forward(): void {
        captureCl.browserForward();
      },
    };
  }

  switchWindow(destWindowHandle: string) {
    this.captureCl.switchWindow(destWindowHandle);
  }

  pauseCapture() {
    this.captureCl.pauseCapture();
  }

  resumeCapture() {
    this.captureCl.resumeCapture();
  }

  setRecordingVideo(video: Video & { startTimestamp: number }) {
    this.recordingVideo = video;
  }
}

function collectRunTargets(...operations: RunnableOperation[]) {
  const isDateInputOperation = (
    target: Pick<Operation, "type" | "elementInfo">,
    type: "click" | "change"
  ) => {
    return (
      target.type === type &&
      target.elementInfo?.tagname.toLowerCase() === "input" &&
      (target.elementInfo.attributes.type === "date" ||
        target.elementInfo.attributes.type === "datetime-local")
    );
  };

  let isCounting = false;

  return operations
    .map((operation, index) => {
      return { operation, index };
    })
    .filter((runTarget, index, array) => {
      if (
        ["start_capturing", "open_window"].includes(runTarget.operation.type)
      ) {
        return false;
      }

      if (runTarget.operation.type === "pause_capturing") {
        isCounting = true;
        return false;
      }

      if (runTarget.operation.type === "resume_capturing") {
        isCounting = false;
        return false;
      }

      if (isCounting) {
        return false;
      }

      if (isDateInputOperation(runTarget.operation, "click")) {
        return false;
      }

      if (isDateInputOperation(runTarget.operation, "change")) {
        const nextOperation:
          | Pick<Operation, "type" | "input" | "elementInfo">
          | undefined = array.at(index + 1)?.operation;

        if (
          nextOperation &&
          isDateInputOperation(nextOperation, "change") &&
          runTarget.operation.elementInfo?.xpath ===
            nextOperation.elementInfo?.xpath
        ) {
          return false;
        }
      }

      return true;
    });
}
