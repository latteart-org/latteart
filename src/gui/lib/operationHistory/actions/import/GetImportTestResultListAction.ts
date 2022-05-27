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

import { ImportTestResultRepository } from "@/lib/eventDispatcher/repositoryService/ImportTestResultRepository";
import { ActionResult } from "@/lib/common/ActionResult";

export interface ImportTestResultsGettable {
  readonly importTestResultRepository: ImportTestResultRepository;
  readonly serviceUrl: string;
}

export class GetImportTestResultListAction {
  constructor(private repositoryContainer: ImportTestResultsGettable) {}

  public async getImportTestResults(): Promise<
    ActionResult<Array<{ url: string; name: string }>>
  > {
    const reply =
      await this.repositoryContainer.importTestResultRepository.getTestResults();
    const serviceUrl = this.repositoryContainer.serviceUrl;

    const data = reply.data
      ? reply.data.map(({ url, name }) => {
          return {
            url: `${serviceUrl}/${url}`,
            name,
          };
        })
      : undefined;

    const error = reply.error ? { code: reply.error.code } : undefined;
    const result = {
      data,
      error,
    };

    return result;
  }
}
