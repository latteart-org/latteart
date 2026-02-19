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

import LoggingService from "@/logger/LoggingService";
import puppeteer, { Browser, Frame, KeyInput, Page } from "puppeteer-core";
import { CDPClient, CDPDialog, CDPPageSetupConfig } from "./types";
import { Iframe } from "@/captureScripts/types";

const defaultWindowSize = { width: 1024, height: 768 };

export default class PuppeteerCDPClient implements CDPClient {
  private browser?: Browser;
  private pageIdToPage: Map<string, Page> = new Map();
  private pageIdCounter = 0;

  constructor(
    private executablePath: string,
    private remoteDebuggingPort: number,
    private acceptInsecureCerts: boolean
  ) {}

  private generatePageId(): string {
    this.pageIdCounter += 1;
    return `page-${this.pageIdCounter}`;
  }

  async open(
    url: string,
    onBrowserClosed: () => void,
    onError: (error: Error) => void,
    options?: {
      headless?: boolean;
      windowSize?: { width: number; height: number };
      pageSetupConfig?: CDPPageSetupConfig;
      onWindowOpened?: (pageId: string, url: string, title: string) => void;
      onWindowClosed?: (pageId: string) => void;
      onWindowFocused?: (pageId: string, url: string, title: string) => void;
      onNavigated?: (pageId: string, url: string, title: string) => void;
      onDialogOpened?: (pageId: string, dialog: CDPDialog) => void;
    }
  ): Promise<{
    initialPageId: string;
    initialPageUrl: string;
    initialPageTitle: string;
  }> {
    const args = [
      `--remote-debugging-port=${this.remoteDebuggingPort}`,
      "--disable-back-forward-cache",
    ];
    args.push(
      `--window-size=${options?.windowSize?.width ?? defaultWindowSize.width},${options?.windowSize?.height ?? defaultWindowSize.height}`
    );

    const browser = await puppeteer.launch({
      executablePath: this.executablePath,
      headless: options?.headless ?? false,
      defaultViewport: null,
      acceptInsecureCerts: this.acceptInsecureCerts,
      args,
    });

    LoggingService.info(`CDP connected.`);

    browser.on("targetcreated", async (target) => {
      try {
        if (target.type() !== "page") {
          return;
        }

        const page = await (async () => {
          for (let i = 0; i < 10; i++) {
            const page = await target.page();
            if (page) {
              return page;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          return null;
        })();

        if (!page) {
          throw new Error("Failed to get page from target.");
        }

        await this.waitForAllFramesLoaded(page);

        LoggingService.debug(`New target created: ${target.url()}`);

        const pageUrl = page.url();

        if (
          pageUrl.startsWith("devtools://") ||
          pageUrl.startsWith("about:") ||
          pageUrl.startsWith("chrome://") ||
          pageUrl.startsWith("edge://")
        ) {
          LoggingService.debug(
            `Ignoring page with URL: ${pageUrl} (not a regular web page)`
          );
          return;
        }

        const { pageId } = await this.setupPage(page, onError, options);

        const url = page.url();
        const title = await page.title();
        LoggingService.debug(`New page opened: ${pageId}: ${url} - ${title}`);
        options?.onWindowOpened?.(pageId, url, title);

        const isPageFocused = await this.isPageFocused(pageId);
        if (isPageFocused && options?.onWindowFocused) {
          options.onWindowFocused(pageId, url, title);
        }
      } catch (e) {
        if (e instanceof Error) {
          LoggingService.error("Error in targetcreated handler:", e);
          onError(new Error("An error occurred in the CDP client."));
          return;
        }

        throw e;
      }
    });

    browser.on("disconnected", () => {
      try {
        LoggingService.debug("Browser disconnected");
        this.browser = undefined;
        this.pageIdToPage.clear();
        this.pageIdCounter = 0;

        onBrowserClosed();
      } catch (e) {
        if (e instanceof Error) {
          LoggingService.error("Error in disconnected handler:", e);
          onError(new Error("An error occurred in the CDP client."));
          return;
        }

        throw e;
      }
    });

    this.browser = browser;

    const pages = await browser.pages();
    const initialPage = pages[0];

    await initialPage.goto(url, { waitUntil: "domcontentloaded" });

    const { pageId } = await this.setupPage(initialPage, onError, options);

    const initialPageUrl = initialPage.url();
    const initialPageTitle = await initialPage.title();

    return { initialPageId: pageId, initialPageUrl, initialPageTitle };
  }

  private async waitForAllFramesLoaded(page: Page, timeout: number = 10000) {
    await page.waitForSelector("body");

    await new Promise((r) => setTimeout(r, 500));

    const iframeCount = await page.evaluate(() => {
      return document.getElementsByTagName("iframe").length;
    });

    const start = Date.now();
    while (true) {
      const currentIframeCount = page.mainFrame().childFrames().length;
      LoggingService.debug(
        `Current loaded iframe count: ${currentIframeCount}/${iframeCount}`
      );
      if (currentIframeCount === iframeCount) {
        break;
      }
      if (Date.now() - start > timeout) {
        throw new Error("Timeout waiting for child frames");
      }
      await new Promise((r) => setTimeout(r, 100));
    }

    await Promise.all(
      page
        .mainFrame()
        .childFrames()
        .map((frame) => frame.waitForSelector("body"))
    );
  }

  private async setupPage(
    page: Page,
    onError: (error: Error) => void,
    options?: {
      pageSetupConfig?: CDPPageSetupConfig;
      onWindowClosed?: (pageId: string) => void;
      onWindowFocused?: (pageId: string, url: string, title: string) => void;
      onNavigated?: (pageId: string, url: string, title: string) => void;
      onDialogOpened?: (pageId: string, dialog: CDPDialog) => void;
    }
  ) {
    const pageId = this.generatePageId();

    const windowDimensions = await this.getWindowDimensions(page);
    await this.injectIFrameInfoGetterToFrame(
      page.mainFrame(),
      windowDimensions
    );

    const cdp = await page.createCDPSession();
    cdp.send("Page.enable");
    cdp.on("Page.frameNavigated", async (event) => {
      try {
        if (event.frame.parentId) {
          return;
        }

        await this.waitForAllFramesLoaded(page);

        const url = event.frame.url;

        if (
          url.startsWith("devtools://") ||
          url.startsWith("about:") ||
          url.startsWith("chrome://") ||
          url.startsWith("edge://")
        ) {
          LoggingService.debug(
            `Ignoring page with URL: ${url} (not a regular web page)`
          );
          return;
        }

        const windowDimensions = await this.getWindowDimensions(page);
        await this.injectIFrameInfoGetterToFrame(
          page.mainFrame(),
          windowDimensions
        );

        if (options?.onWindowFocused) {
          await this.setupPageFocusHandler(page);
        }

        if (options?.pageSetupConfig) {
          await this.setupCustomHandlers(page, options.pageSetupConfig);
        }

        const title = await page.title();
        LoggingService.debug(
          `Frame navigated in page ${pageId}: ${url} - ${title}`
        );
        options?.onNavigated?.(pageId, url, title);
      } catch (e) {
        if (e instanceof Error) {
          LoggingService.error("Error in framenavigated handler:", e);
          onError(new Error("An error occurred in the CDP client."));
          return;
        }

        throw e;
      }
    });

    page.on("close", () => {
      try {
        this.pageIdToPage.delete(pageId);
        LoggingService.debug(`Page closed: ${pageId}`);
        options?.onWindowClosed?.(pageId);
      } catch (e) {
        if (e instanceof Error) {
          LoggingService.error("Error in page close handler:", e);
          onError(new Error("An error occurred in the CDP client."));
          return;
        }

        throw e;
      }
    });

    page.on("dialog", async (dialog) => {
      try {
        LoggingService.debug(
          `Dialog opened in page ${pageId}: ${dialog.message()}`
        );
        options?.onDialogOpened?.(pageId, dialog);
      } catch (e) {
        if (e instanceof Error) {
          LoggingService.error("Error in dialog handler:", e);
          onError(new Error("An error occurred in the CDP client."));
          return;
        }

        throw e;
      }
    });

    if (options?.onWindowFocused) {
      await page.exposeFunction(
        "notifyPageFocused",
        async (iframeInfo?: Iframe) => {
          const url = page.url();
          const title = await page.title();
          LoggingService.debug(
            `Page focused: ${pageId}(iframeIndex: ${iframeInfo?.index}): ${url} - ${title}`
          );
          options.onWindowFocused?.(pageId, url, title);
        }
      );

      await this.setupPageFocusHandler(page);
    }

    if (options?.pageSetupConfig) {
      for (const { name, callback } of options.pageSetupConfig
        .exposedFunctions ?? []) {
        LoggingService.debug(
          `Setting up exposed function: ${name} for pageId: ${pageId}`
        );
        await page.exposeFunction(name, (...args: any[]) => {
          return callback(pageId, ...args);
        });
      }

      await this.setupCustomHandlers(page, options.pageSetupConfig);
    }

    this.pageIdToPage.set(pageId, page);

    return { pageId };
  }

  async close(): Promise<void> {
    if (!this.browser) {
      LoggingService.info("Browser is already closed.");
      return;
    }

    await this.browser.close();
  }

  isConnected(): boolean {
    return this.browser?.connected ?? false;
  }

  async listPageIds(): Promise<string[]> {
    return Array.from(this.pageIdToPage.keys());
  }

  async resizeWindow(
    pageId: string,
    width: number,
    height: number
  ): Promise<void> {
    const page = this.pageIdToPage.get(pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    const cdp = await page.createCDPSession();

    const { windowId } = await cdp.send("Browser.getWindowForTarget");

    await cdp.send("Browser.setWindowBounds", {
      windowId,
      bounds: { width, height },
    });
  }

  async getCurrentUrl(pageId: string): Promise<string> {
    const page = this.pageIdToPage.get(pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    return page.url();
  }

  async getCurrentTitle(pageId: string): Promise<string> {
    const page = this.pageIdToPage.get(pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    return page.title();
  }

  async goBack(pageId: string): Promise<void> {
    const page = this.pageIdToPage.get(pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    await page.goBack({ waitUntil: "domcontentloaded" });
  }

  async goForward(pageId: string): Promise<void> {
    const page = this.pageIdToPage.get(pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    await page.goForward({ waitUntil: "domcontentloaded" });
  }

  async focusPage(pageId: string): Promise<void> {
    if (!pageId) {
      return;
    }

    const page = this.pageIdToPage.get(pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    await page.bringToFront();
  }

  async isPageFocused(pageId: string): Promise<boolean> {
    const page = this.pageIdToPage.get(pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    return page.evaluate(() => {
      return document.hasFocus();
    });
  }

  async screenshot(
    pageId: string,
    options?: { type?: "png" | "webp"; fullPage?: boolean }
  ): Promise<string> {
    const page = this.pageIdToPage.get(pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    const screenshot = await page.screenshot({
      type: options?.type,
      fullPage: options?.fullPage ?? false,
      encoding: "base64",
    });

    if (options?.fullPage) {
      // The scrollbar disappears after a full-page screenshot, so force a reflow to restore it.
      await page.evaluate(() => {
        document.body.style.display = "none";
        document.body.offsetHeight;
        document.body.style.display = "";
      });
    }

    return screenshot;
  }

  async pressKey(pageId: string, key: string): Promise<void> {
    const page = this.pageIdToPage.get(pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    await page.keyboard.press(key as KeyInput);
  }

  executeScript<Args extends any[], Return>(
    target: { pageId: string; iframeIndex?: number },
    script: (...args: Args) => Return,
    ...args: Args
  ): Promise<Return> {
    const page = this.pageIdToPage.get(target.pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    const mainFrame = page.mainFrame();

    if (target.iframeIndex !== undefined) {
      const childFrames = mainFrame.childFrames();
      if (target.iframeIndex < 0 || target.iframeIndex >= childFrames.length) {
        throw new Error("Frame index out of range");
      }
      const frame = childFrames[target.iframeIndex];
      return frame.evaluate(script, ...args);
    }

    return mainFrame.evaluate(script, ...args);
  }

  async executeScriptInAllFrames<Args extends any[], Return>(
    target: { pageId: string },
    script: (...args: Args) => Return,
    ...args: Args
  ): Promise<{ iframeIndex?: number; result: Return }[]> {
    const page = this.pageIdToPage.get(target.pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    const mainFrame = page.mainFrame();
    const mainFrameResult = {
      result: await mainFrame.evaluate(script, ...args),
    };

    const childFrames = mainFrame.childFrames();
    const childFrameResults = await Promise.all(
      childFrames.map(async (frame, index) => {
        return {
          iframeIndex: index,
          result: await frame.evaluate(script, ...args),
        };
      })
    );

    return [mainFrameResult, ...childFrameResults];
  }

  async getMatchedElements(query: {
    pageId: string;
    iframeIndex?: number;
    locatorType: "id" | "xpath";
    locator: string;
    locatorMatchType: "equals" | "contains";
  }): Promise<
    {
      tagName: string;
      getAttribute: (attrName: string) => Promise<string | null>;
      click: () => Promise<void>;
      type: (text: string, options?: { clear?: boolean }) => Promise<void>;
      select: (optionValue: string) => Promise<void>;
    }[]
  > {
    const page = this.pageIdToPage.get(query.pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    const frame =
      query.iframeIndex !== undefined
        ? page.mainFrame().childFrames()[query.iframeIndex]
        : page.mainFrame();

    const xpath =
      query.locatorType === "id" && query.locatorMatchType === "equals"
        ? `//*[@id="${query.locator}"]`
        : query.locatorType === "id" && query.locatorMatchType === "contains"
          ? `//*[contains(@id,"${query.locator}")]`
          : query.locator;

    const elementHandles = await frame.$$(`::-p-xpath(${xpath})`);

    return Promise.all(
      elementHandles.map(async (elementHandle) => {
        const tagName = await elementHandle.evaluate((el) =>
          el.tagName.toLowerCase()
        );

        return {
          tagName,
          getAttribute: async (attrName: string) => {
            return elementHandle.evaluate(
              (el, name) => el.getAttribute(name),
              attrName
            );
          },
          click: async () => {
            await elementHandle.click();
          },
          type: async (text: string, options?: { clear?: boolean }) => {
            if (options?.clear) {
              await elementHandle.evaluate((el) => {
                if ("value" in el) {
                  el.value = "";
                }
              });
            }

            await elementHandle.type(text);
          },
          select: async (optionValue: string) => {
            await elementHandle.select(optionValue);
          },
        };
      })
    );
  }

  async click(target: {
    pageId: string;
    iframeIndex?: number;
    xpath: string;
  }): Promise<void> {
    const page = this.pageIdToPage.get(target.pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    const frame =
      target.iframeIndex !== undefined
        ? page.mainFrame().childFrames()[target.iframeIndex]
        : page.mainFrame();

    await frame.waitForSelector(`::-p-xpath(${target.xpath})`, {
      visible: true,
    });
    await frame.click(`::-p-xpath(${target.xpath})`);
  }

  async type(
    target: { pageId: string; iframeIndex?: number; xpath: string },
    text: string,
    options?: { clear?: boolean }
  ): Promise<void> {
    const page = this.pageIdToPage.get(target.pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    const frame =
      target.iframeIndex !== undefined
        ? page.mainFrame().childFrames()[target.iframeIndex]
        : page.mainFrame();

    if (options?.clear) {
      await frame.evaluate((xpath) => {
        const result = document.evaluate(
          xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        );
        const element = result.singleNodeValue;

        if (element && "value" in element) {
          element.value = "";
        }
      }, target.xpath);
    }

    await frame.waitForSelector(`::-p-xpath(${target.xpath})`, {
      visible: true,
    });
    await frame.type(`::-p-xpath(${target.xpath})`, text);
  }

  async select(
    target: { pageId: string; iframeIndex?: number; xpath: string },
    optionValue: string
  ): Promise<void> {
    const page = this.pageIdToPage.get(target.pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    const frame =
      target.iframeIndex !== undefined
        ? page.mainFrame().childFrames()[target.iframeIndex]
        : page.mainFrame();

    await frame.waitForSelector(`::-p-xpath(${target.xpath})`, {
      visible: true,
    });
    const elementHandle = await frame.$(`::-p-xpath(${target.xpath})`);

    if (!elementHandle) {
      throw new Error("Element not found");
    }

    await elementHandle.click();

    const optionValues = await frame.evaluate((selectElement) => {
      return Array.from((selectElement as HTMLSelectElement).options).map(
        (opt) => opt.value
      );
    }, elementHandle);

    const selectedIndex = await frame.evaluate((selectElement) => {
      return (selectElement as HTMLSelectElement).selectedIndex;
    }, elementHandle);
    const targetIndex = optionValues.findIndex((v) => v === optionValue);

    if (targetIndex === -1) {
      throw new Error(`Option value "${optionValue}" not found`);
    }

    const offset = targetIndex - selectedIndex;

    if (offset > 0) {
      for (let i = 0; i < offset; i++) {
        await page.keyboard.press("ArrowDown");
      }
    } else if (offset < 0) {
      for (let i = 0; i < Math.abs(offset); i++) {
        await page.keyboard.press("ArrowUp");
      }
    }

    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
  }

  async moveMouseOutOfViewport(pageId: string): Promise<void> {
    const page = this.pageIdToPage.get(pageId);
    if (!page) {
      throw new Error("Page not found");
    }

    await page.mouse.move(-1, -1);
  }

  private async getWindowDimensions(page: Page) {
    return page.evaluate(() => {
      return {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
      };
    });
  }

  private async injectIFrameInfoGetterToFrame(
    parentFrame: Frame,
    windowDimensions: {
      innerWidth: number;
      innerHeight: number;
      outerWidth: number;
      outerHeight: number;
    }
  ) {
    LoggingService.debug(
      `Injecting getIFrameInfo into ${parentFrame.childFrames().length} iframes.`
    );
    await Promise.all(
      parentFrame.childFrames().map(async (iframe, iframeIndex) => {
        const frameElement = await iframe.frameElement();

        if (!frameElement) {
          LoggingService.warn(
            `Skipping iframe index: ${iframeIndex} as frame element is not found.`
          );
          return;
        }

        const boundingBox = await frameElement.boundingBox();

        const iframeInfo: Iframe = {
          index: iframeIndex,
          boundingRect: {
            top: boundingBox?.y ?? 0,
            left: boundingBox?.x ?? 0,
            width: boundingBox?.width ?? 0,
            height: boundingBox?.height ?? 0,
          },
          ...windowDimensions,
        };

        await iframe.evaluate((iframeInfo) => {
          (window as any).getIFrameInfo = () => iframeInfo;
        }, iframeInfo);

        LoggingService.debug(
          `Injected getIFrameInfo into iframe index: ${iframeIndex}`
        );
      })
    );
    LoggingService.debug(`Completed injecting getIFrameInfo into iframes.`);
  }

  private async setupPageFocusHandler(page: Page) {
    const setFocusEventHandler = () => {
      window.addEventListener("focus", () => {
        const iframeInfo = (window as any).getIFrameInfo?.();
        (
          (window as any).notifyPageFocused ??
          (parent.window as any).notifyPageFocused
        )(iframeInfo);
      });
    };

    await Promise.all(
      page.frames().map((frame) => frame.evaluate(setFocusEventHandler))
    );
  }

  private async setupCustomHandlers(
    page: Page,
    pageSetupConfig: CDPPageSetupConfig
  ) {
    for (const script of pageSetupConfig.injectionScripts ?? []) {
      await Promise.all(
        page.frames().map(async (frame) => {
          await frame.waitForSelector("body");
          await frame.evaluate(script);
        })
      );
    }
  }
}
