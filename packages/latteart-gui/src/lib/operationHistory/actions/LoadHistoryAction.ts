/**
 * Copyright 2024 NTT Corporation.
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

import { type OperationHistoryItem } from "@/lib/captureControl/OperationHistoryItem";
import { type ActionResult, ActionFailure, ActionSuccess } from "@/lib/common/ActionResult";
import {
  convertTestStepOperation,
  convertNote,
  convertIntention
} from "@/lib/common/replyDataConverter";
import {
  type Comment,
  type CommentForRepository,
  type RepositoryService,
  type TestResultForRepository
} from "latteart-client";

const LOAD_HISTORY_FAILED_MESSAGE_KEY = "error.operation_history.load_history_failed";

export class LoadHistoryAction {
  constructor(
    private repositoryService: Pick<
      RepositoryService,
      "testResultRepository" | "commentRepository" | "serviceUrl"
    >
  ) {}

  /**
   * Restore the operation history of the specified test result ID
   * @param testResultId  Test result ID.
   * @returns Restored operation history information.
   */
  public async loadHistory(testResultId: string): Promise<
    ActionResult<{
      historyItems: OperationHistoryItem[];
      url: string;
      testResultInfo: { id: string; name: string; parentTestResultId?: string };
      testStepIds: string[];
      testingTime: number;
      comments: Comment[];
    }>
  > {
    const getTestResultResult =
      await this.repositoryService.testResultRepository.getTestResult(testResultId);

    if (getTestResultResult.isFailure()) {
      return new ActionFailure({ messageKey: LOAD_HISTORY_FAILED_MESSAGE_KEY });
    }

    const getCommentsResult =
      await this.repositoryService.commentRepository.getComments(testResultId);

    if (getCommentsResult.isFailure()) {
      return new ActionFailure({ messageKey: LOAD_HISTORY_FAILED_MESSAGE_KEY });
    }

    return new ActionSuccess(this.convertData(getTestResultResult.data, getCommentsResult.data));
  }

  private convertData(testResult: TestResultForRepository, comments: CommentForRepository[]) {
    const testSteps = testResult.testSteps.map((testStep) => {
      const {
        input,
        type,
        elementInfo,
        title,
        url,
        timestamp,
        windowHandle,
        keywordTexts,
        scrollPosition,
        clientSize,
        isAutomatic,
        videoFrame,
        imageFileUrl,
        inputElements
      } = testStep.operation;

      const operation = {
        input,
        type,
        elementInfo,
        title,
        url,
        timestamp,
        windowHandle,
        keywordTexts,
        scrollPosition,
        clientSize,
        isAutomatic,
        imageFileUrl,
        videoFrame,
        inputElements
      };

      return {
        ...testStep,
        operation,
        notices: [...testStep.bugs, ...testStep.notices].map((note) => {
          const { id, type, value, details, tags, timestamp, imageFileUrl, videoFrame } = note;

          return {
            id,
            type,
            value,
            details,
            tags,
            timestamp,
            imageFileUrl,
            videoFrame
          };
        }),
        bugs: []
      };
    });

    const operationHistoryItems = testSteps.map((testStep, index) => {
      const sequence = index + 1;
      const operation = testStep.operation
        ? convertTestStepOperation(testStep.operation, sequence)
        : testStep.operation;

      const intention = testStep.intention ? convertIntention(testStep.intention, sequence) : null;
      const bugs =
        testStep.bugs?.map((bug) => {
          return convertNote(bug, sequence);
        }) ?? null;
      const notices =
        testStep.notices?.map((notice) => {
          return convertNote(notice, sequence);
        }) ?? null;

      return { operation, intention, bugs, notices };
    });

    return {
      historyItems: operationHistoryItems,
      url: testResult.initialUrl,
      testResultInfo: {
        id: testResult.id,
        name: testResult.name,
        parentTestResultId: testResult.parentTestResultId
      },
      testStepIds: testSteps.map(({ id }) => id),
      testingTime: testResult.testingTime,
      comments
    };
  }
}
