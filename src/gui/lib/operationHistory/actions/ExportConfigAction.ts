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

export class ExportConfigAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "settingRepository" | "projectRepository"
    >
  ) {}

  public async exportSettings(): Promise<ActionResult<{ url: string }>> {
    const getProjectsResult =
      await this.repositoryContainer.projectRepository.getProjects();
    if (getProjectsResult.isFailure()) {
      throw new Error();
    }
    const projectIds = getProjectsResult.data.map(({ id }) => id);
    const targetProjectId = projectIds[projectIds.length - 1];

    const result =
      await this.repositoryContainer.settingRepository.exportSettings(
        targetProjectId
      );

    if (result.isFailure()) {
      return new ActionFailure({ messageKey: "" });
    }

    return new ActionSuccess(result.data);
  }
}
