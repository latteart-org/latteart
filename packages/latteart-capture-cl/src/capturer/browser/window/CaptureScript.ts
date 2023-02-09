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

import LoggingService from "../../../logger/LoggingService";
import { ElementInfo } from "@/Operation";
import { ScriptExecutor } from "@/webdriver/WebDriverClient";
import {
  CapturedData,
  OperationInfo,
  EventInfo,
  ElementInfoWithBoundingRect,
} from "./CapturedData";
import WebBrowser from "../WebBrowser";

interface SendData {
  operation: OperationInfo;
  elements: ElementInfo[];
  eventInfo: EventInfo;
}

export interface ExtendedDocument extends Document {
  __sendDatas?: SendData[];
  __latteartEventIdToEvent?: Map<string, Event>;
  __capturingIsPaused?: boolean;
  __protected?: boolean;
  __completedInjectFunction?: boolean;
  handleCapturedEvent?: (e: Event) => void;
  extractElements?: (
    parent: Element,
    path: string
  ) => {
    elements: ElementInfo[];
    targetXPath: string;
  };
  getAttributesFromElement?: (elem: HTMLElement) => {
    [key: string]: string;
  };
  collectVisibleElements?: (
    allElements: HTMLInputElement[]
  ) => HTMLInputElement[];
  enqueueEventForReFire?: (id: string, event: Event) => void;
  buildOperationInfo?: (
    element: HTMLInputElement,
    xpath: string,
    eventType: string
  ) => OperationInfo | null;
}

interface ElementsWithTargetXPath {
  elements: ElementInfo[];
  targetXPath: string;
}

/**
 * Class for operations that need injecting scripts to browser content.
 */
export default class CaptureScript {
  private executor: ScriptExecutor;

  /**
   * Constructor.
   * @param executor The class to execute script.
   */
  constructor(executor: ScriptExecutor) {
    this.executor = executor;
  }

  /**
   * Pause capturing.
   */
  public async pauseCapturing(): Promise<void> {
    await this.executor.execute(() => {
      const extendedDocument: ExtendedDocument = document;

      if (!extendedDocument) {
        return;
      }

      extendedDocument.__capturingIsPaused = true;
    });
  }

  /**
   * Resume capturing.
   */
  public async resumeCapturing(): Promise<void> {
    await this.executor.execute(() => {
      const extendedDocument: ExtendedDocument = document;

      if (!extendedDocument) {
        return;
      }

      extendedDocument.__capturingIsPaused = false;
    });
  }

  /**
   * Whether capturing is paused or not.
   * @returns 'true': Capturing is paused, 'false': Capturing is not paused.
   */
  public async capturingIsPaused(): Promise<boolean> {
    return (
      (await this.executor.execute(() => {
        const extendedDocument: ExtendedDocument = document;

        return extendedDocument?.__capturingIsPaused ?? false;
      })) ?? false
    );
  }

  public async attachShield(): Promise<void> {
    await this.executor.execute(
      ({ shieldId }) => {
        const target = document.getElementById(shieldId);

        if (target) {
          return;
        }

        const shield = document.createElement("div");
        shield.id = shieldId;
        shield.style.position = "absolute";
        shield.style.zIndex = "2147483647";
        shield.style.width = "100%";
        shield.style.height = `${document.body.clientHeight}px`;
        shield.style.opacity = "0.6";
        shield.style.backgroundColor = "#333";

        document.body.insertAdjacentElement("afterbegin", shield);
      },
      { shieldId: WebBrowser.SHIELD_ID }
    );
  }

  public async deleteCapturedDatas(): Promise<void> {
    await this.executor.execute(() => {
      const extendedDocument: ExtendedDocument = document;
      console.log(extendedDocument.__sendDatas);
      extendedDocument.__sendDatas = [];
      return;
    });
    return;
  }

  /**
   * Pull captured datas.
   * @returns Captured datas.
   */
  public async pullCapturedDatas(): Promise<CapturedData[]> {
    const capturedDatas =
      (await this.executor.execute(() => {
        const extendedDocument: ExtendedDocument = document;

        if (!extendedDocument || !extendedDocument.__sendDatas) {
          return [];
        }

        const queueLength = extendedDocument.__sendDatas.length;
        const result: SendData[] = [];
        for (let i = 0; i < queueLength; i++) {
          result.push(extendedDocument.__sendDatas.shift()!);
        }

        return result;
      })) ?? [];

    return capturedDatas
      .filter((data) => data.eventInfo.targetXPath !== "")
      .map((data) => {
        return {
          operation: data.operation,
          elements: data.elements,
          suspendedEvent: {
            reFireFromWebdriverType: this.getReFireWebdriverType(data),
            reFire: () =>
              this.reFireEvent({
                id: data.eventInfo.id,
                targetXPath: data.eventInfo.targetXPath,
                type: data.eventInfo.type,
                option: data.eventInfo.option,
              }),
          },
        };
      });
  }

  private getReFireWebdriverType(data: SendData): string {
    if (
      data.operation.elementInfo.tagname === "INPUT" &&
      data.operation.type === "click" &&
      data.operation.elementInfo.attributes["type"] &&
      data.operation.elementInfo.attributes["type"] === "date"
    ) {
      return "inputDate";
    }
    return "";
  }

  /**
   * Whether it is ready to capture or not.
   * @returns 'true': It is ready to capture, 'false': It is not ready to capture.
   */
  public async isReadyToCapture(): Promise<boolean> {
    return (
      (await this.executor.execute(() => {
        const extendedDocument: ExtendedDocument = document;

        if (extendedDocument.handleCapturedEvent === undefined) return false;
        if (extendedDocument.extractElements === undefined) return false;
        if (extendedDocument.getAttributesFromElement === undefined)
          return false;
        if (extendedDocument.collectVisibleElements === undefined) return false;
        if (extendedDocument.enqueueEventForReFire === undefined) return false;
        if (extendedDocument.buildOperationInfo === undefined) return false;
        if (extendedDocument.__completedInjectFunction == undefined)
          return false;

        return true;
      })) ?? false
    );
  }

  /**
   * Get ready to capture.
   * @param ignoreElementIds The ID attribute of elements that ignored to capture.
   */
  public async getReadyToCapture(ignoreElementIds: string[]): Promise<void> {
    (await this.injectFunctionToGetAttributesFromElement()) &&
      (await this.injectFunctionToCollectVisibleElements()) &&
      (await this.injectFunctionToExtractElements()) &&
      (await this.injectFunctionToEnqueueEventForReFire()) &&
      (await this.injectFunctionToBuildOperationInfo()) &&
      (await this.injectFunctionToHandleCapturedEvent(ignoreElementIds)) &&
      (await this.resetEventListeners());
  }

  /**
   * Reset event listeners
   */
  private async resetEventListeners(): Promise<boolean | null> {
    return await this.executor.execute(() => {
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
    });
  }

  public async initGuard(): Promise<boolean | null> {
    return await this.executor.execute(
      ({ shieldStyle }) => {
        const extendedDocument: ExtendedDocument = document;
        const __LATTEART_INIT_GUARD__ = "__latteart_init_guard__";
        const initGuard = extendedDocument.getElementById(
          __LATTEART_INIT_GUARD__
        );
        if (extendedDocument.readyState !== "complete" && !initGuard) {
          const shield = extendedDocument.createElement("div");
          shield.id = __LATTEART_INIT_GUARD__;
          shield.style.position = shieldStyle.position;
          shield.style.zIndex = shieldStyle.zIndex;
          shield.style.width = shieldStyle.width;
          shield.style.height = shieldStyle.height;
          shield.style.opacity = shieldStyle.opacity;
          shield.style.backgroundColor = shieldStyle.backgroundColor;
          extendedDocument.body.insertAdjacentElement("afterbegin", shield);
        }

        if (document.readyState === "complete" && initGuard) {
          initGuard.parentNode?.removeChild(initGuard);
        }
        return true;
      },
      { shieldStyle: CaptureScript.createShieldStyle() }
    );
  }

  public static createShieldStyle(): {
    position: string;
    zIndex: string;
    width: string;
    height: string;
    opacity: string;
    backgroundColor: string;
  } {
    return {
      position: "absolute",
      zIndex: "2147483647",
      width: "100%",
      height: "100%",
      opacity: "0.6",
      backgroundColor: "#333",
    };
  }

  private async injectFunctionToGetAttributesFromElement(): Promise<
    boolean | null
  > {
    return await this.executor.execute(() => {
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
    });
  }

  private async injectFunctionToCollectVisibleElements(): Promise<
    boolean | null
  > {
    return await this.executor.execute(() => {
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
            ["hidden", "collapse"].includes(
              style.getPropertyValue("visibility")
            )
          ) {
            return false;
          }

          return true;
        });
      };
      return true;
    });
  }

  private async injectFunctionToExtractElements(): Promise<boolean | null> {
    return await this.executor.execute(() => {
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
          !extendedDocument.extractElements
        ) {
          return elementsWithTargetXPath;
        }

        const children = [...parent.children];
        const shadowChildren = [...(parent.shadowRoot?.children ?? [])];

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

          const newElement: ElementInfo = {
            tagname: element.tagName,
            text: element.innerText,
            value: element.value,
            xpath: currentXPath,
            attributes: extendedDocument.getAttributesFromElement(element),
          };

          if (element.checked !== undefined) {
            newElement.checked = element.checked;
          }

          elementsWithTargetXPath.elements.push(newElement);

          if (
            element.classList.contains(
              "${CaptureScriptExecutor.TARGET_CLASS_NAME}"
            )
          ) {
            element.classList.remove(
              "${CaptureScriptExecutor.TARGET_CLASS_NAME}"
            );
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
    });
  }

  private async injectFunctionToEnqueueEventForReFire(): Promise<
    boolean | null
  > {
    return await this.executor.execute(() => {
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
    });
  }

  private async injectFunctionToBuildOperationInfo(): Promise<boolean | null> {
    return await this.executor.execute(() => {
      const extendedDocument: ExtendedDocument = document;

      extendedDocument.buildOperationInfo = (
        element: HTMLInputElement,
        xpath: string,
        eventType: string
      ) => {
        const extendedDocument: ExtendedDocument = document;

        if (extendedDocument.getAttributesFromElement === undefined) {
          return null;
        }

        const elementInfo: ElementInfoWithBoundingRect = {
          tagname: element.tagName,
          text: element.innerText,
          value: element.value,
          xpath,
          attributes: extendedDocument.getAttributesFromElement(element),
          boundingRect: element.getBoundingClientRect(),
        };
        if (element.checked !== undefined) {
          elementInfo.checked = element.checked;
        }

        return {
          input: element.value ? element.value : "",
          type: eventType,
          elementInfo,
          title: extendedDocument.title,
          url: extendedDocument.URL,
        };
      };
      return true;
    });
  }

  private async injectFunctionToHandleCapturedEvent(
    ignoreElementIds: string[]
  ): Promise<boolean | null> {
    return await this.executor.execute((ignoreElementIds: string[]) => {
      const extendedDocument: ExtendedDocument = document;

      extendedDocument.handleCapturedEvent = (event: Event) => {
        if (
          !extendedDocument.getAttributesFromElement ||
          !extendedDocument.extractElements ||
          !extendedDocument.enqueueEventForReFire ||
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

        if (targetElement && ignoreElementIds.includes(targetElement.id)) {
          return;
        }

        // Stop event temporarily and enqueue for refire.
        const eventId = event.type + event.timeStamp;
        extendedDocument.enqueueEventForReFire(eventId, event);
        event.preventDefault();
        event.stopPropagation();

        if (!targetElement) {
          return;
        }

        // Extract elements from the screen.
        targetElement.classList.add(
          "${CaptureScriptExecutor.TARGET_CLASS_NAME}"
        );
        const { elements, targetXPath } = extendedDocument.extractElements(
          extendedDocument.body,
          "/HTML/BODY"
        );

        const operation = extendedDocument.buildOperationInfo(
          targetElement,
          targetXPath,
          event.type
        );

        if (operation !== null) {
          // Set the operation.
          if (!extendedDocument.__sendDatas) {
            extendedDocument.__sendDatas = [];
          }
          extendedDocument.__sendDatas.push({
            operation: operation,
            elements: elements,
            eventInfo: {
              id: eventId,
              targetXPath: operation.elementInfo.xpath,
              type: event.type,
              option: {
                bubbles: event.bubbles,
                cancelable: event.cancelable,
              },
            },
          });
        }
      };
      return true;
    }, ignoreElementIds);
  }

  private async reFireEvent(eventInfo: EventInfo): Promise<void> {
    LoggingService.debug(`Refire event.`);
    LoggingService.debug(`eventInfo = ${JSON.stringify(eventInfo)}`);

    await this.executor.execute(
      (args) => {
        const extendedDocument: ExtendedDocument = document;

        if (!extendedDocument.handleCapturedEvent) {
          return;
        }

        const eventInfo = args[0];

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
                  if (
                    !["LABEL", "DIV"].includes(element.tagName.toUpperCase())
                  ) {
                    return false;
                  }

                  const child = element.children[0] as HTMLElement | undefined;

                  if (!child) {
                    return false;
                  }

                  const childIsCheckboxOrRadio =
                    child.tagName.toUpperCase() === "INPUT" &&
                    ["checkbox", "radio"].includes(
                      child.getAttribute("type") ?? ""
                    );

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

              originalDesignElement?.click();
            } catch (error) {
              console.error(error);
            }
            extendedDocument.__latteartEventIdToEvent.delete(eventInfo.id);
          }
        }
      },
      [eventInfo, "a"] as [EventInfo, string]
    );
  }
}
