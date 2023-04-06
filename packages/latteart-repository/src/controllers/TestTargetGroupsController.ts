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
  GetTestTargetGroupResponse,
  PatchTestTargetGroupResponse,
  PostTestTargetGroupResponse,
} from "../interfaces/TestTargetGroups";
import { ServerError, ServerErrorData } from "../ServerError";
import { TestTargetGroupsService } from "@/services/TestTargetGroupsService";
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

@Route("/test-target-groups/")
@Tags("test-target-groups")
export class TestTargetGroupsController extends Controller {
  /**
   * Get test target group.
   * @param testTargetGroupId Target test target group id.
   * @returns Test target group.
   */
  @Response<ServerErrorData<"get_test_target_group_failed">>(
    500,
    "Get testTargetGroup failed"
  )
  @SuccessResponse(200, "Success")
  @Get("{testTargetGroupId}")
  public async getTestTargetGroup(
    @Path() testTargetGroupId: string
  ): Promise<GetTestTargetGroupResponse> {
    try {
      return await new TestTargetGroupsService().get(testTargetGroupId);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Get testTargetGroup failed.", error);

        throw new ServerError(500, {
          code: "get_test_target_group_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Create test target group.
   * @param body Target test matrix ID/test target group name.
   * @returns Created test target group.
   */
  @Response<ServerErrorData<"post_test_target_group_failed">>(
    500,
    "Post testTargetGroup failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async createTestTargetGroup(
    @Body() body: { testMatrixId: string; name: string }
  ): Promise<PostTestTargetGroupResponse> {
    try {
      return await new TestTargetGroupsService().post(body);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Post testTargetGroup failed.", error);

        throw new ServerError(500, {
          code: "post_test_target_group_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Update some information in the test target group to the specified.
   * @param testTargetGroupId Target test target group id.
   * @param body Test target group name.
   * @returns Updated test target group.
   */
  @Response<ServerErrorData<"patch_test_target_group_failed">>(
    500,
    "Patch targetGroup failed"
  )
  @SuccessResponse(200, "Success")
  @Patch("{testTargetGroupId}")
  public async updateTestTargetGroup(
    @Path() testTargetGroupId: string,
    @Body() body: { name: string }
  ): Promise<PatchTestTargetGroupResponse> {
    try {
      return await new TestTargetGroupsService().patch(testTargetGroupId, body);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Patch targetGroup failed.", error);

        throw new ServerError(500, {
          code: "patch_test_target_group_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Delete test target group.
   * @param testTargetGroupId Target test target group id.
   */
  @Response<ServerErrorData<"delete_test_target_group_failed">>(
    500,
    "Delete testTargetGroup failed"
  )
  @SuccessResponse(204, "Success")
  @Delete("{testTargetGroupId}")
  public async deleteTestTargetGroup(
    @Path() testTargetGroupId: string
  ): Promise<void> {
    try {
      return await new TestTargetGroupsService().delete(
        testTargetGroupId,
        transactionRunner
      );
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Delete testTargetGroup failed.", error);

        throw new ServerError(500, {
          code: "delete_test_target_group_failed",
        });
      }
      throw error;
    }
  }
}
