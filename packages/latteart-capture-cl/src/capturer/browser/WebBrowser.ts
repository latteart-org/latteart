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

import WebBrowserWindow from "./window/WebBrowserWindow";
import { Operation } from "../../Operation";
import { CaptureConfig } from "../../CaptureConfig";
import WebDriverClient from "@/webdriver/WebDriverClient";
import WindowContainer from "./WindowContainer";
import ScreenTransition from "../../ScreenTransition";
import { SpecialOperationType } from "../../SpecialOperationType";
import { captureScripts } from "../captureScripts";
import { ScreenMutation } from "@/ScreenMutation";

/**
 * Class for operating browser.
 */
export default class WebBrowser {
  public static readonly SHIELD_ID = "__LATTEART_USER_OPERATION_SHIELD__";

  private _isOpened = false;

  private client: WebDriverClient;
  private config: CaptureConfig;
  private windowContainer: WindowContainer;
  private option: {
    onGetOperation: (operation: Operation) => void;
    onGetMutation: (screenMutations: ScreenMutation[]) => void;
    onGetScreenTransition: (screenTransition: ScreenTransition) => void;
    onHistoryChanged: (browserStatus: {
      canGoBack: boolean;
      canGoForward: boolean;
    }) => void;
    onWindowsChanged: (
      windows: { windowHandle: string; url: string; title: string }[],
      currentWindowHandle: string,
      currentWindowHostNameChanged: boolean
    ) => void;
    onAlertVisibilityChanged: (isVisible: boolean) => void;
  };

  /**
   * Constructor.
   * @param client The WebDriver client to access a browser.
   * @param config Capture config.
   * @param option.onGetOperation The callback when an operation is captured.
   * @param option.onGetMutation The callback when an mutation is captured.
   * @param option.onGetScreenTransition The callback when a screen transition is captured.
   * @param option.onHistoryChanged The callback when browser history changes.
   * @param option.onWindowsChanged The callback when opened windows are changed.
   */
  constructor(
    client: WebDriverClient,
    config: CaptureConfig,
    option?: {
      onGetOperation?: (operation: Operation) => void;
      onGetMutation?: (screenMutations: ScreenMutation[]) => void;
      onGetScreenTransition?: (screenTransition: ScreenTransition) => void;
      onHistoryChanged?: (browserStatus: {
        canGoBack: boolean;
        canGoForward: boolean;
      }) => void;
      onWindowsChanged?: (
        windows: { windowHandle: string; url: string; title: string }[],
        currentWindowHandle: string,
        currentWindowHostNameChanged: boolean
      ) => void;
      onAlertVisibilityChanged?: (isVisible: boolean) => void;
    }
  ) {
    this.client = client;
    this.config = config;
    this.option = {
      onGetOperation:
        option?.onGetOperation ??
        (() => {
          /* Do nothing. */
        }),
      onGetMutation:
        option?.onGetMutation ??
        (() => {
          /* Do noting. */
        }),
      onGetScreenTransition:
        option?.onGetScreenTransition ??
        (() => {
          /* Do nothing. */
        }),
      onHistoryChanged:
        option?.onHistoryChanged ??
        (() => {
          /* Do nothing. */
        }),
      onWindowsChanged:
        option?.onWindowsChanged ??
        (() => {
          /* Do nothing. */
        }),
      onAlertVisibilityChanged:
        option?.onAlertVisibilityChanged ??
        (() => {
          /* Do noting. */
        }),
    };
    this.windowContainer = new WindowContainer(
      (...newWindowHandles: string[]) => {
        return this.createWindows(...newWindowHandles);
      },
      (to: WebBrowserWindow, from?: WebBrowserWindow) => {
        return this.switchWindow(to, from);
      }
    );
  }

  /**
   * Whether browser is opened or not.
   */
  public get isOpened(): boolean {
    return this._isOpened;
  }

  /**
   * Current window.
   */
  public get currentWindow(): WebBrowserWindow | undefined {
    return this.windowContainer.currentWindow;
  }

  /**
   * Open an URL in browser and start monitoring.
   * @param url Initial URL.
   */
  public async open(url: string): Promise<void> {
    await this.client.open(url);

    if (this.config.waitTimeForStartupReload > 0) {
      await this.client.sleep(this.config.waitTimeForStartupReload * 1000);
      await this.client.refresh();
    }

    this._isOpened = true;
  }

  /**
   * Close browser and stop monitoring.
   */
  public async close(): Promise<void> {
    await this.client.close();
    this._isOpened = false;
  }

  /**
   * Update browser state.
   */
  public async updateState(
    beforeWindow: WebBrowserWindow | undefined
  ): Promise<void> {
    const beforeContainerLength = this.windowContainer.length;

    // Update the container to be the same as actual windows.
    const addedWindowHandles = await this.windowContainer.update(
      await this.client.getAllWindowHandles()
    );

    if (this.windowContainer.length === 0) {
      return;
    }

    // Update current window of the container to be the same as actual current window.
    const browsingWindowHandle = await this.getBrowsingWindowHandle();

    if (addedWindowHandles.length === 0 && browsingWindowHandle) {
      await this.windowContainer.changeCurrentWindowTo(browsingWindowHandle);
    }

    // If the number of windows in the container, notice it.
    if (this.windowContainer.length !== beforeContainerLength) {
      const currentWindowHostNameChanged = addedWindowHandles
        .flatMap((newWindowHandle) => {
          const newWindow = this.windowContainer.windows.find(
            ({ windowHandle }) => windowHandle === newWindowHandle
          );
          return newWindow ? [newWindow] : [];
        })
        .some(({ url }) => {
          if (!beforeWindow) {
            return false;
          }

          const oldHostname = new URL(beforeWindow.currentUrl).hostname;
          const newHostname = new URL(url).hostname;

          return oldHostname !== newHostname;
        });

      this.option.onWindowsChanged(
        this.windowContainer.windows,
        this.windowContainer.currentWindowHandle,
        addedWindowHandles.length > 0 ? currentWindowHostNameChanged : false
      );
    }

    // If current window is changed, create switch_window operation.
    if (
      beforeWindow &&
      beforeWindow.windowHandle !== this.windowContainer.currentWindowHandle
    ) {
      const screenElements = await beforeWindow.collectAllFrameScreenElements();

      this.option.onGetOperation(
        beforeWindow.createCapturedOperation({
          type: SpecialOperationType.SWITCH_WINDOW,
          windowHandle: beforeWindow?.windowHandle ?? "",
          input: this.windowContainer.currentWindowHandle,
          pageSource: await this.client.getCurrentPageText(),
          screenElements,
        })
      );
    }

    if (this.currentWindow?.windowHandle) {
      await this.injectFunctionToDetectWindowSwitch(
        this.currentWindow.windowHandle
      );
    }
  }

  /**
   * Count windows.
   * @returns The number of opened windows.
   */
  public countWindows(): number {
    return this.windowContainer.length;
  }

  /**
   * Change current window.
   * @param windowHandle Destination window handle.
   */
  public async changeCurrentWindow(windowHandle: string): Promise<void> {
    const destWindow = this.windowContainer.findWindow(windowHandle);

    if (!destWindow) {
      return;
    }

    return this.switchWindow(destWindow, this.currentWindow);
  }

  /**
   * Create windows which with specified window handles.
   * @param newWindowHandles New window handles.
   * @returns Created windows.
   */
  private async createWindows(...newWindowHandles: string[]) {
    const currentWindowIsFocused =
      (await this.getBrowsingWindowHandle()) !== "";

    const newWindows = await Promise.all(
      newWindowHandles.map(async (windowHandle) => {
        console.log(`-> createWindow: ${windowHandle}`);
        // Switch the current window to a new one temporarily to add callback to the new one.
        await this.client.switchWindowTo(windowHandle);
        await this.client.execute(captureScripts.initGuard, {
          shieldStyle: this.createShieldStyle(),
        });
        await this.client.execute(captureScripts.attachShield, {
          shieldId: WebBrowser.SHIELD_ID,
        });

        const window = await (async () => {
          await this.injectFunctionToDetectWindowSwitch(windowHandle);
          const firstUrl = await this.client.getCurrentUrl();
          const firstTitle = await this.client.getCurrentTitle();

          return new WebBrowserWindow(
            firstUrl,
            firstTitle,
            this.client,
            windowHandle,
            this.config.captureArch,
            this.config.shouldTakeScreenshot,
            this.option
          );
        })();

        return window;
      })
    ).catch((e) => {
      console.error(e);
      throw new Error("Create windows error.");
    });

    if (this.currentWindow) {
      await this.client.switchWindowTo(this.currentWindow.windowHandle);
    }

    return {
      newWindows,
      newFocusedWindow: currentWindowIsFocused ? undefined : newWindows.at(0),
    };
  }

  /**
   * Switch window.
   * @param to Destination window.
   * @param from Source window.
   */
  private async switchWindow(to: WebBrowserWindow, from?: WebBrowserWindow) {
    if (from) {
      from.lockScreenTransitionHistory();

      await this.client.execute(captureScripts.attachShield, {
        shieldId: WebBrowser.SHIELD_ID,
      });
    }

    await this.client.switchWindowTo(to.windowHandle);
    await to.focus();

    await this.client.execute(captureScripts.detachShield, {
      shieldId: WebBrowser.SHIELD_ID,
    });

    to.clearScreenAndOperationInfo();
  }

  private async getBrowsingWindowHandle(): Promise<string> {
    return (
      (await this.client.execute(captureScripts.getBrowsingWindowHandle)) ?? ""
    );
  }

  private async injectFunctionToDetectWindowSwitch(
    windowHandle: string
  ): Promise<void> {
    await this.client.execute(captureScripts.setFunctionToDetectWindowSwitch, {
      windowHandle,
      shieldStyle: this.createShieldStyle(),
    });
  }

  private createShieldStyle(): {
    position: string;
    zIndex: string;
    width: string;
    height: string;
    opacity: string;
    backgroundColor: string;
  } {
    return {
      position: "absolute",
      zIndex: "2147483647",
      width: "100%",
      height: "100%",
      opacity: "0.6",
      backgroundColor: "#333",
    };
  }
}
