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

import {
  RepositoryAccessResult,
  createConnectionRefusedFailure,
  createRepositoryAccessFailure,
  createRepositoryAccessSuccess,
} from "./result";
import { RESTClient } from "@/network/http/client";
import { TestHintForRepository, TestHintPropForRepository } from "./types";

export type TestHintRepository = {
  getTestHints(): Promise<
    RepositoryAccessResult<{
      props: TestHintPropForRepository[];
      data: TestHintForRepository[];
    }>
  >;

  postTestHint(
    testHint: Omit<TestHintForRepository, "id">
  ): Promise<RepositoryAccessResult<TestHintForRepository>>;

  putTestHint(
    testHint: TestHintForRepository
  ): Promise<RepositoryAccessResult<TestHintForRepository>>;
};

export class TestHintRepositoryImpl implements TestHintRepository {
  constructor(private restClient: RESTClient) {}

  public async getTestHints(): Promise<
    RepositoryAccessResult<{
      props: TestHintPropForRepository[];
      data: TestHintForRepository[];
    }>
  > {
    try {
      const response = await this.restClient.httpGet(`api/v1/test-hints`);

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      const { props, data } = response.data as {
        props: TestHintPropForRepository[];
        data: TestHintForRepository[];
      };

      return createRepositoryAccessSuccess({
        data: { props, data },
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async postTestHint(
    testHint: Omit<TestHintForRepository, "id">
  ): Promise<RepositoryAccessResult<TestHintForRepository>> {
    try {
      const response = await this.restClient.httpPost(`api/v1/test-hints`, {
        value: testHint.value,
        testMatrixName: testHint.testMatrixName,
        groupName: testHint.groupName,
        testTargetName: testHint.testTargetName,
        viewPointName: testHint.viewPointName,
        customs: testHint.customs,
        commentWords: testHint.commentWords,
        operationElements: testHint.operationElements,
      });
      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as TestHintForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async putTestHint(
    testHint: TestHintForRepository
  ): Promise<RepositoryAccessResult<TestHintForRepository>> {
    try {
      const response = await this.restClient.httpPut(
        `api/v1/test-hints/${testHint.id}`,
        {
          value: testHint.value,
          testMatrixName: testHint.testMatrixName,
          groupName: testHint.groupName,
          testTargetName: testHint.testTargetName,
          viewPointName: testHint.viewPointName,
          customs: testHint.customs,
          commentWords: testHint.commentWords,
          operationElements: testHint.operationElements,
        }
      );
      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as TestHintForRepository,
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
