/**
 * Copyright 2023 NTT Corporation.
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

import { RESTClient } from "../../network/http/client";
import {
  OperationForRepository,
  CapturedOperationForRepository,
  CoverageSourceForRepository,
  TestStepForRepository,
} from "./types";
import {
  RepositoryAccessResult,
  createRepositoryAccessSuccess,
  createRepositoryAccessFailure,
  createConnectionRefusedFailure,
} from "./result";

export interface TestStepRepository {
  getTestSteps(
    testResultId: string,
    testStepId: string
  ): Promise<RepositoryAccessResult<TestStepForRepository>>;

  patchTestSteps(
    testResultId: string,
    testStepId: string,
    noteId?: string | null,
    bugs?: string[],
    notices?: string[]
  ): Promise<RepositoryAccessResult<TestStepForRepository>>;

  postTestSteps(
    testResultId: string,
    capturedOperation: CapturedOperationForRepository
  ): Promise<
    RepositoryAccessResult<{
      id: string;
      operation: OperationForRepository;
      coverageSource: CoverageSourceForRepository;
    }>
  >;
}

export class TestStepRepositoryImpl implements TestStepRepository {
  constructor(private restClient: RESTClient) {}

  public async getTestSteps(
    testResultId: string,
    testStepId: string
  ): Promise<RepositoryAccessResult<TestStepForRepository>> {
    try {
      const response = await this.restClient.httpGet(
        `api/v1/test-results/${testResultId}/test-steps/${testStepId}`
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      const data = response.data as {
        id: string;
        operation: OperationForRepository;
        intention: string | null;
        bugs: string[];
        notices: string[];
      };

      return createRepositoryAccessSuccess({
        data: { ...data, operation: this.convertOperation(data.operation) },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async patchTestSteps(
    testResultId: string,
    testStepId: string,
    noteId?: string | null,
    bugs?: string[],
    notices?: string[]
  ): Promise<RepositoryAccessResult<TestStepForRepository>> {
    try {
      const body = notices
        ? { notices }
        : bugs
        ? { bugs }
        : { intention: noteId };
      const response = await this.restClient.httpPatch(
        `api/v1/test-results/${testResultId}/test-steps/${testStepId}`,
        body
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      const data = response.data as {
        id: string;
        operation: OperationForRepository;
        intention: string | null;
        bugs: string[];
        notices: string[];
      };

      return createRepositoryAccessSuccess({
        data: { ...data, operation: this.convertOperation(data.operation) },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async postTestSteps(
    testResultId: string,
    capturedOperation: CapturedOperationForRepository
  ): Promise<
    RepositoryAccessResult<{
      id: string;
      operation: OperationForRepository;
      coverageSource: CoverageSourceForRepository;
    }>
  > {
    try {
      const response = await this.restClient.httpPost(
        `api/v1/test-results/${testResultId}/test-steps`,
        {
          input: capturedOperation.input,
          type: capturedOperation.type,
          elementInfo: capturedOperation.elementInfo,
          title: capturedOperation.title,
          url: capturedOperation.url,
          imageData: capturedOperation.imageData,
          windowHandle: capturedOperation.windowHandle,
          timestamp: capturedOperation.timestamp,
          screenElements: capturedOperation.screenElements,
          pageSource: capturedOperation.pageSource,
          scrollPosition: capturedOperation.scrollPosition,
          clientSize: capturedOperation.clientSize,
          isAutomatic: capturedOperation.isAutomatic,
          videoId: capturedOperation.videoId,
          videoTime: capturedOperation.videoTime,
        }
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      const data = response.data as {
        id: string;
        operation: OperationForRepository;
        coverageSource: CoverageSourceForRepository;
      };

      return createRepositoryAccessSuccess({
        data: { ...data, operation: this.convertOperation(data.operation) },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  private convertOperation(operation: OperationForRepository) {
    return {
      ...operation,
      imageFileUrl: operation.imageFileUrl
        ? new URL(operation.imageFileUrl, this.restClient.serverUrl).toString()
        : "",
      videoFrame: operation.videoFrame
        ? {
            ...operation.videoFrame,
            url: new URL(
              operation.videoFrame.url,
              this.restClient.serverUrl
            ).toString(),
          }
        : undefined,
    };
  }
}
