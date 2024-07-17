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

import {
  BoundingRect,
  CapturedElementInfo,
  CapturedItem,
  ElementMutationForScript,
  EventInfo,
  ExtendedDocument,
  Iframe,
  ScreenMutationForScript,
  SuspendedCapturedItem,
} from "./types";

type ElementsWithTargetXPath = {
  elements: CapturedElementInfo[];
  targetXPath: string;
};

export const operationCapturingScripts = {
  captureData,
  collectScreenElements,
  refireEvent,
  deleteCapturedItems,
  markElement,
  unmarkElements,
  putNumberToRect,
};

function captureData({
  captureArch,
  shieldId,
  iframe,
}: {
  captureArch: "polling" | "push";
  shieldId: string;
  iframe?: Iframe;
}): {
  capturedItems: SuspendedCapturedItem[];
  screenElements: { iframeIndex?: number; elements: CapturedElementInfo[] };
  mutatedItems: ScreenMutationForScript[];
} {
  const getUrlAndTitle = () => {
    const extendedDocument: ExtendedDocument = document;
    return { url: extendedDocument.URL, title: extendedDocument.title };
  };

  const isReadyToCapture = (args: {
    captureArch: "polling" | "push";
    url: string;
    title: string;
  }) => {
    const extendedDocument: ExtendedDocument = document;
    extendedDocument.__parentUrl = args.url;
    extendedDocument.__parentTitle = args.title;

    if (extendedDocument.handleCapturedEvent === undefined) return false;
    if (extendedDocument.extractElements === undefined) return false;
    if (extendedDocument.getAttributesFromElement === undefined) return false;
    if (extendedDocument.collectVisibleElements === undefined) return false;
    if (
      extendedDocument.enqueueEventForReFire === undefined &&
      args.captureArch === "polling"
    )
      return false;
    if (extendedDocument.buildOperationInfo === undefined) return false;
    if (extendedDocument.__completedInjectFunction == undefined) return false;

    return true;
  };

  const setFunctionToCollectMutations = (iframe?: Iframe) => {
    const extendedDocument: ExtendedDocument = document;
    extendedDocument.__sendMutatedDatas = [];

    const body = document.getElementsByTagName("body")[0];
    const config = {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeOldValue: true,
    };
    const getXPath = (element: HTMLElement): string => {
      const path: string[] = [];
      let currentElement: HTMLElement = element;
      do {
        const parentElement = currentElement.parentElement;
        if (!parentElement) {
          path.push(currentElement.tagName);
          break;
        }
        let index = 0;
        let cnt = 1;
        parentElement.childNodes.forEach((el) => {
          if (
            currentElement.tagName === (el as HTMLElement).tagName &&
            currentElement !== el
          ) {
            cnt++;
          }
          if (currentElement === el) {
            index = cnt;
          }
        });
        path.push(currentElement.tagName + (index > 1 ? `[${index}]` : ""));
        currentElement = parentElement as HTMLElement;
      } while (currentElement);
      return `/${path.reverse().join("/")}`;
    };
    const getAttributes = (element: HTMLElement): { [key: string]: string } => {
      const attributes: { [key: string]: string } = {};
      for (const attribute of element.attributes) {
        if (["value", "checked"].includes(attribute.name)) {
          continue;
        }
        attributes[attribute.name] = attribute.value;
      }
      return attributes;
    };
    const mutationRecordToElementMutation = (
      record: MutationRecord
    ): ElementMutationForScript[] => {
      const target = record.target as HTMLElement;
      const targetValue = target.getAttribute("value");
      const targetElement = {
        tagname: target.tagName,
        text: target.textContent ?? undefined,
        value: targetValue === null ? "" : targetValue,
        xpath: getXPath(target),
        checked: Boolean(target.getAttribute("checked")) ?? undefined,
        attributes: getAttributes(target),
      };

      const result: ElementMutationForScript[] = [];
      if (record.type === "childList") {
        if (record.addedNodes.length > 0) {
          record.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              const attributes = getAttributes(node);
              const attributesId = getAttributes(node)["id"] ?? "";
              if (
                attributesId.startsWith("__LATTEART_MARKED_RECT__") ||
                attributesId.includes("__LATTEART_USER_OPERATION_SHIELD__")
              ) {
                return;
              }
              const value = node.getAttribute("value");
              result.push({
                type: "childElementAddition",
                targetElement,
                addedChildElement: {
                  tagname: node.tagName,
                  text: node.textContent ?? undefined,
                  value: value === null ? "" : value,
                  xpath: getXPath(node),
                  checked: Boolean(node.getAttribute("checked")) ?? undefined,
                  attributes,
                },
              });
            } else if (node instanceof Text) {
              result.push({
                type: "textContentAddition",
                targetElement,
                addedTextContent: node.textContent ?? "",
              });
            }
          });
        } else if (record.removedNodes.length > 0) {
          record.removedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              const attributes = getAttributes(node);
              const attributesId = getAttributes(node)["id"] ?? "";
              if (
                attributesId.startsWith("__LATTEART_MARKED_RECT__") ||
                attributesId.includes("__LATTEART_USER_OPERATION_SHIELD__")
              ) {
                return;
              }
              const value = node.getAttribute("value");
              result.push({
                type: "childElementRemoval",
                targetElement,
                removedChildElement: {
                  tagname: node.tagName,
                  text: node.textContent ?? undefined,
                  value: value === null ? "" : value,
                  xpath: getXPath(node),
                  checked: Boolean(node.getAttribute("checked")) ?? undefined,
                  attributes,
                },
              });
            } else if (node instanceof Text) {
              result.push({
                type: "textContentRemoval",
                targetElement,
                removedTextContent: node.textContent ?? "",
              });
            }
          });
        }
      } else if (record.type === "characterData") {
        result.push({
          type: "textContentChange",
          targetElement,
          oldValue: record.oldValue ?? "",
        });
      } else if (record.type === "attributes") {
        if (record.target instanceof Element) {
          const attributeName = record.attributeName ?? "";
          const attributeExists = target.hasAttribute(attributeName);
          const newValue = attributeExists
            ? (target.getAttribute(attributeName) as string)
            : "";
          const oldValue = record.oldValue !== null ? record.oldValue : "";

          if (
            (targetElement.tagname === "IFRAME" &&
              attributeName === "cd_frame_id_") ||
            [oldValue, newValue].some(
              (value) =>
                value.includes("__LATTEART_OPERATION_TARGET_ELEMENT__") ||
                value.includes("__LATTEART_MARKED_RECT__") ||
                value.includes("__LATTEART_USER_OPERATION_SHIELD__")
            ) ||
            (!oldValue && !newValue) ||
            oldValue === newValue
          ) {
            return [];
          }
          if (attributeExists && !oldValue) {
            result.push({
              type: "attributeAddition",
              targetElement,
              attributeName,
              newValue,
            });
          } else if (!attributeExists && oldValue) {
            result.push({
              type: "attributeRemoval",
              targetElement,
              attributeName,
              oldValue,
            });
          } else if (attributeExists && oldValue) {
            result.push({
              type: "attributeChange",
              targetElement,
              attributeName,
              newValue,
              oldValue,
            });
          }
        }
      }
      return result;
    };
    const observer = new MutationObserver((mutationList: MutationRecord[]) => {
      const elementMutations: ElementMutationForScript[] = [];
      mutationList.forEach((mutationRecord) => {
        const result = mutationRecordToElementMutation(mutationRecord);
        if (result.length > 0) {
          elementMutations.push(...result);
        }
      });
      if (elementMutations.length > 0) {
        const mutatedData: ScreenMutationForScript = {
          elementMutations,
          timestamp: new Date().getTime(),
          scrollPosition: {
            x: window.scrollX,
            y: window.scrollY,
          },
        };
        if (iframe) {
          mutatedData.iframe = iframe;
        }
        extendedDocument.__sendMutatedDatas?.push(mutatedData);
      }
    });
    observer.observe(body, config);
  };

  const setFunctionToGetAttributesFromElement = () => {
    const extendedDocument: ExtendedDocument = document;

    extendedDocument.getAttributesFromElement = (elem: HTMLElement) => {
      if (!elem.hasAttributes()) {
        return {};
      }
      const attributes: { [key: string]: string } = {};
      for (let i = elem.attributes.length - 1; i >= 0; i--) {
        attributes[elem.attributes[i].name] = elem.attributes[i].value;
      }
      return attributes;
    };
    return true;
  };

  const setFunctionToCollectVisibleElements = () => {
    const extendedDocument: ExtendedDocument = document;

    extendedDocument.collectVisibleElements = (
      allElements: HTMLInputElement[]
    ) => {
      return allElements.filter((element) => {
        // Ignore invisible elements.
        if (element.hidden === true) return false;
        if (document.defaultView === null) return false;

        const style = document.defaultView.getComputedStyle(element, null);

        if (
          element.type !== "hidden" &&
          style.getPropertyValue("display") === "none"
        ) {
          return false;
        }

        if (
          ["hidden", "collapse"].includes(style.getPropertyValue("visibility"))
        ) {
          return false;
        }

        return true;
      });
    };
    return true;
  };

  const setFunctionToExtractElements = () => {
    const extendedDocument: ExtendedDocument = document;

    extendedDocument.extractElements = (parent: Element, path: string) => {
      const elementsWithTargetXPath: ElementsWithTargetXPath = {
        elements: [],
        targetXPath: "",
      };

      if (
        !extendedDocument ||
        !extendedDocument.defaultView ||
        !extendedDocument.collectVisibleElements ||
        !extendedDocument.getAttributesFromElement ||
        !extendedDocument.extractElements ||
        extendedDocument.__capturingIsPaused
      ) {
        return elementsWithTargetXPath;
      }

      const children = [...parent.children];
      const shadowChildren = [
        ...(parent.shadowRoot ? parent.shadowRoot.children : []),
      ];

      const allElements = children.length > 0 ? children : shadowChildren;

      const visibleElements = extendedDocument.collectVisibleElements(
        allElements as HTMLInputElement[]
      );

      for (const element of visibleElements) {
        const currentXPath = ((
          parentXPath: string,
          element: Element,
          elements: Element[]
        ) => {
          const sameTagElements = elements.filter(
            (e) => e.tagName === element.tagName
          );
          const index = sameTagElements.indexOf(element) + 1;

          // Convert the format for SVG.
          // example：hoge[99] → *[name()="hoge"][99]
          const isHTMLElement = (e: Element) => {
            if ((e as any).id === undefined) return false;
            if ((e as any).title === undefined) return false;
            if ((e as any).lang === undefined) return false;
            if ((e as any).dir === undefined) return false;
            if ((e as any).className === undefined) return false;

            return true;
          };

          const tagName = isHTMLElement(element)
            ? element.tagName
            : `*[name()="${element.tagName}"]`;

          const tagNameWithIndex =
            sameTagElements.length > 1 ? `${tagName}[${index}]` : tagName;

          return `${parentXPath}/${tagNameWithIndex}`;
        })(path, element, allElements);

        const textWithoutChildren = Array.from(element.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((textNode) => {
            if (!textNode.textContent) {
              return "";
            }
            return textNode.textContent.replace(/\s/g, "");
          })
          .filter((text) => text !== "")
          .join(" ");

        const boundingRect = element.getBoundingClientRect();
        const newElement: CapturedElementInfo = {
          tagname: element.tagName,
          xpath: currentXPath,
          attributes: extendedDocument.getAttributesFromElement(element),
          boundingRect: {
            top: boundingRect.top,
            left: boundingRect.left,
            width: boundingRect.width,
            height: boundingRect.height,
          },
          outerHeight: window.outerHeight,
          outerWidth: window.outerWidth,
          innerHeight: window.innerHeight,
          innerWidth: window.innerWidth,
          textWithoutChildren,
        };
        if (element.value != null) {
          newElement.value = `${element.value}`;
        }
        if (element.checked !== undefined) {
          newElement.checked = element.checked;
        }
        if (element.innerText != null) {
          newElement.text = element.innerText;
        }

        elementsWithTargetXPath.elements.push(newElement);

        if (
          element.classList.contains("__LATTEART_OPERATION_TARGET_ELEMENT__")
        ) {
          element.classList.remove("__LATTEART_OPERATION_TARGET_ELEMENT__");
          elementsWithTargetXPath.targetXPath = currentXPath;
        }

        const { elements, targetXPath } = extendedDocument.extractElements(
          element,
          currentXPath
        );

        elementsWithTargetXPath.elements.push(...elements);

        if (targetXPath !== "") {
          elementsWithTargetXPath.targetXPath = targetXPath;
        }
      }

      return elementsWithTargetXPath;
    };
    return true;
  };

  const setFunctionToEnqueueEventForReFire = () => {
    const extendedDocument: ExtendedDocument = document;

    extendedDocument.enqueueEventForReFire = (id: string, event: Event) => {
      const extendedDocument: ExtendedDocument = document;

      // Copy the event for refire.
      const initObj: any = {};
      for (const p in event) {
        if (typeof (event as any)[p] !== "function") {
          initObj[p] = (event as any)[p];
        }
      }
      initObj.defaultPrevented = event.defaultPrevented;
      initObj.cancelBubble = event.cancelBubble;

      // click -> MouseEvent, change -> Event.
      const copyEvent =
        event instanceof MouseEvent
          ? new MouseEvent(event.type, initObj)
          : new Event(event.type, initObj);

      // Set to Map in order of fired.
      if (!extendedDocument.__latteartEventIdToEvent) {
        extendedDocument.__latteartEventIdToEvent = new Map();
      }
      extendedDocument.__latteartEventIdToEvent.set(id, copyEvent);
    };
    return true;
  };

  const setFunctionToBuildOperationInfo = () => {
    const extendedDocument: ExtendedDocument = document;

    extendedDocument.buildOperationInfo = (
      element: HTMLInputElement,
      xpath: string,
      eventType: string,
      window: Window
    ) => {
      const extendedDocument: ExtendedDocument = document;

      if (extendedDocument.getAttributesFromElement === undefined) {
        return null;
      }

      const textWithoutChildren = Array.from(element.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((textNode) => {
          if (!textNode.textContent) {
            return "";
          }
          return textNode.textContent.replace(/\s/g, "");
        })
        .filter((text) => text !== "")
        .join(" ");

      const boundingRect = element.getBoundingClientRect();
      const elementInfo: CapturedElementInfo = {
        tagname: element.tagName,
        xpath,
        attributes: extendedDocument.getAttributesFromElement(element),
        boundingRect: {
          top: boundingRect.top,
          left: boundingRect.left,
          width: boundingRect.width,
          height: boundingRect.height,
        },
        outerHeight: window.outerHeight,
        outerWidth: window.outerWidth,
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
        textWithoutChildren,
      };
      if (element.value != null) {
        elementInfo.value = `${element.value}`;
      }
      if (element.checked !== undefined) {
        elementInfo.checked = element.checked;
      }
      if (element.innerText != null) {
        elementInfo.text = element.innerText;
      }

      return {
        input: element.value != null ? `${element.value}` : "",
        type: eventType,
        elementInfo,
        title: extendedDocument.__parentTitle || "",
        url: extendedDocument.__parentUrl || "",
        scrollPosition: {
          x: window.scrollX,
          y: window.scrollY,
        },
        timestamp: new Date().valueOf(),
      };
    };
    return true;
  };

  const setFunctionToHandleCapturedEvent = (args: {
    ignoreElementIds: string[];
    captureType: "polling" | "push";
    iframe?: Iframe;
  }) => {
    const extendedDocument: ExtendedDocument = document;

    extendedDocument.handleCapturedEvent = (event: Event) => {
      if (
        !extendedDocument.getAttributesFromElement ||
        !extendedDocument.extractElements ||
        !extendedDocument.buildOperationInfo
      ) {
        return;
      }

      if (extendedDocument.__capturingIsPaused) {
        return;
      }

      if (extendedDocument.readyState !== "complete" || !event.isTrusted) {
        return;
      }

      const targetElement = event.composedPath()[0] as HTMLInputElement;

      if (targetElement && args.ignoreElementIds.includes(targetElement.id)) {
        return;
      }

      // Stop event temporarily and enqueue for refire.
      const eventId = event.type + event.timeStamp;
      if (
        args.captureType === "polling" &&
        extendedDocument.enqueueEventForReFire
      ) {
        extendedDocument.enqueueEventForReFire(eventId, event);
        event.preventDefault();
        event.stopPropagation();
      }

      if (!targetElement) {
        return;
      }

      // Extract elements from the screen.
      targetElement.classList.add("__LATTEART_OPERATION_TARGET_ELEMENT__");
      const { targetXPath } = extendedDocument.extractElements(
        extendedDocument.body,
        "/HTML/BODY"
      );

      const operation = extendedDocument.buildOperationInfo(
        targetElement,
        targetXPath,
        event.type,
        window
      );

      if (!operation) {
        return;
      }

      if (args.captureType === "polling") {
        // Set the operation.
        if (!extendedDocument.__sendDatas) {
          extendedDocument.__sendDatas = [];
        }

        const refireType = ((operation) => {
          if (
            operation.elementInfo.tagname === "INPUT" &&
            operation.type === "click" &&
            operation.elementInfo.attributes["type"] &&
            (operation.elementInfo.attributes["type"] === "date" ||
              operation.elementInfo.attributes["type"] === "datetime-local")
          ) {
            return "inputDate";
          }
          return "";
        })(operation);

        const eventInfo = {
          id: eventId,
          targetXPath: operation.elementInfo.xpath,
          type: event.type,
          option: {
            bubbles: event.bubbles,
            cancelable: event.cancelable,
          },
        };

        const sendData: SuspendedCapturedItem = {
          operation,
          suspendedEvent: { refireType, eventInfo },
        };

        if (args.iframe) {
          sendData.iframe = args.iframe;
        }

        extendedDocument.__sendDatas.push(sendData);
      } else {
        const sendData: CapturedItem = { operation };

        if (args.iframe) {
          sendData.iframe = args.iframe;
        }

        fetch("http://localhost:3001/api/v1/operation", {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sendData),
        });
      }
    };
    return true;
  };

  const resetEventListeners = () => {
    const extendedDocument: ExtendedDocument = document;

    if (!extendedDocument.handleCapturedEvent) {
      return false;
    }

    extendedDocument.body.removeEventListener(
      "click",
      extendedDocument.handleCapturedEvent,
      true
    );
    extendedDocument.body.removeEventListener(
      "change",
      extendedDocument.handleCapturedEvent,
      true
    );

    extendedDocument.body.addEventListener(
      "click",
      extendedDocument.handleCapturedEvent,
      true
    );
    extendedDocument.body.addEventListener(
      "change",
      extendedDocument.handleCapturedEvent,
      true
    );
    extendedDocument.__completedInjectFunction = true;
    return true;
  };

  const pullMutatedItems = () => {
    const extendedDocument: ExtendedDocument = document;

    if (!extendedDocument || !extendedDocument.__sendMutatedDatas) {
      return [];
    }
    const queueLength = extendedDocument.__sendMutatedDatas.length;
    const result: ScreenMutationForScript[] = [];
    for (let i = 0; i < queueLength; i++) {
      const item = extendedDocument.__sendMutatedDatas.shift();
      if (item) {
        result.push(item);
      }
    }
    return result;
  };

  const pullCapturedItems = () => {
    const extendedDocument: ExtendedDocument = document;

    if (!extendedDocument || !extendedDocument.__sendDatas) {
      return [];
    }

    const queueLength = extendedDocument.__sendDatas.length;
    const result: SuspendedCapturedItem[] = [];
    for (let i = 0; i < queueLength; i++) {
      const item = extendedDocument.__sendDatas.shift();
      if (item) {
        result.push(item);
      }
    }

    return result;
  };

  // get ready to capture
  const urlAndTitle = getUrlAndTitle();
  const isReady = isReadyToCapture({
    captureArch,
    url: urlAndTitle.url,
    title: urlAndTitle.title,
  });

  if (!isReady) {
    if (captureArch === "polling") {
      setFunctionToEnqueueEventForReFire();
      setFunctionToCollectMutations(iframe);
    }

    setFunctionToGetAttributesFromElement() &&
      setFunctionToCollectVisibleElements() &&
      setFunctionToExtractElements() &&
      setFunctionToBuildOperationInfo() &&
      setFunctionToHandleCapturedEvent({
        ignoreElementIds: [shieldId],
        captureType: captureArch,
        iframe,
      }) &&
      resetEventListeners();
  }

  // pull captured items
  const capturedItems =
    captureArch === "polling"
      ? (() => {
          const pulledItems = pullCapturedItems();

          return pulledItems.filter(
            (item) => item.suspendedEvent.eventInfo.targetXPath !== ""
          );
        })()
      : [];

  // pull mutation data
  const mutatedItems = pullMutatedItems();

  // collect screen elements
  const screenElements: {
    iframeIndex?: number;
    elements: CapturedElementInfo[];
  } = {
    elements: (() => {
      const extendedDocument: ExtendedDocument = document;
      if (!extendedDocument.extractElements) {
        return [];
      }

      const { elements } = extendedDocument.extractElements(
        extendedDocument.body,
        "/HTML/BODY"
      );
      return elements;
    })(),
  };

  if (iframe) {
    screenElements.iframeIndex = iframe.index;
  }

  return { capturedItems, screenElements, mutatedItems };
}

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

function deleteCapturedItems() {
  const extendedDocument: ExtendedDocument = document;
  console.log(extendedDocument.__sendDatas);
  extendedDocument.__sendDatas = [];
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
  (div.style.top = rect.top + window.pageYOffset + "px"),
    // div.style.top = rect.top - ${this.getTopElementMarginTopFunc}() + window.pageYOffset + 'px',
    (div.style.left = rect.left + window.pageXOffset + "px"),
    (div.style.height = rect.height + "px");
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
