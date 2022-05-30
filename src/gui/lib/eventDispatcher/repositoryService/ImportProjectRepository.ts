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
import { Reply, ReplyImpl } from "@/lib/captureControl/Reply";

export interface ImportProjectRepository {
  getProjects(): Promise<Reply<Array<{ url: string; name: string }>>>;
  postProjects(
    source: { projectFileUrl: string },
    selectOption: { includeProject: boolean; includeTestResults: boolean }
  ): Promise<Reply<{ projectId: string }>>;
}

export class ImportProjectRepositoryImpl implements ImportProjectRepository {
  constructor(private restClient: RESTClient) {}

  /**
   * Get a list of projects for import.
   * @returns List of projects for import.
   */
  public async getProjects(): Promise<
    Reply<Array<{ url: string; name: string }>>
  > {
    const response = await this.restClient.httpGet(`/imports/projects`);

    return new ReplyImpl({
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
  ): Promise<Reply<{ projectId: string }>> {
    const response = await this.restClient.httpPost(`/imports/projects`, {
      source,
      includeTestResults: selectOption.includeTestResults,
      includeProject: selectOption.includeProject,
    });

    return new ReplyImpl({
      status: response.status,
      data: response.data as { projectId: string },
    });
  }
}
