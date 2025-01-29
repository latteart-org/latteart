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

import { CapturedElementInfo, CapturedItem } from "@/capturer/captureScripts";

export type CapturedOperation = Pick<CapturedItem["operation"], "type"> & {
  elementInfo: Pick<CapturedElementInfo, "xpath" | "attributes" | "tagname">;
};

export function isIgnoreOperation(
  operation: CapturedOperation,
  prevOperations?: CapturedOperation[]
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

  if (prevOperations && prevOperations.length > 0) {
    // Ignore the change event that is fired after the click event for radio button or checkbox.
    if (
      hasChangeEventFiredByClickForCheckboxOrRadio(operation, prevOperations)
    ) {
      return true;
    }

    // Ignore the event for checkbox, radio, or text(email, password, tel) that is fired after the click event for label.
    if (
      hasEventForCheckboxOrRadioOrTextFiredByLabelClick(
        operation,
        prevOperations
      )
    ) {
      return true;
    }
  }

  return false;
}

function hasEventForCheckboxOrRadioOrTextFiredByLabelClick(
  operation: CapturedOperation,
  prevOperations: CapturedOperation[]
): boolean {
  if (!prevOperations || prevOperations.length === 0) {
    return false;
  }

  const target = prevOperations.find(
    (prev) =>
      operation.elementInfo.attributes.id &&
      operation.elementInfo.attributes.id === prev.elementInfo.attributes.for
  );

  if (!target) {
    return false;
  }

  if (target.elementInfo?.tagname.toUpperCase() !== "LABEL") {
    return false;
  }

  if (operation.elementInfo?.tagname.toUpperCase() !== "INPUT") {
    return false;
  }

  if (
    ["TEXT", "PASSWORD", "EMAIL", "TEL"].includes(
      operation.elementInfo?.attributes.type.toUpperCase()
    ) &&
    operation.type === "click"
  ) {
    return true;
  }

  if (
    ["CHECKBOX", "RADIO"].includes(
      operation.elementInfo?.attributes.type.toUpperCase()
    )
  ) {
    return true;
  }

  return false;
}

function hasChangeEventFiredByClickForCheckboxOrRadio(
  operation: CapturedOperation,
  prevOperations: CapturedOperation[]
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

  if (
    !prevOperations.find(
      (prevOperation) =>
        normalizeXPath(prevOperation.elementInfo.xpath) ===
          normalizeXPath(operation.elementInfo.xpath) &&
        prevOperation.type === "click"
    )
  ) {
    return false;
  }

  return true;
}

function normalizeXPath(before: string) {
  return before.replace(/\[1\]/g, "");
}
