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
import { TestResultComparisonResultForRepository } from "./types";

export class TestResultComparisonRepository {
  constructor(private restClient: RESTClient) {}

  /**
   * Compare test results.
   * @param actualTestResultId  Actual test result id.
   * @param expectedTestResultId  Expected test result id.
   * @param option  Option.
   * @returns  Test result comparison result.
   */
  public async compareTestResults(
    actualTestResultId: string,
    expectedTestResultId: string,
    option?: {
      excludeItems?: ("title" | "url" | "elementTexts" | "screenshot")[];
      excludeElements?: { tagname: string }[];
    }
  ): Promise<RepositoryAccessResult<TestResultComparisonResultForRepository>> {
    try {
      const url = `api/v1/test-result-comparisons`;
      const response = await this.restClient.httpPost(url, {
        actualTestResultId,
        expectedTestResultId,
        option,
      });

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as TestResultComparisonResultForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
