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

import { OperationHistoryItem } from "@/lib/captureControl/OperationHistoryItem";
import { CoverageSource, TestResult } from "../types";
import {
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import {
  convertTestStepOperation,
  convertNote,
  convertIntention,
} from "@/lib/eventDispatcher/replyDataConverter";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";
import { GetTestResultAction } from "./testResult/GetTestResultAction";

const LOAD_HISTORY_FAILED_MESSAGE_KEY =
  "error.operation_history.load_history_failed";

export class LoadHistoryAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "testResultRepository" | "serviceUrl"
    >
  ) {}

  /**
   * Restore the operation history of the specified test result ID
   * @param testResultId  Test result ID.
   * @returns Restored operation history information.
   */
  public async loadHistory(testResultId: string): Promise<
    ActionResult<{
      coverageSources: CoverageSource[];
      historyItems: OperationHistoryItem[];
      url: string;
      testResultInfo: { id: string; name: string };
      testStepIds: string[];
      startTimeStamp: number;
    }>
  > {
    const result = await new GetTestResultAction(
      this.repositoryContainer
    ).getTestResult(testResultId);

    if (result.isFailure()) {
      return new ActionFailure({ messageKey: LOAD_HISTORY_FAILED_MESSAGE_KEY });
    }

    const serviceUrl = this.repositoryContainer.serviceUrl;

    return new ActionSuccess(this.convertData(result.data, serviceUrl));
  }

  private convertData(testResult: TestResult, serviceUrl: string) {
    const operationHistoryItems = testResult.testSteps.map(
      (testStep, index) => {
        const sequence = index + 1;
        const operation = testStep.operation
          ? convertTestStepOperation(testStep.operation, serviceUrl, sequence)
          : testStep.operation;

        const intention = testStep.intention
          ? convertIntention(testStep.intention, sequence)
          : null;
        const bugs =
          testStep.bugs?.map((bug) => {
            return convertNote(bug, serviceUrl, sequence);
          }) ?? null;
        const notices =
          testStep.notices?.map((notice) => {
            return convertNote(notice, serviceUrl, sequence);
          }) ?? null;

        return { operation, intention, bugs, notices };
      }
    );

    return {
      coverageSources: testResult.coverageSources,
      historyItems: operationHistoryItems,
      url: testResult.initialUrl,
      testResultInfo: { id: testResult.id, name: testResult.name },
      testStepIds: testResult.testSteps.map(({ id }) => id),
      startTimeStamp: testResult.startTimeStamp,
    };
  }
}
