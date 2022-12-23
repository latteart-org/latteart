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
import { TestResult } from "../../types";
import { RepositoryService } from "src/common";

const GET_TEST_RESULT_FAILED_MESSAGE_KEY =
  "error.operation_history.get_test_result_failed";

export class GetTestResultAction {
  constructor(
    private repositoryService: Pick<
      RepositoryService,
      "testResultRepository" | "serviceUrl"
    >
  ) {}

  public async getTestResult(
    testResultId: string
  ): Promise<ActionResult<TestResult>> {
    const result =
      await this.repositoryService.testResultRepository.getTestResult(
        testResultId
      );

    if (result.isFailure()) {
      return new ActionFailure({
        messageKey: GET_TEST_RESULT_FAILED_MESSAGE_KEY,
      });
    }

    return new ActionSuccess({
      ...result.data,
      testSteps: result.data.testSteps.map((testStep) => {
        const operationImageFileUrl = testStep.operation.imageFileUrl
          ? new URL(
              testStep.operation.imageFileUrl,
              this.repositoryService.serviceUrl
            ).toString()
          : "";

        const operation = {
          ...testStep.operation,
          imageFileUrl: operationImageFileUrl,
        };

        return {
          ...testStep,
          operation,
          notices: [...testStep.bugs, ...testStep.notices].map((note) => {
            const noteImageFileUrl = note.imageFileUrl
              ? new URL(
                  note.imageFileUrl,
                  this.repositoryService.serviceUrl
                ).toString()
              : "";

            return {
              ...note,
              imageFileUrl: noteImageFileUrl,
            };
          }),
          bugs: [],
        };
      }),
    });
  }
}
