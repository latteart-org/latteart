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
 * Special operation type that is not added by DOM event.
 */
export enum SpecialOperationType {
  ACCEPT_ALERT = "accept_alert",
  DISMISS_ALERT = "dismiss_alert",
  BROWSER_BACK = "browser_back",
  BROWSER_FORWARD = "browser_forward",
  SWITCH_WINDOW = "switch_window",
  PAUSE_CAPTURING = "pause_capturing",
  RESUME_CAPTURING = "resume_capturing",
}
