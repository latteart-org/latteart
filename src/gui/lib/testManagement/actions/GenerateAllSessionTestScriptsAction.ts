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

import { TestResultRepository } from "@/lib/eventDispatcher/repositoryService/TestResultRepository";
import { Operation } from "@/lib/operationHistory/Operation";
import { Story } from "../types";
import {
  TestStep,
  CoverageSource,
  InputElementInfo,
} from "@/lib/operationHistory/types";
import { Reply, ReplyImpl } from "@/lib/captureControl/Reply";
import { OperationHistoryItem } from "@/lib/captureControl/OperationHistoryItem";
import ScreenDefFactory from "@/lib/operationHistory/ScreenDefFactory";
import { ScreenDefinition } from "@/lib/common/settings/Settings";
import { ActionResult } from "@/lib/common/ActionResult";
import { Note } from "@/lib/operationHistory/Note";
import { values } from "d3";

export interface GenerateAllSessionTestScriptsActionObserver {
  generateTestScripts: (
    sources: { initialUrl: string; history: Operation[] }[]
  ) => Promise<{
    outputUrl: string;
    invalidOperationTypeExists: boolean;
  }>;
}

export interface TestScriptGeneratable {
  readonly testResultRepository: TestResultRepository;
  readonly serviceUrl: string;
}

export class GenerateAllSessionTestScriptsAction {
  constructor(
    private observer: GenerateAllSessionTestScriptsActionObserver,
    private dispatcher: TestScriptGeneratable
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
                const testSteps: TestStep[] = result.data ?? [];

                return { initialUrl, testSteps };
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

    const result = {
      data: generatedTestScripts,
    };

    return result;
  }

  private async collectTestSteps(
    testResultId: string
  ): Promise<Reply<Array<TestStep>>> {
    const reply = await this.dispatcher.testResultRepository.getTestResult(
      testResultId
    );
    const serviceUrl = this.dispatcher.serviceUrl;
    const testSteps: TestStep[] = reply.data
      ? reply.data.testSteps.map((testStep) => {
          const operation = testStep.operation
            ? Operation.createOperation({
                input: testStep.operation.input,
                type: testStep.operation.type,
                elementInfo: testStep.operation.elementInfo,
                title: testStep.operation.title,
                url: testStep.operation.url,
                imageFilePath: testStep.operation.imageFileUrl
                  ? new URL(
                      testStep.operation.imageFileUrl,
                      serviceUrl
                    ).toString()
                  : testStep.operation.imageFileUrl,
                windowHandle: testStep.operation.windowHandle,
                timestamp: testStep.operation.timestamp,
                inputElements: testStep.operation.inputElements,
                keywordSet: new Set(testStep.operation.keywordTexts),
              })
            : testStep.operation;

          return {
            testStepId: testStep.id,
            operation,
            intention: testStep.intention
              ? new Note({
                  id: testStep.intention.id,
                  value: testStep.intention.value,
                  details: testStep.intention.details,
                  tags: testStep.intention.tags,
                  imageFilePath: testStep.intention.imageFileUrl
                    ? new URL(
                        testStep.intention.imageFileUrl,
                        serviceUrl
                      ).toString()
                    : "",
                })
              : null,
            bugs:
              testStep.bugs?.map((bug) => {
                return new Note({
                  id: bug.id,
                  value: bug.value,
                  details: bug.details,
                  tags: bug.tags,
                  imageFilePath: bug.imageFileUrl
                    ? new URL(bug.imageFileUrl, serviceUrl).toString()
                    : "",
                });
              }) ?? null,
            notices:
              testStep.notices?.map((notice) => {
                return new Note({
                  id: notice.id,
                  value: notice.value,
                  details: notice.details,
                  tags: notice.tags,
                  imageFilePath: notice.imageFileUrl
                    ? new URL(notice.imageFileUrl, serviceUrl).toString()
                    : "",
                });
              }) ?? null,
          };
        })
      : [];

    return new ReplyImpl({ status: reply.status, data: testSteps });
  }
}
