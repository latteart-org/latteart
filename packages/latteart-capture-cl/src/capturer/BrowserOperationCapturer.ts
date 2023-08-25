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

import { Operation, ScreenElements } from "../Operation";
import LoggingService from "../logger/LoggingService";
import WebBrowser from "./browser/WebBrowser";
import { CaptureConfig } from "../CaptureConfig";
import WebDriverClient from "@/webdriver/WebDriverClient";
import ScreenTransition from "../ScreenTransition";
import { SpecialOperationType } from "../SpecialOperationType";
import Autofill from "../webdriver/autofill";
import { TimestampImpl } from "../Timestamp";
import { CapturedData } from "./captureScript";

/**
 * The class for monitoring and getting browser operations.
 */
export default class BrowserOperationCapturer {
  private actionQueue: Array<(capturer: WebBrowser) => Promise<void>> = [];

  private client: WebDriverClient;
  private config: CaptureConfig;
  private webBrowser: WebBrowser | null = null;
  private capturingIsPaused = false;

  private alertIsVisible = false;

  private onGetOperation: (operation: Operation) => void;
  private onGetScreenTransition: (operation: ScreenTransition) => void;
  private onBrowserClosed: () => void;
  private onBrowserHistoryChanged: (browserStatus: {
    canGoBack: boolean;
    canGoForward: boolean;
  }) => void;
  private onBrowserWindowsChanged: (
    windows: { windowHandle: string; url: string; title: string }[],
    currentWindowHandle: string,
    currentWindowHostNameChanged: boolean
  ) => void;
  private onAlertVisibilityChanged: (isVisible: boolean) => void;
  private onError: (error: Error) => void;

  /**
   * Constructor.
   * @param client The WebDriver client to access a browser.
   * @param config Capture config.
   * @param callbacks.onGetOperation The callback when an operation is captured.
   * @param callbacks.onGetScreenTransition The callback when a screen transition is captured.
   * @param callbacks.onBrowserClosed The callback when browser is closed.
   * @param callbacks.onBrowserHistoryChanged The callback when browser history changes.
   * @param callbacks.onBrowserWindowsChanged The callback when opened windows are changed.
   * @param callbacks.onError The callback when an error occurs.
   */
  constructor(
    client: WebDriverClient,
    config: CaptureConfig,
    callbacks: {
      onGetOperation: (operation: Operation) => void;
      onGetScreenTransition: (screenTransition: ScreenTransition) => void;
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
    }
  ) {
    this.client = client;
    this.config = config;
    this.onGetOperation = callbacks.onGetOperation;
    this.onGetScreenTransition = callbacks.onGetScreenTransition;
    this.onBrowserClosed = callbacks.onBrowserClosed;
    this.onBrowserHistoryChanged = callbacks.onBrowserHistoryChanged;
    this.onBrowserWindowsChanged = callbacks.onBrowserWindowsChanged;
    this.onAlertVisibilityChanged = callbacks.onAlertVisibilityChanged;
    this.onError = callbacks.onError;
  }

  /**
   * Start monitoring and capturing a page.
   * @param url Target URL.
   */
  public async start(url: string, onStart: () => void): Promise<void> {
    const browser = new WebBrowser(this.client, this.config, {
      onGetOperation: this.onGetOperation,
      onGetScreenTransition: this.onGetScreenTransition,
      onHistoryChanged: this.onBrowserHistoryChanged,
      onWindowsChanged: this.onBrowserWindowsChanged,
      onAlertVisibilityChanged: this.onAlertVisibilityChanged,
    });

    try {
      await browser.open(url);
      onStart();
    } catch (error) {
      if (error instanceof Error) {
        this.onError(error);
        this.onBrowserClosed();

        return;
      }
      throw error;
    }

    this.webBrowser = browser;

    let acceptAlertOperation: Operation | null = null;

    let shouldDeleteCapturedData = false;
    let lastAlertIsVisible = false;
    let pageSource = "";
    let screenElements: ScreenElements[] | undefined = [];

    while (this.isCapturing()) {
      try {
        this.alertIsVisible = await this.client.alertIsVisible();

        if (!this.alertIsVisible) {
          pageSource = await this.client.getCurrentPageText();

          screenElements =
            await this.webBrowser.currentWindow?.collectAllFrameScreenElements();

          if (shouldDeleteCapturedData && this.config.mediaType === "image") {
            await this.webBrowser.currentWindow?.deleteCapturedDatas();
            shouldDeleteCapturedData = false;
          }
        }

        if (this.alertIsVisible !== lastAlertIsVisible) {
          lastAlertIsVisible = this.alertIsVisible;
          this.onAlertVisibilityChanged(this.alertIsVisible);
        }
        // Wait.
        await ((msec) => new Promise((resolve) => setTimeout(resolve, msec)))(
          100
        );

        const beforeWindow = this.webBrowser.currentWindow;

        // Delete actions after executing all registered actions.
        await Promise.all(
          this.actionQueue.map(async (action) => {
            await action(this.webBrowser!);
          })
        );
        this.actionQueue = [];

        if (!this.isCapturing()) {
          return;
        }

        if (this.alertIsVisible) {
          if (acceptAlertOperation) {
            shouldDeleteCapturedData = true;
            continue;
          }

          const currentWindow = this.webBrowser.currentWindow;

          if (!currentWindow) {
            continue;
          }

          acceptAlertOperation = currentWindow.createCapturedOperation({
            type: SpecialOperationType.ACCEPT_ALERT,
            windowHandle: currentWindow.windowHandle,
            pageSource,
            screenElements,
          });

          continue;
        }

        if (acceptAlertOperation) {
          this.onGetOperation(
            new Operation({
              ...acceptAlertOperation,
              timestamp: new TimestampImpl().epochMilliseconds().toString(),
            })
          );

          acceptAlertOperation = null;
        }

        // Updates browser state.
        await this.webBrowser.updateState(beforeWindow);

        if (this.webBrowser.isWindowSelecting) {
          continue;
        }

        if (this.webBrowser.countWindows() === 0) {
          await this.webBrowser.close();

          return;
        }

        // Capture operations.
        const currentWindow = this.webBrowser.currentWindow;

        if (currentWindow) {
          if (this.capturingIsPaused) {
            await currentWindow.pauseCapturing();
          } else {
            await currentWindow.resumeCapturing();
          }

          const captureArch =
            this.config.mediaType === "image" ? "pull" : "push";

          await currentWindow.getReadyToCapture(captureArch);
          await currentWindow.captureScreenTransition();

          if (captureArch === "pull") {
            await currentWindow.captureOperations();
          }
        }
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }
        if (
          error.name === "UnexpectedAlertOpenError" ||
          error.name === "TimeoutError"
        ) {
          LoggingService.debug(`${error}`);
          continue;
        }

        try {
          await this.webBrowser.close();
        } catch (error) {
          LoggingService.debug(`${error}`);
        }

        if (
          error.name === "WebDriverError" ||
          error.name === "NoSuchWindowError" ||
          (error.name === "Error" && error.message.startsWith("ECONNREFUSED"))
        ) {
          LoggingService.debug(`${error}`);

          break;
        }

        throw error;
      }
    }

    this.onBrowserClosed();
  }

  /**
   * Stop capturing operations.
   */
  public quit(): void {
    this.actionQueue.push(async (browser) => {
      this.onBrowserClosed();

      await browser.close();
      this.webBrowser = null;
    });
  }

  /**
   * Register captured data.
   * @param capturedData captured data.
   * @param option option.
   */
  public async registerCapturedData(
    capturedData: Omit<CapturedData, "eventInfo">,
    option: {
      shouldTakeScreenshot?: boolean;
    } = {}
  ) {
    if (!this.webBrowser?.currentWindow) {
      return;
    }

    return this.webBrowser.currentWindow.registerCapturedData(
      capturedData,
      option.shouldTakeScreenshot ?? false
    );
  }

  /**
   * Take a screenshot of the monitored screen.
   * If failed to take a screenshot, call a callback function and return empty string.
   * @param onError The callback when failed to take a screenshot.
   * @returns Screenshot.(base64)
   */
  public async getScreenshot(onError?: (e: Error) => void): Promise<string> {
    if (!this.isCapturing()) {
      return "";
    }
    const currentWindow = this.webBrowser!.currentWindow;
    if (!currentWindow) {
      return "";
    }
    await currentWindow.focus();
    await currentWindow.sleep(500);
    return currentWindow.getScreenshot().catch((e) => {
      if (onError !== undefined) {
        onError(e);
      }
      return "";
    });
  }

  /**
   * Whether it is capturing or not.
   * @returns 'true': It is capturing, 'false': It is not capturing.
   */
  public isCapturing(): boolean {
    return this.webBrowser?.isOpened ?? false;
  }

  public isWindowSelecting(): boolean {
    return this.webBrowser?.isWindowSelecting ?? false;
  }

  /**
   * Switch capturing window.
   * @param destWindowHandle Destination window handle.
   */
  public async switchCapturingWindow(destWindowHandle: string): Promise<void> {
    this.actionQueue.push(async (browser) => {
      if (!this.isCapturing) {
        return;
      }
      await browser.unprotectAllWindow();
      await browser.switchWindowTo(destWindowHandle);
    });
  }

  public async switchCancel(): Promise<void> {
    if (!this.isCapturing || !this.webBrowser) {
      return;
    }
    await this.webBrowser.unprotectAllWindow();
  }

  public async selectCapturingWindow(): Promise<void> {
    if (!this.isCapturing || !this.webBrowser) {
      return;
    }
    await this.webBrowser.protectAllWindow();
  }

  /**
   * Go back to previous page on capturing browser.
   */
  public browserBack(): void {
    this.actionQueue.push(async (browser) => {
      if (!this.canDoBrowserBack()) {
        return;
      }
      const currentWindow = browser.currentWindow;
      if (!currentWindow) {
        return;
      }

      const operation = await currentWindow.browserBack();
      this.onGetOperation(operation);
    });
  }

  /**
   * Go forward to next page on capturing browser.
   */
  public browserForward(): void {
    this.actionQueue.push(async (browser) => {
      if (!this.canDoBrowserForward()) {
        return;
      }
      const currentWindow = browser.currentWindow;
      if (!currentWindow) {
        return;
      }

      const operation = await currentWindow.browserForward();
      this.onGetOperation(operation);
    });
  }

  /**
   * Pause capturing.
   */
  public async pauseCapturing(): Promise<void> {
    const currentWindow = this.webBrowser?.currentWindow;

    if (!this.capturingIsPaused && currentWindow) {
      this.capturingIsPaused = true;

      const screenElements =
        await currentWindow.collectAllFrameScreenElements();

      this.onGetOperation(
        currentWindow.createCapturedOperation({
          type: SpecialOperationType.PAUSE_CAPTURING,
          windowHandle: currentWindow.windowHandle,
          pageSource: await this.client.getCurrentPageText(),
          screenElements,
        })
      );
    }
  }

  /**
   * Resume capturing.
   */
  public async resumeCapturing(): Promise<void> {
    const currentWindow = this.webBrowser?.currentWindow;

    if (this.capturingIsPaused && currentWindow) {
      this.capturingIsPaused = false;

      const screenElements =
        await currentWindow.collectAllFrameScreenElements();

      this.onGetOperation(
        currentWindow.createCapturedOperation({
          type: SpecialOperationType.RESUME_CAPTURING,
          windowHandle: currentWindow.windowHandle,
          pageSource: await this.client.getCurrentPageText(),
          screenElements,
        })
      );
    }
  }

  /**
   * Set shield enabled.
   */
  public async setShieldEnabled(isShieldEnabled: boolean): Promise<void> {
    await this.webBrowser?.setShieldEnabled(isShieldEnabled);
  }

  public async autofill(
    inputValueSets: {
      locatorType: "id" | "xpath";
      locator: string;
      locatorMatchType: "equals" | "contains";
      inputValue: string;
      iframeIndex?: number;
    }[]
  ): Promise<void> {
    if (this.webBrowser?.currentWindow) {
      await new Autofill(
        this.client,
        inputValueSets,
        this.webBrowser.currentWindow
      ).execute();
    }
  }

  /**
   * Run operation.
   * @param operation Operation.
   */
  public async runOperation(
    operation: Pick<
      Operation,
      "input" | "type" | "elementInfo" | "clientSize" | "scrollPosition"
    >
  ): Promise<void> {
    if (operation.clientSize) {
      await this.client.setClientSize(
        operation.clientSize.width,
        operation.clientSize.height
      );
    }
    if (operation.scrollPosition) {
      await this.client.setScrollPosition(
        operation.scrollPosition.x,
        operation.scrollPosition.y
      );
      await this.client.sleep(500);
    }

    if (
      ![
        SpecialOperationType.ACCEPT_ALERT,
        SpecialOperationType.DISMISS_ALERT,
        SpecialOperationType.BROWSER_BACK,
        SpecialOperationType.BROWSER_FORWARD,
        SpecialOperationType.SWITCH_WINDOW,
        "click",
        "change",
      ].includes(operation.type)
    ) {
      const error = new Error("Invalid operation error.");
      error.name = "InvalidOperationError";
      throw error;
    }

    if (!this.webBrowser?.currentWindow) {
      throw new Error("CurrentWindowNothing");
    }

    if (
      operation.type === SpecialOperationType.ACCEPT_ALERT ||
      operation.type === SpecialOperationType.DISMISS_ALERT
    ) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    } else {
      await this.webBrowser.currentWindow.removeScreenLock();
    }

    try {
      switch (operation.type as SpecialOperationType) {
        case SpecialOperationType.ACCEPT_ALERT:
          while (await this.client.alertIsVisible()) {
            await this.client.acceptAlert(operation.input);
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
          return;

        case SpecialOperationType.DISMISS_ALERT:
          while (await this.client.alertIsVisible()) {
            await this.client.dismissAlert();
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
          return;

        case SpecialOperationType.BROWSER_BACK:
          this.browserBack();
          return;

        case SpecialOperationType.BROWSER_FORWARD:
          this.browserForward();
          return;

        case SpecialOperationType.SWITCH_WINDOW:
          await this.switchCapturingWindow(operation.input);
          return;

        default:
          break;
      }

      if (operation.elementInfo === null) {
        return;
      }

      const operationType = operation.type;
      const elementInfo = operation.elementInfo;
      const xpath = elementInfo.xpath.toLowerCase();

      const action = async () => {
        switch (operationType) {
          case "click":
            await this.client.clickElement(xpath);
            break;

          case "change":
            if (elementInfo.tagname.toLowerCase() === "select") {
              await this.client.clickElement(xpath);
              await this.client.selectOption(xpath, operation.input);
            }

            if (
              ["input", "textarea"].includes(elementInfo.tagname.toLowerCase())
            ) {
              const attributes = elementInfo.attributes;
              const inputValue =
                attributes.type === "date" ||
                attributes.type === "datetime-local"
                  ? this.padDateValue(operation.input, attributes)
                  : operation.input;

              await this.client.clearAndSendKeys(xpath, inputValue);
            }
            break;

          default:
            break;
        }
      };

      if (elementInfo.iframeIndex !== undefined) {
        await this.client.doActionInIframes("runOperation", action, {
          iframeIndexes: [elementInfo.iframeIndex],
        });
      } else {
        await action();
      }
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "WebDriverError" || error.name === "NoSuchWindowError")
      ) {
        LoggingService.debug(error.name);
      } else {
        throw error;
      }
    }
  }

  private canDoBrowserBack() {
    if (!this.isCapturing()) {
      return false;
    }
    const currentWindow = this.webBrowser!.currentWindow;
    if (!currentWindow) {
      return false;
    }
    return currentWindow.canDoBrowserBack();
  }

  private canDoBrowserForward() {
    if (!this.isCapturing()) {
      return false;
    }
    const currentWindow = this.webBrowser!.currentWindow;
    if (!currentWindow) {
      return false;
    }
    return currentWindow.canDoBrowserForward();
  }

  private padDateValue(value: string, attributes: { [key: string]: string }) {
    const yyyymmdd = value.split("-");

    if (attributes.max) {
      const max = attributes.max.split("-")[0].length;
      const year =
        max < 4 || max > 6
          ? yyyymmdd[0].padStart(6, "0")
          : yyyymmdd[0].padStart(max, "0");

      return `${year}-${yyyymmdd[1]}-${yyyymmdd[2]}`;
    }
    return `${yyyymmdd[0].padStart(6, "0")}-${yyyymmdd[1]}-${yyyymmdd[2]}`;
  }
}
