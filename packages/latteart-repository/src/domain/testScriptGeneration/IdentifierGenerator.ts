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

import { createHash } from "crypto";
import { TestScriptSourceElement } from "./types";

export class IdentifierGenerator {
  public maxIdentifierLength = 100;
  public identifierToXPath = new Map<string, string>();

  /**
   * Generate identifier string from element information.
   * @param elem element information
   * @param isUpper whether to capitalize the first letter
   * @return identifier string
   */
  public generateIdentifierFromElement(
    elem: TestScriptSourceElement,
    isUpper = false
  ): string {
    const attr = elem.attributes;

    let tempIdentifier = "";
    if (attr.type && attr.type === "radio") {
      // radio buttons are distinguished by name if they have different id
      // because arguments determine the operation target.
      tempIdentifier = attr.name;
    } else if (attr.id) {
      tempIdentifier = attr.id;
    } else if (attr.type === "submit" && attr.value) {
      tempIdentifier = attr.value;
    } else if (attr.name) {
      if (attr.value) {
        tempIdentifier = attr.name + attr.value;
      } else {
        tempIdentifier = attr.name;
      }
    } else if (elem.text) {
      tempIdentifier = elem.text;
    } else if (attr.value) {
      tempIdentifier = attr.value;
    } else if (attr.href) {
      tempIdentifier = attr.href;
    } else if (attr.alt) {
      tempIdentifier = attr.alt;
    } else if (attr.src) {
      tempIdentifier = attr.src;
    } else {
      tempIdentifier = "noName";
    }

    let identifier = "";
    const xpath = this.identifierToXPath.get(tempIdentifier);
    if (xpath && xpath !== elem.xpath) {
      identifier = `${tempIdentifier}${createHash("md5")
        .update(elem.xpath)
        .digest("hex")}`;
    } else {
      this.identifierToXPath.set(tempIdentifier, elem.xpath);
      identifier = tempIdentifier;
    }

    identifier = this.normalizeAndToCamelCase(identifier, isUpper);

    if (identifier.match(/^[0-9]/)) {
      return "_" + identifier;
    } else {
      return identifier;
    }
  }

  /**
   * Normalize identifier and make it CamelCase.
   * @param identifier identifier string
   * @param isUpper whether to capitalize the first letter
   * @returns identifier string
   */
  public normalizeAndToCamelCase(identifier: string, isUpper = false): string {
    const normalized = this.normalizeIdentifier(identifier);
    const splitStr = normalized.split("$");
    const camelCase = splitStr
      .map(
        (word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join("");

    if (camelCase === "") {
      return "_";
    }

    if (isUpper) {
      return camelCase;
    } else {
      return camelCase.charAt(0).toLowerCase() + camelCase.slice(1);
    }
  }

  private normalizeIdentifier(identifier: string) {
    // Turn white space and single-byte symbols that is likely to
    // be used in title or URL into temporally delimiter '$'.
    // Double-byte symbols that is likely to be used in title or URL
    return identifier
      .trim()
      .replace(/[^0-9A-Za-zぁ-んーァ-ンヴーｦ-ﾟ一-龠\s-_/?|？・〜＿｜→]/g, "")
      .replace(/[\s-_/?|]+/g, "$")
      .replace(/[？・〜＿｜→]+/g, "_")
      .slice(0, this.maxIdentifierLength);
  }
}
