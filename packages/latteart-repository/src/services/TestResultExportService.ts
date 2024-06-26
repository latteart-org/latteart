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

import { TestResultService } from "./TestResultService";
import { ExportFileRepositoryService } from "./ExportFileRepositoryService";
import { serializeTestResult } from "./helper/testResultExportHelper";

export interface TestResultExportService {
  export(testResultId: string): Promise<{ url: string }>;
}

export class TestResultExportServiceImpl implements TestResultExportService {
  constructor(
    private service: {
      testResult: TestResultService;
      exportFileRepository: ExportFileRepositoryService;
    }
  ) {}

  public async export(testResultId: string): Promise<{ url: string }> {
    const testResult = await this.service.testResult.getTestResultForExport(
      testResultId
    );

    if (!testResult) {
      throw Error(`Test result not found: ${testResultId}`);
    }

    const fileData = (
      await this.service.testResult.collectAllScreenshots(testResultId)
    ).concat(await this.service.testResult.collectAllVideos(testResultId));

    const serializedTestResult = serializeTestResult(testResult);

    const url = await this.service.exportFileRepository.exportTestResult({
      name: testResult.name,
      testResultFile: { fileName: "log.json", data: serializedTestResult },
      fileData,
    });

    return { url };
  }
}
