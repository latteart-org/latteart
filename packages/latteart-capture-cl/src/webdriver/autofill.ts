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

/**
 * Special operation type that is not added by DOM event.
 */

import WebBrowserWindow from "@/capturer/browser/window/WebBrowserWindow";
import { Key, WebElement } from "selenium-webdriver";
import WebDriverClient from "./WebDriverClient";
import LoggingService from "../logger/LoggingService";

export type InputValueSet = {
  locatorType: "id" | "xpath";
  locator: string;
  locatorMatchType: "equals" | "contains";
  inputValue: string;
};

export default class Autofill {
  constructor(
    private readonly client: WebDriverClient,
    private readonly inputValueSets: InputValueSet[],
    private readonly currentWindow: WebBrowserWindow
  ) {}

  public async execute(): Promise<void> {
    for (const inputValueSet of this.inputValueSets) {
      const targetWebElements = await this.getWebElements(
        inputValueSet.locatorType,
        inputValueSet.locator,
        inputValueSet.locatorMatchType
      );

      for (const webElement of targetWebElements) {
        await this.currentWindow.sleep(250);
        await this.currentWindow.focus();
        await this.currentWindow.sleep(250);

        const tagName = await webElement.getTagName();
        if (tagName === "select") {
          await this.setValueToSelectbox(webElement, inputValueSet.inputValue);
          continue;
        }

        if (tagName === "textarea") {
          await this.setValueToText(webElement, inputValueSet.inputValue);
          continue;
        }

        const inputType = await webElement.getAttribute("type");

        switch (inputType) {
          case "checkbox":
            await this.setValueToCheckbox(webElement, inputValueSet.inputValue);
            break;
          case "radio":
            await this.setValueToRadiobutton(
              webElement,
              inputValueSet.inputValue
            );
            break;
          case "date":
            await this.setValueToDate(webElement, inputValueSet.inputValue);
            break;
          default:
            await this.setValueToText(webElement, inputValueSet.inputValue);
            break;
        }
      }
    }
  }

  public async setValueToText(
    target: WebElement,
    value: string
  ): Promise<void> {
    try {
      if (value === "") {
        const v = await target.getAttribute("value");
        for (let i = 0; v.length > i; i++) {
          await target.sendKeys(Key.BACK_SPACE);
        }
      } else {
        await target.clear();
        await target.sendKeys(value);
      }
    } catch (error) {
      if (error instanceof Error) {
        LoggingService.error("failed setValueToText", error);
      }
    }
  }

  public async setValueToCheckbox(
    target: WebElement,
    value: string
  ): Promise<void> {
    const v = await target.isSelected();
    if ((v && value === "off") || (!v && value === "on")) {
      try {
        await target.click();
      } catch (error) {
        if (error instanceof Error) {
          LoggingService.error("failed setValueToCheckbox", error);
        }
      }
    }
  }

  public async setValueToRadiobutton(
    target: WebElement,
    value: string
  ): Promise<void> {
    const v = await target.isSelected();
    if (!v && value === "on") {
      try {
        await target.click();
      } catch (error) {
        if (error instanceof Error) {
          LoggingService.error("failed setValueToCheckbox", error);
        }
      }
    }
  }

  public async setValueToSelectbox(
    target: WebElement,
    value: string
  ): Promise<void> {
    try {
      await target.click();
      await this.client.selectOptionUsingWebElement(target, value);
    } catch (error) {
      if (error instanceof Error) {
        LoggingService.error("failed selectOptionUsingWebElement", error);
      }
    }
  }

  public async setValueToDate(
    target: WebElement,
    value: string
  ): Promise<void> {
    const yyyymmdd = value.split("-");
    return await this.setValueToText(
      target,
      `${("00" + yyyymmdd[0]).slice(-6)}-${yyyymmdd[1]}-${yyyymmdd[2]}`
    );
  }

  private async getWebElements(
    locatorType: "id" | "xpath",
    locator: string,
    locatorMatchType: "equals" | "contains"
  ): Promise<WebElement[]> {
    try {
      return await this.client.getElementsByXpath(
        locatorType === "id" && locatorMatchType === "equals"
          ? `//*[@id="${locator}"]`
          : locatorType === "id" && locatorMatchType === "contains"
          ? `//*[contains(@id,"${locator}")]`
          : locator
      );
    } catch (error) {
      if (error instanceof Error) {
        LoggingService.error("failed get element", error);
      }
      return [];
    }
  }
}
