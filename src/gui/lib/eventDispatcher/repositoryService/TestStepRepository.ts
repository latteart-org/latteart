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

import { Reply, ReplyImpl } from "@/lib/captureControl/Reply";
import {
  TestStepOperation,
  CoverageSource,
  InputElementInfo,
} from "@/lib/operationHistory/types";
import RESTClient from "../RESTClient";
import { CapturedOperation } from "@/lib/operationHistory/CapturedOperation";

export class TestStepRepository {
  constructor(
    private restClient: RESTClient,
    private buildAPIURL: (url: string) => string
  ) {}

  public async getTestSteps(
    testResultId: string,
    testStepId: string
  ): Promise<
    Reply<{
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    }>
  > {
    const response = await this.restClient.httpGet(
      this.buildAPIURL(`/test-results/${testResultId}/test-steps/${testStepId}`)
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as {
        id: string;
        operation: TestStepOperation;
        intention: string | null;
        bugs: string[];
        notices: string[];
      },
    });
  }

  public async patchTestSteps(
    testResultId: string,
    testStepId: string,
    noteId?: string | null,
    bugs?: string[]
  ): Promise<
    Reply<{
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    }>
  > {
    const body = bugs ? { bugs } : { intention: noteId };
    const response = await this.restClient.httpPatch(
      this.buildAPIURL(
        `/test-results/${testResultId}/test-steps/${testStepId}`
      ),
      body
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as {
        id: string;
        operation: TestStepOperation;
        intention: string | null;
        bugs: string[];
        notices: string[];
      },
    });
  }

  public async postTestSteps(
    testResultId: string,
    capturedOperation: CapturedOperation
  ): Promise<
    Reply<{
      id: string;
      operation: TestStepOperation;
      coverageSource: CoverageSource;
      inputElementInfo: InputElementInfo;
    }>
  > {
    const response = await this.restClient.httpPost(
      this.buildAPIURL(`/test-results/${testResultId}/test-steps`),
      capturedOperation
    );

    return new ReplyImpl({
      status: response.status,
      data: response.data as {
        id: string;
        operation: TestStepOperation;
        coverageSource: CoverageSource;
        inputElementInfo: InputElementInfo;
      },
    });
  }
}
