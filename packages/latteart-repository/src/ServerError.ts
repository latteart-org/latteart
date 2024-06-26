/**
 * Copyright 2024 NTT Corporation.
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

export type ServerErrorCode =
  | "save_project_failed"
  | "get_project_failed"
  | "get_settings_failed"
  | "save_settings_failed"
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
  | "get_servername_failed"
  | "export_test_result_failed"
  | "import_test_result_failed"
  | "export_project_failed"
  | "import_project_failed"
  | "import_project_not_exist"
  | "import_test_result_not_exist"
  | "import_config_not_exist"
  | "get_screenshots_failed"
  | "get_test_matrix_failed"
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
  | "get_test_progress_failed"
  | "patch_story_failed"
  | "get_story_failed"
  | "export_config_failed"
  | "generate_sequence_view_failed"
  | "generate_graph_view_failed"
  | "compare_test_results_failed"
  | "save_video_failed"
  | "create_video_failed";

/**
 * Server error data.
 */
export type ServerErrorData<T extends ServerErrorCode> = {
  code: T;
  message?: string;
  details?: Array<{
    code: string;
    message: string;
    target: string;
  }>;
};

export class ServerError<T extends ServerErrorCode> extends Error {
  constructor(
    public statusCode: number,
    public data?: ServerErrorData<T>
  ) {
    super(data?.message ?? "");
  }
}
