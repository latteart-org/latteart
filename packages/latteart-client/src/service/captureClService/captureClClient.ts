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

import {
  Operation,
  CaptureConfig,
  CapturedOperation,
  CapturedScreenTransition,
  ElementInfo,
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
      config: CaptureConfig;
      eventListeners: CaptureEventListeners;
    }
  ) {}

  async startCapture(
    url: string,
    option: { compressScreenshots?: boolean } = {}
  ): Promise<ServiceResult<CaptureSession>> {
    const compressScreenshots = option?.compressScreenshots ?? false;

    return this.startCaptureSession(
      {
        url,
        config: this.option.config,
        option: { compressScreenshots },
      },
      this.option.testResult
    );
  }

  private async startCaptureSession(
    payload: {
      url: string;
      config: CaptureConfig;
      option: { compressScreenshots: boolean };
    },
    destTestResultAccessor?: TestResultAccessor
  ) {
    const session = new CaptureSessionImpl(
      this.captureCl,
      this.option.eventListeners,
      destTestResultAccessor
    );

    const result = await session.startCapture(payload);

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
    private testResult?: TestResultAccessor
  ) {}

  private errors: ServiceError[] = [];
  private pendingTestPurposes: { value: string; details?: string }[] = [];
  private lastTestStepId: string | undefined;

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
    option: { compressScreenshots: boolean };
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
          if (!this.testResult) {
            return;
          }

          if (capturedOperation.type === "switch_window") {
            this.browserState.currentWindowHandle = capturedOperation.input;
          }

          const result = await this.testResult.addOperation(
            { ...capturedOperation, isAutomatic: this.isAutomated },
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
            await this.testResult.addTestPurposeToTestStep(
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
        onGetScreenTransition: async (
          capturedScreenTransition: CapturedScreenTransition
        ) => {
          if (!this.testResult) {
            return;
          }

          const result = await this.testResult.addOperation(
            {
              ...capturedScreenTransition,
              type: "screen_transition",
              input: "",
              elementInfo: null,
              inputElements: [],
              isAutomatic: this.isAutomated,
            },
            { compressScreenshot: payload.option.compressScreenshots }
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
            await this.testResult.addTestPurposeToTestStep(
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
        onUpdateWindows: (updatedWindowsInfo: {
          windowHandles: string[];
          currentWindowHandle: string;
        }) => {
          const newWindowHandle = updatedWindowsInfo.windowHandles.find(
            (windowHandle) =>
              !this.browserState.windowHandles.includes(windowHandle)
          );

          this.browserState = { ...this.browserState, ...updatedWindowsInfo };

          if (this.eventListeners.onAddWindow && newWindowHandle) {
            this.eventListeners.onAddWindow(newWindowHandle);
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
  }

  takeNote(
    note: { value: string; details?: string; tags?: string[] },
    option?: { screenshot?: boolean; compressScreenshot?: boolean }
  ) {
    (async () => {
      if (!this.testResult) {
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

      const result = await this.testResult.addNoteToTestStep(
        { ...note, imageData },
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
    this.pendingTestPurposes.push({ ...testPurpose });
  }

  async runOperation(
    operation: Pick<Operation, "type" | "input" | "elementInfo">
  ) {
    const result = await this.captureCl.runOperation({
      input: operation.input,
      type: operation.type,
      elementInfo: operation.elementInfo,
    });

    if (result.error) {
      const error: ServiceError = {
        errorCode: "run_operation_failed",
        message: "Run Operation failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    return new ServiceSuccess(undefined);
  }

  async runOperationAndWait(
    operation: Pick<Operation, "type" | "input" | "elementInfo">
  ) {
    const result = await this.captureCl.runOperationAndScreenTransition({
      input: operation.input,
      type: operation.type,
      elementInfo: operation.elementInfo,
    });

    if (result.error) {
      const error: ServiceError = {
        errorCode: "run_operation_failed",
        message: "Run Operation failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    return new ServiceSuccess(undefined);
  }

  automate(
    option: {
      preScript?: (
        operation: Pick<
          Operation,
          "type" | "input" | "elementInfo" | "windowHandle" | "timestamp"
        >,
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

    const runOperations = (
      ...operations: Pick<
        Operation,
        "type" | "input" | "elementInfo" | "windowHandle" | "timestamp"
      >[]
    ) => {
      return executeAction(async () => {
        const targetTestSteps = collectRunTargets(
          ...operations.map((operation) => {
            return { operation };
          })
        );

        const recordedWindowHandles = targetTestSteps
          .map(({ operation }) => {
            return operation.windowHandle;
          })
          .filter((windowHandle, index, array) => {
            return array.indexOf(windowHandle) === index;
          });
        const replayWindowHandles: string[] = [];

        for (const [index, testStep] of targetTestSteps.entries()) {
          if (option.preScript) {
            await option.preScript(testStep.operation, index);
          }

          if (index === 0) {
            await new Promise<void>((resolve) => {
              setTimeout(() => {
                resolve();
              }, 1000);
            });
          } else {
            const previous = parseInt(
              targetTestSteps[index - 1].operation.timestamp,
              10
            );
            const current = parseInt(testStep.operation.timestamp, 10);
            const intervalTime = option.interval ?? current - previous;

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

          const replayTargetOperation = (() => {
            if (testStep.operation.type !== "switch_window") {
              return testStep.operation;
            }

            const handleKey = recordedWindowHandles.indexOf(
              testStep.operation.input
            );

            if (handleKey === -1) {
              return testStep.operation;
            }

            const switchHandleId = replayWindowHandles[handleKey];
            return {
              ...testStep.operation,
              input: switchHandleId,
            };
          })();

          if (replayTargetOperation.type === "screen_transition") {
            continue;
          }

          const nextOperation = targetTestSteps[index + 1]?.operation as
            | Operation
            | undefined;

          const result =
            nextOperation?.type === "screen_transition"
              ? await this.runOperationAndWait(replayTargetOperation)
              : await this.runOperation(replayTargetOperation);

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

  protectWindows() {
    this.captureCl.protectWindows();
  }

  unprotectWindows() {
    this.captureCl.unprotectWindows();
  }

  pauseCapture() {
    this.captureCl.pauseCapture();
  }

  resumeCapture() {
    this.captureCl.resumeCapture();
  }
}

function collectRunTargets<
  T extends {
    operation: { type: string; input: string; elementInfo: ElementInfo | null };
  }
>(...from: T[]) {
  return from.filter((testStep, index, array) => {
    const isDateInputOperation = (
      target: Pick<Operation, "type" | "elementInfo">,
      type: "click" | "change"
    ) => {
      return (
        target.type === type &&
        target.elementInfo?.tagname.toLowerCase() === "input" &&
        target.elementInfo.attributes.type === "date"
      );
    };

    const isNumberInputOperation = (
      target: Pick<Operation, "type" | "elementInfo">,
      type: "click" | "change"
    ) => {
      return (
        target.type === type &&
        target.elementInfo?.tagname.toLowerCase() === "input" &&
        target.elementInfo.attributes.type === "number"
      );
    };

    if (isDateInputOperation(testStep.operation, "change")) {
      const nextOperation:
        | Pick<Operation, "type" | "input" | "elementInfo">
        | undefined = array[index + 1]?.operation;

      if (
        nextOperation &&
        isDateInputOperation(nextOperation, "change") &&
        testStep.operation.elementInfo?.xpath ===
          nextOperation.elementInfo?.xpath
      ) {
        return false;
      }
    }

    if (isNumberInputOperation(testStep.operation, "click")) {
      const preOperation:
        | Pick<Operation, "type" | "input" | "elementInfo">
        | undefined = array[index - 1]?.operation;

      if (
        preOperation &&
        isNumberInputOperation(preOperation, "change") &&
        testStep.operation.elementInfo?.xpath ===
          preOperation.elementInfo?.xpath
      ) {
        return false;
      }
    }

    return true;
  });
}
