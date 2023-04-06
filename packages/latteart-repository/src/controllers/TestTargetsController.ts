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

import {
  GetTestTargetResponse,
  PatchTestTargetResponse,
  PostTestTargetResponse,
} from "../interfaces/TestTargets";
import { ServerError, ServerErrorData } from "../ServerError";
import { TestTargetService } from "@/services/TestTargetsService";
import {
  Controller,
  Body,
  Patch,
  Route,
  Path,
  Get,
  Post,
  Delete,
  Tags,
  Response,
  SuccessResponse,
} from "tsoa";
import { transactionRunner } from "..";
import { createLogger } from "@/logger/logger";

@Route("projects/{projectId}/test-targets/")
@Tags("projects")
export class TestTargetsController extends Controller {
  /**
   * Get test target.
   * @param projectId Target project id.
   * @param testTargetId Target Test Target id.
   * @returns Test target.
   */
  @Response<ServerErrorData<"get_test_target_failed">>(
    500,
    "Get testTarget failed"
  )
  @SuccessResponse(200, "Success")
  @Get("{testTargetId}")
  public async getTestTarget(
    @Path() projectId: string,
    @Path() testTargetId: string
  ): Promise<GetTestTargetResponse> {
    try {
      return await new TestTargetService().get(testTargetId);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Get testTarget failed.", error);

        throw new ServerError(500, {
          code: "get_test_target_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Create test target.
   * @param projectId Target project id.
   * @param body Target test target group id/test target name.
   * @returns Created test target.
   */
  @Response<ServerErrorData<"post_test_target_failed">>(
    500,
    "Post testTarget failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async createTestTarget(
    @Path() projectId: string,
    @Body() body: { testTargetGroupId: string; name: string }
  ): Promise<PostTestTargetResponse> {
    try {
      return await new TestTargetService().post(body, transactionRunner);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Post testTarget failed.", error);

        throw new ServerError(500, {
          code: "post_test_target_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Update some information of the test target to the specified.
   * @param projectId Target project id.
   * @param testTargetId Target test target id.
   * @param body Test target information.
   * @returns Updated test target.
   */
  @Response<ServerErrorData<"patch_test_target_failed">>(
    500,
    "Patch testTarget failed"
  )
  @SuccessResponse(200, "Success")
  @Patch("{testTargetId}")
  public async updateTestTarget(
    @Path() projectId: string,
    @Path() testTargetId: string,
    @Body()
    body: {
      name?: string;
      index?: number;
      plans?: { viewPointId: string; value: number }[];
    }
  ): Promise<PatchTestTargetResponse> {
    try {
      return await new TestTargetService().patch(
        projectId,
        testTargetId,
        body,
        transactionRunner
      );
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Patch testTarget failed.", error);

        throw new ServerError(500, {
          code: "patch_test_target_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Delete test target.
   * @param projectId Target project id.
   * @param testTargetId Target test target id.
   */
  @Response<ServerErrorData<"delete_test_target_failed">>(
    500,
    "Delete testTarget failed"
  )
  @SuccessResponse(204, "Success")
  @Delete("{testTargetId}")
  public async deleteTestTarget(
    @Path() projectId: string,
    @Path() testTargetId: string
  ): Promise<void> {
    try {
      return await new TestTargetService().delete(
        testTargetId,
        transactionRunner
      );
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Delete testTarget failed.", error);

        throw new ServerError(500, {
          code: "delete_test_target_failed",
        });
      }
      throw error;
    }
  }
}
