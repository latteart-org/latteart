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
import { CoverageSource, InputElementInfo } from "../types";
import { Operation } from "../Operation";
import { Note } from "../Note";
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

const RESUME_FAILED_MESSAGE_KEY = "error.operation_history.resume_failed";

export interface ResumeActionObserver {
  setResumedData: (data: {
    coverageSources: CoverageSource[];
    inputElementInfos: InputElementInfo[];
    historyItems: OperationHistoryItem[];
    url: string;
    testResultInfo: { id: string; name: string };
  }) => Promise<void>;
  registerTestStepId(testStepId: string): number;
  clearTestStepIds(): void;
}

export class ResumeAction {
  constructor(
    private observer: ResumeActionObserver,
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
  public async resume(testResultId: string): Promise<ActionResult<void>> {
    const getTestResultResult =
      await this.repositoryContainer.testResultRepository.getTestResult(
        testResultId
      );

    if (getTestResultResult.isFailure()) {
      return new ActionFailure({ messageKey: RESUME_FAILED_MESSAGE_KEY });
    }

    const testResult = getTestResultResult.data;

    const serviceUrl = this.repositoryContainer.serviceUrl;

    const data = {
      id: testResult.id,
      name: testResult.name,
      operationHistoryItems: testResult.testSteps.map((testStep) => {
        const operation = testStep.operation
          ? convertTestStepOperation(testStep.operation, serviceUrl)
          : testStep.operation;

        return {
          testStepId: testStep.id,
          operation,
          intention: testStep.intention,
          bugs:
            testStep.bugs?.map((bug) => {
              return convertNote(bug, serviceUrl);
            }) ?? null,
          notices:
            testStep.notices?.map((notice) => {
              return convertNote(notice, serviceUrl);
            }) ?? null,
        };
      }),
      coverageSources: testResult.coverageSources,
      inputElementInfos: testResult.inputElementInfos,
      initialUrl: testResult.initialUrl,
    };

    if (data) {
      this.observer.clearTestStepIds();

      const historyItems = data.operationHistoryItems.map((item) => {
        const sequence = this.observer.registerTestStepId(item.testStepId);

        const operation = item.operation
          ? Operation.createFromOtherOperation({
              other: item.operation,
              overrideParams: { sequence },
            })
          : null;

        const intention = item.intention
          ? convertIntention(item.intention, sequence)
          : null;

        const bugs =
          item.bugs?.map((bug) => {
            return Note.createFromOtherNote({
              other: bug,
              overrideParams: { sequence },
            });
          }) ?? [];

        const notices =
          item.notices?.map((notice) => {
            return Note.createFromOtherNote({
              other: notice,
              overrideParams: { sequence },
            });
          }) ?? [];

        return {
          operation: operation,
          intention: intention,
          bugs: bugs,
          notices: notices,
        };
      });

      await this.observer.setResumedData({
        coverageSources: data.coverageSources,
        inputElementInfos: data.inputElementInfos,
        historyItems,
        url: data.initialUrl,
        testResultInfo: { id: data.id, name: data.name },
      });
    }

    return new ActionSuccess(undefined);
  }
}
