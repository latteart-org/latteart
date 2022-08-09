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
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

export class ImportProjectAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "importProjectRepository"
    >
  ) {}

  /**
   * Import project or testresult or all.
   * @param importFileName  Import file name.
   * @param selectOption  Select options.
   */
  public async import(
    source: { projectFile: { data: string; name: string } },
    selectOption: { includeProject: boolean; includeTestResults: boolean }
  ): Promise<ActionResult<{ projectId: string }>> {
    const postProjectsResult =
      await this.repositoryContainer.importProjectRepository.postProjects(
        source,
        selectOption
      );

    if (postProjectsResult.isFailure()) {
      if (postProjectsResult.error.code === "import_test_result_not_exist") {
        return new ActionFailure({
          messageKey: "error.import_export.import-test-result-not-exist",
        });
      }
      if (postProjectsResult.error?.code === "import_project_not_exist") {
        return new ActionFailure({
          messageKey: "error.import_export.import-project-not-exist",
        });
      }

      return new ActionFailure({
        messageKey: "error.import_export.import-data-error",
      });
    }

    return new ActionSuccess(postProjectsResult.data);
  }
}
