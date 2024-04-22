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

export type ImportTestResultRepository = {
  /**
   * Import test result.
   * @param source.importFileUrl Source import file url.
   * @param dest.testResultId Destination local test result id.
   * @param dest.shouldSaveTemporary Whether to save temporary.
   */
  postTestResult(
    source: { testResultFile: { data: string; name: string } },
    dest?: { testResultId?: string }
  ): Promise<RepositoryAccessResult<{ testResultId: string }>>;
};

export class ImportTestResultRepositoryImpl
  implements ImportTestResultRepository
{
  constructor(private restClient: RESTClient) {}

  public async postTestResult(
    source: { testResultFile: { data: string; name: string } },
    dest?: { testResultId?: string }
  ): Promise<RepositoryAccessResult<{ testResultId: string }>> {
    try {
      const body = {
        source,
        dest,
      };

      const response = await this.restClient.httpPost(
        `api/v1/imports/test-results`,
        body
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as { testResultId: string },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
