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

import { ScreenshotEntity } from "@/entities/ScreenshotEntity";
import { CreateCompressedImageResponse } from "@/interfaces/CompressedImage";
import path from "path";
import { TestStepService } from "./TestStepService";
import { NotesServiceImpl } from "./NotesService";
import { FileRepository } from "@/interfaces/fileRepository";
import { CommandExecutor } from "@/interfaces/commandExecutor";
import { Logger } from "@/interfaces/logger";
import { DataSource } from "typeorm";

export class CompressedImageService {
  constructor(
    private dataSource: DataSource,
    private service: {
      screenshotFileRepository: FileRepository;
      testStep: TestStepService;
      note: NotesServiceImpl;
      commandExecutor: CommandExecutor;
      logger: Logger;
    }
  ) {}

  public async compressImage(
    testStepId: string,
    option: {
      shouldDeleteOriginalFile: boolean;
    }
  ): Promise<CreateCompressedImageResponse> {
    console.log(testStepId);

    const originalScreenshot =
      await this.service.testStep.getTestStepScreenshot(testStepId);

    return this.compressAndSaveImage(
      originalScreenshot,
      option.shouldDeleteOriginalFile
    );
  }

  public async compressImageForNote(
    noteId: string,
    option: {
      shouldDeleteOriginalFile: boolean;
    }
  ): Promise<CreateCompressedImageResponse> {
    console.log(noteId);

    const originalScreenshot =
      await this.service.note.getNoteScreenshot(noteId);

    return this.compressAndSaveImage(
      originalScreenshot,
      option.shouldDeleteOriginalFile
    );
  }

  private async compressAndSaveImage(
    originalScreenshot: {
      id: string;
      fileUrl: string;
    },
    shouldDeleteOriginalFile: boolean
  ) {
    const compressedImageFileUrl = await this.executeCompressionCommand(
      originalScreenshot.fileUrl,
      shouldDeleteOriginalFile
    );

    const updatedScreenshotUrl = await this.updateScreenshotEntity(
      originalScreenshot.id,
      compressedImageFileUrl
    );

    return { imageFileUrl: updatedScreenshotUrl };
  }

  private async executeCompressionCommand(
    originalImageFileUrl: string,
    shouldDeleteOriginalFile: boolean
  ) {
    const originalFileName =
      originalImageFileUrl?.split("/").slice(-1)[0] ?? "";
    const originalFilePath =
      this.service.screenshotFileRepository.getFilePath(originalFileName);

    const compressedImageFileName = `${path.basename(
      originalFileName,
      path.extname(originalFileName)
    )}.webp`;

    const command = `cwebp ${originalFilePath} -o ${path.dirname(
      originalFilePath
    )}/${compressedImageFileName}`;

    this.service.logger.debug(`command: ${command}`);

    await this.service.commandExecutor.execute(command);

    const compressedImageFileUrl =
      this.service.screenshotFileRepository.getFileUrl(compressedImageFileName);

    if (shouldDeleteOriginalFile) {
      this.service.screenshotFileRepository.removeFile(originalFileName);
    }

    return compressedImageFileUrl;
  }

  private async updateScreenshotEntity(
    screenshotId: string,
    newScreenshotUrl: string
  ) {
    const screenshotRepository =
      this.dataSource.getRepository(ScreenshotEntity);

    const screenshotEntity = await screenshotRepository.findOneByOrFail({
      id: screenshotId,
    });

    screenshotEntity.fileUrl = newScreenshotUrl;

    const updatedScreenshotEntity =
      await screenshotRepository.save(screenshotEntity);

    return updatedScreenshotEntity.fileUrl;
  }
}
