/**
 * Copyright 2025 NTT Corporation.
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
import { TestHintPropForRepository } from "./types";

export type TestHintPropRepository = {
  putTestHintProps(
    testHintProps: (Omit<TestHintPropForRepository, "id"> & { id?: string })[]
  ): Promise<RepositoryAccessResult<TestHintPropForRepository[]>>;
};

export class TestHintPropRepositoryImpl implements TestHintPropRepository {
  constructor(private restClient: RESTClient) {}

  public async putTestHintProps(
    testHintProps: (Omit<TestHintPropForRepository, "id"> & { id?: string })[]
  ): Promise<RepositoryAccessResult<TestHintPropForRepository[]>> {
    try {
      const response = await this.restClient.httpPut(
        `api/v1/test-hint-props`,
        testHintProps.map((testHintProp) => {
          return {
            id: testHintProp.id,
            name: testHintProp.name,
            type: testHintProp.type,
            listItems: testHintProp.listItems,
          };
        })
      );
      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      return createRepositoryAccessSuccess({
        data: response.data as TestHintPropForRepository[],
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }
}
