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

import { ImportProjectRepository } from "@/lib/eventDispatcher/repositoryService/ImportProjectRepository";
import { ActionResult } from "@/lib/common/ActionResult";

export interface Importable {
  readonly importProjectRepository: ImportProjectRepository;
}

export class ImportAction {
  constructor(private repositoryContainer: Importable) {}

  /**
   * Import project or testresult or all.
   * @param importFileName  Import file name.
   * @param selectOption  Select options.
   */
  public async importZip(
    source: { projectFileUrl: string },
    selectOption: { includeProject: boolean; includeTestResults: boolean }
  ): Promise<ActionResult<{ projectId: string }>> {
    const reply =
      await this.repositoryContainer.importProjectRepository.postProjects(
        source,
        selectOption
      );

    let errorMessage;

    if (reply.error?.code === "import_test_result_not_exist") {
      errorMessage = "import-test-result-not-exist";
    }
    if (reply.error?.code === "import_project_not_exist") {
      errorMessage = "import-project-not-exist";
    }
    if (!reply.data) {
      errorMessage = "import-data-error";
    }

    const error = errorMessage ? { code: errorMessage } : undefined;
    const result = {
      data: reply.data,
      error,
    };

    return result;
  }
}
