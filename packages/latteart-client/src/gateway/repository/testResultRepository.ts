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

import { RESTClient } from "../../network/http/client";
import {
  RepositoryAccessResult,
  createRepositoryAccessSuccess,
  createRepositoryAccessFailure,
  createConnectionRefusedFailure,
} from "./result";
import {
  TestResultSummaryForRepository,
  TestResultForRepository,
  TestResultViewOptionForRepository,
  SequenceViewForRepository,
} from "./types";

export class TestResultRepository {
  constructor(private restClient: RESTClient) {}

  /**
   * Delete test result.
   * @param testResultId  Test result id.
   */
  public async deleteTestResult(
    testResultId: string
  ): Promise<RepositoryAccessResult<void>> {
    try {
      const response = await this.restClient.httpDelete(
        `api/v1/test-results/${testResultId}`
      );

      if (response.status !== 204) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as void,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  /**
   * Creates export data with the specified test results.
   * @param testResultId  Test result ID.
   * @param shouldSaveTemporary Whether to save temporary.
   * @returns Test script URL.
   */
  public async postTestResultForExport(
    testResultId: string
  ): Promise<RepositoryAccessResult<{ url: string }>> {
    try {
      const response = await this.restClient.httpPost(
        `api/v1/test-results/${testResultId}/export`
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as { url: string },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  /**
   * Create an empty test result.
   * @param name  Test result name.
   * @returns  Created test result information.
   */
  public async postEmptyTestResult(
    initialUrl?: string,
    name?: string
  ): Promise<RepositoryAccessResult<TestResultSummaryForRepository>> {
    try {
      const url = `api/v1/test-results`;
      const response = await this.restClient.httpPost(url, {
        initialUrl,
        name,
      });

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as TestResultSummaryForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  /**
   * Get a list of test results.
   * @returns List of test results.
   */
  public async getTestResults(): Promise<
    RepositoryAccessResult<Array<TestResultSummaryForRepository>>
  > {
    try {
      const response = await this.restClient.httpGet(`api/v1/test-results`);

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as Array<{
          id: string;
          name: string;
        }>,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  /**
   * Get the test result of the specified test result ID.
   * @param testResultId  Test result ID.
   */
  public async getTestResult(
    testResultId: string
  ): Promise<RepositoryAccessResult<TestResultForRepository>> {
    try {
      const response = await this.restClient.httpGet(
        `api/v1/test-results/${testResultId}`
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as TestResultForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async patchTestResult(
    testResultId: string,
    name?: string,
    startTime?: number,
    initialUrl?: string
  ): Promise<RepositoryAccessResult<TestResultForRepository>> {
    try {
      const response = await this.restClient.httpPatch(
        `api/v1/test-results/${testResultId}`,
        { name, startTime, initialUrl }
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as TestResultForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async getSessionIds(
    testResultId: string
  ): Promise<RepositoryAccessResult<Array<string>>> {
    try {
      const response = await this.restClient.httpGet(
        `api/v1/test-results/${testResultId}/sessions`
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as Array<string>,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async generateSequenceView(
    testResultId: string,
    option?: TestResultViewOptionForRepository
  ): Promise<RepositoryAccessResult<SequenceViewForRepository>> {
    try {
      const url = `api/v1/test-results/${testResultId}/sequence-views`;
      const response = await this.restClient.httpPost(url, option);

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as SequenceViewForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
