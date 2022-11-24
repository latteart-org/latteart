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

import { RESTClientResponse } from "../network/http/client";

export type RepositoryAccessResult<T> =
  | RepositoryAccessSuccess<T>
  | RepositoryAccessFailure;

export function createRepositoryAccessSuccess<T>(response: {
  data: T;
}): RepositoryAccessSuccess<T> {
  return new RepositoryAccessSuccess({
    data: response.data,
  });
}

export function createRepositoryAccessFailure(
  response: RESTClientResponse
): RepositoryAccessFailure {
  const failureType: RepositoryAccessFailureType = (() => {
    if (response.status >= 400 && response.status < 500) {
      if (response.status === 404) return "ResourceNotFound";
      return "OtherClientError";
    }

    if (response.status >= 500 && response.status < 600) {
      if (response.status === 500) return "InternalServerError";
      return "OtherServerError";
    }

    return "UnknownError";
  })();

  if (isServerError(response.data)) {
    return new RepositoryAccessFailure({
      type: failureType,
      error: response.data,
    });
  } else {
    console.error("Invalid Server Error.", response.data);

    return new RepositoryAccessFailure({
      type: failureType,
      error: { code: "unknown_error" },
    });
  }
}

export function createConnectionRefusedFailure(): RepositoryAccessFailure {
  return new RepositoryAccessFailure({
    type: "ConnectionRefused",
    error: {
      code: "connection_refused",
    },
  });
}

type RepositoryServerError = {
  code:
    | RepositoryServerErrorCode
    | RepositoryConnectionErrorCode
    | "unknown_error";
  message?: string;
  details?: Array<{
    code: string;
    message: string;
    target: string;
  }>;
};

class RepositoryAccessSuccess<T> {
  constructor(private readonly body: { data: T }) {}

  public get data(): T {
    return this.body.data;
  }

  public isSuccess(): this is RepositoryAccessSuccess<T> {
    return true;
  }

  public isFailure(): this is RepositoryAccessFailure {
    return false;
  }
}

type RepositoryAccessFailureType =
  | "ConnectionRefused"
  | "ResourceNotFound"
  | "InternalServerError"
  | "OtherClientError"
  | "OtherServerError"
  | "UnknownError";

class RepositoryAccessFailure {
  constructor(
    private readonly body: {
      type: RepositoryAccessFailureType;
      error: RepositoryServerError;
    }
  ) {}

  public get type(): RepositoryAccessFailureType {
    return this.body.type;
  }

  public get error(): RepositoryServerError {
    return this.body.error;
  }

  public isSuccess(): this is RepositoryAccessSuccess<unknown> {
    return false;
  }

  public isFailure(): this is RepositoryAccessFailure {
    return true;
  }
}

function isServerError(data: unknown): data is RepositoryServerError {
  if (typeof data !== "object") {
    return false;
  }

  if (typeof (data as RepositoryServerError).code !== "string") {
    return false;
  }

  const message = (data as RepositoryServerError).message;
  if (message !== undefined) {
    if (typeof (data as RepositoryServerError).message !== "string") {
      return false;
    }
  }

  const details = (data as RepositoryServerError).details;

  if (details !== undefined) {
    if (typeof details !== "object") {
      return false;
    }

    if (
      !details.every((detail) => {
        return (
          typeof detail.code === "string" &&
          typeof detail.message === "string" &&
          typeof detail.target === "string"
        );
      })
    ) {
      return false;
    }
  }

  return true;
}

type RepositoryServerErrorCode =
  | "save_project_failed"
  | "get_project_failed"
  | "get_settings_failed"
  | "save_settings_failed"
  | "get_device_settings_failed"
  | "save_device_settings_failed"
  | "save_test_script_failed"
  | "save_snapshot_failed"
  | "save_test_result_failed"
  | "get_test_result_failed"
  | "add_test_step_failed"
  | "get_test_step_failed"
  | "edit_test_step_failed"
  | "add_note_failed"
  | "get_note_failed"
  | "edit_note_failed"
  | "delete_note_failed"
  | "compress_note_image_failed"
  | "compress_test_step_image_failed"
  | "update_test_result_failed"
  | "delete_test_result_failed"
  | "post_session_failed"
  | "patch_session_failed"
  | "delete_session_failed"
  | "get_session_failed"
  | "get_servername_failed"
  | "export_test_result_failed"
  | "import_test_result_failed"
  | "export_project_failed"
  | "import_project_failed"
  | "import_project_not_exist"
  | "import_test_result_not_exist"
  | "upload_request_failed"
  | "upload_failed"
  | "get_screenshots_failed"
  | "get_test_matrix_failed"
  | "post_test_matrix_failed"
  | "patch_test_matrix_failed"
  | "delete_test_matrix_failed"
  | "get_test_target_group_failed"
  | "post_test_target_group_failed"
  | "patch_test_target_group_failed"
  | "delete_test_target_group_failed"
  | "get_test_target_failed"
  | "post_test_target_failed"
  | "patch_test_target_failed"
  | "delete_test_target_failed"
  | "get_view_point_failed"
  | "post_view_point_failed"
  | "patch_view_point_failed"
  | "delete_view_point_failed"
  | "no_test_cases_generated"
  | "compare_test_result_failed"
  | "get_test_progress_failed"
  | "patch_story_failed";

type RepositoryConnectionErrorCode = "connection_refused";
