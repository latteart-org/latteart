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

/**
 * Captured data.
 */
export type CapturedData = {
  operation: CapturedOperationInfo;
  elements: CapturedElementInfo[];
  eventInfo: EventInfo;
};

/**
 * Event information.
 */
export type EventInfo = {
  /**
   * Event ID.
   */
  id: string;

  /**
   * The XPath of the screen element that has been operated.
   */
  targetXPath: string;

  /**
   * Event Type.
   */
  type: string;

  /**
   * Option.
   */
  option: {
    /**
     * Whether it bubbles or not.
     */
    bubbles: boolean;

    /**
     * Whether it is cancelable or not.
     */
    cancelable: boolean;
  };
};

/**
 * Bounding rect.
 */
export type BoundingRect = {
  /**
   * Top.
   */
  top: number;

  /**
   * Left.
   */
  left: number;

  /**
   * Width.
   */
  width: number;

  /**
   * Height.
   */
  height: number;
};

export type CaptureScript = {
  /**
   * Pause capturing.
   */
  pauseCapturing: () => void;
  /**
   * Resume capturing.
   */
  resumeCapturing: () => void;
  /**
   * Whether capturing is paused or not.
   * @returns 'true': Capturing is paused, 'false': Capturing is not paused.
   */
  capturingIsPaused: () => boolean;
  attachShield: ({ shieldId }: { shieldId: string }) => void;
  deleteCapturedDatas: () => void;
  /**
   * Pull captured datas.
   * @returns Captured datas.
   */
  pullCapturedDatas: () => CapturedData[];
  /**
   * Whether it is ready to capture or not.
   * @returns 'true': It is ready to capture, 'false': It is not ready to capture.
   */
  isReadyToCapture: () => boolean;
  /**
   * Reset event listeners
   */
  resetEventListeners: () => boolean;
  initGuard: ({
    shieldStyle,
  }: {
    shieldStyle: {
      position: string;
      zIndex: string;
      width: string;
      height: string;
      opacity: string;
      backgroundColor: string;
    };
  }) => boolean;
  setFunctionToGetAttributesFromElement: () => boolean;
  setFunctionToCollectVisibleElements: () => boolean;
  setFunctionToExtractElements: () => boolean;
  setFunctionToEnqueueEventForReFire: () => boolean;
  setFunctionToBuildOperationInfo: () => boolean;
  setFunctionToHandleCapturedEvent: (ignoreElementIds: string[]) => boolean;
  setFunctionToDetectWindowSwitch: ({
    windowHandle,
    shieldId,
    shieldStyle,
  }: {
    windowHandle: string;
    shieldId: string;
    shieldStyle: {
      position: string;
      zIndex: string;
      width: string;
      height: string;
      opacity: string;
      backgroundColor: string;
    };
  }) => void;
  refireEvent: (eventInfo: EventInfo) => void;
  unblockUserOperations: ({
    windowHandle,
    shieldId,
  }: {
    windowHandle: string | undefined;
    shieldId: string;
  }) => void;
  getBrowsingWindowHandle: () => string;
  markRect: ({
    rect,
    index,
    prefix,
  }: {
    rect: BoundingRect;
    index: number;
    prefix: string;
  }) => void;
  unmarkElements: ({
    rects,
    prefix,
  }: {
    rects: BoundingRect[];
    prefix: string;
  }) => void;
  putNumberToRect: ({
    index,
    prefix,
  }: {
    index: number;
    prefix: string;
  }) => void;
  isCurrentScreenObserved: () => boolean;
  observeCurrentScreen: () => void;
  focusWindow: (windowHandle: string) => void;
  collectScreenElements: () => CapturedElementInfo[];
};

/**
 * Capture scripts.
 */
export const captureScript: CaptureScript = {
  pauseCapturing,
  resumeCapturing,
  capturingIsPaused,
  attachShield,
  deleteCapturedDatas,
  pullCapturedDatas,
  isReadyToCapture,
  resetEventListeners,
  initGuard,
  setFunctionToGetAttributesFromElement,
  setFunctionToCollectVisibleElements,
  setFunctionToExtractElements,
  setFunctionToEnqueueEventForReFire,
  setFunctionToBuildOperationInfo,
  setFunctionToHandleCapturedEvent,
  setFunctionToDetectWindowSwitch,
  refireEvent,
  unblockUserOperations,
  getBrowsingWindowHandle,
  markRect,
  unmarkElements,
  putNumberToRect,
  isCurrentScreenObserved,
  observeCurrentScreen,
  focusWindow,
  collectScreenElements,
};

type CapturedElementInfo = {
  tagname: string;
  text?: string;
  value?: string;
  xpath: string;
  checked?: boolean;
  attributes: { [key: string]: string };
  boundingRect: BoundingRect;
  textWithoutChildren?: string;
};

type CapturedOperationInfo = {
  input: string;
  type: string;
  elementInfo: CapturedElementInfo;
  title: string;
  url: string;
  scrollPosition: { x: number; y: number };
};

type ExtendedDocument = Document & {
  __sendDatas?: CapturedData[];
  __latteartEventIdToEvent?: Map<string, Event>;
  __capturingIsPaused?: boolean;
  __protected?: boolean;
  __completedInjectFunction?: boolean;
  handleCapturedEvent?: (e: Event) => void;
  extractElements?: (
    parent: Element,
    path: string
  ) => {
    elements: CapturedElementInfo[];
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
    eventType: string,
    window: Window
  ) => CapturedOperationInfo | null;
};

type ExtendedDocumentForScreenTransition = Document &
  Pick<ExtendedDocument, "extractElements"> & {
    __hasBeenObserved?: boolean;
  };

type ExtendedWindowForWindowSwitch = Window & {
  setWindowHandleToLocalStorage?: () => void;
  removeWindowHandleToLocalStorage?: () => void;
};

type ElementsWithTargetXPath = {
  elements: CapturedElementInfo[];
  targetXPath: string;
};

function pauseCapturing() {
  const extendedDocument: ExtendedDocument = document;

  if (!extendedDocument) {
    return;
  }

  extendedDocument.__capturingIsPaused = true;
}

function resumeCapturing() {
  const extendedDocument: ExtendedDocument = document;

  if (!extendedDocument) {
    return;
  }

  extendedDocument.__capturingIsPaused = false;
}

function capturingIsPaused() {
  const extendedDocument: ExtendedDocument = document;

  if (extendedDocument && extendedDocument.__capturingIsPaused !== undefined) {
    return extendedDocument.__capturingIsPaused;
  }

  return false;
}

function attachShield({ shieldId }: { shieldId: string }) {
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
}

function deleteCapturedDatas() {
  const extendedDocument: ExtendedDocument = document;
  console.log(extendedDocument.__sendDatas);
  extendedDocument.__sendDatas = [];
}

function pullCapturedDatas() {
  const extendedDocument: ExtendedDocument = document;

  if (!extendedDocument || !extendedDocument.__sendDatas) {
    return [];
  }

  const queueLength = extendedDocument.__sendDatas.length;
  const result: CapturedData[] = [];
  for (let i = 0; i < queueLength; i++) {
    result.push(extendedDocument.__sendDatas.shift()!);
  }

  return result;
}

function isReadyToCapture() {
  const extendedDocument: ExtendedDocument = document;

  if (extendedDocument.handleCapturedEvent === undefined) return false;
  if (extendedDocument.extractElements === undefined) return false;
  if (extendedDocument.getAttributesFromElement === undefined) return false;
  if (extendedDocument.collectVisibleElements === undefined) return false;
  if (extendedDocument.enqueueEventForReFire === undefined) return false;
  if (extendedDocument.buildOperationInfo === undefined) return false;
  if (extendedDocument.__completedInjectFunction == undefined) return false;

  return true;
}

function resetEventListeners() {
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
}

function initGuard({
  shieldStyle,
}: {
  shieldStyle: {
    position: string;
    zIndex: string;
    width: string;
    height: string;
    opacity: string;
    backgroundColor: string;
  };
}) {
  const extendedDocument: ExtendedDocument = document;
  const __LATTEART_INIT_GUARD__ = "__latteart_init_guard__";
  const initGuard = extendedDocument.getElementById(__LATTEART_INIT_GUARD__);
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

  if (document.readyState === "complete" && initGuard && initGuard.parentNode) {
    initGuard.parentNode.removeChild(initGuard);
  }
  return true;
}

function setFunctionToGetAttributesFromElement() {
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
}

function setFunctionToCollectVisibleElements() {
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
}

function setFunctionToExtractElements() {
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
        text: element.innerText,
        xpath: currentXPath,
        attributes: extendedDocument.getAttributesFromElement(element),
        boundingRect: {
          top: boundingRect.top,
          left: boundingRect.left,
          width: boundingRect.width,
          height: boundingRect.height,
        },
        textWithoutChildren,
      };
      if (element.value != null) {
        newElement.value = `${element.value}`;
      }
      if (element.checked !== undefined) {
        newElement.checked = element.checked;
      }

      elementsWithTargetXPath.elements.push(newElement);

      if (
        element.classList.contains("${CaptureScriptExecutor.TARGET_CLASS_NAME}")
      ) {
        element.classList.remove("${CaptureScriptExecutor.TARGET_CLASS_NAME}");
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
}

function setFunctionToEnqueueEventForReFire() {
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
}

function setFunctionToBuildOperationInfo() {
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
      text: element.innerText,
      xpath,
      attributes: extendedDocument.getAttributesFromElement(element),
      boundingRect: {
        top: boundingRect.top,
        left: boundingRect.left,
        width: boundingRect.width,
        height: boundingRect.height,
      },
      textWithoutChildren,
    };
    if (element.value != null) {
      elementInfo.value = `${element.value}`;
    }
    if (element.checked !== undefined) {
      elementInfo.checked = element.checked;
    }

    return {
      input: element.value ? element.value : "",
      type: eventType,
      elementInfo,
      title: extendedDocument.title,
      url: extendedDocument.URL,
      scrollPosition: {
        x: window.scrollX,
        y: window.scrollY,
      },
    };
  };
  return true;
}

function setFunctionToHandleCapturedEvent(ignoreElementIds: string[]) {
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
    targetElement.classList.add("${CaptureScriptExecutor.TARGET_CLASS_NAME}");
    const { elements, targetXPath } = extendedDocument.extractElements(
      extendedDocument.body,
      "/HTML/BODY"
    );

    const operation = extendedDocument.buildOperationInfo(
      targetElement,
      targetXPath,
      event.type,
      window
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
}

function setFunctionToDetectWindowSwitch({
  windowHandle,
  shieldId,
  shieldStyle,
}: {
  windowHandle: string;
  shieldId: string;
  shieldStyle: {
    position: string;
    zIndex: string;
    width: string;
    height: string;
    opacity: string;
    backgroundColor: string;
  };
}) {
  console.log(`injectFunctionToDetectWindowSwitch - START: ${windowHandle}`);

  const extendedWindow: ExtendedWindowForWindowSwitch = window;

  const extendedDocument: ExtendedDocument = document;
  const __LATTEART_INIT_GUARD__ = "__latteart_init_guard__";
  const initGuard = extendedDocument.getElementById(__LATTEART_INIT_GUARD__);
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

  if (
    extendedDocument.readyState === "complete" &&
    initGuard &&
    initGuard.parentNode
  ) {
    initGuard.parentNode.removeChild(initGuard);
  }

  if (!extendedWindow.setWindowHandleToLocalStorage) {
    extendedWindow.setWindowHandleToLocalStorage = () => {
      const localStorageIsEnabled = (() => {
        try {
          return localStorage !== undefined && localStorage !== null;
        } catch (e) {
          return false;
        }
      })();

      if (!localStorageIsEnabled) {
        return;
      }

      // Set focused window handle.
      const oldHandle = localStorage.currentWindowHandle;
      localStorage.currentWindowHandle = windowHandle;
      console.log(`focus: ${oldHandle} -> ${localStorage.currentWindowHandle}`);
    };
  }
  extendedWindow.removeEventListener(
    "focus",
    extendedWindow.setWindowHandleToLocalStorage
  );
  extendedWindow.addEventListener(
    "focus",
    extendedWindow.setWindowHandleToLocalStorage
  );

  if (!extendedWindow.removeWindowHandleToLocalStorage) {
    extendedWindow.removeWindowHandleToLocalStorage = () => {
      // Block user operations.
      (() => {
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
      })();

      const localStorageIsEnabled = (() => {
        try {
          return localStorage !== undefined && localStorage !== null;
        } catch (e) {
          return false;
        }
      })();

      if (!localStorageIsEnabled) {
        return;
      }

      // Unset window handle.
      const oldHandle = localStorage.currentWindowHandle;
      localStorage.currentWindowHandle = "";
      console.log(`blur: ${oldHandle} -> ${localStorage.currentWindowHandle}`);
    };
  }
  extendedWindow.removeEventListener(
    "blur",
    extendedWindow.removeWindowHandleToLocalStorage
  );
  extendedWindow.addEventListener(
    "blur",
    extendedWindow.removeWindowHandleToLocalStorage
  );
  console.log(`injectFunctionToDetectWindowSwitch - END`);
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

function unblockUserOperations({
  windowHandle,
  shieldId,
}: {
  windowHandle: string | undefined;
  shieldId: string;
}) {
  const extendedDocument: ExtendedDocument = document;
  const target = extendedDocument.getElementById(shieldId);
  if (!target || !target.parentNode) {
    return;
  }

  if (localStorage.currentWindowHandle === windowHandle) {
    target.parentNode.removeChild(target);
  }
}

function getBrowsingWindowHandle() {
  const localStorageIsEnabled = (() => {
    try {
      return localStorage !== undefined && localStorage !== null;
    } catch (e) {
      return false;
    }
  })();

  if (!localStorageIsEnabled) {
    return "";
  }

  return (localStorage.currentWindowHandle as string) || "";
}

function markRect({
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

function isCurrentScreenObserved() {
  const extendedDocument: ExtendedDocumentForScreenTransition = document;
  return extendedDocument.__hasBeenObserved !== undefined
    ? extendedDocument.__hasBeenObserved
    : false;
}

function observeCurrentScreen() {
  const extendedDocument: ExtendedDocumentForScreenTransition = document;
  extendedDocument.__hasBeenObserved = true;
}

function focusWindow(windowHandle: string) {
  const localStorageIsEnabled = (() => {
    try {
      return localStorage !== undefined && localStorage !== null;
    } catch (e) {
      return false;
    }
  })();

  if (!localStorageIsEnabled) {
    return;
  }

  localStorage.currentWindowHandle = windowHandle;
}

function collectScreenElements() {
  const extendedDocument: ExtendedDocumentForScreenTransition = document;
  if (!extendedDocument.extractElements) {
    return [];
  }

  const { elements } = extendedDocument.extractElements(
    extendedDocument.body,
    "/HTML/BODY"
  );
  return elements;
}
