/**
 * Copyright 2021 NTT Corporation.
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

import { Reply } from "@/lib/captureControl/Reply";

export interface TestResultExportable {
  exportTestResult(testResultId: string): Promise<Reply<{ url: string }>>;
}

export class ExportAction {
  constructor(private dispatcher: TestResultExportable) {}

  public async exportWithTestResult(testResultId: string): Promise<string> {
    const reply = await this.dispatcher.exportTestResult(testResultId);

    if (!reply.data) {
      throw new Error(`create-export-data-error`);
    }

    const outputUrl: string = reply.data.url;

    return outputUrl;
  }
}
