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
import { ScreenshotsService } from "@/services/ScreenshotsService";
import { TimestampServiceImpl } from "@/services/TimestampService";
import {
  Controller,
  Route,
  Path,
  Get,
  Tags,
  Response,
  SuccessResponse,
} from "tsoa";
import { createFileRepositoryManager } from "@/gateways/fileRepository";
import { createLogger } from "@/logger/logger";

@Route("test-results/{testResultId}/screenshots")
@Tags("test-results")
export class ScreenshotsController extends Controller {
  /**
   * Output screenshot files of all test results.
   * @param testResultId Target test result id.
   * @returns Download url for the output screenshot file.
   */
  @Response<ServerErrorData<"get_screenshots_failed">>(
    500,
    "Get screenshots failed"
  )
  @SuccessResponse(200, "Success")
  @Get()
  public async outputTestResultScreenshots(
    @Path() testResultId: string
  ): Promise<{ url: string }> {
    const timestampService = new TimestampServiceImpl();
    const fileRepositoryManager = await createFileRepositoryManager();
    const tempFileRepository = fileRepositoryManager.getRepository("temp");
    const workingFileRepository = fileRepositoryManager.getRepository("work");
    try {
      const url = await new ScreenshotsService().getScreenshots(
        testResultId,
        tempFileRepository,
        workingFileRepository,
        timestampService
      );
      return { url };
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Get screenshots failed.", error);

        throw new ServerError(500, {
          code: "get_screenshots_failed",
        });
      }
      throw error;
    }
  }
}
