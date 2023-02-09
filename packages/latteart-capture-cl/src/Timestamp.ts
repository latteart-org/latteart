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

import moment from "moment";

export interface Timestamp {
  diff(value: Timestamp): number;
  epochMilliseconds(): number;
}

export class TimestampImpl implements Timestamp {
  private time: moment.Moment;

  constructor(value?: string | number) {
    if (value) {
      const stringTimestamp = this.timestampToString(value);

      if (stringTimestamp.length > 10) {
        this.time = moment(Number(value), "x");
      } else {
        this.time = moment(Number(value), "X");
      }
    } else {
      this.time = moment();
    }
  }
  public diff(value: Timestamp): number {
    return this.time.diff(moment(value.epochMilliseconds()));
  }

  public epochMilliseconds(): number {
    return this.time.valueOf();
  }

  private timestampToString(timestamp: string | number): string {
    const stringTimestamp =
      typeof timestamp === "number" ? String(timestamp) : timestamp;

    return this.suppressZero(stringTimestamp);
  }

  private suppressZero(value: string): string {
    let idx = 0;
    while (value.charAt(idx) === "0") idx++;
    return value.slice(idx);
  }
}
