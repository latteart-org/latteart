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
 * The class for managing screen transition history.
 */
export default class ScreenTransitionHistory {
  private _urls: string[] = [];
  private _currentIndex = -1;
  private canAddUrl = true;

  /**
   * URLs.
   */
  public get urls(): string[] {
    return this._urls;
  }

  /**
   * Current index.
   */
  public get currentIndex(): number {
    return this._currentIndex;
  }

  /**
   * Add URL to the history.
   * @param url URL
   */
  public add(url: string): void {
    if (!this.canAddUrl) {
      return;
    }

    this._urls = this._urls.filter((_, index) => {
      return index <= this._currentIndex;
    });
    this._urls.push(url);
    this._currentIndex = this._urls.length - 1;
  }

  /**
   * Go back in history.
   */
  public back(): void {
    if (!this.canBack()) {
      return;
    }
    this._currentIndex--;
  }

  /**
   * Go forward in history.
   */
  public forward(): void {
    if (!this.canForward()) {
      return;
    }
    this._currentIndex++;
  }

  /**
   * Get current URL.
   * @returns Current URL.
   */
  public getCurrentUrl(): string {
    if (this._urls.length === 0) {
      return "";
    }
    return this._urls[this._currentIndex];
  }

  /**
   * Whether it can go back.
   * @returns 'true': It can go back, 'false': It can not go back.
   */
  public canBack(): boolean {
    return this._currentIndex > 0;
  }

  /**
   * Whether it can go forward.
   * @returns 'true': It can go forward, 'false': It can not go forward.
   */
  public canForward(): boolean {
    return this._currentIndex < this._urls.length - 1;
  }

  /**
   * Prohibit adding URL to the history.
   */
  public lock(): void {
    this.canAddUrl = false;
  }

  /**
   * Allow adding URL to the history.
   */
  public unlock(): void {
    this.canAddUrl = true;
  }

  /**
   * Whether the history is locked or not.
   * @returns 'true': The history is locked, 'false': The history is not locked.
   */
  public get isLocked(): boolean {
    return !this.canAddUrl;
  }
}
