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
import { type RepositoryService, type DailyTestProgressForRepository } from "latteart-client";
import { type Timestamp } from "@/lib/common/Timestamp";

const COLLECT_PROGRESS_DATAS_FAILED_MESSAGE_KEY =
  "error.test_management.collect_progress_datas_failed";

export class CollectProgressDatasAction {
  constructor(private repositoryService: Pick<RepositoryService, "projectRepository">) {}

  public async collect(
    projectId: string,
    filter: {
      period?: { since: Timestamp; until: Timestamp };
    } = {}
  ): Promise<ActionResult<DailyTestProgressForRepository[]>> {
    const getTestProgressResult = await this.repositoryService.projectRepository.getTestProgress(
      projectId,
      {
        period: {
          since: filter.period?.since.unix() ?? undefined,
          until: filter.period ? filter.period.until.unix() + 3600 * 24 - 1 : undefined
        }
      }
    );

    if (getTestProgressResult.isFailure()) {
      return new ActionFailure({
        messageKey: COLLECT_PROGRESS_DATAS_FAILED_MESSAGE_KEY
      });
    }

    return new ActionSuccess(getTestProgressResult.data);
  }
}
