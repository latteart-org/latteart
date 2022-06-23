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
  isServerError,
  RepositoryAccessResult,
  RepositoryAccessFailure,
  RepositoryAccessSuccess,
} from "@/lib/captureControl/Reply";
import { TestResult } from "@/lib/operationHistory/types";

export class TestResultRepository {
  constructor(private restClient: RESTClient) {}

  /**
   * Delete local test result.
   * @param testResultId  Test result id.
   */
  public async deleteTestResult(
    testResultId: string
  ): Promise<RepositoryAccessResult<void>> {
    const response = await this.restClient.httpDelete(
      `/test-results/${testResultId}`
    );

    if (response.status !== 200 && isServerError(response.data)) {
      return new RepositoryAccessFailure({
        status: response.status,
        error: response.data,
      });
    }

    return new RepositoryAccessSuccess({
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
  ): Promise<RepositoryAccessResult<{ url: string }>> {
    const response = await this.restClient.httpPost(
      `/test-results/${testResultId}/export`,
      { temp: shouldSaveTemporary }
    );

    if (response.status !== 200 && isServerError(response.data)) {
      return new RepositoryAccessFailure({
        status: response.status,
        error: response.data,
      });
    }

    return new RepositoryAccessSuccess({
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
  ): Promise<RepositoryAccessResult<{ id: string }>> {
    const response = await this.restClient.httpPost(
      `/upload-request/test-result`,
      { source, dest }
    );

    if (response.status !== 200 && isServerError(response.data)) {
      return new RepositoryAccessFailure({
        status: response.status,
        error: response.data,
      });
    }

    return new RepositoryAccessSuccess({
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
  ): Promise<RepositoryAccessResult<{ id: string; name: string }>> {
    const url = `/test-results`;
    const response = await this.restClient.httpPost(url, { initialUrl, name });

    if (response.status !== 200 && isServerError(response.data)) {
      return new RepositoryAccessFailure({
        status: response.status,
        error: response.data,
      });
    }

    return new RepositoryAccessSuccess({
      status: response.status,
      data: response.data as { id: string; name: string },
    });
  }

  /**
   * Get a list of test results.
   * @returns List of test results.
   */
  public async getTestResults(): Promise<
    RepositoryAccessResult<Array<{ id: string; name: string }>>
  > {
    const response = await this.restClient.httpGet(`/test-results`);

    if (response.status !== 200 && isServerError(response.data)) {
      return new RepositoryAccessFailure({
        status: response.status,
        error: response.data,
      });
    }

    return new RepositoryAccessSuccess({
      status: response.status,
      data: response.data as Array<{
        id: string;
        name: string;
      }>,
    });
  }

  /**
   * Get the test result of the specified test result ID.
   * @param testResultId  Test result ID.
   */
  public async getTestResult(
    testResultId: string
  ): Promise<RepositoryAccessResult<TestResult>> {
    const response = await this.restClient.httpGet(
      `/test-results/${testResultId}`
    );

    if (response.status !== 200 && isServerError(response.data)) {
      return new RepositoryAccessFailure({
        status: response.status,
        error: response.data,
      });
    }

    return new RepositoryAccessSuccess({
      status: response.status,
      data: response.data as TestResult,
    });
  }

  public async patchTestResult(
    testResultId: string,
    name?: string,
    startTime?: number,
    initialUrl?: string
  ): Promise<RepositoryAccessResult<string>> {
    const response = await this.restClient.httpPatch(
      `/test-results/${testResultId}`,
      { name, startTime, initialUrl }
    );

    if (response.status !== 200 && isServerError(response.data)) {
      return new RepositoryAccessFailure({
        status: response.status,
        error: response.data,
      });
    }

    return new RepositoryAccessSuccess({
      status: response.status,
      data: (response.data as TestResult).name,
    });
  }
}
