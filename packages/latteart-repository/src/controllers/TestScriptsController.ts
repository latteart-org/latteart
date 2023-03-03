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
import { TestResultServiceImpl } from "@/services/TestResultService";
import { TestScriptJSDocRenderingService } from "@/services/testScriptDocRendering/TestScriptJSDocRenderingService";
import { TestScriptFileRepositoryServiceImpl } from "@/services/TestScriptFileRepositoryService";
import { TestStepServiceImpl } from "@/services/TestStepService";
import { TimestampServiceImpl } from "@/services/TimestampService";
import {
  Controller,
  Post,
  Route,
  Path,
  Body,
  Tags,
  Response,
  SuccessResponse,
} from "tsoa";
import { CreateTestScriptDto } from "../interfaces/TestScripts";
import { TestScriptsService } from "../services/TestScriptsService";
import { createFileRepositoryManager } from "@/gateways/fileRepository";
import { createLogger } from "@/logger/logger";

@Route("test-results/{testResultId}/test-scripts")
@Tags("test-results")
export class TestScriptsController extends Controller {
  /**
   * Generate test script from test result.
   * @param testResultId Target test result id.
   * @param requestBody Test script output settings.
   * @returns Information in the output test script file.
   */
  @Response<ServerErrorData<"save_test_script_failed">>(
    500,
    "Save test script failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async generateTestResultTestScript(
    @Path() testResultId: string,
    @Body() requestBody: CreateTestScriptDto
  ): Promise<{ url: string; invalidOperationTypeExists: boolean }> {
    const timestampService = new TimestampServiceImpl();
    const fileRepositoryManager = await createFileRepositoryManager();
    const screenshotFileRepository =
      fileRepositoryManager.getRepository("screenshot");
    const testScriptRepository =
      fileRepositoryManager.getRepository("testScript");
    const workingFileRepository = fileRepositoryManager.getRepository("work");

    const testResultService = new TestResultServiceImpl({
      timestamp: timestampService,
      testStep: new TestStepServiceImpl({
        screenshotFileRepository,
        timestamp: timestampService,
        config: new ConfigsService(),
      }),
    });

    const testScriptFileRepositoryService =
      new TestScriptFileRepositoryServiceImpl({
        testScriptRepository,
        testScriptDocRendering: new TestScriptJSDocRenderingService(),
        screenshotFileRepository,
        workingFileRepository,
        timestamp: timestampService,
      });

    try {
      return await new TestScriptsService({
        testResult: testResultService,
        testScriptFileRepository: testScriptFileRepositoryService,
      }).createTestScriptByTestResult(testResultId, requestBody);
    } catch (error) {
      if (error instanceof ServerError) {
        throw error;
      }

      if (error instanceof Error) {
        createLogger().error("Save test script failed.", error);

        throw new ServerError(500, {
          code: "save_test_script_failed",
        });
      }

      throw error;
    }
  }
}
