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

import { ElementInfo, Operation } from "@/Operation";
import {
  CapturedElementInfo,
  CapturedItem,
  Iframe,
  MutatedElementInfo,
  ScreenMutationForScript,
  SuspendedCapturedItem,
} from "../../captureScripts/types";
import {
  BrowserOperationCapturer,
  BrowserOperationCapturerCallbacks,
} from "../types";
import { CDPClient, CDPDialog } from "./types";
import { CaptureConfig } from "@/CaptureConfig";
import ScreenTransition from "@/ScreenTransition";
import { ElementMutation, ScreenMutation } from "@/ScreenMutation";
import { setupScripts } from "@/captureScripts/cdp/setup";
import { captureScripts } from "@/captureScripts/cdp";
import {
  CapturedOperation,
  createCapturedOperation,
  isIgnoreOperation,
  padDateValue,
} from "../common/capturingHelper";
import CDPMarkedScreenShotTaker from "./CDPMarkedScreenshotTaker";
import LoggingService from "@/logger/LoggingService";
import { SpecialOperationType } from "@/SpecialOperationType";
import ScreenTransitionHistory from "../common/ScreenTransitionHistory";

/**
 * The class for monitoring and capturing browser operations via CDP.
 */
export class CDPBrowserOperationCapturer implements BrowserOperationCapturer {
  private client: CDPClient;
  private screenshotTaker: CDPMarkedScreenShotTaker;
  private config: CaptureConfig;
  private currentPageId?: string;
  private currentUrl?: string;
  private currentTitle?: string;
  private prevCapturedOperation?: CapturedOperation;
  private pageIdToScreenTransitionHistory: Map<
    string,
    ScreenTransitionHistory
  > = new Map();
  private currentDialog?: CDPDialog;
  private suspendedSwitchWindowOperation?: Operation;
  private isCapturingPaused: boolean = false;

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
  private onError: (error: Error) => void;
  private onGetScreenTransitionAfterOperation?: () => void;

  /**
   * Constructor.
   * @param client CDP client instance
   * @param config Capture config.
   * @param callbacks Event callbacks
   */
  constructor(
    cdpClient: CDPClient,
    config: CaptureConfig,
    callbacks: BrowserOperationCapturerCallbacks
  ) {
    this.client = cdpClient;
    this.screenshotTaker = new CDPMarkedScreenShotTaker(this.client);
    this.config = config;
    this.onGetOperation = callbacks.onGetOperation;
    this.onGetScreenTransition = callbacks.onGetScreenTransition;
    this.onGetMutation = callbacks.onGetMutation;
    this.onBrowserClosed = callbacks.onBrowserClosed;
    this.onBrowserHistoryChanged = callbacks.onBrowserHistoryChanged;
    this.onBrowserWindowsChanged = callbacks.onBrowserWindowsChanged;
    this.onError = callbacks.onError;
  }

  async start(url: string, onStart: () => void): Promise<void> {
    const { isEnabled, width, height } = this.config.captureWindowSize;
    const windowSize = isEnabled ? { windowSize: { width, height } } : {};

    const onWindowOpened = async (
      pageId: string,
      url: string,
      title: string
    ) => {
      await this.handleWindowsChange();

      const screenTransitionHistory = new ScreenTransitionHistory();
      screenTransitionHistory.add(url);
      this.pageIdToScreenTransitionHistory.set(pageId, screenTransitionHistory);
    };

    const onWindowFocused = async (
      pageId: string,
      url: string,
      title: string
    ) => {
      try {
        if (this.currentPageId === pageId) {
          return;
        }

        const beforePageId = this.currentPageId;
        const beforeUrl = this.currentUrl;
        const beforeTitle = this.currentTitle;
        this.currentPageId = pageId;
        this.currentUrl = url;
        this.currentTitle = title;

        await this.handleWindowsChange();

        if (beforePageId && beforeUrl && beforeTitle) {
          try {
            this.suspendedSwitchWindowOperation = undefined;

            const operation = createCapturedOperation({
              type: SpecialOperationType.SWITCH_WINDOW,
              windowHandle: beforePageId,
              url: beforeUrl,
              title: beforeTitle,
              input: pageId,
            });

            this.onGetOperation(operation);
          } catch (e) {
            LoggingService.debug(
              `CDPBrowserOperationCapturer: Error occurred in onWindowFocused, but ignored.`
            );
          }
          await this.handleScreenTransition(pageId, url, title);
          this.onGetScreenTransitionAfterOperation?.();
        } else {
          await this.handleScreenTransition(pageId, url, title);
        }
      } catch (e) {
        if (!(e instanceof Error)) {
          throw e;
        }

        if (e.name === "TargetCloseError") {
          LoggingService.debug(
            `CDPBrowserOperationCapturer: Target closed error occurred in onWindowFocused, but ignored.`
          );
          return;
        }

        this.onError(e);
      }
    };

    const { initialPageId, initialPageUrl, initialPageTitle } =
      await this.client.open(url, this.onBrowserClosed, this.onError, {
        headless: this.config.isHeadlessMode,
        ...windowSize,
        pageSetupConfig: {
          injectionScripts: [setupScripts.setupPage],
          exposedFunctions: [
            {
              name: "sendCapturedOperation",
              callback: async (pageId, data) => {
                LoggingService.debug(
                  `CDPBrowserOperationCapturer: sendCapturedOperation called, pageId=${pageId}`
                );
                LoggingService.debug(
                  `Data: ${JSON.stringify((data as any).suspendedOperation, null, 2)}`
                );

                try {
                  if (this.currentPageId !== pageId) {
                    this.currentPageId = pageId;
                    this.currentUrl = await this.client.getCurrentUrl(pageId);
                    this.currentTitle =
                      await this.client.getCurrentTitle(pageId);
                    if (this.suspendedSwitchWindowOperation) {
                      this.onGetOperation({
                        ...this.suspendedSwitchWindowOperation,
                        input: pageId,
                      });

                      const screenTransitionTimestamp =
                        parseInt(
                          this.suspendedSwitchWindowOperation.timestamp,
                          10
                        ) + 1;

                      this.suspendedSwitchWindowOperation = undefined;

                      await this.handleScreenTransition(
                        this.currentPageId,
                        this.currentUrl,
                        this.currentTitle,
                        screenTransitionTimestamp
                      );
                      this.onGetScreenTransitionAfterOperation?.();
                    }
                  }

                  await this.handleCapturedOperation(
                    data as {
                      suspendedOperation: SuspendedCapturedItem;
                      screenElements: {
                        iframeIndex?: number;
                        elements: CapturedElementInfo[];
                      };
                    }
                  );
                } catch (e) {
                  if (!(e instanceof Error)) {
                    throw e;
                  }

                  if (e.message.includes("Execution context was destroyed")) {
                    LoggingService.debug(
                      `CDPBrowserOperationCapturer: Execution context was destroyed error occurred in handleCapturedOperation, but ignored.`
                    );
                    return;
                  }

                  if (e.name === "TargetCloseError") {
                    LoggingService.debug(
                      `CDPBrowserOperationCapturer: Target closed error occurred in handleCapturedOperation, but ignored.`
                    );
                    return;
                  }

                  this.onError(e);
                }
              },
            },
            {
              name: "sendCapturedMutation",
              callback: async (pageId, data) => {
                LoggingService.debug(
                  `CDPBrowserOperationCapturer: sendCapturedMutation called, pageId=${pageId}`
                );
                LoggingService.debug(
                  `Data: ${JSON.stringify((data as any).mutation, null, 2)}`
                );

                try {
                  if (this.currentPageId !== pageId) {
                    this.currentPageId = pageId;
                    this.currentUrl = await this.client.getCurrentUrl(pageId);
                    this.currentTitle =
                      await this.client.getCurrentTitle(pageId);

                    if (this.suspendedSwitchWindowOperation) {
                      this.onGetOperation({
                        ...this.suspendedSwitchWindowOperation,
                        input: pageId,
                      });

                      const screenTransitionTimestamp =
                        parseInt(
                          this.suspendedSwitchWindowOperation.timestamp,
                          10
                        ) + 1;

                      this.suspendedSwitchWindowOperation = undefined;

                      await this.handleScreenTransition(
                        this.currentPageId,
                        this.currentUrl,
                        this.currentTitle,
                        screenTransitionTimestamp
                      );
                      this.onGetScreenTransitionAfterOperation?.();
                    }
                  }

                  await this.handleCapturedMutation(
                    data as {
                      mutation: ScreenMutationForScript;
                      screenElements: {
                        iframeIndex?: number;
                        elements: CapturedElementInfo[];
                      };
                    }
                  );
                } catch (e) {
                  if (!(e instanceof Error)) {
                    throw e;
                  }

                  if (e.message.includes("Execution context was destroyed")) {
                    LoggingService.debug(
                      `CDPBrowserOperationCapturer: Execution context was destroyed error occurred in handleCapturedMutation, but ignored.`
                    );
                    return;
                  }

                  if (e.name === "TargetCloseError") {
                    LoggingService.debug(
                      `CDPBrowserOperationCapturer: Target closed error occurred in handleCapturedMutation, but ignored.`
                    );
                    return;
                  }

                  this.onError(e);
                }
              },
            },
          ],
        },
        onWindowOpened,
        onWindowClosed: async (pageId) => {
          try {
            if (this.currentPageId === pageId) {
              const beforePageId = this.currentPageId;
              const beforeUrl = this.currentUrl;
              const beforeTitle = this.currentTitle;

              if (beforePageId && beforeUrl && beforeTitle) {
                this.suspendedSwitchWindowOperation = createCapturedOperation({
                  type: SpecialOperationType.SWITCH_WINDOW,
                  windowHandle: beforePageId,
                  url: beforeUrl,
                  title: beforeTitle,
                });
              }
            }

            await this.handleWindowsChange();

            this.pageIdToScreenTransitionHistory.delete(pageId);
          } catch (e) {
            if (!(e instanceof Error)) {
              throw e;
            }

            if (e.name === "TargetCloseError") {
              LoggingService.debug(
                `CDPBrowserOperationCapturer: Target closed error occurred in onWindowClosed, but ignored.`
              );
              return;
            }

            this.onError(e);
          }
        },
        onWindowFocused,
        onNavigated: async (pageId, url, title) => {
          try {
            this.currentPageId = pageId;
            this.currentUrl = url;
            this.currentTitle = title;

            await this.handleScreenTransition(pageId, url, title);
            this.onGetScreenTransitionAfterOperation?.();

            const screenTransitionHistory =
              this.pageIdToScreenTransitionHistory.get(pageId);

            if (!screenTransitionHistory) {
              return;
            }

            if (screenTransitionHistory.isLocked) {
              screenTransitionHistory.unlock();
              return;
            }

            const beforeUrl = screenTransitionHistory.getCurrentUrl();
            if (url === beforeUrl) {
              return;
            }

            screenTransitionHistory.add(url);

            this.onBrowserHistoryChanged({
              canGoBack: screenTransitionHistory.canBack(),
              canGoForward: screenTransitionHistory.canForward(),
            });
          } catch (e) {
            if (!(e instanceof Error)) {
              throw e;
            }

            if (e.name === "TargetCloseError") {
              LoggingService.debug(
                `CDPBrowserOperationCapturer: Target closed error occurred in onNavigated, but ignored.`
              );
              return;
            }

            this.onError(e);
          }
        },
        onDialogOpened: async (pageId, dialog) => {
          try {
            this.currentDialog = dialog;

            const url = await this.client.getCurrentUrl(pageId);
            const title = await this.client.getCurrentTitle(pageId);

            const operation = createCapturedOperation({
              type: SpecialOperationType.ACCEPT_ALERT,
              windowHandle: pageId,
              url,
              title,
            });

            this.onGetOperation(operation);
          } catch (e) {
            if (!(e instanceof Error)) {
              throw e;
            }

            if (e.name === "TargetCloseError") {
              LoggingService.debug(
                `CDPBrowserOperationCapturer: Target closed error occurred in onDialogOpened, but ignored.`
              );
              return;
            }

            this.onError(e);
          }
        },
      });

    onStart();

    await this.client.focusPage(initialPageId);

    onWindowOpened?.(initialPageId, initialPageUrl, initialPageTitle);
  }

  private async handleWindowsChange() {
    const pageIds = await this.client.listPageIds();
    const windows = await Promise.all(
      pageIds.map(async (pageId) => {
        const url = await this.client.getCurrentUrl(pageId);
        const title = await this.client.getCurrentTitle(pageId);
        return { windowHandle: pageId, url, title };
      })
    );
    this.onBrowserWindowsChanged(windows, this.currentPageId ?? "", false);
  }

  private async handleScreenTransition(
    pageId: string,
    url: string,
    title: string,
    timestamp?: number
  ): Promise<void> {
    if (url === "about:blank") {
      return;
    }

    if (this.isCapturingPaused) {
      await this.client.executeScriptInAllFrames(
        { pageId },
        captureScripts.pauseCapturing
      );
    } else {
      await this.client.executeScriptInAllFrames(
        { pageId },
        captureScripts.resumeCapturing
      );
    }

    const screenElements = await this.collectAllFrameScreenElements(pageId);

    const target = { pageId };
    const pageSource = await this.client.executeScript(target, () => {
      if (!document) {
        return "";
      }
      return document.getElementsByTagName("body")[0].innerText;
    });

    // Move the mouse cursor out of the viewport to avoid hover effects.
    await this.client.moveMouseOutOfViewport(pageId);

    const imageData = this.config.shouldTakeScreenshot
      ? await this.screenshotTaker.takeScreenshotWithMarkOf(target, [], true)
      : "";

    const clientSize = await this.client.executeScript({ pageId }, () => {
      return {
        width: window.outerWidth,
        height: window.outerHeight,
      };
    });

    const screenTransition = new ScreenTransition({
      windowHandle: pageId,
      title,
      url,
      imageData,
      pageSource,
      clientSize,
      screenElements,
    });
    if (timestamp) {
      screenTransition.timestamp = timestamp.toString();
    }

    this.onGetScreenTransition(screenTransition);
  }

  quit(): void {
    this.client
      .close()
      .then(() => {
        this.onBrowserClosed();
      })
      .catch((e) => {
        this.onError(e);
      });
  }

  async registerCapturedItem(
    capturedItem: Omit<CapturedItem, "eventInfo">,
    option?: { shouldTakeScreenshot?: boolean }
  ): Promise<void> {
    if (!this.currentPageId) {
      return;
    }

    const clientSize = await this.client.executeScript(
      { pageId: this.currentPageId },
      () => {
        return {
          width: window.outerWidth,
          height: window.outerHeight,
        };
      }
    );
    const elements = await this.collectAllFrameScreenElements(
      this.currentPageId
    );

    const operation = await this.convertToOperation(
      { ...capturedItem, elements },
      clientSize,
      option?.shouldTakeScreenshot ?? false
    );

    if (operation) {
      this.onGetOperation(operation);
    }
  }

  async getScreenshot(onError?: (e: Error) => void): Promise<string> {
    if (!this.currentPageId) {
      return "";
    }

    const target = { pageId: this.currentPageId };

    return this.screenshotTaker
      .takeScreenshotWithMarkOf(target, [])
      .catch((e) => {
        if (onError !== undefined) {
          onError(e);
        }
        return "";
      });
  }

  async switchCapturingWindow(destWindowHandle: string): Promise<void> {
    await this.client.focusPage(destWindowHandle);
  }

  browserBack(): void {
    (async () => {
      if (!this.currentPageId) {
        return;
      }

      const screenTransitionHistory = this.pageIdToScreenTransitionHistory.get(
        this.currentPageId
      );

      if (!screenTransitionHistory?.canBack()) {
        return;
      }

      const url = await this.client.getCurrentUrl(this.currentPageId ?? "");
      const title = await this.client.getCurrentTitle(this.currentPageId ?? "");

      const operation = createCapturedOperation({
        type: SpecialOperationType.BROWSER_BACK,
        windowHandle: this.currentPageId,
        url,
        title,
      });
      this.onGetOperation(operation);

      await this.client.goBack(this.currentPageId);
      screenTransitionHistory.back();
      screenTransitionHistory.lock();

      this.onBrowserHistoryChanged({
        canGoBack: screenTransitionHistory.canBack(),
        canGoForward: screenTransitionHistory.canForward(),
      });
    })();
  }

  browserForward(): void {
    (async () => {
      if (!this.currentPageId) {
        return;
      }

      const screenTransitionHistory = this.pageIdToScreenTransitionHistory.get(
        this.currentPageId
      );

      if (!screenTransitionHistory?.canForward()) {
        return;
      }

      const url = await this.client.getCurrentUrl(this.currentPageId ?? "");
      const title = await this.client.getCurrentTitle(this.currentPageId ?? "");

      const operation = createCapturedOperation({
        type: SpecialOperationType.BROWSER_FORWARD,
        windowHandle: this.currentPageId,
        url,
        title,
      });
      this.onGetOperation(operation);

      await this.client.goForward(this.currentPageId);
      screenTransitionHistory.forward();
      screenTransitionHistory.lock();

      this.onBrowserHistoryChanged({
        canGoBack: screenTransitionHistory.canBack(),
        canGoForward: screenTransitionHistory.canForward(),
      });
    })();
  }

  async pauseCapturing(): Promise<void> {
    if (!this.currentPageId || this.isCapturingPaused) {
      return;
    }

    this.isCapturingPaused = true;

    const url = await this.client.getCurrentUrl(this.currentPageId ?? "");
    const title = await this.client.getCurrentTitle(this.currentPageId ?? "");

    const operation = createCapturedOperation({
      type: SpecialOperationType.PAUSE_CAPTURING,
      windowHandle: this.currentPageId,
      url,
      title,
    });
    this.onGetOperation(operation);

    await this.client.executeScriptInAllFrames(
      { pageId: this.currentPageId ?? "" },
      captureScripts.pauseCapturing
    );
  }

  async resumeCapturing(): Promise<void> {
    if (!this.currentPageId || !this.isCapturingPaused) {
      return;
    }

    this.isCapturingPaused = false;

    const url = await this.client.getCurrentUrl(this.currentPageId ?? "");
    const title = await this.client.getCurrentTitle(this.currentPageId ?? "");

    const operation = createCapturedOperation({
      type: SpecialOperationType.RESUME_CAPTURING,
      windowHandle: this.currentPageId,
      url,
      title,
    });
    this.onGetOperation(operation);

    await this.client.executeScriptInAllFrames(
      { pageId: this.currentPageId ?? "" },
      captureScripts.resumeCapturing
    );
  }

  async autofill(
    inputValueSets: {
      locatorType: "id" | "xpath";
      locator: string;
      locatorMatchType: "equals" | "contains";
      inputValue: string;
      iframeIndex?: number | undefined;
    }[]
  ): Promise<void> {
    if (!this.currentPageId) {
      return;
    }

    for (const inputValueSet of inputValueSets) {
      const targetWebElements = await this.client.getMatchedElements({
        pageId: this.currentPageId,
        iframeIndex: inputValueSet.iframeIndex,
        locatorType: inputValueSet.locatorType,
        locator: inputValueSet.locator,
        locatorMatchType: inputValueSet.locatorMatchType,
      });

      const inputValue = inputValueSet.inputValue;

      for (const webElement of targetWebElements) {
        await new Promise((resolve) => setTimeout(resolve, 400));

        if (webElement.tagName === "select") {
          await webElement.select(inputValue);
          continue;
        }

        if (webElement.tagName === "textarea") {
          await webElement.type(inputValue, { clear: true });
          continue;
        }

        const inputType = await webElement.getAttribute("type");

        switch (inputType) {
          case "checkbox": {
            const isChecked =
              (await webElement.getAttribute("checked")) === "true";

            if (
              (isChecked && inputValue === "off") ||
              (!isChecked && inputValue === "on")
            ) {
              try {
                await webElement.click();
              } catch (error) {
                if (error instanceof Error) {
                  LoggingService.error("failed setValueToCheckbox", error);
                }
              }
            }
            break;
          }
          case "radio": {
            const isChecked = await webElement.getAttribute("checked");
            if (!isChecked && inputValue === "on") {
              try {
                await webElement.click();
              } catch (error) {
                if (error instanceof Error) {
                  LoggingService.error("failed setValueToCheckbox", error);
                }
              }
            }
            break;
          }
          case "date":
          case "datetime-local": {
            const yyyymmdd = inputValue.split("-");
            const max = await webElement.getAttribute("max");

            if (max) {
              const maxLength = max.split("-")[0].length;
              const year =
                maxLength < 4 || maxLength > 6
                  ? yyyymmdd[0].padStart(6, "0")
                  : yyyymmdd[0].padStart(maxLength, "0");

              return await webElement.type(
                `${year}-${yyyymmdd[1]}-${yyyymmdd[2]}`,
                { clear: true }
              );
            }

            await webElement.type(
              `${yyyymmdd[0].padStart(6, "0")}-${yyyymmdd[1]}-${yyyymmdd[2]}`,
              { clear: true }
            );
            break;
          }
          default: {
            await webElement.type(inputValue, { clear: true });
            break;
          }
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  async runOperation(
    operation: Pick<
      Operation,
      "input" | "type" | "elementInfo" | "clientSize" | "scrollPosition"
    >
  ): Promise<void> {
    for (let i = 0; i < 30; i++) {
      if (this.currentPageId) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (!this.currentPageId) {
      return;
    }

    const pageId = this.currentPageId;

    if (operation.clientSize) {
      await this.client.resizeWindow(
        pageId,
        operation.clientSize.width,
        operation.clientSize.height
      );
    }
    if (operation.scrollPosition) {
      await this.client.executeScript(
        { pageId },
        (x, y) => {
          window.scrollTo(x, y);
        },
        operation.scrollPosition.x,
        operation.scrollPosition.y
      );

      await new Promise((resolve) => setTimeout(resolve, 500));
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

    await new Promise((resolve) => setTimeout(resolve, 500));

    switch (operation.type as SpecialOperationType) {
      case SpecialOperationType.ACCEPT_ALERT:
        try {
          if (!this.currentDialog) {
            throw new Error("No dialog to accept.");
          }
          await this.currentDialog.accept(operation.input);
        } catch (error) {
          LoggingService.error(`Failed to accept dialog: ${error}`);
        } finally {
          this.currentDialog = undefined;
        }
        return;

      case SpecialOperationType.DISMISS_ALERT:
        try {
          if (!this.currentDialog) {
            throw new Error("No dialog to dismiss.");
          }
          await this.currentDialog.dismiss();
        } catch (error) {
          LoggingService.error(`Failed to dismiss dialog: ${error}`);
        } finally {
          this.currentDialog = undefined;
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

    try {
      const operationType = operation.type;
      const elementInfo = operation.elementInfo as ElementInfo & {
        iframeIndex?: number;
      };
      const target = {
        pageId,
        iframeIndex: elementInfo.iframe?.index,
        xpath: elementInfo.xpath.toLowerCase(),
      };

      switch (operationType) {
        case "click":
          await this.client.click(target);
          break;

        case "change":
          if (elementInfo.tagname.toLowerCase() === "select") {
            await this.client.click(target);
            await this.client.select(target, operation.input);
          }

          if (
            ["input", "textarea"].includes(elementInfo.tagname.toLowerCase())
          ) {
            const attributes = elementInfo.attributes;
            const inputValue =
              attributes.type === "date" || attributes.type === "datetime-local"
                ? padDateValue(operation.input, attributes)
                : operation.input;

            await this.client.type(target, inputValue, { clear: true });
            await this.client.pressKey(target.pageId, "Tab");
          }
          break;

        default:
          break;
      }
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      LoggingService.error(error.message, error);

      if (error.name === "TimeoutError") {
        const e = new Error("No such element error.");
        e.name = "NoSuchElementError";
        throw e;
      }

      const e = new Error("Element not interactable error.");
      e.name = "ElementNotInteractableError";
      throw e;
    }
  }

  async runOperationAndWaitForScreenTransition(
    operation: Pick<
      Operation,
      "input" | "type" | "elementInfo" | "clientSize" | "scrollPosition"
    >
  ): Promise<void> {
    for (let i = 0; i < 30; i++) {
      if (this.currentPageId) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (
      operation.type === SpecialOperationType.SWITCH_WINDOW &&
      operation.input === this.currentPageId
    ) {
      LoggingService.debug(
        `CDPBrowserOperationCapturer: Skipped waiting for screen transition after operation because the target window is the current window.`
      );
      return;
    }

    await Promise.race([
      new Promise<void>((resolve, reject) => {
        LoggingService.debug(
          `CDPBrowserOperationCapturer: Waiting for screen transition after operation...`
        );
        this.onGetScreenTransitionAfterOperation = () => {
          LoggingService.debug(
            `CDPBrowserOperationCapturer: Screen transition after operation captured.`
          );
          resolve();
        };

        this.runOperation(operation).catch((e) => {
          reject(e);
        });
      }),
      new Promise<void>((_, reject) => {
        setTimeout(() => {
          const e = new Error(
            "Timeout waiting for screen transition after operation."
          );
          e.name = "ScreenTransitionTimeoutError";

          reject(e);
        }, 10000);
      }),
    ]).finally(() => {
      this.onGetScreenTransitionAfterOperation = undefined;
    });
  }

  async registerMutatedItem(
    screenMutationForScript: ScreenMutationForScript,
    option?: { shouldTakeScreenshot?: boolean }
  ) {
    if (!this.currentPageId) {
      return;
    }

    const clientSize = await this.client.executeScript(
      { pageId: this.currentPageId },
      () => {
        return {
          width: window.outerWidth,
          height: window.outerHeight,
        };
      }
    );

    const convertMutatedElementInfoToElementInfo = (
      mutatedElementInfo: MutatedElementInfo,
      iframe?: Iframe
    ) => {
      return {
        tagname: mutatedElementInfo.tagname,
        text: mutatedElementInfo.text,
        value: mutatedElementInfo.value,
        xpath: mutatedElementInfo.xpath,
        attributes: mutatedElementInfo.attributes,
        boundingRect: { top: 0, left: 0, width: 0, height: 0 },
        iframe: iframe,
        innerHeight: 0,
        innerWidth: 0,
        outerHeight: 0,
        outerWidth: 0,
      };
    };

    const elementMutations: ElementMutation[] =
      screenMutationForScript.elementMutations.map((mutation) => {
        const targetElement = convertMutatedElementInfoToElementInfo(
          mutation.targetElement,
          screenMutationForScript.iframe
        );

        switch (mutation.type) {
          case "childElementAddition":
            return {
              ...mutation,
              targetElement,
              addedChildElement: convertMutatedElementInfoToElementInfo(
                mutation.addedChildElement,
                screenMutationForScript.iframe
              ),
            };
          case "childElementRemoval":
            return {
              ...mutation,
              targetElement,
              removedChildElement: convertMutatedElementInfoToElementInfo(
                mutation.removedChildElement,
                screenMutationForScript.iframe
              ),
            };
          default:
            return { ...mutation, targetElement };
        }
      });

    const pageId = this.currentPageId;
    const target = { pageId };

    // Take a screenshot.
    const imageData = option?.shouldTakeScreenshot
      ? await this.screenshotTaker.takeScreenshotWithMarkOf(target, [])
      : "";

    const screenMutation: ScreenMutation = {
      elementMutations,
      windowHandle: pageId,
      url: await this.client.getCurrentUrl(pageId),
      title: await this.client.getCurrentTitle(pageId),
      scrollPosition: screenMutationForScript.scrollPosition,
      clientSize,
      imageData,
      timestamp: screenMutationForScript.timestamp,
    };

    this.onGetMutation([screenMutation]);
  }

  private async handleCapturedOperation(data: {
    suspendedOperation: SuspendedCapturedItem;
    screenElements: { iframeIndex?: number; elements: CapturedElementInfo[] };
  }): Promise<void> {
    await this.registerCapturedItem(data.suspendedOperation, {
      shouldTakeScreenshot: this.config.shouldTakeScreenshot,
    });

    await this.refireSuspendedEvent(data.suspendedOperation);

    this.prevCapturedOperation = data.suspendedOperation.operation;
  }

  private async handleCapturedMutation(data: {
    mutation: ScreenMutationForScript;
    screenElements: { iframeIndex?: number; elements: CapturedElementInfo[] };
  }): Promise<void> {
    await this.registerMutatedItem(data.mutation, {
      shouldTakeScreenshot: this.config.shouldTakeScreenshot,
    });
  }

  private async collectAllFrameScreenElements(pageId: string): Promise<
    {
      iframeIndex?: number;
      elements: CapturedElementInfo[];
    }[]
  > {
    const results = (
      await this.client.executeScriptInAllFrames(
        { pageId },
        captureScripts.collectScreenElements
      )
    ).map(({ iframeIndex, result }) => {
      return { iframeIndex, elements: result };
    });

    return [...results];
  }

  private async convertToOperation(
    capturedItem: CapturedItem & {
      elements: {
        iframeIndex?: number;
        elements: CapturedElementInfo[];
      }[];
    },
    clientSize: { width: number; height: number },
    shouldTakeScreenshot: boolean
  ) {
    if (!this.currentPageId) {
      return;
    }

    if (
      isIgnoreOperation(
        capturedItem.operation,
        this.prevCapturedOperation ? [this.prevCapturedOperation] : []
      )
    ) {
      LoggingService.debug(
        `CDPBrowserOperationCapturer: Ignored operation: ${capturedItem.operation.type}`
      );
      return;
    }

    const pageId = this.currentPageId;
    const target = {
      pageId,
      iframeIndex: capturedItem.iframe?.index,
    };

    // Take a screenshot.
    const boundingRect = capturedItem.operation.elementInfo.boundingRect;
    const imageData = shouldTakeScreenshot
      ? await this.screenshotTaker.takeScreenshotWithMarkOf(target, [
          boundingRect,
        ])
      : "";

    const elementInfo: ElementInfo = {
      tagname: capturedItem.operation.elementInfo.tagname,
      text: capturedItem.operation.elementInfo.text,
      value: capturedItem.operation.elementInfo.value,
      xpath: capturedItem.operation.elementInfo.xpath,
      attributes: capturedItem.operation.elementInfo.attributes,
      boundingRect: capturedItem.operation.elementInfo.boundingRect,
      iframe: capturedItem.iframe,
      innerHeight: capturedItem.operation.elementInfo.innerHeight,
      innerWidth: capturedItem.operation.elementInfo.innerWidth,
      outerHeight: capturedItem.operation.elementInfo.outerHeight,
      outerWidth: capturedItem.operation.elementInfo.outerWidth,
    };
    if (capturedItem.operation.elementInfo.checked !== undefined) {
      elementInfo.checked = capturedItem.operation.elementInfo.checked;
    }

    const pageSource = await this.client.executeScript(target, () => {
      if (!document) {
        return "";
      }
      return document.getElementsByTagName("body")[0].innerText;
    });

    return createCapturedOperation({
      type: capturedItem.operation.type,
      windowHandle: pageId,
      url: capturedItem.operation.url,
      title: capturedItem.operation.title,
      input: capturedItem.operation.input,
      scrollPosition: capturedItem.operation.scrollPosition,
      clientSize,
      elementInfo,
      screenElements: capturedItem.elements,
      imageData,
      pageSource,
      timestamp: capturedItem.operation.timestamp,
    });
  }

  private async refireSuspendedEvent(capturedItem: SuspendedCapturedItem) {
    if (!this.currentPageId) {
      return;
    }

    if (capturedItem.suspendedEvent.refireType === "inputDate") {
      await this.client.pressKey(this.currentPageId, "Space");
    } else {
      await this.client.executeScript(
        { pageId: this.currentPageId, iframeIndex: capturedItem.iframe?.index },
        captureScripts.refireEvent,
        capturedItem.suspendedEvent.eventInfo
      );
    }
  }
}
