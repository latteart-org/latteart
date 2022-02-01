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

import moment from "moment";

export interface Timestamp {
  unix(): number;
  format(format: string): string;
  epochMilliseconds(): number;
  diffFormat(value: string | number): string;
  isBetween(start: string, end: string): boolean;
  isSameDayAs(other: number): boolean;
}

export class TimestampImpl implements Timestamp {
  private time: moment.Moment;

  constructor(value?: string | number, option?: string) {
    if (value) {
      if (option === "date") {
        this.time = moment(value, "YYYY-MM-DD");
      } else {
        const stringTimestamp = this.timestampTostring(value);

        if (stringTimestamp.length > 10) {
          this.time = moment(value, "x");
        } else {
          this.time = moment(value, "X");
        }
      }
    } else {
      this.time = moment();
    }
  }

  public unix(): number {
    return this.time.unix();
  }

  public format(format: string): string {
    return this.time.format(format);
  }

  public epochMilliseconds(): number {
    return this.time.valueOf();
  }

  public diffFormat(value: string | number): string {
    return moment(this.time.diff(moment(value, "x")))
      .utc()
      .format("HH:mm:ss");
  }

  public isBetween(start: string, end: string): boolean {
    return this.time.isBetween(start, end, "day", "[]");
  }

  public isSameDayAs(other: number): boolean {
    return moment.unix(other).diff(this.time, "days") === 0;
  }

  private timestampTostring(timestamp: string | number): string {
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

export function TestingTime(testingTime: number): string {
  return moment(testingTime, "x").utc().format("HH:mm:ss");
}
