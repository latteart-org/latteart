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

import { AppDataSource } from "@/data-source";
import { createFileRepositoryManager } from "@/gateways/fileRepository";
import {
  CompareTestResultsDto,
  CompareTestResultsResponse,
} from "@/interfaces/TestResultComparison";
import { createLogger } from "@/logger/logger";
import { ServerError, ServerErrorData } from "@/ServerError";
import { ConfigsService } from "@/services/ConfigsService";
import { TestResultServiceImpl } from "@/services/TestResultService";
import { TestStepServiceImpl } from "@/services/TestStepService";
import { TimestampServiceImpl } from "@/services/TimestampService";
import { Controller, Post, Route, Body, Response, SuccessResponse } from "tsoa";

@Route("test-result-comparisons")
export class TestResultComparisonController extends Controller {
  /**
   * Compare test results.
   * @param requestBody Test result ids and option.
   * @returns Generated sequence view model.
   */
  @Response<ServerErrorData<"compare_test_results_failed">>(
    500,
    "Compare test results failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async compareTestResults(
    @Body()
    requestBody: CompareTestResultsDto
  ): Promise<CompareTestResultsResponse> {
    const timestampService = new TimestampServiceImpl();
    const fileRepositoryManager = await createFileRepositoryManager();
    const screenshotFileRepository =
      fileRepositoryManager.getRepository("screenshot");
    const workingFileRepository = fileRepositoryManager.getRepository("work");
    const compareReportRepository = fileRepositoryManager.getRepository("temp");

    try {
      const result = await new TestResultServiceImpl(AppDataSource, {
        timestamp: timestampService,
        testStep: new TestStepServiceImpl(AppDataSource, {
          screenshotFileRepository,
          timestamp: timestampService,
          config: new ConfigsService(AppDataSource),
        }),
        screenshotFileRepository,
        workingFileRepository,
        compareReportRepository,
      }).compareTestResults(
        requestBody.actualTestResultId,
        requestBody.expectedTestResultId,
        requestBody.option
      );

      return result;
    } catch (error) {
      if (error instanceof ServerError) {
        throw error;
      }

      if (error instanceof Error) {
        createLogger().error("Compare test result failed.", error);

        throw new ServerError(500, {
          code: "compare_test_results_failed",
        });
      }

      throw error;
    }
  }
}
