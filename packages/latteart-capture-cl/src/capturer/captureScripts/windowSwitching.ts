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

import { ExtendedDocument } from "./types";

type ExtendedWindowForWindowSwitch = Window & {
  setWindowHandleToLocalStorage?: () => void;
  removeWindowHandleToLocalStorage?: () => void;
};

export const windowSwitchingScripts = {
  setFunctionToDetectWindowSwitch,
  getBrowsingWindowHandle,
  focusWindow,
};

function setFunctionToDetectWindowSwitch({
  windowHandle,
  shieldStyle,
}: {
  windowHandle: string;
  shieldStyle: {
    position: string;
    zIndex: string;
    width: string;
    height: string;
    opacity: string;
    backgroundColor: string;
  };
}) {
  const extendedWindow: ExtendedWindowForWindowSwitch = window;

  const extendedDocument: ExtendedDocument = document;

  const __LATTEART_INIT_GUARD__ = "__latteart_init_guard__";
  const initGuard = extendedDocument.getElementById(__LATTEART_INIT_GUARD__);

  if (
    extendedDocument.readyState !== "complete" &&
    !extendedDocument.__capturingIsPaused &&
    !initGuard
  ) {
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
      const isLocalStorageEnabled = (() => {
        try {
          return localStorage !== undefined && localStorage !== null;
        } catch (e) {
          return false;
        }
      })();

      if (!isLocalStorageEnabled) {
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
      const isLocalStorageEnabled = (() => {
        try {
          return localStorage !== undefined && localStorage !== null;
        } catch (e) {
          return false;
        }
      })();

      if (!isLocalStorageEnabled) {
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
}

function getBrowsingWindowHandle() {
  const isLocalStorageEnabled = (() => {
    try {
      return localStorage !== undefined && localStorage !== null;
    } catch (e) {
      return false;
    }
  })();

  if (!isLocalStorageEnabled) {
    return "";
  }

  return (localStorage.currentWindowHandle as string) || "";
}

function focusWindow(windowHandle: string) {
  const isLocalStorageEnabled = (() => {
    try {
      return localStorage !== undefined && localStorage !== null;
    } catch (e) {
      return false;
    }
  })();

  if (!isLocalStorageEnabled) {
    return;
  }

  localStorage.currentWindowHandle = windowHandle;
}
