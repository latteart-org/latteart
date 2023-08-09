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

import WebDriverClient from "./WebDriverClient";
import { Alert, By, Key, WebDriver, WebElement } from "selenium-webdriver";
import LoggingService from "@/logger/LoggingService";

/**
 * Selenium WebDriver client.
 */
export class SeleniumWebDriverClient implements WebDriverClient {
  private driver: WebDriver;
  private frameLockedId = "";

  /**
   * Constructor.
   * @param driver WebDriver instance.
   */
  constructor(driver: WebDriver) {
    this.driver = driver;
  }

  /**
   * @inheritdoc
   */
  public async open(url: string): Promise<void> {
    return this.driver.get(url);
  }

  /**
   * @inheritdoc
   */
  public async setTimeouts(
    timeouts: Partial<{
      implicit: number;
      pageLoad: number;
      script: number;
    }> = {}
  ): Promise<void> {
    if (timeouts.implicit !== undefined) {
      await this.driver.manage().setTimeouts({ implicit: timeouts.implicit });
    }

    if (timeouts.pageLoad !== undefined) {
      await this.driver.manage().setTimeouts({ implicit: timeouts.pageLoad });
    }

    if (timeouts.script !== undefined) {
      await this.driver.manage().setTimeouts({ implicit: timeouts.script });
    }
  }

  /**
   * @inheritdoc
   */
  public async sleep(ms: number): Promise<void> {
    return this.driver.sleep(ms);
  }

  /**
   * @inheritdoc
   */
  public async refresh(): Promise<void> {
    return this.driver.navigate().refresh();
  }

  /**
   * @inheritdoc
   */
  public async close(): Promise<void> {
    return this.driver.quit();
  }

  /**
   * @inheritdoc
   */
  public async getAllWindowHandles(): Promise<string[]> {
    try {
      return await this.driver.getAllWindowHandles();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "NoSuchWindowError") {
          return [];
        }
      }
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  public async switchWindowTo(windowHandle: string): Promise<void> {
    try {
      return await this.driver.switchTo().window(windowHandle);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "NoSuchWindowError") {
          return;
        }
      }
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  public async switchFrameTo(
    iframeIndex: number,
    lockId: string
  ): Promise<void> {
    if (this.frameLockedId !== "" && this.frameLockedId !== lockId) {
      throw new Error(`locked frame. ${lockId}`);
    }
    try {
      return await this.driver.switchTo().frame(iframeIndex);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "NoSuchFrameError") {
          return;
        }
      }
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  public async switchDefaultContent(lockId: string): Promise<void> {
    if (this.frameLockedId !== "" && this.frameLockedId !== lockId) {
      throw new Error(`locked frame. ${lockId}`);
    }

    try {
      return await this.driver.switchTo().defaultContent();
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
      }
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  public lockFrame(lockId: string): void {
    this.frameLockedId = lockId;
  }

  /**
   * @inheritdoc
   */
  public unLockFrame(): void {
    this.frameLockedId = "";
  }

  /**
   * @inheritdoc
   */
  public isLockedFrame(): boolean {
    return this.frameLockedId !== "";
  }

  /**
   * @inheritdoc
   */
  public async waitUntilFrameUnlock(): Promise<void> {
    for (let i = 0; i < 20; i++) {
      if (!this.isLockedFrame()) {
        return;
      }
      await this.sleep(100);
    }
    throw new Error(`timeout while waiting for unlock. ${this.frameLockedId}`);
  }

  /**
   * @inheritdoc
   */
  public async alertIsVisible(): Promise<boolean> {
    return (await this.getAlert()) !== undefined;
  }

  /**
   * @inheritdoc
   */
  public async getCurrentUrl(): Promise<string> {
    try {
      return await this.driver.getCurrentUrl();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "NoSuchWindowError") {
          return "";
        }
      }
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  public async getCurrentWindowHandle(): Promise<string> {
    try {
      return await this.driver.getWindowHandle();
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        if (error.name === "NoSuchWindowError") {
          return "";
        }
      }
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  public async getCurrentTitle(): Promise<string> {
    try {
      return await this.driver.getTitle();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "NoSuchWindowError") {
          return "";
        }
      }
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  public async takeScreenshot(): Promise<string> {
    try {
      return this.driver.takeScreenshot();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "NoSuchWindowError") {
          return "";
        }
      }
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  public async browserBack(): Promise<void> {
    return this.driver.navigate().back();
  }

  /**
   * @inheritdoc
   */
  public async browserForward(): Promise<void> {
    return this.driver.navigate().forward();
  }

  /**
   * @inheritdoc
   */
  public async getCurrentPageSource(): Promise<string> {
    try {
      return await this.driver.getPageSource();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name == "NoSuchWindowError") {
          return "";
        }
      }
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  public async getCurrentPageText(): Promise<string> {
    try {
      return await this.driver.executeScript(
        `
          if (!document) {
            return ""
          }
          return document.getElementsByTagName("body")[0].innerText
        `
      );
    } catch (error) {
      if (error instanceof Error) {
        if (
          [
            "NoSuchWindowError",
            "NoSuchElementError",
            "StaleElementReferenceError",
          ].includes(error.name)
        ) {
          return "";
        }
      }
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  public async execute<T, U>(
    script: (args: U) => T,
    args?: U
  ): Promise<T | null> {
    try {
      let notReady = true;
      for (let cnt = 0; cnt < 30; cnt++) {
        notReady =
          (await this.driver.executeScript(
            `return !document || !document.body`
          )) ?? true;
        if (!notReady) {
          break;
        }
        await this.driver.sleep(100);
      }
      if (notReady) {
        throw new Error("timeout error");
      }

      return await this.driver.executeScript(script, args);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name == "NoSuchWindowError") {
          return null;
        }
      }
      throw error;
    }
  }

  /**
   * @inheritdoc
   */
  public async clickElement(xpath: string): Promise<void> {
    LoggingService.debug(`click: xpath = ${xpath}`);

    return this.retryAction(() => {
      const elementForClick = this.driver.findElement(By.xpath(xpath));

      return elementForClick.click();
    });
  }

  /**
   * @inheritdoc
   */
  public async clearAndSendKeys(xpath: string, value: string): Promise<void> {
    LoggingService.debug(
      `clearAndSendKeys: xpath = ${xpath}, value = ${value}`
    );

    return this.retryAction(async () => {
      const elementForInput = this.driver.findElement(By.xpath(xpath));

      const v = await elementForInput.getAttribute("value");
      for (let i = 0; v.length > i; i++) {
        await elementForInput.sendKeys(Key.BACK_SPACE);
      }

      return elementForInput.sendKeys(value);
    });
  }

  /**
   * @inheritdoc
   */
  public async sendKeys(xpath: string, value: string): Promise<void> {
    LoggingService.debug(`sendKeys: xpath = ${xpath}, value = ${value}`);

    return this.retryAction(async () => {
      const elementForInput = this.driver.findElement(By.xpath(xpath));
      return elementForInput.sendKeys(value);
    });
  }

  /**
   * @inheritdoc
   */
  public async acceptAlert(text = ""): Promise<void> {
    const alert = await this.getAlert();

    if (text) {
      await alert?.sendKeys(text);
    }

    return alert?.accept();
  }

  /**
   * @inheritdoc
   */
  public async dismissAlert(): Promise<void> {
    const alert = await this.getAlert();

    return alert?.dismiss();
  }

  /**
   * @inheritdoc
   */
  public async getDocumentReadyState(): Promise<string> {
    const readyState = (await this.driver.executeScript(
      "return document.readyState"
    )) as string;
    return readyState;
  }

  private async getAlert(): Promise<Alert | undefined> {
    try {
      return await this.driver.switchTo().alert();
    } catch (error) {
      return undefined;
    }
  }

  public async selectOption(
    selectElementXpath: string,
    optionValue: string
  ): Promise<void> {
    LoggingService.debug(
      `selectOption: xpath = ${selectElementXpath}, value = ${optionValue}`
    );

    return this.retryAction(async () => {
      const elementForInput = await this.driver.findElement(
        By.xpath(selectElementXpath)
      );
      await this.selectOptionUsingWebElement(elementForInput, optionValue);
    });
  }

  public async selectOptionUsingWebElement(
    elementForInput: WebElement,
    optionValue: string
  ): Promise<void> {
    const options = await elementForInput.findElements(By.css("option"));

    const selectedIndex = (
      await Promise.all(
        options.map((option) => {
          return option.getAttribute("selected");
        })
      )
    ).findIndex((option) => {
      return option === "true";
    });

    const values = await Promise.all(
      options.map((option) => {
        return option.getAttribute("value");
      })
    );

    const optionIndex = values.findIndex((value) => {
      return value === optionValue;
    });

    const index = optionIndex - selectedIndex;

    if (index > 0) {
      for (let i = 0; i < index; i++) {
        await this.driver.actions().keyDown(Key.ARROW_DOWN).perform();
      }
    } else if (index < 0) {
      for (let i = 0; i < Math.abs(index); i++) {
        await this.driver.actions().keyDown(Key.ARROW_UP).perform();
      }
    }

    await this.driver.actions().keyDown(Key.ENTER).perform();
  }

  public async getElementByXpath(xpath: string): Promise<WebElement> {
    return await this.driver.findElement(By.xpath(xpath));
  }

  public async getElementsByXpath(xpath: string): Promise<WebElement[]> {
    return await this.driver.findElements(By.xpath(xpath));
  }

  public async getElementByTagName(tagName: string): Promise<WebElement[]> {
    return await this.driver.findElements(By.tagName(tagName));
  }

  public async getClientSize(): Promise<{ width: number; height: number }> {
    let rect = await this.driver.manage().window().getRect();

    for (let i = 0; i < 10; i++) {
      const correctedRect = await this.driver.manage().window().setRect(rect);
      if (rect.width === correctedRect.width && rect.height === rect.height) {
        break;
      }

      LoggingService.warn(
        `Correct client size: ${JSON.stringify(rect)} -> ${JSON.stringify(
          correctedRect
        )}`
      );
      rect = correctedRect;
    }

    return { width: rect.width, height: rect.height };
  }

  public async setClientSize(width: number, height: number): Promise<void> {
    await this.driver.manage().window().setRect({ width, height });
  }

  public async setScrollPosition(x: number, y: number): Promise<void> {
    return await this.driver.executeScript(`window.scrollTo(${x},${y});`);
  }

  private async retryAction(action: () => Promise<void>, limit = 10) {
    for (let i = 0; i < limit; i++) {
      try {
        await action();
        break;
      } catch (error) {
        if (i === limit - 1) {
          throw error;
        }
        LoggingService.warn(`${error}`);
        LoggingService.warn(`Retry.`);
      }
    }
  }
}
