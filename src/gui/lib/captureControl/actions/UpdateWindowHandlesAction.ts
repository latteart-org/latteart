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

import { WindowHandle } from "../../operationHistory/types";

interface UpdateWindowHandlesObserver {
  setWindowHandles: (values: WindowHandle[]) => void;
}

export class UpdateWindowHandlesAction {
  constructor(private observer: UpdateWindowHandlesObserver) {}

  public update(
    currentWindowHandles: WindowHandle[],
    newDetectedWindowHandleValues: string[]
  ): void {
    const currentWindowHandlesDisabledClosedWindows = this.disableClosedWindows(
      currentWindowHandles,
      newDetectedWindowHandleValues
    );

    const newWindowHandles = this.createNewWindows(
      currentWindowHandlesDisabledClosedWindows,
      newDetectedWindowHandleValues
    );

    this.observer.setWindowHandles([
      ...currentWindowHandles,
      ...newWindowHandles,
    ]);
  }

  private disableClosedWindows(
    currentWindowHandles: WindowHandle[],
    newDetectedWindowHandleValues: string[]
  ) {
    return currentWindowHandles.map((windowHandle: WindowHandle) => {
      const existsWindowHandle = newDetectedWindowHandleValues.find(
        (availableWindowHandle: string) => {
          return windowHandle.value === availableWindowHandle;
        }
      );

      if (!existsWindowHandle) {
        windowHandle.available = false;
      }

      return windowHandle;
    });
  }

  private createNewWindows(
    currentWindowHandles: WindowHandle[],
    newDetectedWindowHandleValues: string[]
  ) {
    const newWindowHandleValues = newDetectedWindowHandleValues.filter(
      (newWindowHandleValue: string) => {
        return !currentWindowHandles
          .map(({ value }) => value)
          .includes(newWindowHandleValue);
      }
    );

    return newWindowHandleValues.map((value, index) => {
      return {
        text: `window${currentWindowHandles.length + index + 1}`,
        value,
        available: true,
      };
    });
  }
}
