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

import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

export interface Timestamp {
  unix(): number;
  format(format: string): string;
  epochMilliseconds(): number;
  diff(from: Timestamp): number;
  diffFormat(from: Timestamp, format?: string): string;
  isBetween(start: Timestamp, end: Timestamp): boolean;
  isSameOrBefore(other: Timestamp): boolean;
  isSameOrAfter(other: Timestamp): boolean;
  isSameDayAs(other: number): boolean;
}

export class TimestampImpl implements Timestamp {
  private time: dayjs.Dayjs;
  private static dateFormat = "YYYY-MM-DD";

  constructor(value?: string | number) {
    if (value) {
      if (this.isDateFormat(String(value))) {
        this.time = dayjs(value, TimestampImpl.dateFormat);
      } else {
        const stringTimestamp = this.timestampToString(value);

        if (stringTimestamp.length > 10) {
          this.time = dayjs(value, "x");
        } else {
          this.time = dayjs(value, "X");
        }
      }
    } else {
      this.time = dayjs();
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

  public diff(from: Timestamp): number {
    return this.time.diff(dayjs(from.epochMilliseconds(), "x"));
  }

  public diffFormat(from: Timestamp, format = "HH:mm:ss"): string {
    return dayjs(this.diff(from), "x").utc().format(format);
  }

  public isBetween(start: Timestamp, end: Timestamp): boolean {
    const startDate = start.format(TimestampImpl.dateFormat);
    const endDate = end.format(TimestampImpl.dateFormat);
    return this.time.isBetween(startDate, endDate, "day", "[]");
  }

  public isSameOrBefore(other: Timestamp): boolean {
    return this.time.isSameOrBefore(other.format(TimestampImpl.dateFormat), "day");
  }

  public isSameOrAfter(other: Timestamp): boolean {
    return this.time.isSameOrAfter(other.format(TimestampImpl.dateFormat), "day");
  }

  public isSameDayAs(other: number): boolean {
    return dayjs.unix(other).startOf("day").diff(this.time.startOf("day"), "days") === 0;
  }

  public offset(epochMilliseconds: number): Timestamp {
    return new TimestampImpl(this.epochMilliseconds() + epochMilliseconds);
  }

  private timestampToString(timestamp: string | number): string {
    const stringTimestamp = typeof timestamp === "number" ? String(timestamp) : timestamp;

    return this.suppressZero(stringTimestamp);
  }

  private suppressZero(value: string): string {
    let idx = 0;
    while (value.charAt(idx) === "0") idx++;
    return value.slice(idx);
  }

  private isDateFormat(value: string): boolean {
    const stringDate = value.match(/^(\d+)-(\d+)-(\d+)$/);
    if (stringDate) {
      const y = Number(stringDate[1]);
      const m = Number(stringDate[2]) - 1;
      const d = Number(stringDate[3]);
      const dateInfo = new Date(y, m, d);
      return y == dateInfo.getFullYear() && m == dateInfo.getMonth() && d == dateInfo.getDate();
    }
    return false;
  }
}

export function formatTime(milliseconds: number): string {
  return dayjs(milliseconds, "x").utc().format("HH:mm:ss");
}

export function formatDateTime(milliseconds: number): string {
  return dayjs(milliseconds, "x").format("YYYY/MM/DD HH:mm:ss");
}
