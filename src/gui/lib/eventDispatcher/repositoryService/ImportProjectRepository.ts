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

import { RESTClient } from "../RESTClient";
import {
  RepositoryAccessResult,
  RepositoryAccessSuccess,
  createRepositoryAccessFailure,
} from "@/lib/captureControl/Reply";

export class ImportProjectRepository {
  constructor(private restClient: RESTClient) {}

  /**
   * Get a list of projects for import.
   * @returns List of projects for import.
   */
  public async getProjects(): Promise<
    RepositoryAccessResult<Array<{ url: string; name: string }>>
  > {
    const response = await this.restClient.httpGet(`/imports/projects`);

    if (response.status !== 200) {
      return createRepositoryAccessFailure(response);
    }

    return new RepositoryAccessSuccess({
      status: response.status,
      data: response.data as Array<{
        url: string;
        name: string;
      }>,
    });
  }

  /**
   * Import project or testresult or all.
   * @param importFileName  Import file name.
   * @param selectOption  Select options.
   */
  public async postProjects(
    source: { projectFileUrl: string },
    selectOption: { includeProject: boolean; includeTestResults: boolean }
  ): Promise<RepositoryAccessResult<{ projectId: string }>> {
    const response = await this.restClient.httpPost(`/imports/projects`, {
      source,
      includeTestResults: selectOption.includeTestResults,
      includeProject: selectOption.includeProject,
    });

    if (response.status !== 200) {
      return createRepositoryAccessFailure(response);
    }

    return new RepositoryAccessSuccess({
      status: response.status,
      data: response.data as { projectId: string },
    });
  }
}
