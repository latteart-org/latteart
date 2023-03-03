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

import { ServerError, ServerErrorData } from "../ServerError";
import { ConfigsService } from "@/services/ConfigsService";
import { ExportServiceImpl } from "@/services/ExportService";
import { TestResultServiceImpl } from "@/services/TestResultService";
import { ExportFileRepositoryServiceImpl } from "@/services/ExportFileRepositoryService";
import { TestStepServiceImpl } from "@/services/TestStepService";
import { TimestampServiceImpl } from "@/services/TimestampService";
import {
  Controller,
  Post,
  Route,
  Path,
  Tags,
  Response,
  SuccessResponse,
} from "tsoa";
import { createFileRepositoryManager } from "@/gateways/fileRepository";
import { createLogger } from "@/logger/logger";

@Route("test-results/{testResultId}/export")
@Tags("test-results")
export class TestResultExportController extends Controller {
  /**
   * Export test result.
   * @param testResultId Target test result id.
   * @returns Download url for exported test result.
   */
  @Response<ServerErrorData<"export_test_result_failed">>(
    500,
    "Export test result failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async exportTestResult(
    @Path() testResultId: string
  ): Promise<{ url: string }> {
    const timestampService = new TimestampServiceImpl();
    const fileRepositoryManager = await createFileRepositoryManager();
    const screenshotFileRepository =
      fileRepositoryManager.getRepository("screenshot");
    const exportFileRepository = fileRepositoryManager.getRepository("export");
    const workingFileRepository = fileRepositoryManager.getRepository("work");

    const testResultService = new TestResultServiceImpl({
      timestamp: timestampService,
      testStep: new TestStepServiceImpl({
        screenshotFileRepository,
        timestamp: timestampService,
        config: new ConfigsService(),
      }),
    });

    const exportFileRepositoryService = new ExportFileRepositoryServiceImpl({
      exportFileRepository,
      workingFileRepository,
      timestamp: timestampService,
    });

    try {
      return await new ExportServiceImpl({
        testResult: testResultService,
        exportFileRepository: exportFileRepositoryService,
      }).exportTestResult(testResultId);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Export test result failed.", error);
        throw new ServerError(500, {
          code: "export_test_result_failed",
        });
      }
      throw error;
    }
  }
}
