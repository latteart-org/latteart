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

import { PageObjectMethodCommentGenerator } from "../../PageObjectMethodCommentGenerator";
import {
  PageObjectOperation,
  ElementType,
  OperationType,
  invalidOperationTypeExists,
} from "../../../model/pageObject/method/operation/PageObjectOperation";

export class JSPageObjectMethodCommentGenerator
  implements PageObjectMethodCommentGenerator {
  generateFrom(
    name: string,
    operations: PageObjectOperation[],
    destPageObject: {
      name: string;
      imageUrl: string;
    }
  ): string {
    const operationLines = operations.map(({ type, target }) => {
      const name =
        target.type === ElementType.RadioButton
          ? target.name ?? ""
          : target.identifier;

      const targetName =
        target.imageUrl && name
          ? `<a href="${target.imageUrl}">${name}</a>`
          : name;

      const invalidTypeExists = invalidOperationTypeExists(type as string);
      const operationTypeStr = this.getOperationTypeString(type);
      const operationStr = invalidTypeExists
        ? `<span style="color:red">Do '${operationTypeStr}'</span><span style="color:gray"># Please implement it manually</span>`
        : operationTypeStr;

      const targetStr = targetName ? ` [ ${targetName} ]` : "";

      return `<li>${operationStr}${targetStr}</li>`;
    });

    const moveOperationLine = `<li>Move to [ <a href="${destPageObject.imageUrl}">${destPageObject.name}</a> ]</li>`;

    const paramsTextLines = [...operationLines, moveOperationLine];

    const paramsText =
      paramsTextLines.length > 0
        ? `<ol>${paramsTextLines.join("\n")}</ol>`
        : "";

    return `\
${paramsText}`;
  }

  private getOperationTypeString(type: OperationType) {
    if (type === "click") {
      return "Click";
    }

    if (type === "change") {
      return "Change";
    }

    if (type === "switch_window") {
      return "Switch window to";
    }

    if (type === "accept_alert") {
      return "Accept alert";
    }

    if (type === "dismiss_alert") {
      return "Dismiss alert";
    }

    if (type === "browser_back") {
      return "Browser back";
    }

    if (type === "browser_forward") {
      return "Browser forward";
    }

    if (type === "other") {
      return "Operate";
    }

    return "";
  }
}
