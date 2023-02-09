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

import { RESTClient } from "../../network/http/client";
import {
  OperationForRepository,
  CapturedOperationForRepository,
  CoverageSourceForRepository,
  InputElementInfoForRepository,
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
      inputElementInfo: InputElementInfoForRepository;
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

      return createRepositoryAccessSuccess({
        data: response.data as {
          id: string;
          operation: OperationForRepository;
          intention: string | null;
          bugs: string[];
          notices: string[];
        },
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

      return createRepositoryAccessSuccess({
        data: response.data as {
          id: string;
          operation: OperationForRepository;
          intention: string | null;
          bugs: string[];
          notices: string[];
        },
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
      inputElementInfo: InputElementInfoForRepository;
    }>
  > {
    try {
      const response = await this.restClient.httpPost(
        `api/v1/test-results/${testResultId}/test-steps`,
        capturedOperation
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as {
          id: string;
          operation: OperationForRepository;
          coverageSource: CoverageSourceForRepository;
          inputElementInfo: InputElementInfoForRepository;
        },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
