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

import RESTClient from "../RESTClient";
import { ReplyImpl, Reply } from "@/lib/captureControl/Reply";

export interface ImportTestResultRepository {
  postTestResult(
    source: { testResultFileUrl: string },
    dest?: { testResultId?: string }
  ): Promise<Reply<{ testResultId: string }>>;
  getTestResults(): Promise<Reply<Array<{ url: string; name: string }>>>;
}

export class ImportTestResultRepositoryImpl
  implements ImportTestResultRepository {
  constructor(
    private restClient: RESTClient,
    private buildAPIURL: (url: string) => string
  ) {}

  /**
   * Import test result.
   * @param source.importFileUrl Source import file url.
   * @param dest.testResultId Destination local test result id.
   * @param dest.shouldSaveTemporary Whether to save temporary.
   */
  public async postTestResult(
    source: { testResultFileUrl: string },
    dest?: { testResultId?: string }
  ): Promise<Reply<{ testResultId: string }>> {
    const body = {
      source,
      dest,
    };

    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/imports/test-results`),
      body
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as { testResultId: string },
    });
  }

  /**
   * Get a list of test results for import.
   * @returns List of test results for import.
   */
  public async getTestResults(): Promise<
    Reply<Array<{ url: string; name: string }>>
  > {
    const response = await this.restClient.httpGet(
      this.buildAPIURL(`/imports/test-results`)
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as Array<{
        url: string;
        name: string;
      }>,
    });
  }
}
