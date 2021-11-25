/**
 * Copyright 2021 NTT Corporation.
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

import { ElementInfo } from "../../../../../types";
import { IdentifierUtil } from "../../../../IdentifierUtil";

export interface LocatorGenerator {
  generateFrom(elem: ElementInfo): string;
}

export class LocatorGeneratorImpl implements LocatorGenerator {
  private _usedLocator: Set<string> = new Set<string>();

  public generateFrom(elem: ElementInfo): string {
    const attr = elem.attributes;

    if (IdentifierUtil.isDefined(attr.id)) {
      const idLocator = "#" + attr.id;
      return this.isValidLocator(idLocator) ? idLocator : elem.xpath;
    }

    if (IdentifierUtil.isDefined(attr.name)) {
      if (IdentifierUtil.isDefined(attr.value)) {
        const nameValueLocator = `//*[@name="${attr.name}" and @value="${attr.value}"]`;
        return this.isValidLocator(nameValueLocator)
          ? nameValueLocator
          : elem.xpath;
      } else {
        const nameLocator = `[name="${attr.name}"]`;
        return this.isValidLocator(nameLocator) ? nameLocator : elem.xpath;
      }
    }

    if (IdentifierUtil.isDefined(elem.text) && elem.tagname !== "DIV") {
      const partialText = elem
        .text!.slice(0, IdentifierUtil.maxIdentifierLength)
        .trim();
      if (!partialText.match(/\s/g)) {
        if (elem.tagname === "A") {
          const linkTextLocator = "*=" + partialText;
          return this.isValidLocator(linkTextLocator)
            ? linkTextLocator
            : elem.xpath;
        } else {
          const linkTextLocator =
            elem.tagname.toLowerCase() + "*=" + partialText;
          return this.isValidLocator(linkTextLocator)
            ? linkTextLocator
            : elem.xpath;
        }
      }
    }

    return elem.xpath;
  }

  private isValidLocator(locator: string) {
    if (this._usedLocator.has(locator)) {
      return false;
    } else {
      this._usedLocator.add(locator);
      return true;
    }
  }
}
