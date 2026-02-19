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

/**
 * CDP Page Setup Config.
 */
export type CDPPageSetupConfig = {
  exposedFunctions?: {
    name: string;
    callback: (pageId: string, ...args: unknown[]) => Promise<unknown>;
  }[];
  injectionScripts?: (() => void)[];
};

/**
 * CDP Dialog.
 */
export type CDPDialog = {
  type(): "alert" | "confirm" | "prompt" | "beforeunload";
  message(): string;
  defaultValue(): string;
  accept: (promptText?: string) => Promise<void>;
  dismiss: () => Promise<void>;
};

/**
 * CDP Client.
 */
export type CDPClient = {
  open(
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
  }>;
  close(): Promise<void>;
  isConnected(): boolean;
  listPageIds(): Promise<string[]>;
  resizeWindow(pageId: string, width: number, height: number): Promise<void>;
  getCurrentUrl(pageId: string): Promise<string>;
  getCurrentTitle(pageId: string): Promise<string>;
  goBack(pageId: string): Promise<void>;
  goForward(pageId: string): Promise<void>;
  isPageFocused(pageId: string): Promise<boolean>;
  focusPage(pageId: string): Promise<void>;
  screenshot(
    pageId: string,
    options?: { type?: "png" | "webp"; fullPage?: boolean }
  ): Promise<string>;
  pressKey(pageId: string, key: string): Promise<void>;
  executeScript<Args extends any[], Return>(
    target: { pageId: string; iframeIndex?: number },
    script: (...args: Args) => Return,
    ...args: Args
  ): Promise<Return>;
  executeScriptInAllFrames<Args extends any[], Return>(
    target: { pageId: string },
    script: (...args: Args) => Return,
    ...args: Args
  ): Promise<{ iframeIndex?: number; result: Return }[]>;
  getMatchedElements(query: {
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
  >;
  click(target: {
    pageId: string;
    iframeIndex?: number;
    xpath: string;
  }): Promise<void>;
  type(
    target: { pageId: string; iframeIndex?: number; xpath: string },
    text: string,
    options?: { clear?: boolean }
  ): Promise<void>;
  select(
    target: { pageId: string; iframeIndex?: number; xpath: string },
    optionValue: string
  ): Promise<void>;
  moveMouseOutOfViewport(pageId: string): Promise<void>;
};
