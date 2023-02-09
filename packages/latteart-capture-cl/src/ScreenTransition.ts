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

import { TimestampImpl } from "./Timestamp";

/**
 * Screen transition information.
 */
export default class ScreenTransition {
  /**
   * The title of destination screen.
   */
  public title = "";

  /**
   * The URL of destination screen.
   */
  public url = "";

  /**
   * The screenshot of destination screen.
   */
  public imageData = "";

  /**
   * The window handle of the window that displays destination screen.
   */
  public windowHandle = "";

  /**
   * Timestamp.
   */
  public timestamp: string = new TimestampImpl().epochMilliseconds().toString();

  /**
   * Html page source.
   */
  public pageSource = "";

  /**
   * Constructor.
   * @param init The information for initialization.
   */
  constructor(init?: Partial<ScreenTransition>) {
    Object.assign(this, init);
  }
}
