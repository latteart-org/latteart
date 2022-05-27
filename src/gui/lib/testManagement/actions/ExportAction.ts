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

import { ProjectRepository } from "@/lib/eventDispatcher/repositoryService/ProjectRepository";
import { ActionResult } from "@/lib/common/ActionResult";

export interface Exportable {
  readonly projectRepository: ProjectRepository;
}

export class ExportAction {
  constructor(private repositoryContainer: Exportable) {}

  public async exportZip(
    projectId: string,
    selectOption: { includeProject: boolean; includeTestResults: boolean }
  ): Promise<ActionResult<string>> {
    const reply =
      await this.repositoryContainer.projectRepository.postProjectForExport(
        projectId,
        selectOption
      );

    const error = !reply.data
      ? { code: "create-export-data-error" }
      : undefined;
    const outputUrl = reply.data ? reply.data.url : undefined;
    const result = {
      data: outputUrl,
      error,
    };

    return result;
  }
}
