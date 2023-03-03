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
import { TimestampServiceImpl } from "@/services/TimestampService";
import {
  Controller,
  Body,
  Patch,
  Route,
  Path,
  Post,
  Delete,
  Tags,
  Response,
  SuccessResponse,
} from "tsoa";
import { transactionRunner } from "..";

import {
  PatchSessionDto,
  PatchSessionResponse,
  PostSessionResponse,
} from "../interfaces/Sessions";
import { SessionsService } from "../services/SessionsService";
import { createFileRepositoryManager } from "@/gateways/fileRepository";
import { createLogger } from "@/logger/logger";

@Route("projects/{projectId}/sessions")
@Tags("projects")
export class SessionsController extends Controller {
  /**
   * Create session with the given story.
   * @param projectId Target project id.
   * @param requestBody Target story id.
   * @returns Created session
   */
  @Response<ServerErrorData<"post_session_failed">>(500, "Post session failed")
  @SuccessResponse(200, "Success")
  @Post("")
  public async createSession(
    @Path() projectId: string,
    @Body() requestBody: { storyId: string }
  ): Promise<PostSessionResponse> {
    try {
      return await new SessionsService().postSession(
        projectId,
        requestBody.storyId,
        transactionRunner
      );
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Post session failed.", error);

        throw new ServerError(500, {
          code: "post_session_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Update some session information to the specified.
   * @param projectId Target project id.
   * @param sessionId Target session id.
   * @param requestBody Session.
   * @returns Updated session.
   */
  @Response<ServerErrorData<"patch_session_failed">>(
    500,
    "Patch session failed"
  )
  @SuccessResponse(200, "Success")
  @Patch("{sessionId}")
  public async updateSession(
    @Path() projectId: string,
    @Path() sessionId: string,
    @Body() requestBody: PatchSessionDto
  ): Promise<PatchSessionResponse> {
    const fileRepositoryManager = await createFileRepositoryManager();
    const attachedFileRepository =
      fileRepositoryManager.getRepository("attachedFile");
    try {
      return await new SessionsService().patchSession(
        projectId,
        sessionId,
        requestBody,
        {
          timestampService: new TimestampServiceImpl(),
          attachedFileRepository,
        },
        transactionRunner
      );
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Patch session failed.", error);

        throw new ServerError(500, {
          code: "patch_session_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Delete the session.
   * @param projectId Target project id.
   * @param sessionId Target session id.
   */
  @Response<ServerErrorData<"delete_session_failed">>(
    500,
    "Delete session failed"
  )
  @SuccessResponse(204, "Success")
  @Delete("{sessionId}")
  public async deleteSession(
    @Path() projectId: string,
    @Path() sessionId: string
  ): Promise<void> {
    try {
      await new SessionsService().deleteSession(
        projectId,
        sessionId,
        transactionRunner
      );
      return;
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Delete session failed.", error);

        throw new ServerError(500, {
          code: "delete_session_failed",
        });
      }
      throw error;
    }
  }
}
