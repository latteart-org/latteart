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
import { CommandExecutionServiceImpl } from "@/services/CommandExecutionService";
import { TestStepServiceImpl } from "@/services/TestStepService";
import { NotesServiceImpl } from "@/services/NotesService";
import { ConfigsService } from "@/services/ConfigsService";
import { TimestampServiceImpl } from "@/services/TimestampService";
import { ImageFileRepositoryServiceImpl } from "@/services/ImageFileRepositoryService";
import { screenshotDirectoryService } from "..";
import LoggingService from "@/logger/LoggingService";
import { ServerError, ServerErrorData } from "../ServerError";

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
    const imageFileRepositoryService = new ImageFileRepositoryServiceImpl({
      staticDirectory: screenshotDirectoryService,
    });

    const testStepService = new TestStepServiceImpl({
      imageFileRepository: imageFileRepositoryService,
      timestamp: timestampService,
      config: new ConfigsService(),
    });
    const noteService = new NotesServiceImpl({
      imageFileRepository: imageFileRepositoryService,
      timestamp: timestampService,
    });

    try {
      return new CompressedImageService({
        imageFileRepository: imageFileRepositoryService,
        testStep: testStepService,
        note: noteService,
        commandExecution: new CommandExecutionServiceImpl(),
      }).compressImage(testStepId, {
        shouldDeleteOriginalFile: (await new ConfigsService().getConfig(""))
          .config.imageCompression.isDeleteSrcImage,
      });
    } catch (error) {
      if (error instanceof Error) {
        LoggingService.error("Compress test step image failed.", error);

        throw new ServerError(500, {
          code: "compress_test_step_image_failed",
        });
      }
      throw error;
    }
  }
}
