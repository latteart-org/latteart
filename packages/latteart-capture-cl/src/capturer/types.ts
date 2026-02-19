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

import { Operation } from "@/Operation";
import { CapturedItem } from "../captureScripts/types";
import ScreenTransition from "@/ScreenTransition";
import { ScreenMutation } from "@/ScreenMutation";

/**
 * Interface for monitoring and capturing browser operations.
 */
export type BrowserOperationCapturer = {
  /**
   * Start monitoring and capturing a page.
   * @param url Target URL.
   * @param onStart Callback function to be called when capturing is started.
   */
  start: (url: string, onStart: () => void) => Promise<void>;

  /**
   * Stop capturing operations.
   */
  quit: () => void;

  /**
   * Register captured item.
   * @param capturedItem captured item.
   * @param option option.
   */
  registerCapturedItem: (
    capturedItem: Omit<CapturedItem, "eventInfo">,
    option?: { shouldTakeScreenshot?: boolean } | undefined
  ) => Promise<void>;

  /**
   * Take a screenshot of the monitored screen.
   * If failed to take a screenshot, call a callback function and return empty string.
   * @param onError The callback when failed to take a screenshot.
   * @returns Screenshot.(base64)
   */
  getScreenshot: (onError?: (e: Error) => void) => Promise<string>;

  /**
   * Switch capturing window.
   * @param destWindowHandle Destination window handle.
   */
  switchCapturingWindow: (destWindowHandle: string) => Promise<void>;

  /**
   * Go back to previous page on capturing browser.
   */
  browserBack: () => void;

  /**
   * Go forward to next page on capturing browser.
   */
  browserForward: () => void;

  /**
   * Pause capturing.
   */
  pauseCapturing: () => Promise<void>;

  /**
   * Resume capturing.
   */
  resumeCapturing: () => Promise<void>;

  /**
   * Autofill input fields.
   * @param inputValueSets Input value sets.
   */
  autofill: (
    inputValueSets: {
      locatorType: "id" | "xpath";
      locator: string;
      locatorMatchType: "equals" | "contains";
      inputValue: string;
      iframeIndex?: number | undefined;
    }[]
  ) => Promise<void>;

  /**
   * Run operation.
   * @param operation Operation.
   */
  runOperation: (
    operation: Pick<
      Operation,
      "input" | "type" | "elementInfo" | "clientSize" | "scrollPosition"
    >
  ) => Promise<void>;

  /**
   * Run operation and wait for screen transition.
   * @param operation Operation.
   */
  runOperationAndWaitForScreenTransition?: (
    operation: Pick<
      Operation,
      "input" | "type" | "elementInfo" | "clientSize" | "scrollPosition"
    >
  ) => Promise<void>;
};

/**
 * Callbacks for BrowserOperationCapturer.
 */
export type BrowserOperationCapturerCallbacks = {
  onGetOperation: (operation: Operation) => void;
  onGetScreenTransition: (screenTransition: ScreenTransition) => void;
  onGetMutation: (screenMutation: ScreenMutation[]) => void;
  onBrowserClosed: () => void;
  onBrowserHistoryChanged: (browserStatus: {
    canGoBack: boolean;
    canGoForward: boolean;
  }) => void;
  onBrowserWindowsChanged: (
    windows: { windowHandle: string; url: string; title: string }[],
    currentWindowHandle: string,
    currentWindowHostNameChanged: boolean
  ) => void;
  onAlertVisibilityChanged: (isVisible: boolean) => void;
  onError: (error: Error) => void;
};
