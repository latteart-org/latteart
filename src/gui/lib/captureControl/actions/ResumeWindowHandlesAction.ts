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

interface ResumeWindowHandlesMutationObserver {
  setWindowHandles(
    value: {
      text: string;
      value: string;
      available: boolean;
    }[]
  ): void;
  setIsResuming(value: boolean): void;
}

interface WindowInfo {
  windowHandle: string;
}

export class ResumeWindowHandlesAction {
  constructor(private observer: ResumeWindowHandlesMutationObserver) {}

  public resume(windowInfos: WindowInfo[]): Promise<void> {
    const windowHandles = this.collectWindowHandles(windowInfos);

    this.observer.setWindowHandles(windowHandles);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.observer.setIsResuming(false);

        resolve();
      }, 300);
    });
  }

  private collectWindowHandles(windowInfo: WindowInfo[]) {
    let windowHandleNumber = 1;

    return windowInfo
      .reduce((existHandles: string[], operation: WindowInfo) => {
        const existHandle = existHandles.find((handle: string) => {
          return handle === operation.windowHandle;
        });

        if (!existHandle) {
          existHandles.push(operation.windowHandle);
        }

        return existHandles;
      }, [])
      .map((windowHandle: string) => {
        return {
          text: `window${windowHandleNumber++}`,
          value: windowHandle,
          available: false,
        };
      });
  }
}
