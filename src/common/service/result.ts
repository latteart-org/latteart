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
 * service error
 */
export interface ServiceError {
  errorCode: ServiceErrorCode;
  message: string;
  variables?: { [key: string]: string };
}

/**
 * service result
 */
export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure;

/**
 * service result contains the success value
 */
export class ServiceSuccess<T> {
  constructor(public readonly data: T) {}

  public isSuccess(): this is ServiceSuccess<T> {
    return true;
  }

  public isFailure(): this is ServiceFailure {
    return false;
  }
}

/**
 * service result contains the error value
 */
export class ServiceFailure {
  constructor(public readonly error: ServiceError) {}

  public isSuccess(): this is ServiceSuccess<unknown> {
    return false;
  }

  public isFailure(): this is ServiceFailure {
    return true;
  }
}

type ServiceErrorCode =
  | RepositoryServiceErrorCode
  | CaptureCLServiceErrorCode
  | "unknown_error";

type RepositoryServiceErrorCode =
  | "create_empty_test_result_failed"
  | "get_test_result_failed"
  | "get_test_step_failed"
  | "add_test_step_failed"
  | "compress_test_step_screenshot_failed"
  | "add_note_failed"
  | "edit_note_failed"
  | "delete_note_failed"
  | "link_note_to_test_step_failed"
  | "unlink_note_from_test_step_failed"
  | "compress_note_screenshot_failed"
  | "add_test_purpose_failed"
  | "edit_test_purpose_failed"
  | "delete_test_purpose_failed"
  | "link_test_purpose_to_test_step_failed"
  | "unlink_test_purpose_from_test_step_failed";

type CaptureCLServiceErrorCode =
  | "run_operation_failed"
  | "enter_values_failed"
  | "detect_devices_failed"
  | "invalid_url"
  | "web_driver_version_mismatch"
  | "web_driver_not_ready"
  | "appium_not_started"
  | "device_not_connected"
  | "invalid_operation"
  | "element_not_found"
  | "capture_failed";
