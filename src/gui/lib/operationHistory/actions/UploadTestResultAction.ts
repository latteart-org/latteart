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

export interface TestResultUploadable {
  readonly testResultRepository: TestResultRepository;
}

export class UploadTestResultAction {
  constructor(private dispatcher: TestResultUploadable) {}

  public async uploadTestResult(
    source: { testResultId: string },
    dest: { repositoryUrl: string; testResultId?: string }
  ): Promise<ActionResult<string>> {
    const reply = await this.dispatcher.testResultRepository.postTestResultForUpload(
      source,
      dest
    );

    const error = reply.error ? { code: "upload-request-error" } : undefined;
    const result = {
      data: reply.data?.id,
      error,
    };

    return result;
  }
}
