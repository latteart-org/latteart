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
 * Server error code.
 */
export type ServerErrorCode =
  | "detect_devices_failed"
  | "capture_failed"
  | "unknown_error"
  | "invalid_url"
  | "web_driver_version_mismatch"
  | "web_driver_not_ready"
  | "appium_not_started"
  | "device_not_connected"
  | "invalid_operation"
  | "element_not_found";

/**
 * Server error.
 */
export type ServerError = {
  /**
   * Error code.
   */
  code: ServerErrorCode;

  /**
   * Error message.
   */
  message: string;

  /**
   * details.
   */
  details?: Array<{
    /**
     * Error code.
     */
    code: string;

    /**
     * Error message.
     */
    message: string;

    /**
     * Error location.
     */
    target: string;
  }>;
};
