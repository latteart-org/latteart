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

import { SocketIOClient } from "../../network/websocket/client";
import { RESTClient, RESTClientImpl } from "../../network/http/client";
import {
  RepositoryAccessResult,
  createRepositoryAccessFailure,
  createRepositoryAccessSuccess,
  createConnectionRefusedFailure,
} from "../repository";
import {
  CaptureConfig,
  CapturedOperation,
  CapturedScreenTransition,
  Operation,
} from "../../service/types";
import { CaptureCLServerError } from "./types";

export class CaptureClServerAdapter {
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
      openInfoDialog: (message: string) => void;
    }
  ): Promise<{
    data: unknown;
    error?: CaptureCLServerError | undefined;
  }> {
    this.socketIOClient.existsConnecting = false;
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

      const openInfoDialog = (message: string) => {
        eventListeners.openInfoDialog(message);
      };

      await this.socketIOClient.connect(
        onDisconnect,
        openInfoDialog,
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
    this.socketIOClient.existsConnecting = false;
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
