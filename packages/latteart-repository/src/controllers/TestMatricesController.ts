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
  GetTestMatrixResponse,
  PatchTestMatrixResponse,
  PostTestMatrixResponse,
} from "../interfaces/TestMatrices";
import { ServerError, ServerErrorData } from "../ServerError";
import { TestMatricesService } from "@/services/TestMatricesService";
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

@Route("/test-matrices/")
@Tags("test-matrices")
export class TestMatricesController extends Controller {
  /**
   * Get test matrix.
   * @param testMatrixId Target test matrix id.
   * @returns Test matrix.
   */
  @Response<ServerErrorData<"get_test_matrix_failed">>(
    500,
    "Get testMatrix failed"
  )
  @SuccessResponse(200, "Success")
  @Get("{testMatrixId}")
  public async getTestMatrix(
    @Path() testMatrixId: string
  ): Promise<GetTestMatrixResponse> {
    try {
      return await new TestMatricesService().get(testMatrixId);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Get testMatrix failed.", error);

        throw new ServerError(500, {
          code: "get_test_matrix_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Create test matrix.
   * @param body Target project id and test matrix name.
   * @returns Created test matrix.
   */
  @Response<ServerErrorData<"get_test_matrix_failed">>(
    500,
    "Post testMatrix failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async createTestMatrix(
    @Body() body: { projectId: string; name: string }
  ): Promise<PostTestMatrixResponse> {
    try {
      return await new TestMatricesService().post(body);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Post testMatrix failed.", error);

        throw new ServerError(500, {
          code: "get_test_matrix_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Update some information in the test matrix to the specified.
   * @param testMatrixId Target test matrix id.
   * @param body Test matrix name.
   * @returns Updated test matrix.
   */
  @Response<ServerErrorData<"get_test_matrix_failed">>(
    500,
    "Patch testMatrix failed"
  )
  @SuccessResponse(200, "Success")
  @Patch("{testMatrixId}")
  public async updateTestMatrix(
    @Path() testMatrixId: string,
    @Body() body: { name: string }
  ): Promise<PatchTestMatrixResponse> {
    try {
      return await new TestMatricesService().patch(testMatrixId, body);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Patch testMatrix failed.", error);

        throw new ServerError(500, {
          code: "get_test_matrix_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Delete test matrix.
   * @param testMatrixId Target test matrix id.
   */
  @Response<ServerErrorData<"delete_test_matrix_failed">>(
    500,
    "Delete testMatrix failed"
  )
  @SuccessResponse(204, "Success")
  @Delete("{testMatrixId}")
  public async deleteTestMatrix(@Path() testMatrixId: string): Promise<void> {
    try {
      return await new TestMatricesService().delete(
        testMatrixId,
        transactionRunner
      );
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Delete testMatrix failed.", error);

        throw new ServerError(500, {
          code: "delete_test_matrix_failed",
        });
      }
      throw error;
    }
  }
}
