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

import LoggingService from "@/logger/LoggingService";
import { ServerError, ServerErrorData } from "../ServerError";
import { ImageFileRepositoryServiceImpl } from "@/services/ImageFileRepositoryService";
import { TimestampServiceImpl } from "@/services/TimestampService";
import {
  Controller,
  Post,
  Route,
  Body,
  Tags,
  Response,
  SuccessResponse,
} from "tsoa";
import { screenshotDirectoryService, tempDirectoryService } from "..";
import { ImportFileRepositoryServiceImpl } from "@/services/ImportFileRepositoryService";
import { TestResultImportService } from "@/services/TestResultImportService";
import { CreateTestResultImportDto } from "../interfaces/TesResultImport";

@Route("imports/test-results")
@Tags("imports")
export class TestResultImportController extends Controller {
  /**
   * Import test result into the repository.
   * @param requestBody Test results to import.
   * @returns Imported test result id.
   */
  @Response<ServerErrorData<"import_test_result_failed">>(
    500,
    "Import test result failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async importTestResult(
    @Body() requestBody: CreateTestResultImportDto
  ): Promise<{ testResultId: string }> {
    const timestampService = new TimestampServiceImpl();

    const imageFileRepositoryService = new ImageFileRepositoryServiceImpl({
      staticDirectory: screenshotDirectoryService,
    });

    const importFileRepositoryService = new ImportFileRepositoryServiceImpl({
      staticDirectory: tempDirectoryService,
      imageFileRepository: imageFileRepositoryService,
      timestamp: timestampService,
    });

    try {
      const result = await new TestResultImportService({
        importFileRepository: importFileRepositoryService,
        imageFileRepository: imageFileRepositoryService,
        timestamp: timestampService,
      }).importTestResult(
        requestBody.source.testResultFile,
        requestBody.dest?.testResultId ?? null
      );

      return result;
    } catch (error) {
      if (error instanceof Error) {
        LoggingService.error("Import test result failed.", error);

        throw new ServerError(500, {
          code: "import_test_result_failed",
        });
      }
      throw error;
    }
  }
}
