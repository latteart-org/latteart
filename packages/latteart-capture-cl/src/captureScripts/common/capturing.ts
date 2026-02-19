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

import { BoundingRect, EventInfo, ExtendedDocument } from "../types";

export const capturingScripts = {
  collectScreenElements,
  refireEvent,
  markElement,
  unmarkElements,
  putNumberToRect,
};

function collectScreenElements() {
  const extendedDocument: ExtendedDocument = document;
  if (!extendedDocument.extractElements) {
    return [];
  }

  const { elements } = extendedDocument.extractElements(
    extendedDocument.body,
    "/HTML/BODY"
  );
  return elements;
}

function refireEvent(eventInfo: EventInfo) {
  const extendedDocument: ExtendedDocument = document;

  if (!extendedDocument.handleCapturedEvent) {
    return;
  }

  const targetElement = extendedDocument.evaluate(
    eventInfo.targetXPath,
    extendedDocument,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (!targetElement) {
    return;
  }

  if (extendedDocument.__latteartEventIdToEvent) {
    const eventObj = extendedDocument.__latteartEventIdToEvent.get(
      eventInfo.id
    );
    if (eventObj) {
      targetElement.dispatchEvent(eventObj);

      // Refire events for original design radio/checkbox like below.
      //
      // <label> or <div>
      //   <input type="radio"/> <!-- invisible input element -->
      //
      //   ..Some elements or texts to compose radio/checkbox..
      //
      // </label> or </div>
      try {
        const originalDesignElement = ((element: HTMLElement) => {
          const isOriginalDesignElement = (element: HTMLElement) => {
            if (!["LABEL", "DIV"].includes(element.tagName.toUpperCase())) {
              return false;
            }

            const child = element.children[0] as HTMLElement | undefined;

            if (!child) {
              return false;
            }

            const childType = child.getAttribute("type");
            const childIsCheckboxOrRadio =
              child.tagName.toUpperCase() === "INPUT" &&
              ["checkbox", "radio"].includes(childType ? childType : "");

            const childStyle = window.getComputedStyle(child, "");

            const childIsInvisible =
              childStyle.display === "none" ||
              childStyle.visibility === "hidden";

            console.log(childIsInvisible);

            return childIsCheckboxOrRadio && childIsInvisible;
          };

          if (isOriginalDesignElement(element)) {
            return element.children[0] as HTMLElement;
          }

          if (
            element.parentElement &&
            isOriginalDesignElement(element.parentElement)
          ) {
            return element.parentElement.children[0] as HTMLElement;
          }

          return null;
        })(targetElement as HTMLElement);

        if (originalDesignElement) {
          originalDesignElement.click();
        }
      } catch (error) {
        console.error(error);
      }
      extendedDocument.__latteartEventIdToEvent.delete(eventInfo.id);
    }
  }
}

function markElement({
  rect,
  index,
  prefix,
}: {
  rect: BoundingRect;
  index: number;
  prefix: string;
}) {
  const div = document.createElement("div");

  div.id = `${prefix}_${index}`;
  div.style.position = "absolute";
  div.style.top = rect.top + window.pageYOffset + "px";
  // div.style.top = rect.top - ${this.getTopElementMarginTopFunc}() + window.pageYOffset + 'px';
  div.style.left = rect.left + window.pageXOffset + "px";
  div.style.height = rect.height + "px";
  div.style.width = rect.width + "px";
  div.style.border = "2px solid #F00";
  div.style.display = "block";
  div.style.zIndex = "2147483647";
  div.style.pointerEvents = "none";

  const body = document.getElementsByTagName("body")[0];
  body.insertAdjacentElement("beforeend", div);
}

function unmarkElements({
  rects,
  prefix,
}: {
  rects: BoundingRect[];
  prefix: string;
}) {
  rects.forEach((_, index) => {
    const element = document.getElementById(`${prefix}_${index}`);
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
}

function putNumberToRect({ index, prefix }: { index: number; prefix: string }) {
  const div = document.getElementById(`${prefix}_${index}`);

  if (div === null) {
    return;
  }

  const p = document.createElement("p");
  p.style.position = "relative";
  p.style.top = "0px";
  p.style.left = "0px";
  p.style.color = "red";
  const vhShadow =
    "0px 1px 0px white, 0px -1px 0px white, -1px 0px 0px white, 1px 0px 0px white";
  const diagonalShadow =
    "1px 1px 0px white, -1px -1px 0px white, -1px 1px 0px white, 1px -1px 0px white";
  p.style.textShadow = vhShadow + ", " + diagonalShadow;
  p.innerText = String.fromCharCode(9312 + index);

  div.insertAdjacentElement("beforeend", p);
}
