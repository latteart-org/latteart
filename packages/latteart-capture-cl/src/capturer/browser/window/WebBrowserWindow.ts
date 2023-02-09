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

import { Operation, ElementInfo } from "../../../Operation";
import ScreenTransitionHistory from "./ScreenTransitionHistory";
import LoggingService from "../../../logger/LoggingService";
import WebDriverClient from "@/webdriver/WebDriverClient";
import ScreenSummary from "./ScreenSummary";
import OperationSummary from "./OperationSummary";
import MarkedScreenShotTaker from "./MarkedScreenshotTaker";
import CaptureScript from "./CaptureScript";
import { CapturedData } from "./CapturedData";
import ScreenTransition from "../../../ScreenTransition";
import WebBrowser from "../WebBrowser";
import { SpecialOperationType } from "../../../SpecialOperationType";
import { Key } from "selenium-webdriver";

interface ExtendedDocumentForScreenTransition extends Document {
  __hasBeenObserved?: boolean;
}

/**
 * The class for operating for window.
 */
export default class WebBrowserWindow {
  public currentScreenSummary: ScreenSummary = new ScreenSummary();
  public currentOperationSummary: OperationSummary = new OperationSummary();

  private client: WebDriverClient;
  private _windowHandle: string;
  private beforeOperation: Operation | null = null;
  private onGetOperation: (operation: Operation) => void;
  private onGetScreenTransition: (screenTransition: ScreenTransition) => void;
  private onHistoryChanged: (browserStatus: {
    canGoBack: boolean;
    canGoForward: boolean;
  }) => void;
  private screenTransitionHistory: ScreenTransitionHistory =
    new ScreenTransitionHistory();
  private firstUrl: string;
  private isFirstOperation: boolean;

  /**
   * Constructor.
   * @param firstUrl Initial URL.
   * @param client The WebDriver client to access a window.
   * @param windowHandle Window handle.
   * @param option.onGetOperation The callback when an operation is captured.
   * @param option.onGetScreenTransition The callback when a screen transition is captured.
   * @param option.onHistoryChanged The callback when opened windows are changed.
   */
  constructor(
    firstUrl: string,
    client: WebDriverClient,
    windowHandle: string,
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
    this.client = client;
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
    this.isFirstOperation = false;
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
   * Take a screenshot of current screen.
   * @returns The screenshot of current screen(base64)
   */
  public async getScreenshot(): Promise<string> {
    return await this.client.takeScreenshot();
  }

  /**
   * Wait for the specified time.
   * @param ms Wait time.(ms)
   */
  public async sleep(ms: number): Promise<void> {
    await this.client.sleep(ms);
  }

  /**
   * Check if a screen transition is captured and if so, call the callback function.
   */
  public async captureScreenTransition(): Promise<void> {
    const currentDocumentLoadingIsCompleted =
      (await this.client.getDocumentReadyState()) === "complete";
    if (!currentDocumentLoadingIsCompleted) {
      return;
    }
    const currentScreenHasBeenObserved =
      (await this.client.execute(() => {
        const extendedDocument: ExtendedDocumentForScreenTransition = document;
        return extendedDocument.__hasBeenObserved ?? false;
      })) ?? false;

    await this.client.execute(() => {
      const extendedDocument: ExtendedDocumentForScreenTransition = document;
      extendedDocument.__hasBeenObserved = true;
    });

    const currentUrl = await this.client.getCurrentUrl();
    if (currentUrl === "") {
      return;
    }

    const urlIsChanged = this.currentScreenSummary.url !== currentUrl;

    if (currentScreenHasBeenObserved && !urlIsChanged) {
      return;
    }

    const screenTransition = await this.createScreenTransition();
    if (!screenTransition) {
      return;
    }
    this.onGetScreenTransition(screenTransition);

    if (urlIsChanged) {
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

    this.isFirstOperation = true;
  }

  /**
   * Check if operations are captured and if so, call the callback function.
   */
  public async captureOperations(): Promise<void> {
    const captureScript = new CaptureScript(this.client);

    if (!(await captureScript.isReadyToCapture())) {
      await captureScript.getReadyToCapture([WebBrowser.SHIELD_ID]);
    }

    // Get and notice operations.
    const capturedDatas = await captureScript.pullCapturedDatas();
    if (capturedDatas.length === 0) {
      return;
    }
    for (const capturedData of capturedDatas) {
      const capturedOperations = await this.convertToCapturedOperations([
        capturedData,
      ]);

      if (
        capturedOperations[0] &&
        this.shouldRegisterOperation(
          capturedOperations[0],
          this.beforeOperation
        )
      ) {
        this.noticeCapturedOperations(...capturedOperations);
      }
      this.beforeOperation = capturedOperations[0] ?? null;

      if (capturedData.suspendedEvent.reFireFromWebdriverType === "inputDate") {
        await this.client.sendKeys(
          capturedData.operation.elementInfo.xpath,
          Key.SPACE
        );
      } else {
        await capturedData.suspendedEvent.reFire();
      }

      if (await this.client.alertIsVisible()) {
        break;
      }
    }
  }

  public async deleteCapturedDatas(): Promise<void> {
    const captureScript = new CaptureScript(this.client);
    await captureScript.deleteCapturedDatas();
  }

  /**
   * Create operations from specified information.
   * @param args The information for creation.
   * @returns Created operations.
   */
  public createCapturedOperation(args: {
    type: string;
    windowHandle: string;
    input?: string;
    elementInfo?: ElementInfo;
    screenElements?: ElementInfo[];
    inputElements?: ElementInfo[];
    pageSource?: string;
  }): Operation {
    return new Operation({
      type: args.type,
      input: args.input ?? "",
      elementInfo: args.elementInfo ?? null,
      screenElements: args.screenElements ?? [],
      windowHandle: args.windowHandle,
      title: this.currentScreenSummary.title,
      url: this.currentScreenSummary.url,
      imageData: this.currentOperationSummary.screenshotBase64,
      inputElements: args.inputElements ?? [],
      pageSource: args.pageSource ?? "",
    });
  }

  /**
   * Go back to previous page on monitoring browser and create a browser back operation and return it.
   * @returns The browser back operation.
   */
  public async browserBack(): Promise<Operation> {
    const operation = this.createCapturedOperation({
      type: SpecialOperationType.BROWSER_BACK,
      windowHandle: this._windowHandle,
      pageSource: await this.client.getCurrentPageText(),
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
    const operation = this.createCapturedOperation({
      type: SpecialOperationType.BROWSER_FORWARD,
      windowHandle: this._windowHandle,
      pageSource: await this.client.getCurrentPageText(),
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
    this.currentOperationSummary = new OperationSummary();
  }

  /**
   * Focus the window.
   */
  public async focus(): Promise<void> {
    await this.client.execute((windowHandle) => {
      const localStorageIsEnabled = (() => {
        try {
          return localStorage !== undefined && localStorage !== null;
        } catch (e) {
          return false;
        }
      })();

      if (!localStorageIsEnabled) {
        return;
      }

      localStorage.currentWindowHandle = windowHandle;
    }, this._windowHandle);

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
    await new CaptureScript(this.client).pauseCapturing();
  }

  /**
   * Resume capturing.
   */
  public async resumeCapturing(): Promise<void> {
    await new CaptureScript(this.client).resumeCapturing();
  }

  /**
   * Whether capturing is paused or not.
   * @returns 'true': Capturing is paused, 'false': Capturing is not paused.
   */
  public async capturingIsPaused(): Promise<boolean> {
    return await new CaptureScript(this.client).capturingIsPaused();
  }

  private noticeCapturedOperations(...operations: Operation[]) {
    for (const operation of operations) {
      this.onGetOperation(operation);
    }
  }

  private async updateScreenAndOperationSummary() {
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
    };

    this.currentOperationSummary = {
      screenshotBase64: await this.getScreenshot(),
      elementXPath: "",
      type: "screen_transition",
    };
  }

  private async createScreenTransition(): Promise<ScreenTransition | null> {
    await this.updateScreenAndOperationSummary();
    const pageText = await this.client.getCurrentPageText();
    if (!pageText) {
      return null;
    }
    return new ScreenTransition({
      windowHandle: this._windowHandle,
      title: this.currentScreenSummary.title,
      url: this.currentScreenSummary.url,
      imageData: this.currentOperationSummary.screenshotBase64,
      pageSource: pageText,
    });
  }

  private capturedDataHasChangeEventFiredByMouseClick(data: CapturedData) {
    if (data.operation.type !== "change") {
      return false;
    }

    const elementType = data.operation.elementInfo.attributes.type
      ? data.operation.elementInfo.attributes.type.toLowerCase()
      : "";
    const elementTagname = data.operation.elementInfo.tagname.toLowerCase();
    if (
      !(
        elementTagname === "input" &&
        (elementType === "radio" || elementType === "checkbox")
      )
    ) {
      return false;
    }

    const elementXPath = data.operation.elementInfo.xpath;
    const normalizedXPath = this.normalizeXPath(elementXPath);
    const normalizedPrevXPath = this.normalizeXPath(
      this.currentOperationSummary.elementXPath
    );
    if (
      !(
        this.currentOperationSummary.type === "click" &&
        normalizedXPath === normalizedPrevXPath
      )
    ) {
      return false;
    }

    return true;
  }

  private normalizeXPath(before: string) {
    return before.replace(/\[1\]/g, "");
  }

  private async convertToCapturedOperations(capturedDatas: CapturedData[]) {
    const filteredDatas = capturedDatas.filter((data) => {
      // Ignore the click event when dropdown list is opened because Selenium can not take a screenshot when dropdown list is opened.
      if (
        data.operation.type === "click" &&
        data.operation.elementInfo.tagname.toLowerCase() === "select"
      ) {
        return false;
      }

      // Ignore the click event when clicking an input element of calendar type.
      if (
        data.operation.type === "click" &&
        data.operation.elementInfo.attributes.type === "date"
      ) {
        return false;
      }

      // Ignore the change event that is fired after the click event of radio button or checkbox.
      if (this.capturedDataHasChangeEventFiredByMouseClick(data)) {
        return false;
      }

      return true;
    });

    if (filteredDatas.length === 0) {
      return [];
    }

    // Take a screenshot.
    const boundingRects = filteredDatas.map(
      (data) => data.operation.elementInfo.boundingRect
    );
    const screenShotBase64 = await new MarkedScreenShotTaker(
      this.client
    ).takeScreenshotWithMarkOf(boundingRects);

    return Promise.all(
      filteredDatas.map(async (data) => {
        this.currentOperationSummary = {
          screenshotBase64: screenShotBase64,
          elementXPath: data.operation.elementInfo.xpath,
          type: data.operation.type,
        };

        const elementInfo: ElementInfo = {
          tagname: data.operation.elementInfo.tagname,
          text: data.operation.elementInfo.text,
          value: data.operation.elementInfo.value,
          xpath: data.operation.elementInfo.xpath,
          attributes: data.operation.elementInfo.attributes,
        };
        if (data.operation.elementInfo.checked !== undefined) {
          elementInfo.checked = data.operation.elementInfo.checked;
        }

        let inputElements: ElementInfo[] = [];
        inputElements = data.elements.filter((elmInfo) => {
          let expected = false;
          switch (elmInfo.tagname.toLowerCase()) {
            case "input":
              if (
                !!elmInfo.attributes.type &&
                elmInfo.attributes.type !== "button" &&
                elmInfo.attributes.type !== "submit"
              ) {
                expected = true;
              }
              break;
            case "select":
            case "textarea":
              expected = true;
              break;
            default:
              break;
          }
          return expected;
        });
        this.isFirstOperation = false;

        return this.createCapturedOperation({
          input: data.operation.input,
          type: data.operation.type,
          elementInfo,
          screenElements: data.elements,
          windowHandle: this._windowHandle,
          inputElements,
          pageSource: await this.client.getCurrentPageText(),
        });
      })
    );
  }

  private shouldRegisterOperation(
    operation: Operation,
    beforeOperation: Operation | null
  ): boolean {
    if (beforeOperation === null) {
      return true;
    }

    if (beforeOperation.url !== operation.url) {
      return true;
    }

    if (beforeOperation.elementInfo?.attributes.for === undefined) {
      return true;
    }

    if (
      beforeOperation.elementInfo?.attributes.for !==
      operation.elementInfo?.attributes.id
    ) {
      return true;
    }

    if (beforeOperation.elementInfo?.tagname.toUpperCase() !== "LABEL") {
      return true;
    }

    if (operation.elementInfo?.tagname.toUpperCase() !== "INPUT") {
      return true;
    }

    if (
      !["CHECKBOX", "RADIO"].includes(
        operation.elementInfo?.attributes.type.toUpperCase()
      )
    ) {
      return true;
    }
    return false;
  }
}
