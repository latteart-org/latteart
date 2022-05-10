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
  constructor(private dispatcher: ImportTestResultsGettable) {}

  public async getImportTestResults(): Promise<
    ActionResult<Array<{ url: string; name: string }>>
  > {
    const reply = await this.dispatcher.importTestResultRepository.getTestResults();
    const serviceUrl = this.dispatcher.serviceUrl;

    const data = reply.data!.map(({ id, name }) => {
      return {
        url: `${serviceUrl}/${id}`,
        name,
      };
    });

    const result = {
      data,
      error: reply.error ?? undefined,
    };

    return result;
  }
}
