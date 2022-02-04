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

import { TimestampImpl, Timestamp } from "./Timestamp";

/**
 * Timer class that executes a function every second.
 */
export default class Timer {
  private startTime: Timestamp | null = null;
  private intervalId: number | null = null;

  /**
   * Start the timer.
   * @param onChangeTime  Callback function called every second.
   * @param startTime  Start time.
   */
  public start(onChangeTime: (time: string) => void, startTime: number): void {
    this.startTime = new TimestampImpl(startTime);

    this.intervalId = window.setInterval(() => {
      const now = new TimestampImpl();
      onChangeTime(now.diffFormat(this.startTime ?? now));
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
}
