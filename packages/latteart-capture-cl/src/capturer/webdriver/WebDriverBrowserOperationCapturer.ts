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

import { ElementInfo, Operation, ScreenElements } from "../../Operation";
import LoggingService from "../../logger/LoggingService";
import WebBrowser from "./browser/WebBrowser";
import { CaptureConfig } from "../../CaptureConfig";
import WebDriverClient from "@/webdriver/WebDriverClient";
import ScreenTransition from "../../ScreenTransition";
import { SpecialOperationType } from "../../SpecialOperationType";
import Autofill from "../../webdriver/autofill";
import { TimestampImpl } from "../../Timestamp";
import { CapturedItem } from "../../captureScripts/types";
import { ScreenMutation } from "@/ScreenMutation";
import {
  BrowserOperationCapturer,
  BrowserOperationCapturerCallbacks,
} from "../types";
import {
  createCapturedOperation,
  padDateValue,
} from "../common/capturingHelper";

/**
 * The class for monitoring and capturing browser operations via WebDriver.
 */
export default class WebDriverBrowserOperationCapturer
  implements BrowserOperationCapturer
{
  private actionQueue: Array<(capturer: WebBrowser) => Promise<void>> = [];

  private client: WebDriverClient;
  private config: CaptureConfig;
  private webBrowser: WebBrowser | null = null;
  private capturingIsPaused = false;

  private alertIsVisible = false;

  private onGetOperation: (operation: Operation) => void;
  private onGetScreenTransition: (operation: ScreenTransition) => void;
  private onGetMutation: (screenMutation: ScreenMutation[]) => void;
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
   * @param callbacks.onGetmution The callback when an mutation is captured.
   * @param callbacks.onGetScreenTransition The callback when a screen transition is captured.
   * @param callbacks.onBrowserClosed The callback when browser is closed.
   * @param callbacks.onBrowserHistoryChanged The callback when browser history changes.
   * @param callbacks.onBrowserWindowsChanged The callback when opened windows are changed.
   * @param callbacks.onError The callback when an error occurs.
   */
  constructor(
    client: WebDriverClient,
    config: CaptureConfig,
    callbacks: BrowserOperationCapturerCallbacks
  ) {
    this.client = client;
    this.config = config;
    this.onGetOperation = callbacks.onGetOperation;
    this.onGetScreenTransition = callbacks.onGetScreenTransition;
    this.onGetMutation = callbacks.onGetMutation;
    this.onBrowserClosed = callbacks.onBrowserClosed;
    this.onBrowserHistoryChanged = callbacks.onBrowserHistoryChanged;
    this.onBrowserWindowsChanged = callbacks.onBrowserWindowsChanged;
    this.onAlertVisibilityChanged = callbacks.onAlertVisibilityChanged;
    this.onError = callbacks.onError;
  }

  public async start(url: string, onStart: () => void): Promise<void> {
    const browser = new WebBrowser(this.client, this.config, {
      onGetOperation: this.onGetOperation,
      onGetMutation: this.onGetMutation,
      onGetScreenTransition: this.onGetScreenTransition,
      onHistoryChanged: this.onBrowserHistoryChanged,
      onWindowsChanged: this.onBrowserWindowsChanged,
      onAlertVisibilityChanged: this.onAlertVisibilityChanged,
    });

    try {
      await browser.open(url);
      onStart();
    } catch (error) {
      await browser.close();
      throw error;
    }

    this.webBrowser = browser;

    let acceptAlertOperation: Operation | null = null;

    let lastAlertIsVisible = false;
    let pageSource = "";
    let screenElements: ScreenElements[] = [];

    while (this.isCapturing()) {
      // Wait.
      await ((msec) => new Promise((resolve) => setTimeout(resolve, msec)))(
        200
      );

      const beforeWindow = this.webBrowser.currentWindow;

      try {
        this.alertIsVisible = await this.client.alertIsVisible();

        if (this.alertIsVisible !== lastAlertIsVisible) {
          lastAlertIsVisible = this.alertIsVisible;
          this.onAlertVisibilityChanged(this.alertIsVisible);
        }

        if (this.alertIsVisible) {
          if (acceptAlertOperation) {
            continue;
          }

          const currentWindow = this.webBrowser.currentWindow;

          if (!currentWindow) {
            continue;
          }

          const title = currentWindow.currentScreenSummary.title;
          const url = currentWindow.currentScreenSummary.url;
          const imageData = currentWindow.currentScreenSummary.screenshotBase64;

          acceptAlertOperation = createCapturedOperation({
            title,
            url,
            imageData,
            type: SpecialOperationType.ACCEPT_ALERT,
            windowHandle: currentWindow.windowHandle,
            pageSource,
            screenElements,
          });

          continue;
        }

        if (acceptAlertOperation) {
          if (this.config.captureArch === "polling") {
            // Delete items captured between the triggering operation and the alert display.
            await this.webBrowser.currentWindow?.deleteCapturedItems();
          }

          this.onGetOperation(
            new Operation({
              ...acceptAlertOperation,
              timestamp: new TimestampImpl().epochMilliseconds().toString(),
            })
          );

          acceptAlertOperation = null;
        }

        // Update browser state.
        await this.webBrowser.updateState(beforeWindow);

        if (this.webBrowser.countWindows() === 0) {
          LoggingService.info("No windows opened.");
          await this.webBrowser.close();

          break;
        }

        // Capture data in current window.
        const currentWindow = this.webBrowser.currentWindow;
        if (currentWindow) {
          if (this.capturingIsPaused) {
            await currentWindow.pauseCapturing();
          } else {
            await currentWindow.resumeCapturing();
          }

          const result = await currentWindow.captureData();

          screenElements = result.screenElements;
          pageSource = result.pageSource;
        }

        // Execute all registered actions.
        for (const action of [...this.actionQueue]) {
          try {
            await action(this.webBrowser);

            this.actionQueue.shift();
          } catch (error) {
            if (error instanceof Error && error.name === "NoSuchWindowError") {
              LoggingService.debug(`${error}`);

              break;
            }

            throw error;
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
          error.name === "NoSuchSessionError" ||
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

  public quit(): void {
    this.actionQueue.push(async (browser) => {
      await browser.close();
      this.webBrowser = null;
    });
  }

  public async registerCapturedItem(
    capturedItem: Omit<CapturedItem, "eventInfo">,
    option: {
      shouldTakeScreenshot?: boolean;
    } = {}
  ) {
    if (!this.webBrowser?.currentWindow) {
      return;
    }

    try {
      this.alertIsVisible = await this.client.alertIsVisible();
      this.actionQueue.push(async (browser) => {
        await browser.currentWindow?.registerCapturedItem(
          capturedItem,
          option.shouldTakeScreenshot ?? false
        );
      });
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      this.onError(error);
    }
  }

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

  private isCapturing(): boolean {
    return this.webBrowser?.isOpened ?? false;
  }

  public async switchCapturingWindow(destWindowHandle: string): Promise<void> {
    this.actionQueue.push(async (browser) => {
      if (!this.isCapturing) {
        return;
      }
      await browser.changeCurrentWindow(destWindowHandle);
    });
  }

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

  public async pauseCapturing(): Promise<void> {
    const currentWindow = this.webBrowser?.currentWindow;

    if (!this.capturingIsPaused && currentWindow) {
      this.capturingIsPaused = true;

      const screenElements =
        await currentWindow.collectAllFrameScreenElements();

      const title = currentWindow.currentScreenSummary.title;
      const url = currentWindow.currentScreenSummary.url;
      const imageData = currentWindow.currentScreenSummary.screenshotBase64;

      this.onGetOperation(
        createCapturedOperation({
          title,
          url,
          imageData,
          type: SpecialOperationType.PAUSE_CAPTURING,
          windowHandle: currentWindow.windowHandle,
          pageSource: await this.client.getCurrentPageText(),
          screenElements,
        })
      );
    }
  }

  public async resumeCapturing(): Promise<void> {
    const currentWindow = this.webBrowser?.currentWindow;

    if (this.capturingIsPaused && currentWindow) {
      this.capturingIsPaused = false;

      const screenElements =
        await currentWindow.collectAllFrameScreenElements();

      const title = currentWindow.currentScreenSummary.title;
      const url = currentWindow.currentScreenSummary.url;
      const imageData = currentWindow.currentScreenSummary.screenshotBase64;

      this.onGetOperation(
        createCapturedOperation({
          title,
          url,
          imageData,
          type: SpecialOperationType.RESUME_CAPTURING,
          windowHandle: currentWindow.windowHandle,
          pageSource: await this.client.getCurrentPageText(),
          screenElements,
        })
      );
    }
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
      const elementInfo = operation.elementInfo as ElementInfo & {
        iframeIndex?: number;
      };
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
                  ? padDateValue(operation.input, attributes)
                  : operation.input;

              await this.client.clearAndSendKeys(xpath, inputValue);
              await this.client.focusout();
            }
            break;

          default:
            break;
        }
      };

      const lockId = "runOperation";
      if (elementInfo.iframeIndex !== undefined) {
        await this.client.doActionInIframes(lockId, action, {
          iframeIndexes: [elementInfo.iframeIndex],
        });
      } else {
        await this.client.doActionInDefaultFrame(lockId, action);
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
}
