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

import {
  getCurrentEpochMillis,
  getCurrentUnixtime,
  unixtimeToFormattedString,
} from "@/domain/timeUtil";

export interface TimestampService {
  unix(): number;
  format(format: string): string;
  epochMilliseconds(): number;
}

export class TimestampServiceImpl implements TimestampService {
  public unix(): number {
    return getCurrentUnixtime();
  }

  public format(format: string): string {
    return unixtimeToFormattedString(getCurrentUnixtime(), format);
  }

  public epochMilliseconds(): number {
    return getCurrentEpochMillis();
  }
}
