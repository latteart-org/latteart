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

import ILogger from "./ILogger";

/**
 * Class that outputs logs.
 */
export default class EmptyLogger implements ILogger {
  /** @inheritdoc */
  public debug(): void {
    // ignore
  }

  /** @inheritdoc */
  public info(): void {
    // ignore
  }

  /** @inheritdoc */
  public warn(): void {
    // ignore
  }

  /** @inheritdoc */
  public error(): void {
    // ignore
  }
}
