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
import { TestResult } from "@/lib/operationHistory/types";

export class TestResultRepository {
  constructor(
    private restClient: RESTClient,
    private buildAPIURL: (url: string) => string
  ) {}

  /**
   * Delete local test result.
   * @param testResultId  Test result id.
   */
  public async deleteTestResult(testResultId: string): Promise<Reply<void>> {
    const response = await this.restClient.httpDelete(
      this.buildAPIURL(`/test-results/${testResultId}`)
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as void,
    });
  }

  /**
   * Creates export data with the specified test results.
   * @param testResultId  Test result ID.
   * @param shouldSaveTemporary Whether to save temporary.
   * @returns Test script URL.
   */
  public async postTestResultForExport(
    testResultId: string,
    shouldSaveTemporary: boolean
  ): Promise<Reply<{ url: string }>> {
    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/test-results/${testResultId}/export`),
      { temp: shouldSaveTemporary }
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as { url: string },
    });
  }

  /**
   * Upload test result.
   * @param source.testResultId Source test result ID.
   * @param dest.repositoryUrl Destination repository url.
   * @param dest.testResultId Destination test result ID.
   */
  public async postTestResultForUpload(
    source: { testResultId: string },
    dest: { repositoryUrl: string; testResultId?: string }
  ): Promise<Reply<{ id: string }>> {
    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/upload-request/test-result`),
      { source, dest }
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as { id: string },
    });
  }

  /**
   * Create an empty test result.
   * @param name  Test result name.
   * @returns  Created test result information.
   */
  public async postEmptyTestResult(
    initialUrl?: string,
    name?: string
  ): Promise<Reply<{ id: string; name: string }>> {
    const url = this.buildAPIURL(`/test-results`);
    const response = await this.restClient.httpPost(url, { initialUrl, name });

    return new ReplyImpl({
      status: response.status,
      data: response.data as { id: string; name: string },
    });
  }

  /**
   * Get a list of test results.
   * @returns List of test results.
   */
  public async getTestResults(): Promise<
    Reply<Array<{ id: string; name: string }>>
  > {
    const response = await this.restClient.httpGet(
      this.buildAPIURL(`/test-results`)
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as Array<{
        id: string;
        name: string;
      }>,
    });
  }

  public async getTestResult(testResultId: string): Promise<Reply<TestResult>> {
    const response = await this.restClient.httpGet(
      this.buildAPIURL(`/test-results/${testResultId}`)
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as TestResult,
    });
  }
}
