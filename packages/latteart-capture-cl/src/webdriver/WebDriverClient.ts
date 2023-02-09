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

import { WebElement } from "selenium-webdriver";

/**
 * The class for executing script.
 */
export interface ScriptExecutor {
  /**
   * Inject the script to current page content and execute the script.
   * @param script Script.
   * @param args The arguments passed to the script.
   */
  execute<T, U>(script: (args: U) => T, args?: U): Promise<T | null>;
}

/**
 * WebDriver client.
 */
export default interface WebDriverClient extends ScriptExecutor {
  /**
   * Open an URL in browser.
   * @param url URL
   */
  open(url: string): Promise<void>;

  /**
   * Set timeouts.
   * @param timeouts.implicit The timeout value for finding an element.(ms)
   * @param timeouts.pageLoad The timeout value for page loading.(ms)
   * @param timeouts.script The timeout value for executing script.(ms)
   */
  setTimeouts(
    timeouts: Partial<{ implicit: number; pageLoad: number; script: number }>
  ): Promise<void>;

  /**
   * Wait for the specified time.
   * @param ms Wait time.(ms)
   */
  sleep(ms: number): Promise<void>;

  /**
   * Refresh browser.
   */
  refresh(): Promise<void>;

  /**
   * Close browser.
   */
  close(): Promise<void>;

  /**
   * Get all opened window handles.
   * @returns Window handles.
   */
  getAllWindowHandles(): Promise<string[]>;

  /**
   * Switch a window.
   * @param windowHandle Destination window handle.
   */
  switchWindowTo(windowHandle: string): Promise<void>;

  /**
   * Whether alert dialog is visible or not.
   * @returns 'true': Alert dialog is visible, 'false': Alert dialog is not visible.
   */
  alertIsVisible(): Promise<boolean>;

  /**
   * Get current URL.
   * @returns Current URL.
   */
  getCurrentUrl(): Promise<string>;

  /**
   * Get current window handle.
   * @returns Current window handle.
   */
  getCurrentWindowHandle(): Promise<string>;

  /**
   * Get current page title.
   * @returns Current page title.
   */
  getCurrentTitle(): Promise<string>;

  /**
   * Take a screenshot of current screen.
   * @returns The screenshot of current screen.(base64)
   */
  takeScreenshot(): Promise<string>;

  /**
   * Go back to previous page.
   */
  browserBack(): Promise<void>;

  /**
   * Go forward to next page.
   */
  browserForward(): Promise<void>;

  /**
   * Get current page source.
   * @returns Current page source.
   */
  getCurrentPageSource(): Promise<string>;

  /**
   * Get current page text.
   * @returns Current page text.
   */
  getCurrentPageText(): Promise<string>;

  /**
   * Click an element.
   * @param xpath Target element XPath.
   */
  clickElement(xpath: string): Promise<void>;

  /**
   * Clear existing text and input new text.
   * @param xpath Target element XPath.
   * @param value Input value.
   */
  clearAndSendKeysToElement(xpath: string, value: string): Promise<void>;

  /**
   * Keyboard input.
   * @param xpath Target element XPath.
   * @param value Input value.
   */
  sendKeys(xpath: string, value: string): Promise<void>;

  /**
   * Accept alert if alert is visible.
   * @param text Text for prompt.
   */
  acceptAlert(text?: string): Promise<void>;

  /**
   * Dismiss alert if alert is visible.
   */
  dismissAlert(): Promise<void>;

  /**
   * Get loading status of the current page document.
   */
  getDocumentReadyState(): Promise<string>;

  /**
   * Select item in select box.
   */
  selectOption(selectElementXpath: string, optionValue: string): Promise<void>;

  /**
   * Select item in select box using web element.
   */
  selectOptionUsingWebElement(
    elementForInput: WebElement,
    optionValue: string
  ): Promise<void>;

  /**
   * Get element by xpath
   * @param xpath
   */
  getElementByXpath(xpath: string): Promise<WebElement>;

  /**
   * Get elements by xpath
   * @param xpath
   */
  getElementsByXpath(xpath: string): Promise<WebElement[]>;

  /**
   * Get element by tagname
   * @param tagName
   */
  getElementByTagName(tagName: string): Promise<WebElement[]>;
}
