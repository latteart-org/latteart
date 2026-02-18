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

import {
  CapturedElementInfo,
  ElementMutationForScript,
  ExtendedDocument,
  ScreenMutationForScript,
  SuspendedCapturedItem,
} from "../types";
import { ExtendedWindowForCDP } from "./types";

type ElementsWithTargetXPath = {
  elements: CapturedElementInfo[];
  targetXPath: string;
};

export const setupScripts = {
  setupPage,
};

function setupPage(): void {
  const iframe = (window as ExtendedWindowForCDP).getIFrameInfo?.();

  const setFunctionToCollectMutations = () => {
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

      const isIgnoreElement = (attribute: { id?: string; class?: string }) => {
        return (
          (attribute.id?.startsWith("__LATTEART_MARKED_RECT__") ?? false) ||
          attribute.id === "__LATTEART_USER_OPERATION_SHIELD__" ||
          attribute.id === "__latteart_init_guard__" ||
          (attribute.class?.includes("__LATTEART_OPERATION_TARGET_ELEMENT__") ??
            false)
        );
      };

      const result: ElementMutationForScript[] = [];
      if (record.type === "childList") {
        if (record.addedNodes.length > 0) {
          record.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              const attributes = getAttributes(node);

              if (isIgnoreElement(attributes)) {
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

              if (isIgnoreElement(attributes)) {
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
            [
              Object.fromEntries([[attributeName, oldValue]]),
              Object.fromEntries([[attributeName, newValue]]),
            ].some((attributes) => isIgnoreElement(attributes))
          ) {
            return [];
          }

          if (
            (targetElement.tagname === "IFRAME" &&
              attributeName === "cd_frame_id_") ||
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
        const mutation: ScreenMutationForScript = {
          elementMutations,
          timestamp: new Date().getTime(),
          scrollPosition: {
            x: window.scrollX,
            y: window.scrollY,
          },
        };

        if (iframe) {
          mutation.iframe = iframe;
        }

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

        const sendCapturedMutation =
          (window as ExtendedWindowForCDP).sendCapturedMutation ??
          (parent.window as ExtendedWindowForCDP).sendCapturedMutation;
        if (sendCapturedMutation) {
          sendCapturedMutation({ mutation, screenElements });
        }
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
      if (extendedDocument.enqueueEventForReFire) {
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

      const suspendedOperation: SuspendedCapturedItem = {
        operation,
        suspendedEvent: { refireType, eventInfo },
      };

      if (iframe) {
        suspendedOperation.iframe = iframe;
      }

      if (suspendedOperation.suspendedEvent.eventInfo.targetXPath !== "") {
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

        const sendCapturedOperation =
          (window as ExtendedWindowForCDP).sendCapturedOperation ??
          (parent.window as ExtendedWindowForCDP).sendCapturedOperation;
        if (sendCapturedOperation) {
          sendCapturedOperation({ suspendedOperation, screenElements });
        }
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

  const getUrlAndTitle = () => {
    const extendedDocument: ExtendedDocument = document;
    return { url: extendedDocument.URL, title: extendedDocument.title };
  };

  const isReadyToCapture = (args: { url: string; title: string }) => {
    const extendedDocument: ExtendedDocument = document;
    extendedDocument.__parentUrl = args.url;
    extendedDocument.__parentTitle = args.title;

    if (extendedDocument.handleCapturedEvent === undefined) return false;
    if (extendedDocument.extractElements === undefined) return false;
    if (extendedDocument.getAttributesFromElement === undefined) return false;
    if (extendedDocument.collectVisibleElements === undefined) return false;
    if (extendedDocument.enqueueEventForReFire === undefined) return false;
    if (extendedDocument.buildOperationInfo === undefined) return false;
    if (extendedDocument.__completedInjectFunction == undefined) return false;

    return true;
  };

  // get ready to capture
  const urlAndTitle = getUrlAndTitle();
  const isReady = isReadyToCapture({
    url: urlAndTitle.url,
    title: urlAndTitle.title,
  });

  if (!isReady) {
    setFunctionToEnqueueEventForReFire();
    setFunctionToCollectMutations();
    setFunctionToGetAttributesFromElement();
    setFunctionToCollectVisibleElements();
    setFunctionToExtractElements();
    setFunctionToBuildOperationInfo();
    setFunctionToHandleCapturedEvent({ ignoreElementIds: [] });
    resetEventListeners();
  }
}
