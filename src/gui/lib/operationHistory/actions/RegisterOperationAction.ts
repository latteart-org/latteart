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

import { CapturedOperation } from "../CapturedOperation";
import {
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import { Operation } from "../Operation";
import { CoverageSource } from "../types";
import { convertTestStepOperation } from "@/lib/eventDispatcher/replyDataConverter";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

const REGISTER_OPERATION_FAILED_MESSAGE_KEY =
  "error.operation_history.register_operation_failed";

export class RegisterOperationAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "testStepRepository" | "serviceUrl"
    >
  ) {}

  /**
   * Register the operation information in the repository.
   * @param testResultId  Test result ID.
   * @param capturedOperation  Operation information to register.
   * @returns Saved operation information.
   */
  public async registerOperation(
    testResultId: string,
    capturedOperation: CapturedOperation
  ): Promise<
    ActionResult<{
      id: string;
      operation: Operation;
      coverageSource: CoverageSource;
    }>
  > {
    const postTestStepsResult =
      await this.repositoryContainer.testStepRepository.postTestSteps(
        testResultId,
        capturedOperation
      );

    if (postTestStepsResult.isFailure()) {
      return new ActionFailure({
        messageKey: REGISTER_OPERATION_FAILED_MESSAGE_KEY,
      });
    }

    const {
      id,
      operation: testStepOperation,
      coverageSource,
    } = postTestStepsResult.data;
    const serviceUrl = this.repositoryContainer.serviceUrl;

    const operation = convertTestStepOperation(testStepOperation, serviceUrl);

    const data = {
      id,
      operation,
      coverageSource,
    };

    return new ActionSuccess(data);
  }
}
