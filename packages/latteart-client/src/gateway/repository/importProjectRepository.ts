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

import { RESTClient } from "../../network/http/client";
import {
  RepositoryAccessResult,
  createRepositoryAccessSuccess,
  createRepositoryAccessFailure,
  createConnectionRefusedFailure,
} from "./result";
import { SettingsForRepository } from "./types";

export type ImportProjectRepository = {
  /**
   * Import project or testresult or all.
   * @param importFileName  Import file name.
   * @param selectOption  Select options.
   */
  postProjects(
    source: { projectFile: { data: string; name: string } },
    selectOption: {
      includeProject: boolean;
      includeTestResults: boolean;
      includeConfig: boolean;
    }
  ): Promise<
    RepositoryAccessResult<{
      projectId: string;
      config?: SettingsForRepository;
    }>
  >;
};

export class ImportProjectRepositoryImpl implements ImportProjectRepository {
  constructor(private restClient: RESTClient) {}

  public async postProjects(
    source: { projectFile: { data: string; name: string } },
    selectOption: {
      includeProject: boolean;
      includeTestResults: boolean;
      includeConfig: boolean;
    }
  ): Promise<
    RepositoryAccessResult<{
      projectId: string;
      config?: SettingsForRepository;
    }>
  > {
    try {
      const response = await this.restClient.httpPost(
        `api/v1/imports/projects`,
        {
          source,
          includeTestResults: selectOption.includeTestResults,
          includeProject: selectOption.includeProject,
          includeConfig: selectOption.includeConfig,
        }
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as {
          projectId: string;
          config?: SettingsForRepository;
        },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
