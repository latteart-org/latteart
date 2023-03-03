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
  GetViewPointResponse,
  PatchViewPointResponse,
  PostViewPointResponse,
} from "../interfaces/ViewPoints";
import { ServerError, ServerErrorData } from "../ServerError";
import { ViewPointsService } from "@/services/ViewPointsService";
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

@Route("/view-points/")
@Tags("view-points")
export class ViewPointsController extends Controller {
  /**
   * Get test view point.
   * @param viewPointId Test view point id.
   * @returns Test view point.
   */
  @Response<ServerErrorData<"get_view_point_failed">>(
    500,
    "Get viewPoint failed"
  )
  @SuccessResponse(200, "Success")
  @Get("{viewPointId}")
  public async getTestViewPoint(
    @Path() viewPointId: string
  ): Promise<GetViewPointResponse> {
    try {
      return await new ViewPointsService().get(viewPointId);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Get viewPoint failed.", error);

        throw new ServerError(500, {
          code: "get_view_point_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Add test view point to test matrix.
   * @param body Target test matrix id/test view point.
   * @returns Created test view point.
   */
  @Response<ServerErrorData<"post_view_point_failed">>(
    500,
    "Post viewPoint failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async addViewPoint(
    @Body()
    body: {
      testMatrixId: string;
      name: string;
      index: number;
      description: string;
    }
  ): Promise<PostViewPointResponse> {
    try {
      return await new ViewPointsService().post(body, transactionRunner);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Post viewPoint failed.", error);

        throw new ServerError(500, {
          code: "post_view_point_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Update some information in the test view point to the specified.
   * @param viewPointId Target test view point id.
   * @param body Test view point.
   * @returns Updated test view point.
   */
  @Response<ServerErrorData<"patch_view_point_failed">>(
    500,
    "Patch viewPoint failed"
  )
  @SuccessResponse(200, "Success")
  @Patch("{viewPointId}")
  public async updateViewPoint(
    @Path() viewPointId: string,
    @Body()
    body: { name?: string; description?: string; index?: number }
  ): Promise<PatchViewPointResponse> {
    try {
      return await new ViewPointsService().patch(viewPointId, body);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Patch viewPoint failed.", error);

        throw new ServerError(500, {
          code: "patch_view_point_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Delete test view point.
   * @param viewPointId Target test view point id.
   */
  @Response<ServerErrorData<"delete_view_point_failed">>(
    500,
    "Delete viewPoint failed"
  )
  @SuccessResponse(204, "Success")
  @Delete("{viewPointId}")
  public async deleteViewPoint(@Path() viewPointId: string): Promise<void> {
    try {
      return await new ViewPointsService().delete(viewPointId);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Delete viewPoint failed.", error);

        throw new ServerError(500, {
          code: "delete_view_point_failed",
        });
      }
      throw error;
    }
  }
}
