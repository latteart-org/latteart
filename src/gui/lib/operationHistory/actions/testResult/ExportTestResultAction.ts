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

export interface TestResultExportable {
  readonly testResultRepository: TestResultRepository;
}

export class ExportTestResultAction {
  constructor(private dispatcher: TestResultExportable) {}

  public async exportWithTestResult(
    testResultId: string,
    shouldSaveTemporary = false
  ): Promise<ActionResult<string>> {
    const reply =
      await this.dispatcher.testResultRepository.postTestResultForExport(
        testResultId,
        shouldSaveTemporary
      );

    const outputUrl = reply.data ? reply.data.url : undefined;
    const error = reply.error
      ? { code: "create-export-data-error" }
      : undefined;
    const result = {
      data: outputUrl,
      error,
    };

    return result;
  }
}
