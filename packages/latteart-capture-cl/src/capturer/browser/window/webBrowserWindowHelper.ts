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

import { CapturedElementInfo, CapturedItem } from "@/capturer/captureScripts";

export type CapturedOperation = Pick<CapturedItem["operation"], "type"> & {
  elementInfo: Pick<CapturedElementInfo, "xpath" | "attributes" | "tagname">;
};

export function isIgnoreOperation(
  operation: CapturedOperation,
  prevOperation?: CapturedOperation
) {
  // Ignore the click event when dropdown list is opened because Selenium can not take a screenshot when dropdown list is opened.
  if (
    operation.type === "click" &&
    operation.elementInfo.tagname.toLowerCase() === "select"
  ) {
    return true;
  }

  // Ignore the click event when clicking an input element of calendar type.
  if (
    operation.type === "click" &&
    (operation.elementInfo.attributes.type === "date" ||
      operation.elementInfo.attributes.type === "datetime-local")
  ) {
    return true;
  }

  if (prevOperation) {
    // Ignore the change event that is fired after the click event for radio button or checkbox.
    if (
      hasChangeEventFiredByClickForCheckboxOrRadio(operation, prevOperation)
    ) {
      return true;
    }

    // Ignore the event for checkbox or radio that is fired after the click event for label.
    if (hasEventForCheckboxOrRadioFiredByLabelClick(operation, prevOperation)) {
      return true;
    }
  }

  return false;
}

function hasEventForCheckboxOrRadioFiredByLabelClick(
  operation: CapturedOperation,
  prevOperation: CapturedOperation
): boolean {
  if (!prevOperation) {
    return false;
  }

  if (prevOperation.elementInfo?.attributes.for === undefined) {
    return false;
  }

  if (
    prevOperation.elementInfo?.attributes.for !==
    operation.elementInfo?.attributes.id
  ) {
    return false;
  }

  if (prevOperation.elementInfo?.tagname.toUpperCase() !== "LABEL") {
    return false;
  }

  if (operation.elementInfo?.tagname.toUpperCase() !== "INPUT") {
    return false;
  }

  if (
    !["CHECKBOX", "RADIO"].includes(
      operation.elementInfo?.attributes.type.toUpperCase()
    )
  ) {
    return false;
  }

  return true;
}

function hasChangeEventFiredByClickForCheckboxOrRadio(
  operation: CapturedOperation,
  prevOperation: CapturedOperation
) {
  if (operation.type !== "change") {
    return false;
  }

  const elementType = operation.elementInfo.attributes.type
    ? operation.elementInfo.attributes.type.toLowerCase()
    : "";
  const elementTagname = operation.elementInfo.tagname.toLowerCase();
  if (
    !(
      elementTagname === "input" &&
      (elementType === "radio" || elementType === "checkbox")
    )
  ) {
    return false;
  }

  const elementXPath = operation.elementInfo.xpath;
  const normalizedXPath = normalizeXPath(elementXPath);
  const normalizedPrevXPath = normalizeXPath(prevOperation.elementInfo.xpath);
  if (
    !(prevOperation.type === "click" && normalizedXPath === normalizedPrevXPath)
  ) {
    return false;
  }

  return true;
}

function normalizeXPath(before: string) {
  return before.replace(/\[1\]/g, "");
}
