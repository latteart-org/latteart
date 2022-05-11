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
import { ActionResult } from "@/lib/common/ActionResult";

export interface TestResultsGettable {
  readonly testResultRepository: TestResultRepository;
}

export class GetTestResultListAction {
  constructor(private dispatcher: TestResultsGettable) {}

  public async getTestResults(): Promise<
    ActionResult<Array<{ id: string; name: string }>>
  > {
    const reply = await this.dispatcher.testResultRepository.getTestResults();

    return reply;
  }
}