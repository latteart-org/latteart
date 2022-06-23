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

import {
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

const GET_IMPORT_TEST_RESULTS_FAILED_MESSAGE_KEY =
  "error.operation_history.get_import_test_results_failed";

export class GetImportTestResultListAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "importTestResultRepository" | "serviceUrl"
    >
  ) {}

  public async getImportTestResults(): Promise<
    ActionResult<Array<{ url: string; name: string }>>
  > {
    const getTestResultsResult =
      await this.repositoryContainer.importTestResultRepository.getTestResults();

    if (getTestResultsResult.isFailure()) {
      return new ActionFailure({
        messageKey: GET_IMPORT_TEST_RESULTS_FAILED_MESSAGE_KEY,
      });
    }

    const serviceUrl = this.repositoryContainer.serviceUrl;
    const data = getTestResultsResult.data.map(({ url, name }) => {
      return {
        url: `${serviceUrl}/${url}`,
        name,
      };
    });

    return new ActionSuccess(data);
  }
}
