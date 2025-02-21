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

import { ServerError, ServerErrorData } from "../ServerError";
import {
  Controller,
  Body,
  Route,
  Path,
  Post,
  Delete,
  Tags,
  Response,
  SuccessResponse,
  Get,
  Put,
} from "tsoa";
import { createLogger } from "@/logger/logger";
import { TestHintsService } from "../services/TestHintsService";
import {
  GetTestHintResponse,
  PostTestHintDto,
  PostTestHintResponse,
  PutTestHintDto,
  PutTestHintResponse,
} from "../interfaces/TestHints";
import { AppDataSource } from "@/data-source";

@Route("test-hints")
@Tags("test-hints")
export class TesthintsController extends Controller {
  /**
   * Get all test hints.
   * @returns All test hints.
   */
  @Response<ServerErrorData<"get_all_test_hints_failed">>(
    500,
    "Get AllTestHints failed"
  )
  @SuccessResponse(200, "Success")
  @Get()
  public async getAllTestHints(): Promise<GetTestHintResponse> {
    try {
      return await new TestHintsService(AppDataSource).getAllTestHints();
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Get AllTestHints failed.", error);

        throw new ServerError(500, {
          code: "get_all_test_hints_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Register test hint.
   * @param requestBody Test hint.
   * @returns Registered test hint.
   */
  @Response<ServerErrorData<"post_test_hint_failed">>(
    500,
    "Post TestHint failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async postTestHint(
    @Body() requestBody: PostTestHintDto
  ): Promise<PostTestHintResponse> {
    try {
      return await new TestHintsService(AppDataSource).postTestHint(
        requestBody
      );
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Post TestHint failed.", error);

        throw new ServerError(500, {
          code: "post_test_hint_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Update test hint.
   * @param testHintId Test hint id.
   * @param requestBody Test hint.
   * @returns Updated test hint.
   */
  @Response<ServerErrorData<"put_test_hint_failed">>(500, "Put testHint failed")
  @SuccessResponse(200, "Success")
  @Put("{testHintId}")
  public async putTestHint(
    @Path() testHintId: string,
    @Body() requestBody: PutTestHintDto
  ): Promise<PutTestHintResponse> {
    try {
      return await new TestHintsService(AppDataSource).putTestHint(
        testHintId,
        requestBody
      );
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Put Testhint failed.", error);

        throw new ServerError(500, {
          code: "put_test_hint_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Delete test hint.
   * @param testHintId Test hint id.
   */
  @Response<ServerErrorData<"delete_test_hint_failed">>(
    500,
    "Delete testHint failed"
  )
  @SuccessResponse(204, "Success")
  @Delete("{testHintId}")
  public async deleteTestHint(@Path() testHintId: string): Promise<void> {
    try {
      return await new TestHintsService(AppDataSource).deleteTestHint(
        testHintId
      );
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Delete Testhint failed.", error);

        throw new ServerError(500, {
          code: "delete_test_hint_failed",
        });
      }
      throw error;
    }
  }
}
