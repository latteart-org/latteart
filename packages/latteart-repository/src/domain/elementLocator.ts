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

import { ElementInfo } from "./types";

export type Locator = {
  [key in LocatorType]?: string;
};

type LocatorType = "id" | "name" | "linkText" | "innerText" | "xpath" | "other";

export type ElementLocatorFormatter = {
  formatIdLocator: (id: string) => string;
  formatNameAndValueLocator: (name: string, value: string) => string;
  formatNameLocator: (name: string) => string;
  formatTextAndTagnameLocator: (text: string, tagname?: string) => string;
  formatXPathLocator: (xpath: string) => string;
};

export function createWDIOLocatorFormatter(): ElementLocatorFormatter {
  return {
    formatIdLocator: (id: string) => {
      return `#${id}`;
    },
    formatNameAndValueLocator: (name: string, value: string) => {
      return `//*[@name="${name}" and @value="${value}"]`;
    },
    formatNameLocator: (name: string) => {
      return `[name="${name}"]`;
    },
    formatTextAndTagnameLocator: (text: string, tagname = "") => {
      return `${tagname}*=${text}`;
    },
    formatXPathLocator: (xpath: string) => {
      return xpath;
    },
  };
}

export type ElementLocatorSource = {
  tagname: string;
  text?: string;
  xpath: string;
  attributes: { id?: string; name?: string; value?: string };
};

export interface ElementLocatorGenerator {
  generateFrom(source: ElementLocatorSource): Locator[];
}

export class ScreenElementLocatorGenerator implements ElementLocatorGenerator {
  constructor(
    private formatter: ElementLocatorFormatter,
    private screenElements: ElementInfo[],
    private useMultiLocator: boolean,
    private maxTextLength = 100
  ) {}

  public generateFrom(source: ElementLocatorSource): Locator[] {
    let locators: Locator[];

    if (this.useMultiLocator) {
      locators = this.generateLocatorForMultiLocator(source);
      locators.push({ xpath: this.formatter.formatXPathLocator(source.xpath) });
    } else {
      const locator = this.generateLocator(source);
      locators = [
        {
          other:
            locator !== ""
              ? locator
              : this.formatter.formatXPathLocator(source.xpath),
        },
      ];
    }
    return locators;
  }

  private hasSameIdElement(xpath: string, id: string): boolean {
    const normalizedXPath = this.normalizeXPath(xpath);
    return this.screenElements.some(
      (element) =>
        element.attributes.id === id &&
        this.normalizeXPath(element.xpath) !== normalizedXPath
    );
  }

  private hasSameNameAndValueElement(
    xpath: string,
    name: string,
    value: string
  ): boolean {
    const normalizedXPath = this.normalizeXPath(xpath);
    return this.screenElements.some(
      (element) =>
        element.attributes.name === name &&
        element.value === value &&
        this.normalizeXPath(element.xpath) !== normalizedXPath
    );
  }

  private hasSameNameElement(xpath: string, name: string): boolean {
    const normalizedXPath = this.normalizeXPath(xpath);
    return this.screenElements.some(
      (element) =>
        element.attributes.name === name &&
        this.normalizeXPath(element.xpath) !== normalizedXPath
    );
  }

  private hasSameTextAndTagnameElement(
    xpath: string,
    text: string,
    tagname: string
  ): boolean {
    return this.screenElements.some((element) => {
      const normalizedXPath = this.normalizeXPath(xpath);
      return (
        text === this.toPartialText(element.text ?? "") &&
        tagname === element.tagname &&
        this.normalizeXPath(element.xpath) !== normalizedXPath
      );
    });
  }

  private generateLocatorForMultiLocator(
    source: ElementLocatorSource
  ): Locator[] {
    const locators: Locator[] = [];

    const { id, name } = source.attributes;
    const xpath = source.xpath;

    if (id && !this.hasSameIdElement(xpath, id)) {
      locators.push({ id });
    }

    if (name && !this.hasSameNameElement(xpath, name)) {
      locators.push({ name });
    }

    if (!source.text) {
      return locators;
    }

    const partialText = this.toPartialText(source.text);
    if (source.tagname.toUpperCase() === "A") {
      if (
        !this.hasSameTextAndTagnameElement(xpath, partialText, "A") &&
        !partialText.includes("\n")
      ) {
        locators.push({ linkText: partialText });
      }
    } else {
      if (
        !this.hasSameTextAndTagnameElement(
          xpath,
          partialText,
          source.tagname
        ) &&
        !partialText.includes("\n")
      ) {
        locators.push({ innerText: partialText });
      }
    }

    return locators;
  }

  private generateLocator(source: ElementLocatorSource): string {
    const { id, name, value } = source.attributes;
    const xpath = source.xpath;

    if (id && !this.hasSameIdElement(xpath, id)) {
      return this.formatter.formatIdLocator(id);
    }

    if (name && value && !this.hasSameNameAndValueElement(xpath, name, value)) {
      return this.formatter.formatNameAndValueLocator(name, value);
    }

    if (name && !this.hasSameNameElement(xpath, name)) {
      return this.formatter.formatNameLocator(name);
    }

    if (source.tagname === "DIV" || !source.text) {
      return "";
    }

    const partialText = this.toPartialText(source.text);

    if (partialText.match(/<|>|\/|\s/g)) {
      return "";
    }

    if (source.tagname === "A") {
      return this.hasSameTextAndTagnameElement(xpath, partialText, "A")
        ? ""
        : this.formatter.formatTextAndTagnameLocator(partialText);
    }

    return this.hasSameTextAndTagnameElement(xpath, partialText, source.tagname)
      ? ""
      : this.formatter.formatTextAndTagnameLocator(
          partialText,
          source.tagname.toLowerCase()
        );
  }

  private toPartialText(text: string): string {
    return text.slice(0, this.maxTextLength).trim();
  }

  private normalizeXPath(before: string): string {
    return before.replace(/\[1\]/g, "");
  }
}
