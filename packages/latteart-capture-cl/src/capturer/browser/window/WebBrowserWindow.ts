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

import { Operation, ElementInfo, ScreenElements } from "../../../Operation";
import ScreenTransitionHistory from "./ScreenTransitionHistory";
import LoggingService from "../../../logger/LoggingService";
import WebDriverClient from "@/webdriver/WebDriverClient";
import ScreenSummary from "./ScreenSummary";
import MarkedScreenShotTaker from "./MarkedScreenshotTaker";
import ScreenTransition from "../../../ScreenTransition";
import WebBrowser from "../WebBrowser";
import { SpecialOperationType } from "../../../SpecialOperationType";
import { Key } from "selenium-webdriver";
import {
  CapturedItem,
  CapturedElementInfo,
  captureScripts,
  Iframe,
  SuspendedCapturedItem,
} from "@/capturer/captureScripts";
import { CapturedOperation, isIgnoreOperation } from "./webBrowserWindowHelper";

type CapturingAction = (iframe?: Iframe) => Promise<{
  capturedItems: SuspendedCapturedItem[];
  screenElements: { iframeIndex?: number; elements: CapturedElementInfo[] };
} | null>;

/**
 * The class for operating for window.
 */
export default class WebBrowserWindow {
  public currentScreenSummary: ScreenSummary = new ScreenSummary();
  public prevCapturedOperation?: CapturedOperation;

  private client: WebDriverClient;
  private captureArch: "polling" | "push";
  private _windowHandle: string;
  private onGetOperation: (operation: Operation) => void;
  private onGetScreenTransition: (screenTransition: ScreenTransition) => void;
  private onHistoryChanged: (browserStatus: {
    canGoBack: boolean;
    canGoForward: boolean;
  }) => void;
  private screenTransitionHistory: ScreenTransitionHistory =
    new ScreenTransitionHistory();
  private firstUrl: string;
  private firstTitle: string;

  /**
   * Constructor.
   * @param firstUrl Initial URL.
   * @param client The WebDriver client to access a window.
   * @param windowHandle Window handle.
   * @param captureArch Captureing architecture type.
   * @param option.onGetOperation The callback when an operation is captured.
   * @param option.onGetScreenTransition The callback when a screen transition is captured.
   * @param option.onHistoryChanged The callback when opened windows are changed.
   */
  constructor(
    firstUrl: string,
    firstTitle: string,
    client: WebDriverClient,
    windowHandle: string,
    captureArch: "polling" | "push",
    option?: {
      onGetOperation?: (operation: Operation) => void;
      onGetScreenTransition?: (screenTransition: ScreenTransition) => void;
      onHistoryChanged?: (browserStatus: {
        canGoBack: boolean;
        canGoForward: boolean;
      }) => void;
    }
  ) {
    this.firstUrl = firstUrl;
    this.firstTitle = firstTitle;
    this.client = client;
    this.captureArch = captureArch;
    this.onGetOperation =
      option?.onGetOperation ??
      (() => {
        /* Do nothing. */
      });
    this.onGetScreenTransition =
      option?.onGetScreenTransition ??
      (() => {
        /* Do nothing. */
      });
    this.onHistoryChanged =
      option?.onHistoryChanged ??
      (() => {
        /* Do nothing. */
      });
    this._windowHandle = windowHandle;
  }

  /**
   * Window handle.
   */
  public get windowHandle(): string {
    return this._windowHandle;
  }

  /**
   * Current URL.
   */
  public get currentUrl(): string {
    if (this.currentScreenSummary.url === "") {
      return this.firstUrl;
    }
    return this.currentScreenSummary.url;
  }

  /**
   * Current title.
   */
  public get currentTitle(): string {
    if (this.currentScreenSummary.title === "") {
      return this.firstTitle;
    }
    return this.currentScreenSummary.title;
  }

  /**
   * Take a screenshot of current screen.
   * @returns The screenshot of current screen(base64)
   */
  public async getScreenshot(): Promise<string> {
    return this.captureArch === "polling"
      ? await this.client.takeScreenshot()
      : "";
  }

  /**
   * Wait for the specified time.
   * @param ms Wait time.(ms)
   */
  public async sleep(ms: number): Promise<void> {
    await this.client.sleep(ms);
  }

  public async registerCapturedItem(
    capturedItem: CapturedItem,
    shouldTakeScreenshot: boolean
  ) {
    const clientSize = await this.client.getClientSize();
    let elements = await this.collectAllFrameScreenElements();

    if (capturedItem.operation.url !== (await this.client.getCurrentUrl())) {
      elements = [];
    }

    const operation = await this.convertToOperation(
      { ...capturedItem, elements },
      clientSize,
      shouldTakeScreenshot
    );

    if (operation) {
      this.onGetOperation(operation);
    }
  }

  public async deleteCapturedItems(): Promise<void> {
    await this.client.execute(captureScripts.deleteCapturedItems);
  }

  /**
   * Create operations from specified information.
   * @param args The information for creation.
   * @returns Created operations.
   */
  public createCapturedOperation(args: {
    type: string;
    windowHandle: string;
    url?: string;
    title?: string;
    input?: string;
    scrollPosition?: { x: number; y: number };
    clientSize?: { width: number; height: number };
    elementInfo?: ElementInfo;
    screenElements?: ScreenElements[];
    pageSource?: string;
    timestamp?: number;
  }): Operation {
    const baseArgs = {
      type: args.type,
      input: args.input ?? "",
      scrollPosition: args.scrollPosition,
      clientSize: args.clientSize,
      elementInfo: args.elementInfo ?? null,
      screenElements: args.screenElements ?? [],
      windowHandle: args.windowHandle,
      title: args.title ?? this.currentScreenSummary.title,
      url: args.url ?? this.currentScreenSummary.url,
      imageData: this.currentScreenSummary.screenshotBase64,
      pageSource: args.pageSource ?? "",
    };

    return new Operation(
      args.timestamp
        ? { ...baseArgs, timestamp: args.timestamp.toString() }
        : { ...baseArgs }
    );
  }

  /**
   * Go back to previous page on monitoring browser and create a browser back operation and return it.
   * @returns The browser back operation.
   */
  public async browserBack(): Promise<Operation> {
    const screenElements = await this.collectAllFrameScreenElements();

    const operation = this.createCapturedOperation({
      type: SpecialOperationType.BROWSER_BACK,
      windowHandle: this._windowHandle,
      pageSource: await this.client.getCurrentPageText(),
      screenElements,
    });
    await this.client.browserBack();

    this.screenTransitionHistory.back();
    this.lockScreenTransitionHistory();

    return operation;
  }

  /**
   * Go forward to next page on monitoring browser and create a browser forward operation and return it.
   * @returns The browser forward operation.
   */
  public async browserForward(): Promise<Operation> {
    const screenElements = await this.collectAllFrameScreenElements();

    const operation = this.createCapturedOperation({
      type: SpecialOperationType.BROWSER_FORWARD,
      windowHandle: this._windowHandle,
      pageSource: await this.client.getCurrentPageText(),
      screenElements,
    });

    await this.client.browserForward();

    this.screenTransitionHistory.forward();
    this.lockScreenTransitionHistory();

    return operation;
  }

  /**
   * Whether it can go back to previous page or not.
   * @returns 'true': It can go back, 'false': It can not go back.
   */
  public canDoBrowserBack(): boolean {
    return this.screenTransitionHistory.canBack();
  }

  /**
   * Whether it can go forward to next page or not.
   * @returns 'true': It can go forward, 'false': It can not go forward.
   */
  public canDoBrowserForward(): boolean {
    return this.screenTransitionHistory.canForward();
  }

  /**
   * Lock the screen transition history.
   */
  public lockScreenTransitionHistory(): void {
    this.screenTransitionHistory.lock();
  }

  /**
   * Clear current screen summary and current operation summary.
   */
  public clearScreenAndOperationInfo(): void {
    this.currentScreenSummary = new ScreenSummary();
    this.prevCapturedOperation = undefined;
  }

  /**
   * Focus the window.
   */
  public async focus(): Promise<void> {
    await this.client.execute(captureScripts.focusWindow, this._windowHandle);

    LoggingService.debug(`focusWindow: ${this._windowHandle}`);
  }

  /**
   * Remove Screen Lock.
   */
  public async removeScreenLock(): Promise<void> {
    const setTime = 250;
    await this.sleep(setTime);
    await this.focus();
    await this.sleep(setTime);

    LoggingService.debug(`removeScreenLock`);
  }

  /**
   * Pause capturing.
   */
  public async pauseCapturing(): Promise<void> {
    const action = () => this.client.execute(captureScripts.pauseCapturing);

    await action();
    await this.client.doActionInIframes("pauseCapturing", action);
  }

  /**
   * Resume capturing.
   */
  public async resumeCapturing(): Promise<void> {
    const action = () => this.client.execute(captureScripts.resumeCapturing);

    await action();
    await this.client.doActionInIframes("resumeCapturing", action);
  }

  /**
   * Whether capturing is paused or not.
   * @returns 'true': Capturing is paused, 'false': Capturing is not paused.
   */
  public async capturingIsPaused(): Promise<boolean> {
    return (
      (await this.client.execute(captureScripts.capturingIsPaused)) ?? false
    );
  }

  public async captureData() {
    const action: CapturingAction = (iframe) => {
      return this.client.execute(captureScripts.captureData, {
        captureArch: this.captureArch,
        shieldId: WebBrowser.SHIELD_ID,
        iframe,
      });
    };

    const defaultContentResult = await action();
    const iframeResult = (
      await this.client.doActionInIframes("capture", action)
    ).reduce(
      (acc, { result }) => {
        return {
          capturedItems: [
            ...acc.capturedItems,
            ...(result?.capturedItems ?? []),
          ],
          screenElements: [
            ...acc.screenElements,
            ...(result ? [result.screenElements] : []),
          ],
        };
      },
      {
        capturedItems: Array<SuspendedCapturedItem>(),
        screenElements: Array<ScreenElements>(),
      }
    );

    const result = {
      capturedItems: [
        ...(defaultContentResult?.capturedItems ?? []),
        ...iframeResult.capturedItems,
      ],
      screenElements: [
        ...(defaultContentResult ? [defaultContentResult.screenElements] : []),
        ...iframeResult.screenElements,
      ],
    };

    const screenElements = result.screenElements;
    const pageSource = await this.client.getCurrentPageText();

    await this.captureScreenTransition();
    await this.captureOperations(result.capturedItems);

    return { screenElements, pageSource };
  }

  public async collectAllFrameScreenElements(): Promise<
    {
      iframeIndex?: number;
      elements: CapturedElementInfo[];
    }[]
  > {
    const action = async () =>
      (await this.client.execute(captureScripts.collectScreenElements)) ?? [];

    const elementsInDefaultContent = {
      iframeIndex: undefined,
      elements: await action(),
    };
    const elementsInIFrames = (
      await this.client.doActionInIframes("collectScreenElements", action)
    ).map(({ iframe, result }) => {
      return { iframeIndex: iframe.index, elements: result };
    });

    return [...elementsInIFrames, elementsInDefaultContent];
  }

  private async captureOperations(
    capturedItems: SuspendedCapturedItem[]
  ): Promise<void> {
    for (const item of capturedItems) {
      if (await this.client.alertIsVisible()) {
        break;
      }

      await this.registerCapturedItem(item, true);
      await this.refireSuspendedEvent(item);
    }
  }

  private async captureScreenTransition(): Promise<void> {
    const currentUrl = await this.client.getCurrentUrl();
    const isUrlChanged =
      currentUrl !== "" && this.currentScreenSummary.url !== currentUrl;
    const isDocumentLoadingCompleted =
      await this.client.isCurrentDocumentLoadingCompleted();
    const isScreenObserved =
      (await this.client.execute(captureScripts.isCurrentScreenObserved)) ??
      false;

    await this.client.execute(captureScripts.observeCurrentScreen);

    if (!isDocumentLoadingCompleted || (isScreenObserved && !isUrlChanged)) {
      return;
    }

    const screenTransition = await this.createScreenTransition();

    if (!screenTransition) {
      return;
    }

    this.onGetScreenTransition(screenTransition);

    if (isUrlChanged) {
      // Add URL to the history for browser back/forward.
      if (this.screenTransitionHistory.isLocked) {
        this.screenTransitionHistory.unlock();
      } else {
        this.screenTransitionHistory.add(this.currentScreenSummary.url);
      }
    }

    this.onHistoryChanged({
      canGoBack: this.canDoBrowserBack(),
      canGoForward: this.canDoBrowserForward(),
    });
  }

  private async updateScreenSummary() {
    const url = await this.client.getCurrentUrl();
    if (url === "") {
      return;
    }

    const title = await this.client.getCurrentTitle();

    const urlParser = new URL(url);
    const location = urlParser.pathname + urlParser.search;
    this.currentScreenSummary = {
      url,
      title,
      location,
      screenshotBase64: await this.getScreenshot(),
    };
  }

  private async createScreenTransition(): Promise<ScreenTransition | null> {
    await this.updateScreenSummary();

    const pageText = await this.client.getCurrentPageText();

    if (!pageText) {
      return null;
    }

    const screenElements = await this.collectAllFrameScreenElements();

    return new ScreenTransition({
      windowHandle: this._windowHandle,
      title: this.currentScreenSummary.title,
      url: this.currentScreenSummary.url,
      imageData: this.currentScreenSummary.screenshotBase64,
      pageSource: pageText,
      clientSize: await this.client.getClientSize(),
      screenElements,
    });
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
    if (isIgnoreOperation(capturedItem.operation, this.prevCapturedOperation)) {
      this.prevCapturedOperation = capturedItem.operation;
      return;
    }

    // Take a screenshot.
    let screenShotBase64 = "";
    if (shouldTakeScreenshot) {
      const boundingRect = capturedItem.operation.elementInfo.boundingRect;

      const action = () =>
        new MarkedScreenShotTaker(this.client).takeScreenshotWithMarkOf([
          boundingRect,
        ]);

      if (capturedItem.iframe !== undefined) {
        const results = await this.client.doActionInIframes(
          "takeScreenshot",
          action,
          { iframeIndexes: [capturedItem.iframe.index] }
        );

        screenShotBase64 =
          results.find(
            ({ iframe }) => iframe.index === capturedItem.iframe?.index
          )?.result ?? "";
      } else {
        screenShotBase64 = await action();
      }
    }

    this.currentScreenSummary.screenshotBase64 = screenShotBase64;
    this.prevCapturedOperation = capturedItem.operation;

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

    let pageSource = "";
    const action = () => this.client.getCurrentPageText();

    if (capturedItem.iframe !== undefined) {
      const results = await this.client.doActionInIframes(
        "getCurrentPageText",
        action,
        { iframeIndexes: [capturedItem.iframe.index] }
      );

      pageSource =
        results.find(
          ({ iframe }) => iframe.index === capturedItem.iframe?.index
        )?.result ?? "";
    } else {
      pageSource = await action();
    }
    if (capturedItem.operation.url !== (await this.client.getCurrentUrl())) {
      pageSource = "";
    }

    return this.createCapturedOperation({
      input: capturedItem.operation.input,
      type: capturedItem.operation.type,
      scrollPosition: capturedItem.operation.scrollPosition,
      clientSize,
      elementInfo,
      screenElements: capturedItem.elements,
      windowHandle: this._windowHandle,
      url: capturedItem.operation.url,
      title: capturedItem.operation.title,
      pageSource,
      timestamp: capturedItem.operation.timestamp,
    });
  }

  private async refireSuspendedEvent(capturedItem: SuspendedCapturedItem) {
    const action = async () => {
      if (capturedItem.suspendedEvent.refireType === "inputDate") {
        await this.client.sendKeys(
          capturedItem.operation.elementInfo.xpath,
          Key.SPACE
        );
      } else {
        await this.client.execute(
          captureScripts.refireEvent,
          capturedItem.suspendedEvent.eventInfo
        );
      }
    };

    if (capturedItem.iframe !== undefined) {
      await this.client.doActionInIframes("refireSuspendedEvent", action, {
        iframeIndexes: [capturedItem.iframe.index],
      });
    } else {
      await action();
    }
  }
}
