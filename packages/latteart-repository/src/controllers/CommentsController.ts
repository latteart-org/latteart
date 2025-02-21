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

import { ServerError, ServerErrorData } from "@/ServerError";
import { AppDataSource } from "@/data-source";
import { CreateCommentDto, CreateCommentResponse } from "@/interfaces/Comments";

import { createLogger } from "@/logger/logger";
import { CommentsService } from "@/services/CommentsService";
import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Query,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";

@Route("test-results/{testResultId}/comments")
@Tags("test-results")
export class CommentsController extends Controller {
  /**
   * Get comments
   * @param testResultId Test result id.
   * @returns Comments.
   */
  @Response<ServerErrorData<"get_comment_failed">>(500, "get_comment_failed")
  @SuccessResponse(200, "Success")
  @Get()
  public async getComments(
    @Path() testResultId: string,
    @Query() since?: number,
    @Query() until?: number
  ): Promise<CreateCommentResponse[]> {
    try {
      const filter = { since, until };
      return new CommentsService(AppDataSource).getComments(
        testResultId,
        filter
      );
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Get Comment failed.", error);

        throw new ServerError(500, {
          code: "get_comment_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Register comment.
   * @param testResultId Test result id.
   * @returns Registered comment.
   */
  @Response<ServerErrorData<"post_comment_failed">>(500, "post_comment_failed")
  @SuccessResponse(200, "Success")
  @Post()
  public async postComment(
    @Path() testResultId: string,
    @Body() body: CreateCommentDto
  ): Promise<CreateCommentResponse> {
    try {
      return new CommentsService(AppDataSource).postComment(
        testResultId,
        body.value,
        body.timestamp
      );
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Post Comment failed.", error);

        throw new ServerError(500, {
          code: "post_comment_failed",
        });
      }
      throw error;
    }
  }
}
