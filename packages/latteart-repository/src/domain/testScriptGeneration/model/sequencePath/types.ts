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

import { TestScriptSourceOperation } from "../../types";

export type Sequence = {
  /**
   * screen definition
   */
  readonly className: string;
  /**
   * destination of the screen transition by the result of the operation
   */
  readonly destination: string;
  /**
   * destination url of the screen transition by the result of the operation
   */
  readonly destinationUrl: string;
  /**
   * series of operations in this page
   */
  readonly operations: TestScriptSourceOperation[];
  /**
   * page url
   */
  readonly url: string;
  /**
   * screen image url
   */
  readonly imageUrl: string;
};

export type SequencePath = Sequence[];
