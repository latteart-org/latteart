/**
 * Copyright 2025 NTT Corporation.
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

import { TestResultAccessor } from "../repositoryService";
import {
  CaptureConfig,
  Operation,
  TestStepNote,
  RunnableOperation,
  Video,
  CoverageSource,
} from "../types";
import { ServiceResult } from "../result";

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
  createCaptureClient(option: {
    testResult?: TestResultAccessor;
    videoRecorder?: { getCapturingVideo(): Promise<Video> };
    config: CaptureConfig;
    eventListeners: CaptureEventListeners;
  }): CaptureClClient;

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

export type CaptureEventListeners = {
  onEnd: (result: ServiceResult<void>) => Promise<void>;
  onAddTestStep?: (testStep: {
    id: string;
    operation: Operation;
    coverageSource: CoverageSource;
  }) => Promise<void>;
  onAddNote?: (testStepNote: TestStepNote) => Promise<void>;
  onAddTestPurpose?: (testStepNote: TestStepNote) => Promise<void>;
  onAddWindow?: (windowHandle: string, title: string) => Promise<void>;
  onPause?: () => void;
  onResume?: () => void;
  onUpdateWindowTitle?: (windowHandle: string, title: string) => Promise<void>;
  onCurrentWindowHostNameChanged?: () => Promise<void>;
};

export type CaptureClClient = {
  /**
   * start Capture
   * @param url target page url
   * @param option.firstTestPurpose first test purpose
   * @param option.compressScreenshots whether to compress screenshots
   */
  startCapture(
    url: string,
    option?: {
      compressScreenshots?: boolean;
      firstTestPurpose?: { value: string; details?: string };
    }
  ): Promise<ServiceResult<CaptureSession>>;
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
   * @param preScript function called before running each Operation
   * @param option.interval interval in milliseconds (default: duration between timestamps)
   */
  automate(option?: {
    preScript?: (operation: RunnableOperation, index: number) => Promise<void>;
    interval?: number;
  }): {
    /**
     * run Operations
     * @param operations operation contexts
     */
    runOperations(
      ...operations: RunnableOperation[]
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
          iframeIndex?: number;
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
   * pause capture
   */
  pauseCapture(): void;

  /**
   * resume capture
   */
  resumeCapture(): void;

  /**
   * set recording video
   * @param video recording video
   */
  setRecordingVideo(video: Video & { startTimestamp: number }): void;
};

export type CaptureCLServiceErrorCode =
  | "run_operation_failed"
  | "enter_values_failed"
  | "detect_devices_failed"
  | "invalid_url"
  | "web_driver_version_mismatch"
  | "connection_refused"
  | "web_driver_not_ready"
  | "appium_not_started"
  | "device_not_connected"
  | "invalid_operation"
  | "element_not_found"
  | "element_not_interactable"
  | "capture_failed"
  | "client_side_capture_service_not_found";
