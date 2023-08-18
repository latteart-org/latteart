/**
 * Copyright 2023 NTT Corporation.
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

import { createFileRepositoryManager } from "@/gateways/fileRepository";
import { Video } from "@/interfaces/Videos";
import { createLogger } from "@/logger/logger";
import { ServerError, ServerErrorData } from "@/ServerError";
import { VideoService } from "@/services/VideoService";
import {
  Body,
  Controller,
  Post,
  Patch,
  Path,
  Route,
  Response,
  SuccessResponse,
} from "tsoa";

@Route("videos")
export class Videos extends Controller {
  /**
   * Create video.
   * @returns Created video information.
   */
  @Response<ServerErrorData<"create_video_failed">>(500, "Create video failed")
  @SuccessResponse(200, "Success")
  @Post()
  public async createVideo(): Promise<Video> {
    try {
      const fileRepositoryManager = await createFileRepositoryManager();
      const videoFileRepository = fileRepositoryManager.getRepository("video");

      return await new VideoService({ videoFileRepository }).createVideo();
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Create video failed", error);
        throw new ServerError(500, {
          code: "create_video_failed",
        });
      }
      throw error;
    }
  }

  @Patch("{videoId}")
  public async patch(
    @Path() videoId: string,
    @Body() requestBody: { base64: string }
  ): Promise<void> {
    try {
      const fileRepositoryManager = await createFileRepositoryManager();
      const videoFileRepository = fileRepositoryManager.getRepository("video");

      await new VideoService({ videoFileRepository }).append(
        videoId,
        requestBody.base64
      );
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Save video failed.", error);

        throw new ServerError(500, {
          code: "save_video_failed",
        });
      }
      throw error;
    }
  }
}
