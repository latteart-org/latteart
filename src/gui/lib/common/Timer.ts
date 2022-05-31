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

import { formatTime } from "./Timestamp";

/**
 * Timer class that executes a function every second.
 */
export default class Timer {
  private intervalId: number | null = null;
  private currentTime = 0;

  public get now(): string {
    return formatTime(this.currentTime);
  }

  /**
   * Start the timer.
   */
  public start(): void {
    this.intervalId = window.setInterval(() => {
      this.currentTime += 1000;
    }, 1000);
  }

  /**
   * End the timer.
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Reset the timer.
   * @param millis initial time.
   */
  public reset(millis = 0): void {
    this.currentTime = millis;
  }
}
