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

export type CaptureCLServerError = {
  code: CaptureCLServerErrorCode | CaptureCLConnectionErrorCode;
  message?: string;
  details?: Array<{
    code: string;
    message: string;
    target: string;
  }>;
};

type CaptureCLServerErrorCode =
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

type CaptureCLConnectionErrorCode =
  | "capture_socket_disconnected"
  | "client_side_capture_service_not_found";
