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

import { type ActionResult, ActionFailure, ActionSuccess } from "@/lib/common/ActionResult";
import { type RepositoryService } from "latteart-client";

export class ExportProjectAction {
  constructor(private repositoryService: Pick<RepositoryService, "projectRepository">) {}

  public async export(
    projectId: string,
    selectOption: {
      includeProject: boolean;
      includeTestResults: boolean;
      includeConfig: boolean;
    }
  ): Promise<ActionResult<string>> {
    const postProjectForExportResult =
      await this.repositoryService.projectRepository.postProjectForExport(projectId, selectOption);

    if (postProjectForExportResult.isFailure()) {
      return new ActionFailure({
        messageKey: "error.import_export.create-export-data-error"
      });
    }

    return new ActionSuccess(postProjectForExportResult.data.url);
  }
}
