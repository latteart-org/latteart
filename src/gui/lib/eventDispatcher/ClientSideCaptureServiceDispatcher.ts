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

import SocketIOClient from "./SocketIOClient";
import RESTClient from "./RESTClient";
import { Reply, ServerError } from "../captureControl/Reply";
import { CaptureConfig } from "../captureControl/CaptureConfig";
import {
  CapturedOperation,
  CapturedScreenTransition,
} from "../operationHistory/CapturedOperation";
import { Operation } from "../operationHistory/Operation";

/**
 * A class that processes the acquisition of client-side information through the service.
 */
export default class ClientSideCaptureServiceDispatcher {
  /**
   * Service URL.
   */
  get serviceUrl(): string {
    return this._serviceUrl;
  }

  set serviceUrl(value: string) {
    this._serviceUrl = value;
  }

  /**
   * The URL of the proxy server used to connect to the service.
   */
  get proxyUrl(): string {
    return this._proxyUrl;
  }

  set proxyUrl(value: string) {
    this._proxyUrl = value;
  }

  /**
   * Determine if it is currently recorded.
   * @returns Returns true if recording.
   */
  get isCapturing(): boolean {
    return this.socketIOClient !== null;
  }

  private _serviceUrl = "http://127.0.0.1:3001";
  private _proxyUrl = "";
  private restClient: RESTClient = new RESTClient();
  private socketIOClient: SocketIOClient | null = null;

  /**
   * Acquires a list of devices connected to the terminal where the recording agent is located.
   *
   * @returns List of connected devices.
   */
  public async recognizeDevices(
    platformName: string
  ): Promise<
    Reply<
      Array<{
        deviceName: string;
        modelNumber: string;
        osVersion: string;
      }>
    >
  > {
    try {
      const devices: Array<{
        platform: "Android" | "iOS";
        id: string;
        name: string;
        osVersion: string;
      }> = await this.restClient.httpGet(this.buildAPIURL(`/devices`));

      const data = devices
        .filter((device) => {
          return device.platform === platformName;
        })
        .map(({ id, name, osVersion }) => {
          return { deviceName: id, modelNumber: name, osVersion };
        });

      return {
        succeeded: true,
        data,
      };
    } catch (error) {
      return {
        succeeded: false,
        error: {
          code: "client_side_capture_service_not_found",
          message: "Client side capture service is not found.",
        },
      };
    }
  }

  /**
   * Replay execution of operation history.
   * @param config  Settings at the time of capture.
   * @param operations Operation history.
   */
  public async runOperations(
    config: CaptureConfig,
    operations: Operation[]
  ): Promise<Reply<string>> {
    try {
      let occurredError: ServerError | null = null;
      let completedMessage: string | null = null;

      this.socketIOClient = new SocketIOClient(this._serviceUrl);

      const target = {
        platformName: config.platformName,
        browserName: config.browser,
        device: {
          id: config.device.deviceName,
          name: config.device.modelNumber,
          osVersion: config.device.osVersion,
        },
        platformVersion: config.platformVersion,
        waitTimeForStartupReload: config.waitTimeForStartupReload,
      };

      const onConnect = () => {
        this.socketIOClient?.emit("run_operations", operations, target);
      };

      const onCanceled = () => {
        completedMessage = "run-operations-canceled";
      };

      const onSucceeded = () => {
        completedMessage = "done-run-operations";
      };

      const onAborted = () => {
        completedMessage = "done-run-operations-because-skipped";
      };

      const onError = (data?: unknown) => {
        console.info(`onError: ${JSON.stringify(data)}`);

        const error = data as ServerError;
        occurredError = {
          code:
            error.code === "unknown_error"
              ? "run_operations_failed"
              : error.code,
          message: error.message,
          details: error.details,
        };
      };

      await this.socketIOClient
        .connect(
          onConnect,
          ...[
            { eventName: "error_occurred", eventHandler: onError },
            {
              eventName: "run_operations_completed",
              eventHandler: onSucceeded,
            },
            { eventName: "run_operations_canceled", eventHandler: onCanceled },
            { eventName: "run_operations_aborted", eventHandler: onAborted },
          ]
        )
        .catch((error) => {
          if (error.message === "disconnected") {
            occurredError = {
              code: "run_operations_socket_disconnected",
              message: "Disconnected from client side capture service.",
            };

            return;
          }

          throw error;
        });

      this.socketIOClient = null;

      let response: Reply<string> | undefined;
      if (completedMessage) {
        response = {
          succeeded: true,
          data: completedMessage,
        };
      } else {
        response = {
          succeeded: false,
          error: occurredError ?? undefined,
        };
      }
      return response;
    } catch (error) {
      console.error(error);

      return {
        succeeded: false,
        error: {
          code: "client_side_capture_service_not_found",
          message: "Client side capture service is not found.",
        },
      };
    }
  }

  /**
   * Forced termination of replay.
   */
  public forceQuitRunningOperation(): void {
    this.socketIOClient?.emit("stop_run_operations");
  }

  /**
   * Start recording.
   *
   * @param target  Recording target.
   * @param eventListeners.onGetOperation  Function called when an operation is detected.
   * @param eventListeners.onScreenTransition  Function called when a screen transition is detected.
   */
  public async startCapture(
    url: string,
    config: CaptureConfig,
    eventListeners: {
      onStart: () => Promise<void>;
      onGetOperation: (capturedOperation: CapturedOperation) => Promise<void>;
      onGetScreenTransition: (
        capturedScreenTransition: CapturedScreenTransition
      ) => Promise<void>;
      onChangeBrowserHistory: (browserStatus: {
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
    }
  ): Promise<Reply<void>> {
    try {
      let occurredError: ServerError | null = null;

      this.socketIOClient = new SocketIOClient(this._serviceUrl);

      const target = {
        platformName: config.platformName,
        browserName: config.browser,
        device: {
          id: config.device.deviceName,
          name: config.device.modelNumber,
          osVersion: config.device.osVersion,
        },
        platformVersion: config.platformVersion,
        waitTimeForStartupReload: config.waitTimeForStartupReload,
      };

      const onConnect = () => {
        this.socketIOClient?.emit("start_capture", url, target);
      };

      const onStart = (data?: unknown) => {
        console.info(`onStart: ${JSON.stringify(data)}`);

        eventListeners.onStart();
      };

      const onGetOperation = (data?: unknown) => {
        // console.info(`onGetOperation: ${JSON.stringify(data)}`);

        // TODO: Type check
        const capturedOperation = data as CapturedOperation;

        eventListeners.onGetOperation(capturedOperation);
      };

      const onGetScreenTransition = (data?: unknown) => {
        // console.info(`onGetScreenTransition: ${JSON.stringify(data)}`);

        // TODO: Type check
        const capturedScreenTransition = data as CapturedScreenTransition;

        eventListeners.onGetScreenTransition(capturedScreenTransition);
      };

      const onChangeBrowserHistory = (data?: unknown) => {
        console.info(`onChangeBrowserHistory: ${JSON.stringify(data)}`);

        const browserStatus = data as {
          canGoBack: boolean;
          canGoForward: boolean;
        };

        eventListeners.onChangeBrowserHistory(browserStatus);
      };

      const onUpdateAvailableWindows = (data?: unknown) => {
        console.info(`onUpdateAvailableWindows: ${JSON.stringify(data)}`);

        // TODO: Type check
        const updateWindowsInfo = data as {
          windowHandles: string[];
          currentWindowHandle: string;
        };

        eventListeners.onUpdateAvailableWindows(updateWindowsInfo);
      };

      const onChangeAlertVisibility = (data?: unknown) => {
        eventListeners.onChangeAlertVisibility(data as { isVisible: boolean });
      };

      const onPause = () => {
        eventListeners.onPause();
      };

      const onResume = () => {
        eventListeners.onResume();
      };

      const onError = (data?: unknown) => {
        console.info(`onError: ${JSON.stringify(data)}`);

        const error = data as ServerError;
        occurredError = {
          code: error.code === "unknown_error" ? "capture_failed" : error.code,
          message: error.message,
          details: error.details,
        };
      };

      await this.socketIOClient
        .connect(
          onConnect,
          ...[
            { eventName: "capture_started", eventHandler: onStart },
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
        )
        .catch((error) => {
          if (error.message === "disconnected") {
            occurredError = {
              code: "capture_socket_disconnected",
              message: "Disconnected from client side capture service.",
            };

            return;
          }

          throw error;
        });

      this.socketIOClient = null;

      return {
        succeeded: !occurredError,
        error: occurredError ? occurredError : undefined,
      };
    } catch (error) {
      console.error(error);

      return {
        succeeded: false,
        error: {
          code: "client_side_capture_service_not_found",
          message: "Client side capture service is not found.",
        },
      };
    }
  }

  /**
   * End recording.
   */
  public endCapture(): void {
    this.socketIOClient?.emit("stop_capture");
  }

  /**
   * Take a screenshot of the screen currently displayed by the recording browser.
   * @returns Screenshot file path.
   */
  public async takeScreenshot(): Promise<string> {
    if (!this.socketIOClient) {
      return "";
    }

    const screenshot = await this.socketIOClient.invoke(
      "take_screenshot",
      "screenshot_taken"
    );

    console.info(`takeScreenshot: ${screenshot}`);

    if (typeof screenshot !== "string") {
      return "";
    }

    return screenshot;
  }

  /**
   * Browser back the recording target browser.
   */
  public browserBack(): void {
    this.socketIOClient?.emit("browser_back");
  }

  /**
   * Browser forward the recording target browser.
   */
  public browserForward(): void {
    this.socketIOClient?.emit("browser_forward");
  }

  /**
   * Switch the window handle during capture
   * @param destWindowHandle  Window handler to switch to
   */
  public switchCapturingWindow(destWindowHandle: string): void {
    this.socketIOClient?.emit("switch_capturing_window", destWindowHandle);
  }

  public switchCancel(): void {
    this.socketIOClient?.emit("switch_cancel");
  }

  public selectCapturingWindow(): void {
    this.socketIOClient?.emit("select_capturing_window");
  }

  /**
   * Pause capturing.
   */
  public pauseCapturing(): void {
    this.socketIOClient?.emit("pause_capture");
  }

  /**
   * Resume capturing.
   */
  public resumeCapturing(): void {
    this.socketIOClient?.emit("resume_capture");
  }

  /**
   * Generate API URL.
   * @param url  URL after the fixed value.
   * @returns  URL
   */
  private buildAPIURL(url: string) {
    return new URL(`api/v1${url}`, this._serviceUrl).toString();
  }
}
