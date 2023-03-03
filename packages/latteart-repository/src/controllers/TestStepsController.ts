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
import { TestStepServiceImpl } from "@/services/TestStepService";
import { TimestampServiceImpl } from "@/services/TimestampService";
import {
  Controller,
  Get,
  Post,
  Patch,
  Route,
  Path,
  Body,
  Tags,
  Response,
  SuccessResponse,
} from "tsoa";
import {
  PatchTestStepDto,
  CreateTestStepDto,
  GetTestStepResponse,
  CreateTestStepResponse,
  PatchTestStepResponse,
} from "../interfaces/TestSteps";
import { createFileRepositoryManager } from "@/gateways/fileRepository";
import { createLogger } from "@/logger/logger";

@Route("test-results/{testResultId}/test-steps")
@Tags("test-results")
export class TestStepsController extends Controller {
  /**
   * Add test step to test result.
   * @param testResultId Target test result id.
   * @param requestBody Operation.
   * @returns Added test step.
   */
  @Response<ServerErrorData<"add_test_step_failed">>(
    500,
    "Add test step failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async addTestStep(
    @Path() testResultId: string,
    @Body() requestBody: CreateTestStepDto
  ): Promise<CreateTestStepResponse> {
    console.log("TestStepsController - addTestStep");

    const fileRepositoryManager = await createFileRepositoryManager();
    const screenshotFileRepository =
      fileRepositoryManager.getRepository("screenshot");

    try {
      return await new TestStepServiceImpl({
        screenshotFileRepository,
        timestamp: new TimestampServiceImpl(),
        config: new ConfigsService(),
      }).createTestStep(testResultId, requestBody);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Add test step failed.", error);

        throw new ServerError(500, {
          code: "add_test_step_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Get test step.
   * @param testResultId Target test result id.
   * @param testStepId Target test step id.
   * @returns Test step.
   */
  @Response<ServerErrorData<"get_test_step_failed">>(
    404,
    "Get test step failed"
  )
  @SuccessResponse(200, "Success")
  @Get("{testStepId}")
  public async getTestStep(
    @Path() testResultId: string,
    @Path() testStepId: string
  ): Promise<GetTestStepResponse> {
    console.log("TestStepsController - getTestStep");
    const fileRepositoryManager = await createFileRepositoryManager();
    const screenshotFileRepository =
      fileRepositoryManager.getRepository("screenshot");

    const testStepService = new TestStepServiceImpl({
      screenshotFileRepository,
      timestamp: new TimestampServiceImpl(),
      config: new ConfigsService(),
    });

    try {
      const testStep = await testStepService.getTestStep(testStepId);

      return testStep;
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Get test step failed.", error);

        throw new ServerError(404, {
          code: "get_test_step_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Update test step notes (Purposes or Notices) to specified.
   * @param testResultId Target test result id.
   * @param testStepId Target test step id.
   * @param requestBody Test step notes (Purpose or Notices).
   * @returns Updated test step.
   */
  @Response<ServerErrorData<"edit_test_step_failed">>(
    500,
    "Edit test step failed"
  )
  @SuccessResponse(200, "Success")
  @Patch("{testStepId}")
  public async updateTestStepNotes(
    @Path() testResultId: string,
    @Path() testStepId: string,
    @Body() requestBody: PatchTestStepDto
  ): Promise<PatchTestStepResponse> {
    const fileRepositoryManager = await createFileRepositoryManager();
    const screenshotFileRepository =
      fileRepositoryManager.getRepository("screenshot");

    const testStepService = new TestStepServiceImpl({
      screenshotFileRepository,
      timestamp: new TimestampServiceImpl(),
      config: new ConfigsService(),
    });

    try {
      if (requestBody.notices) {
        console.log("TestStepsController - attachNotesToTestStep");

        await testStepService.attachNotesToTestStep(
          testStepId,
          requestBody.notices
        );
      }

      if (requestBody.intention !== undefined) {
        console.log("TestStepsController - attachTestPurposeToTestStep");

        await testStepService.attachTestPurposeToTestStep(
          testStepId,
          requestBody.intention
        );
      }

      const testStep = await testStepService.getTestStep(testStepId);

      return testStep;
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Edit test step failed.", error);

        throw new ServerError(500, {
          code: "edit_test_step_failed",
        });
      }
      throw error;
    }
  }
}
