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

import { ListSessionResponse } from "../interfaces/Sessions";
import LoggingService from "@/logger/LoggingService";
import { ServerError, ServerErrorData } from "../ServerError";
import { ConfigsService } from "@/services/ConfigsService";
import { ImageFileRepositoryServiceImpl } from "@/services/ImageFileRepositoryService";
import { SessionsService } from "@/services/SessionsService";
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
  Delete,
  Tags,
  Response,
  SuccessResponse,
} from "tsoa";
import { screenshotDirectoryService, transactionRunner } from "..";
import {
  ListTestResultResponse,
  CreateTestResultResponse,
  GetTestResultResponse,
  PatchTestResultResponse,
  CreateTestResultDto,
  GetSequenceViewDto,
  GetSequenceViewResponse,
} from "../interfaces/TestResults";
import { TestResultServiceImpl } from "../services/TestResultService";

@Route("test-results")
@Tags("test-results")
export class TestResultsController extends Controller {
  /**
   * Get test result identifiers.
   * @returns Test result identifiers.
   */
  @SuccessResponse(200, "Success")
  @Get()
  public async getTestResultIdentifiers(): Promise<ListTestResultResponse[]> {
    console.log("TestResultsController - getTestResultIdentifiers");

    const timestampService = new TimestampServiceImpl();
    const imageFileRepositoryService = new ImageFileRepositoryServiceImpl({
      staticDirectory: screenshotDirectoryService,
    });

    return new TestResultServiceImpl({
      timestamp: timestampService,
      testStep: new TestStepServiceImpl({
        imageFileRepository: imageFileRepositoryService,
        timestamp: timestampService,
        config: new ConfigsService(),
      }),
    }).getTestResultIdentifiers();
  }

  /**
   * Get test result.
   * @param testResultId Target test result id.
   * @returns Test result.
   */
  @Response<ServerErrorData<"get_test_result_failed">>(
    404,
    "Test result not found"
  )
  @Response<ServerErrorData<"get_test_result_failed">>(
    500,
    "Get test result failed"
  )
  @SuccessResponse(200, "Success")
  @Get("{testResultId}")
  public async getTestResult(
    @Path() testResultId: string
  ): Promise<GetTestResultResponse> {
    console.log("TestResultsController - getTestResult");

    const timestampService = new TimestampServiceImpl();
    const imageFileRepositoryService = new ImageFileRepositoryServiceImpl({
      staticDirectory: screenshotDirectoryService,
    });

    try {
      const testResult = await new TestResultServiceImpl({
        timestamp: timestampService,
        testStep: new TestStepServiceImpl({
          imageFileRepository: imageFileRepositoryService,
          timestamp: timestampService,
          config: new ConfigsService(),
        }),
      }).getTestResult(testResultId);

      if (testResult) {
        return testResult;
      }
    } catch (error) {
      if (error instanceof Error) {
        LoggingService.error("Get test result failed.", error);

        throw new ServerError(500, {
          code: "get_test_result_failed",
        });
      }
      throw error;
    }

    LoggingService.error(
      `Test result not found. testResultId: ${testResultId}`
    );

    throw new ServerError(404, {
      code: "get_test_result_failed",
    });
  }

  /**
   * Create test result.
   * @param requestBody Test target url, Test result name, Test start date and time.
   * @returns Created test result id/test result name.
   */
  @Response<ServerErrorData<"save_test_result_failed">>(
    500,
    "Create test result failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async createTestResult(
    @Body() requestBody: CreateTestResultDto
  ): Promise<CreateTestResultResponse> {
    console.log("TestResultsController - createTestResult");

    const timestampService = new TimestampServiceImpl();
    const imageFileRepositoryService = new ImageFileRepositoryServiceImpl({
      staticDirectory: screenshotDirectoryService,
    });

    try {
      const result = await new TestResultServiceImpl({
        timestamp: timestampService,
        testStep: new TestStepServiceImpl({
          imageFileRepository: imageFileRepositoryService,
          timestamp: timestampService,
          config: new ConfigsService(),
        }),
      }).createTestResult(requestBody, null);

      return result;
    } catch (error) {
      if (error instanceof Error) {
        LoggingService.error("Create test result failed.", error);

        throw new ServerError(500, {
          code: "save_test_result_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Update some information in the test result to the specified.
   * @param testResultId Target test result id.
   * @param requestBody Test result name, Test start date and time, Test target url.
   * @returns Updated test result.
   */
  @Response<ServerErrorData<"update_test_result_failed">>(
    500,
    "Update test result failed"
  )
  @SuccessResponse(200, "Success")
  @Patch("{testResultId}")
  public async updateTestResult(
    @Path() testResultId: string,
    @Body()
    requestBody: { name?: string; startTime?: number; initialUrl?: string }
  ): Promise<PatchTestResultResponse> {
    console.log("TestResultsController - updateTestResult");

    const timestampService = new TimestampServiceImpl();
    const imageFileRepositoryService = new ImageFileRepositoryServiceImpl({
      staticDirectory: screenshotDirectoryService,
    });

    try {
      return await new TestResultServiceImpl({
        timestamp: timestampService,
        testStep: new TestStepServiceImpl({
          imageFileRepository: imageFileRepositoryService,
          timestamp: timestampService,
          config: new ConfigsService(),
        }),
      }).patchTestResult({
        id: testResultId,
        ...requestBody,
      });
    } catch (error) {
      if (error instanceof Error) {
        LoggingService.error("Update test result failed.", error);

        throw new ServerError(500, {
          code: "update_test_result_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Delete test result.
   * @param testResultId Target test result id.
   */
  @Response<ServerErrorData<"delete_test_result_failed">>(
    500,
    "Delete test result failed"
  )
  @SuccessResponse(204, "Success")
  @Delete("{testResultId}")
  public async deleteTestResult(@Path() testResultId: string): Promise<void> {
    const timestampService = new TimestampServiceImpl();
    const imageFileRepositoryService = new ImageFileRepositoryServiceImpl({
      staticDirectory: screenshotDirectoryService,
    });
    const service = new TestResultServiceImpl({
      timestamp: timestampService,
      testStep: new TestStepServiceImpl({
        imageFileRepository: imageFileRepositoryService,
        timestamp: timestampService,
        config: new ConfigsService(),
      }),
    });

    try {
      return await service.deleteTestResult(
        testResultId,
        transactionRunner,
        screenshotDirectoryService
      );
    } catch (error) {
      if (error instanceof Error) {
        LoggingService.error("Delete test result failed.", error);
        throw new ServerError(500, {
          code: "delete_test_result_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Get session ids associated with test results.
   * @param testResultId Target test result id.
   * @returns Session ids linked to test results.
   */
  @SuccessResponse(200, "Success")
  @Get("{testResultId}/sessions")
  public async getSessionIds(
    @Path() testResultId: string
  ): Promise<ListSessionResponse> {
    console.log("TestResultsController - getSessionIds");

    return new SessionsService().getSessionIdentifiers(testResultId);
  }

  /**
   * Generate sequence view model of test result.
   * @param testResultId Target test result id.
   * @param requestBody Test result view option.
   * @returns Generated sequence view model.
   */
  @Response<ServerErrorData<"generate_sequence_view_failed">>(
    500,
    "Generate sequence view failed"
  )
  @SuccessResponse(200, "Success")
  @Post("{testResultId}/sequence-views")
  public async generateSequenceView(
    @Path() testResultId: string,
    @Body() requestBody?: GetSequenceViewDto
  ): Promise<GetSequenceViewResponse> {
    console.log("TestResultsController - getSequenceView");

    const timestampService = new TimestampServiceImpl();
    const imageFileRepositoryService = new ImageFileRepositoryServiceImpl({
      staticDirectory: screenshotDirectoryService,
    });
    const service = new TestResultServiceImpl({
      timestamp: timestampService,
      testStep: new TestStepServiceImpl({
        imageFileRepository: imageFileRepositoryService,
        timestamp: timestampService,
        config: new ConfigsService(),
      }),
    });

    try {
      return await service.generateSequenceView(testResultId, requestBody);
    } catch (error) {
      if (error instanceof Error) {
        LoggingService.error("Generate sequence view failed.", error);
        throw new ServerError(500, {
          code: "generate_sequence_view_failed",
        });
      }
      throw error;
    }
  }
}
