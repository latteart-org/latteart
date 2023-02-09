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

import WebBrowserWindow from "./window/WebBrowserWindow";
import { Operation } from "../../Operation";
import { CaptureConfig } from "../../CaptureConfig";
import WebDriverClient from "@/webdriver/WebDriverClient";
import WindowContainer from "./WindowContainer";
import ScreenTransition from "../../ScreenTransition";
import { SpecialOperationType } from "../../SpecialOperationType";
import CaptureScript, { ExtendedDocument } from "./window/CaptureScript";

interface ExtendedWindowForWindowSwitch extends Window {
  setWindowHandleToLocalStorage?: () => void;
  removeWindowHandleToLocalStorage?: () => void;
}

/**
 * Class for operating browser.
 */
export default class WebBrowser {
  public static readonly SHIELD_ID = "__LATTEART_USER_OPERATION_SHIELD__";

  private _isOpened = false;
  private _isWindowSelecting = false;

  private client: WebDriverClient;
  private config: CaptureConfig;
  private windowContainer: WindowContainer;
  private option: {
    onGetOperation: (operation: Operation) => void;
    onGetScreenTransition: (screenTransition: ScreenTransition) => void;
    onHistoryChanged: (browserStatus: {
      canGoBack: boolean;
      canGoForward: boolean;
    }) => void;
    onWindowsChanged: (
      windowHandles: string[],
      currentWindowHandle: string
    ) => void;
    onAlertVisibilityChanged: (isVisible: boolean) => void;
  };

  /**
   * Constructor.
   * @param client The WebDriver client to access a browser.
   * @param config Capture config.
   * @param option.onGetOperation The callback when an operation is captured.
   * @param option.onGetScreenTransition The callback when a screen transition is captured.
   * @param option.onHistoryChanged The callback when browser history changes.
   * @param option.onWindowsChanged The callback when opened windows are changed.
   */
  constructor(
    client: WebDriverClient,
    config: CaptureConfig,
    option?: {
      onGetOperation?: (operation: Operation) => void;
      onGetScreenTransition?: (screenTransition: ScreenTransition) => void;
      onHistoryChanged?: (browserStatus: {
        canGoBack: boolean;
        canGoForward: boolean;
      }) => void;
      onWindowsChanged?: (
        windowHandles: string[],
        currentWindowHandle: string
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

  public get isWindowSelecting(): boolean {
    return this._isWindowSelecting;
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
  public async updateState(): Promise<void> {
    const beforeContainerLength = this.windowContainer.length;

    // Update the container to be the same as actual windows.
    await this.windowContainer.update(await this.client.getAllWindowHandles());

    if (this.windowContainer.length === 0) {
      return;
    }

    // Update current window of the container to be the same as actual current window.
    if (!this.isWindowSelecting) {
      await this.windowContainer.changeCurrentWindowTo(
        (await this.getBrowsingWindowHandle()) ?? ""
      );
    }

    // If the number of windows in the container, notice it.
    if (this.windowContainer.length !== beforeContainerLength) {
      if (this.windowContainer.length >= 2) {
        await this.protectAllWindow();
      }
      this.option.onWindowsChanged(
        this.windowContainer.windowHandles,
        this.windowContainer.currentWindowHandle
      );
    }

    // Unblock user operations.
    if (!this.isWindowSelecting) {
      await this.client.execute(
        ({ windowHandle, shieldId }) => {
          const extendedDocument: ExtendedDocument = document;
          const target = extendedDocument.getElementById(shieldId);
          if (!target || !target.parentNode) {
            return;
          }

          if (localStorage.currentWindowHandle === windowHandle) {
            target.parentNode.removeChild(target);
          }
        },
        {
          windowHandle: this.currentWindow?.windowHandle,
          shieldId: WebBrowser.SHIELD_ID,
        }
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
   * Switch current window.
   * @param windowHandle Destination window handle.
   */
  public switchWindowTo(windowHandle: string): Promise<void> {
    return this.windowContainer.changeCurrentWindowTo(windowHandle);
  }

  public async protectAllWindow(): Promise<void> {
    this._isWindowSelecting = true;
    if (!this.currentWindow) {
      return;
    }
    await this.client.switchWindowTo(this.currentWindow.windowHandle);
    await new CaptureScript(this.client).attachShield();
  }

  public async unprotectAllWindow(): Promise<void> {
    this._isWindowSelecting = false;
  }

  /**
   * Create windows which with specified window handles.
   * @param newWindowHandles New window handles.
   * @returns Created windows.
   */
  private async createWindows(...newWindowHandles: string[]) {
    const currentWindow = this.currentWindow;
    const currentWindowIsFocused =
      (await this.getBrowsingWindowHandle()) !== "";

    return Promise.all(
      newWindowHandles.map(async (windowHandle) => {
        console.log(`-> createWindow: ${windowHandle}`);
        // Switch the current window to a new one temporarily to add callback to the new one.
        await this.client.switchWindowTo(windowHandle);
        await new CaptureScript(this.client).initGuard();

        const window = await (async () => {
          await this.injectFunctionToDetectWindowSwitch(windowHandle);
          const firstUrl = await this.client.getCurrentUrl();

          return new WebBrowserWindow(
            firstUrl,
            this.client,
            windowHandle,
            this.option
          );
        })();
        await window.focus();

        // If current window is focused, switch back the window that switched temporarily.
        if (currentWindow && currentWindowIsFocused) {
          await this.client.switchWindowTo(currentWindow.windowHandle);
        }
        return window;
      })
    ).catch((e) => {
      console.error(e);
      throw new Error("Create windows error.");
    });
  }

  /**
   * Switch window.
   * @param to Destination window.
   * @param from Source window.
   */
  private async switchWindow(to: WebBrowserWindow, from?: WebBrowserWindow) {
    if (from) {
      from.lockScreenTransitionHistory();

      this.option.onGetOperation(
        from.createCapturedOperation({
          type: SpecialOperationType.SWITCH_WINDOW,
          windowHandle: from?.windowHandle ?? "",
          input: to.windowHandle,
          pageSource: await this.client.getCurrentPageText(),
        })
      );
    }

    await this.client.switchWindowTo(to.windowHandle);

    to.clearScreenAndOperationInfo();
  }

  private async getBrowsingWindowHandle(): Promise<string> {
    return (
      (await this.client.execute(() => {
        const localStorageIsEnabled = (() => {
          try {
            return localStorage !== undefined && localStorage !== null;
          } catch (e) {
            return false;
          }
        })();

        if (!localStorageIsEnabled) {
          return "";
        }

        return (localStorage.currentWindowHandle as string) || "";
      })) ?? ""
    );
  }

  private async injectFunctionToDetectWindowSwitch(
    windowHandle: string
  ): Promise<void> {
    await this.client.execute(
      ({ windowHandle, shieldId, shieldStyle }) => {
        console.log(
          `injectFunctionToDetectWindowSwitch - START: ${windowHandle}`
        );

        const extendedWindow: ExtendedWindowForWindowSwitch = window;

        const extendedDocument: ExtendedDocument = document;
        const __LATTEART_INIT_GUARD__ = "__latteart_init_guard__";
        const initGuard = extendedDocument.getElementById(
          __LATTEART_INIT_GUARD__
        );
        if (extendedDocument.readyState !== "complete" && !initGuard) {
          const shield = extendedDocument.createElement("div");
          shield.id = __LATTEART_INIT_GUARD__;
          shield.style.position = shieldStyle.position;
          shield.style.zIndex = shieldStyle.zIndex;
          shield.style.width = shieldStyle.width;
          shield.style.height = shieldStyle.height;
          shield.style.opacity = shieldStyle.opacity;
          shield.style.backgroundColor = shieldStyle.backgroundColor;
          extendedDocument.body.insertAdjacentElement("afterbegin", shield);
        }

        if (extendedDocument.readyState === "complete" && initGuard) {
          initGuard.parentNode?.removeChild(initGuard);
        }

        if (!extendedWindow.setWindowHandleToLocalStorage) {
          extendedWindow.setWindowHandleToLocalStorage = () => {
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

            // Set focused window handle.
            const oldHandle = localStorage.currentWindowHandle;
            localStorage.currentWindowHandle = windowHandle;
            console.log(
              `focus: ${oldHandle} -> ${localStorage.currentWindowHandle}`
            );
          };
        }
        extendedWindow.removeEventListener(
          "focus",
          extendedWindow.setWindowHandleToLocalStorage
        );
        extendedWindow.addEventListener(
          "focus",
          extendedWindow.setWindowHandleToLocalStorage
        );

        if (!extendedWindow.removeWindowHandleToLocalStorage) {
          extendedWindow.removeWindowHandleToLocalStorage = () => {
            // Block user operations.
            (() => {
              const target = document.getElementById(shieldId);

              if (target) {
                return;
              }

              const shield = document.createElement("div");
              shield.id = shieldId;
              shield.style.position = "absolute";
              shield.style.zIndex = "2147483647";
              shield.style.width = "100%";
              shield.style.height = `${document.body.clientHeight}px`;
              shield.style.opacity = "0.6";
              shield.style.backgroundColor = "#333";

              document.body.insertAdjacentElement("afterbegin", shield);
            })();

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

            // Unset window handle.
            const oldHandle = localStorage.currentWindowHandle;
            localStorage.currentWindowHandle = "";
            console.log(
              `blur: ${oldHandle} -> ${localStorage.currentWindowHandle}`
            );
          };
        }
        extendedWindow.removeEventListener(
          "blur",
          extendedWindow.removeWindowHandleToLocalStorage
        );
        extendedWindow.addEventListener(
          "blur",
          extendedWindow.removeWindowHandleToLocalStorage
        );
        console.log(`injectFunctionToDetectWindowSwitch - END`);
      },
      {
        windowHandle,
        shieldId: WebBrowser.SHIELD_ID,
        shieldStyle: CaptureScript.createShieldStyle(),
      }
    );
  }
}
