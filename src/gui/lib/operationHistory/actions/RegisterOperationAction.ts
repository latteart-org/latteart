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

import { TestStepRepository } from "@/lib/eventDispatcher/repositoryService/TestStepRepository";
import { CapturedOperation } from "../CapturedOperation";
import { ActionResult } from "@/lib/common/ActionResult";
import { Operation } from "../Operation";
import { CoverageSource, InputElementInfo, TestStepOperation } from "../types";

export interface OperationRegistrable {
  readonly testStepRepository: TestStepRepository;
  readonly serviceUrl: string;
}

export class RegisterOperationAction {
  constructor(private dispatcher: OperationRegistrable) {}

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
      inputElementInfo: InputElementInfo;
    }>
  > {
    const reply = await this.dispatcher.testStepRepository.postTestSteps(
      testResultId,
      capturedOperation
    );

    const {
      id,
      operation: testStepOperation,
      coverageSource,
      inputElementInfo,
    } = reply.data as {
      id: string;
      operation: TestStepOperation;
      coverageSource: CoverageSource;
      inputElementInfo?: InputElementInfo;
    };
    const serviceUrl = this.dispatcher.serviceUrl;

    const operation = Operation.createOperation({
      input: testStepOperation.input,
      type: testStepOperation.type,
      elementInfo: testStepOperation.elementInfo,
      title: testStepOperation.title,
      url: testStepOperation.url,
      imageFilePath: testStepOperation.imageFileUrl
        ? new URL(testStepOperation.imageFileUrl, serviceUrl).toString()
        : testStepOperation.imageFileUrl,
      windowHandle: testStepOperation.windowHandle,
      timestamp: testStepOperation.timestamp,
      inputElements: testStepOperation.inputElements,
      keywordSet: new Set(testStepOperation.keywordTexts),
    });

    const data = {
      id,
      operation,
      coverageSource,
      inputElementInfo,
    };

    const error = reply.error ? { code: reply.error.code } : undefined;
    const result = {
      data: data as {
        id: string;
        operation: Operation;
        coverageSource: CoverageSource;
        inputElementInfo: InputElementInfo;
      },
      error,
    };

    return result;
  }
}
