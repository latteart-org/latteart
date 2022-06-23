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

import { Operation } from "@/lib/operationHistory/Operation";
import { Story } from "../types";
import { TestStep } from "@/lib/operationHistory/types";
import {
  RepositoryAccessResult,
  RepositoryAccessSuccess,
} from "@/lib/captureControl/Reply";
import ScreenDefFactory from "@/lib/operationHistory/ScreenDefFactory";
import { ScreenDefinition } from "@/lib/common/settings/Settings";
import { ActionResult, ActionSuccess } from "@/lib/common/ActionResult";
import {
  convertTestStepOperation,
  convertIntention,
  convertNote,
} from "@/lib/eventDispatcher/replyDataConverter";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

export interface GenerateAllSessionTestScriptsActionObserver {
  generateTestScripts: (
    sources: { initialUrl: string; history: Operation[] }[]
  ) => Promise<{
    outputUrl: string;
    invalidOperationTypeExists: boolean;
  }>;
}

export class GenerateAllSessionTestScriptsAction {
  constructor(
    private observer: GenerateAllSessionTestScriptsActionObserver,
    private repositoryContainer: Pick<
      RepositoryContainer,
      "testResultRepository" | "serviceUrl"
    >
  ) {}

  public async generateAllSessionTestScripts(
    screenDefinitionConfig: ScreenDefinition,
    stories: Story[]
  ): Promise<
    ActionResult<{
      outputUrl: string;
      invalidOperationTypeExists: boolean;
    }>
  > {
    const initialUrlAndHistoryInEachStories = (
      await Promise.all(
        stories.map(async (story) => {
          const initialUrlAndTestResultIds = story.sessions
            .map((session) => {
              return {
                initialUrl: session.initialUrl,
                testResultFiles: session.testResultFiles ?? [],
              };
            })
            .filter(({ testResultFiles }) => testResultFiles.length > 0)
            .map(({ initialUrl, testResultFiles }) => {
              return {
                initialUrl,
                testResultId: testResultFiles[0].id,
              };
            });

          const initialUrlAndTestSteps = await Promise.all(
            initialUrlAndTestResultIds.map(
              async ({ initialUrl, testResultId }) => {
                const result = await this.collectTestSteps(testResultId);

                if (result.isFailure()) {
                  return { initialUrl, testSteps: [] };
                }

                return { initialUrl, testSteps: result.data };
              }
            )
          );

          const initialUrlAndHistoryInEachSessions = initialUrlAndTestSteps.map(
            ({ initialUrl, testSteps }) => {
              const history = testSteps.flatMap((testStep: TestStep) => {
                if (!testStep.operation) {
                  return [];
                }

                const screenDef = new ScreenDefFactory(
                  screenDefinitionConfig
                ).createFrom(
                  testStep.operation.title,
                  testStep.operation.url,
                  testStep.operation.keywordSet
                );

                const operation = Operation.createFromOtherOperation({
                  other: testStep.operation,
                  overrideParams: {
                    screenDef,
                  },
                });

                return [operation];
              });

              return {
                initialUrl,
                history,
              };
            }
          );

          return initialUrlAndHistoryInEachSessions;
        })
      )
    ).flat();

    const generatedTestScripts = await this.observer.generateTestScripts(
      initialUrlAndHistoryInEachStories
    );

    return new ActionSuccess(generatedTestScripts);
  }

  private async collectTestSteps(
    testResultId: string
  ): Promise<RepositoryAccessResult<Array<TestStep>>> {
    const getTestResultResult =
      await this.repositoryContainer.testResultRepository.getTestResult(
        testResultId
      );

    if (getTestResultResult.isFailure()) {
      return getTestResultResult;
    }

    const serviceUrl = this.repositoryContainer.serviceUrl;
    const testSteps: TestStep[] = getTestResultResult.data.testSteps.map(
      (testStep) => {
        const operation = testStep.operation
          ? convertTestStepOperation(testStep.operation, serviceUrl)
          : testStep.operation;

        return {
          testStepId: testStep.id,
          operation,
          intention: testStep.intention
            ? convertIntention(testStep.intention)
            : null,
          bugs:
            testStep.bugs?.map((bug) => {
              return convertNote(bug, serviceUrl);
            }) ?? null,
          notices:
            testStep.notices?.map((notice) => {
              return convertNote(notice, serviceUrl);
            }) ?? null,
        };
      }
    );

    return new RepositoryAccessSuccess({
      status: getTestResultResult.status,
      data: testSteps,
    });
  }
}
