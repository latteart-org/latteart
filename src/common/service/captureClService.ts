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
  ServiceResult,
  ServiceError,
  ServiceFailure,
  ServiceSuccess,
} from "./result";
import {
  TestStepNote,
  TestStep,
  Operation,
  CapturedOperation,
  CapturedScreenTransition,
  CoverageSource,
  CaptureConfig,
  ElementInfo,
} from "./types";
import { TestResultAccessor } from "./repositoryService";
import { SocketIOClient } from "../network/websocket/client";
import { RESTClientImpl, RESTClient } from "../network/http/client";
import {
  RepositoryAccessResult,
  createRepositoryAccessSuccess,
  createRepositoryAccessFailure,
  createConnectionRefusedFailure,
} from "../repository/result";

/**
 * Client Side Capture Service
 */
export type CaptureClService = {
  /**
   * service url
   */
  readonly serviceUrl: string;

  /**
   * create a Capture Client
   * @param testResult Test Result for storing captured data
   * @param option option
   */
  createCaptureClient(
    testResult: TestResultAccessor,
    option: { config: CaptureConfig; eventListeners: CaptureEventListeners }
  ): CaptureClClient;

  /**
   * collect connected devices of a specific platform
   * @param platformName device platform name
   */
  recognizeDevices(
    platformName: string
  ): Promise<
    ServiceResult<
      { deviceName: string; modelNumber: string; osVersion: string }[]
    >
  >;
};

/**
 * Capture Session
 */
export type CaptureSession = {
  readonly windowHandles: readonly string[];

  readonly currentWindowHandle: string;

  readonly canNavigateBack: boolean;

  readonly canNavigateForward: boolean;

  readonly isAlertVisible: boolean;

  /**
   * end capture
   */
  endCapture(): void;

  /**
   * add a Note to last Test Step
   * @param note Note context
   * @param option option
   */
  takeNote(
    note: { value: string; details?: string; tags?: string[] },
    option?: { screenshot?: boolean; compressScreenshot?: boolean }
  ): void;

  /**
   * set next Test Purpose
   * @param testPurpose Test Purpose context
   */
  setNextTestPurpose(testPurpose: { value: string; details?: string }): void;

  /**
   * automate
   * @param option.interval interval in milliseconds (default: 1000)
   */
  automate(option?: { interval?: number }): {
    /**
     * run Operations
     * @param operations operation contexts
     */
    runOperations(
      ...operations: Pick<Operation, "type" | "input" | "elementInfo">[]
    ): Promise<ServiceResult<void>>;

    /**
     * enter values to screen elements
     * @param targetAndValues locator of target elements and input value
     */
    enterValues(
      ...targetAndValues: {
        target: {
          locatorType: "id" | "xpath";
          locator: string;
          locatorMatchType: "equals" | "regex";
        };
        value: string;
      }[]
    ): Promise<ServiceResult<void>>;
  };

  /**
   * control browser navigation
   */
  navigate(): {
    back(): void;
    forward(): void;
  };

  /**
   * switch window
   * @param destWindowHandle dest Window Handle
   */
  switchWindow(destWindowHandle: string): void;

  /**
   * protect windows from user operations
   */
  protectWindows(): void;

  /**
   * unprotect windows from user operations
   */
  unprotectWindows(): void;

  /**
   * pause capture
   */
  pauseCapture(): void;

  /**
   * resume capture
   */
  resumeCapture(): void;
};

/**
 * create a Client Side Capture Service
 * @param serviceUrl service url
 */
export function createCaptureClService(serviceUrl: string): CaptureClService {
  const captureCl = new CaptureClAdapter(serviceUrl);

  return {
    serviceUrl,
    createCaptureClient(
      testResult: TestResultAccessor,
      option: { config: CaptureConfig; eventListeners: CaptureEventListeners }
    ) {
      return new CaptureClClientImpl(
        captureCl,
        testResult,
        option.config,
        option.eventListeners
      );
    },
    async recognizeDevices(platformName: string) {
      const result = await captureCl.recognizeDevices(platformName);

      if (result.isFailure()) {
        const error: ServiceError = {
          errorCode: "detect_devices_failed",
          message: "Detect devices failed.",
        };
        console.error(error.message);

        return new ServiceFailure(error);
      }

      return new ServiceSuccess(result.data);
    },
  };
}

export type CaptureEventListeners = {
  onEnd: (result: ServiceResult<void>) => Promise<void>;
  onAddTestStep?: (testStep: {
    id: string;
    operation: Operation;
    coverageSource: CoverageSource;
  }) => Promise<void>;
  onAddNote?: (testStepNote: TestStepNote) => Promise<void>;
  onAddTestPurpose?: (testStepNote: TestStepNote) => Promise<void>;
  onAddWindow?: (windowHandle: string) => Promise<void>;
  onPause?: () => void;
  onResume?: () => void;
};

type CaptureClClient = {
  /**
   * start Capture
   * @param url target page url
   * @param option.compressScreenshots whether to compress screenshots
   */
  startCapture(
    url: string,
    option?: { compressScreenshots?: boolean }
  ): Promise<ServiceResult<CaptureSession>>;

  /**
   * replay Test Result
   * @param url target page url
   * @param option.filterPredicate predicate to filter Test Steps
   * @param option.preScript function called before running each Test Step
   * @param option.interval interval in milliseconds (default: duration between timestamps)
   */
  replay(
    url: string,
    option?: {
      filterPredicate?: (
        testStep: TestStep,
        index: number,
        array: TestStep[]
      ) => boolean;
      preScript?: (testStep: TestStep, index: number) => Promise<void>;
      interval?: number;
    }
  ): Promise<ServiceResult<void>>;

  /**
   * replay Test Result and save to repository
   * @param url target page url
   * @param option.filterPredicate predicate to filter Test Steps
   * @param option.preScript function called before running each Test Step
   * @param option.compressScreenshots whether to compress screenshots
   * @param option.interval interval in milliseconds (default: duration between timestamps)
   */
  replayAndSave(
    url: string,
    destTestResultAccessor: TestResultAccessor,
    option?: {
      filterPredicate?: (
        testStep: TestStep,
        index: number,
        array: TestStep[]
      ) => boolean;
      preScript?: (testStep: TestStep, index: number) => Promise<void>;
      compressScreenshots?: boolean;
      interval?: number;
    }
  ): Promise<ServiceResult<void>>;
};

class CaptureClClientImpl implements CaptureClClient {
  constructor(
    private captureCl: CaptureClAdapter,
    private testResult: TestResultAccessor,
    private config: CaptureConfig,
    private eventListeners: CaptureEventListeners
  ) {}

  async startCapture(
    url: string,
    option: { compressScreenshots?: boolean } = {}
  ) {
    const compressScreenshots = option?.compressScreenshots ?? false;

    return this.startCaptureSession(
      {
        url,
        config: this.config,
        option: { compressScreenshots },
      },
      this.testResult
    );
  }

  async replay(
    url: string,
    option: {
      filterPredicate?: (
        testStep: TestStep,
        index: number,
        array: TestStep[]
      ) => boolean;
      preScript?: (testStep: TestStep, index: number) => Promise<void>;
      interval?: number;
    } = {}
  ) {
    const startSessionResult = await this.startCaptureSession({
      url,
      config: this.config,
      option: { compressScreenshots: false },
    });

    if (startSessionResult.isFailure()) {
      return startSessionResult;
    }

    const session = startSessionResult.data;

    const result = await this.doReplay(session, option);

    session.endCapture();

    return result;
  }

  async replayAndSave(
    url: string,
    destTestResultAccessor: TestResultAccessor,
    option: {
      filterPredicate?: (
        testStep: TestStep,
        index: number,
        array: TestStep[]
      ) => boolean;
      preScript?: (testStep: TestStep, index: number) => Promise<void>;
      compressScreenshots?: boolean;
      interval?: number;
    } = {}
  ) {
    const compressScreenshots = option?.compressScreenshots ?? false;

    const startSessionResult = await this.startCaptureSession(
      { url, config: this.config, option: { compressScreenshots } },
      destTestResultAccessor
    );

    if (startSessionResult.isFailure()) {
      return startSessionResult;
    }

    const session = startSessionResult.data;

    const result = await this.doReplay(session, option);

    session.endCapture();

    return result;
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
      this.eventListeners,
      destTestResultAccessor
    );

    const result = await session.startCapture(payload);

    if (result.isFailure()) {
      return result;
    }

    return new ServiceSuccess(session);
  }

  private async doReplay(
    session: CaptureSessionImpl,
    option: {
      filterPredicate?: (
        testStep: TestStep,
        index: number,
        array: TestStep[]
      ) => boolean;
      preScript?: (testStep: TestStep, index: number) => Promise<void>;
      interval?: number;
    }
  ) {
    const collectTestStepsResult = await this.testResult.collectTestSteps();

    if (collectTestStepsResult.isFailure()) {
      return new ServiceFailure({
        ...collectTestStepsResult.error,
        errorCode: "get_test_result_failed",
      });
    }

    const testSteps = collectTestStepsResult.data.filter(
      option.filterPredicate ?? (() => true)
    );

    const recordedWindowHandles = testSteps
      .map(({ operation }) => {
        return operation.windowHandle;
      })
      .filter((windowHandle, index, array) => {
        return array.indexOf(windowHandle) === index;
      });
    const replayWindowHandles: string[] = [];

    const targetTestSteps = collectRunTargets(...testSteps);

    for (const [index, testStep] of targetTestSteps.entries()) {
      if (option.preScript) {
        await option.preScript(testStep, index);
      }

      if (index === 0) {
        await new Promise((resolve) => {
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

        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, intervalTime);
        });
      }

      const availableWindowHandles = session.windowHandles;
      for (const availableWindow of availableWindowHandles) {
        if (!replayWindowHandles.includes(availableWindow)) {
          replayWindowHandles.push(availableWindow);
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
          ? await session.runOperationAndWait(replayTargetOperation)
          : await session.runOperation(replayTargetOperation);

      if (result.isFailure()) {
        return result;
      }
    }

    return new ServiceSuccess(undefined);
  }
}

class CaptureSessionImpl implements CaptureSession {
  constructor(
    private captureCl: CaptureClAdapter,
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
              screenElements: [],
              inputElements: [],
              keywordTexts: [],
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
        onUpdateAvailableWindows: (updatedWindowsInfo: {
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

  automate(option: { interval?: number } = {}) {
    const executeAction = async <T>(
      action: () => Promise<ServiceResult<T>>
    ) => {
      this.isAutomated = true;

      const result = await action();

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 2000);
      });

      this.isAutomated = false;

      return result;
    };

    const runOperations = (
      ...operations: Pick<Operation, "type" | "input" | "elementInfo">[]
    ) => {
      return executeAction(async () => {
        const defaultInterval = 1000;

        const targetTestSteps = collectRunTargets(
          ...operations.map((operation) => {
            return { operation };
          })
        );

        for (const [index, testStep] of targetTestSteps.entries()) {
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, option.interval ?? defaultInterval);
          });

          if (testStep.operation.type === "screen_transition") {
            continue;
          }

          const nextOperation = targetTestSteps[index + 1]?.operation as
            | Operation
            | undefined;

          const result =
            nextOperation?.type === "screen_transition"
              ? await this.runOperationAndWait(testStep.operation)
              : await this.runOperation(testStep.operation);

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
        const result = await this.captureCl.inputValue(...targetAndValues);

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

class CaptureClAdapter {
  private socketIOClient: SocketIOClient;
  private restClient: RESTClient;

  constructor(public readonly serviceUrl: string) {
    this.socketIOClient = new SocketIOClient(serviceUrl);
    this.restClient = new RESTClientImpl(serviceUrl);
  }

  public get isCapturing(): boolean {
    return this.socketIOClient.isConnected;
  }

  public async recognizeDevices(platformName: string): Promise<
    RepositoryAccessResult<
      Array<{
        deviceName: string;
        modelNumber: string;
        osVersion: string;
      }>
    >
  > {
    try {
      const response = await this.restClient.httpGet("api/v1/devices");

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      const devices = response.data as Array<{
        platform: "Android" | "iOS";
        id: string;
        name: string;
        osVersion: string;
      }>;

      const data = devices
        .filter((device) => {
          return device.platform === platformName;
        })
        .map(({ id, name, osVersion }) => {
          return { deviceName: id, modelNumber: name, osVersion };
        });

      return createRepositoryAccessSuccess({
        data,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async startCapture(
    url: string,
    config: CaptureConfig,
    eventListeners: {
      onGetOperation: (capturedOperation: CapturedOperation) => Promise<void>;
      onGetScreenTransition: (
        capturedScreenTransition: CapturedScreenTransition
      ) => Promise<void>;
      onChangeBrowserHistory: (browserHistoryState: {
        canGoBack: boolean;
        canGoForward: boolean;
      }) => void;
      onUpdateAvailableWindows: (updatedWindowsInfo: {
        windowHandles: string[];
        currentWindowHandle: string;
      }) => void;
      onChangeAlertVisibility: (data: { isVisible: boolean }) => void;
      onPause: () => void;
      onResume: () => void;
      onError: (error: CaptureCLServerError) => void;
      onEnd: () => Promise<void>;
    }
  ): Promise<{
    data: unknown;
    error?: CaptureCLServerError | undefined;
  }> {
    try {
      const target = {
        platformName: config.platformName,
        browserName: config.browser,
        device: {
          id: config.device?.deviceName ?? "",
          name: config.device?.modelNumber ?? "",
          osVersion: config.device?.osVersion ?? "",
        },
        platformVersion: config.platformVersion ?? "",
        waitTimeForStartupReload: config.waitTimeForStartupReload,
      };

      const onGetOperation = async (data?: unknown) => {
        // console.info(`onGetOperation: ${JSON.stringify(data)}`);

        // TODO: Type check
        const capturedOperation = data as CapturedOperation;

        await eventListeners.onGetOperation(capturedOperation);
      };

      const onGetScreenTransition = async (data?: unknown) => {
        // console.info(`onGetScreenTransition: ${JSON.stringify(data)}`);

        // TODO: Type check
        const capturedScreenTransition = data as CapturedScreenTransition;

        await eventListeners.onGetScreenTransition(capturedScreenTransition);
      };

      const onChangeBrowserHistory = async (data?: unknown) => {
        console.info(`onChangeBrowserHistory: ${JSON.stringify(data)}`);

        const browserStatus = data as {
          canGoBack: boolean;
          canGoForward: boolean;
        };

        eventListeners.onChangeBrowserHistory(browserStatus);
      };

      const onUpdateAvailableWindows = async (data?: unknown) => {
        console.info(`onUpdateAvailableWindows: ${JSON.stringify(data)}`);

        // TODO: Type check
        const updateWindowsInfo = data as {
          windowHandles: string[];
          currentWindowHandle: string;
        };

        eventListeners.onUpdateAvailableWindows(updateWindowsInfo);
      };

      const onChangeAlertVisibility = async (data?: unknown) => {
        eventListeners.onChangeAlertVisibility(data as { isVisible: boolean });
      };

      const onPause = async () => {
        eventListeners.onPause();
      };

      const onResume = async () => {
        eventListeners.onResume();
      };

      const onError = async (data?: unknown) => {
        console.info(`onError: ${JSON.stringify(data)}`);

        const error = data as CaptureCLServerError;

        eventListeners.onError(error);
      };

      const onDisconnect = (error?: Error) => {
        if (error?.message === "disconnected") {
          eventListeners.onError({
            code: "capture_socket_disconnected",
            message: "Disconnected from client side capture service.",
          });
        }

        eventListeners.onEnd();
      };

      await this.socketIOClient.connect(
        onDisconnect,
        ...[
          { eventName: "operation_captured", eventHandler: onGetOperation },
          {
            eventName: "screen_transition_captured",
            eventHandler: onGetScreenTransition,
          },
          {
            eventName: "browser_history_changed",
            eventHandler: onChangeBrowserHistory,
          },
          {
            eventName: "browser_windows_changed",
            eventHandler: onUpdateAvailableWindows,
          },
          {
            eventName: "alert_visibility_changed",
            eventHandler: onChangeAlertVisibility,
          },
          { eventName: "capture_paused", eventHandler: onPause },
          { eventName: "capture_resumed", eventHandler: onResume },
          { eventName: "error_occurred", eventHandler: onError },
        ]
      );

      const result = await this.socketIOClient.invoke(
        "start_capture",
        "capture_started",
        url,
        target
      );

      console.info(`onStart: ${JSON.stringify(result.data)}`);

      return { data: undefined };
    } catch (error) {
      console.error(error);

      return {
        data: undefined,
        error: {
          code: "client_side_capture_service_not_found",
          message: "Client side capture service is not found.",
        },
      };
    }
  }

  public endCapture(): void {
    try {
      this.socketIOClient.emit("stop_capture");
    } catch (error) {
      console.error(error);
    }
  }

  public async takeScreenshot(): Promise<string> {
    try {
      const screenshot = (
        await this.socketIOClient.invoke("take_screenshot", "screenshot_taken")
      ).data;

      console.info(`takeScreenshot: ${screenshot}`);

      if (typeof screenshot !== "string") {
        return "";
      }

      return screenshot;
    } catch (error) {
      console.error(error);
      return "";
    }
  }

  public browserBack(): void {
    try {
      this.socketIOClient.emit("browser_back");
    } catch (error) {
      console.error(error);
    }
  }

  public browserForward(): void {
    try {
      this.socketIOClient.emit("browser_forward");
    } catch (error) {
      console.error(error);
    }
  }

  public switchWindow(destWindowHandle: string): void {
    try {
      this.socketIOClient.emit("switch_capturing_window", destWindowHandle);
    } catch (error) {
      console.error(error);
    }
  }

  public protectWindows(): void {
    try {
      this.socketIOClient.emit("select_capturing_window");
    } catch (error) {
      console.error(error);
    }
  }

  public unprotectWindows(): void {
    try {
      this.socketIOClient.emit("switch_cancel");
    } catch (error) {
      console.error(error);
    }
  }

  public pauseCapture(): void {
    try {
      this.socketIOClient.emit("pause_capture");
    } catch (error) {
      console.error(error);
    }
  }

  public resumeCapture(): void {
    try {
      this.socketIOClient.emit("resume_capture");
    } catch (error) {
      console.error(error);
    }
  }

  public async runOperation(
    operation: Pick<Operation, "type" | "input" | "elementInfo">
  ): Promise<{
    data: unknown;
    error?: CaptureCLServerError | undefined;
  }> {
    try {
      const result = await this.socketIOClient.invoke(
        "run_operation",
        {
          success: "run_operation_completed",
          failure: "run_operation_failed",
        },
        operation
      );

      if (result.status === "failure") {
        return {
          data: undefined,
          error: result.data as CaptureCLServerError,
        };
      }

      return { data: undefined };
    } catch (error) {
      console.error(error);
      return {
        data: undefined,
        error: {
          code: "client_side_capture_service_not_found",
          message: "Client side capture service is not found.",
        },
      };
    }
  }

  public async runOperationAndScreenTransition(
    operation: Pick<Operation, "type" | "input" | "elementInfo">
  ): Promise<{
    data: unknown;
    error?: CaptureCLServerError | undefined;
  }> {
    try {
      const result = await this.socketIOClient.invoke(
        "run_operation_and_screen_transition",
        {
          success: "run_operation_and_screen_transition_completed",
          failure: "run_operation_and_screen_transition_failed",
        },
        operation
      );

      if (result.status === "failure") {
        return {
          data: undefined,
          error: result.data as CaptureCLServerError,
        };
      }

      return { data: undefined };
    } catch (error) {
      console.error(error);
      return {
        data: undefined,
        error: {
          code: "client_side_capture_service_not_found",
          message: "Client side capture service is not found.",
        },
      };
    }
  }

  public async inputValue(
    ...targetAndValues: {
      target: {
        locatorType: "id" | "xpath";
        locator: string;
        locatorMatchType: "equals" | "regex";
      };
      value: string;
    }[]
  ): Promise<{
    data: unknown;
    error?: CaptureCLServerError | undefined;
  }> {
    try {
      const result = await this.socketIOClient.invoke(
        "autofill",
        "autofill_completed",
        targetAndValues.map(({ target, value }) => {
          return { ...target, inputValue: value };
        })
      );

      if (result.status === "failure") {
        return {
          data: undefined,
          error: result.data as CaptureCLServerError,
        };
      }

      return { data: undefined };
    } catch (error) {
      console.error(error);
      return {
        data: undefined,
        error: {
          code: "client_side_capture_service_not_found",
          message: "Client side capture service is not found.",
        },
      };
    }
  }
}

type CaptureCLServerErrorCode =
  | "detect_devices_failed"
  | "capture_failed"
  | "unknown_error"
  | "invalid_url"
  | "web_driver_version_mismatch"
  | "web_driver_not_ready"
  | "appium_not_started"
  | "device_not_connected"
  | "invalid_operation"
  | "element_not_found";

type CaptureCLConnectionErrorCode =
  | "capture_socket_disconnected"
  | "client_side_capture_service_not_found";

type CaptureCLServerError = {
  code: CaptureCLServerErrorCode | CaptureCLConnectionErrorCode;
  message?: string;
  details?: Array<{
    code: string;
    message: string;
    target: string;
  }>;
};

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
