/**
 * Copyright 2024 NTT Corporation.
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

import { CreateCompressedImageResponse } from "../interfaces/CompressedImage";
import {
  Controller,
  Post,
  Route,
  Path,
  Response,
  SuccessResponse,
  Tags,
} from "tsoa";
import { CompressedImageService } from "../services/CompressedImageService";
import { CommandExecutorImpl } from "@/gateways/commandExecutor";
import { TestStepServiceImpl } from "@/services/TestStepService";
import { NotesServiceImpl } from "@/services/NotesService";
import { ConfigsService } from "@/services/ConfigsService";
import { TimestampServiceImpl } from "@/services/TimestampService";
import { ServerError, ServerErrorData } from "../ServerError";
import { createFileRepositoryManager } from "@/gateways/fileRepository";
import { createLogger } from "@/logger/logger";
import { AppDataSource } from "@/data-source";

@Route("test-results/{testResultId}/test-steps/{testStepId}/compressed-image")
@Tags("test-results")
export class CompressedImageController extends Controller {
  /**
   * Compress test step screenshot.
   * @param testResultId Target test result id.
   * @param testStepId Target test step id.
   * @returns Image url after compression.
   */
  @Response<ServerErrorData<"compress_test_step_image_failed">>(
    500,
    "Compress test step image failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async compressTestStepScreenshot(
    @Path() testResultId: string,
    @Path() testStepId: string
  ): Promise<CreateCompressedImageResponse> {
    console.log("CompressedImageController - compressTestStepScreenshot");

    const timestampService = new TimestampServiceImpl();
    const fileRepositoryManager = await createFileRepositoryManager();
    const screenshotFileRepository =
      fileRepositoryManager.getRepository("screenshot");

    const testStepService = new TestStepServiceImpl(AppDataSource, {
      screenshotFileRepository,
      timestamp: timestampService,
      config: new ConfigsService(AppDataSource),
    });
    const noteService = new NotesServiceImpl(AppDataSource, {
      screenshotFileRepository,
      timestamp: timestampService,
    });
    const logger = createLogger();

    try {
      return new CompressedImageService(AppDataSource, {
        screenshotFileRepository,
        testStep: testStepService,
        note: noteService,
        commandExecutor: new CommandExecutorImpl(),
        logger,
      }).compressImage(testStepId, {
        shouldDeleteOriginalFile: true,
      });
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Compress test step image failed.", error);

        throw new ServerError(500, {
          code: "compress_test_step_image_failed",
        });
      }
      throw error;
    }
  }
}
