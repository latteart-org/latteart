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

import { NoteEntity } from "@/entities/NoteEntity";
import { ScreenshotEntity } from "@/entities/ScreenshotEntity";
import { TagEntity } from "@/entities/TagEntity";
import { TestResultEntity } from "@/entities/TestResultEntity";
import {
  CreateNoteDto,
  UpdateNoteDto,
  CreateNoteResponse,
  GetNoteResponse,
  UpdateNoteResponse,
} from "@/interfaces/Notes";
import { TimestampService } from "./TimestampService";
import { FileRepository } from "@/interfaces/fileRepository";
import { VideoEntity } from "@/entities/VideoEntity";
import { DataSource } from "typeorm";

export interface NotesService {
  createNote(
    testResultId: string,
    requestBody: CreateNoteDto
  ): Promise<CreateNoteResponse>;
  getNote(noteId: string): Promise<GetNoteResponse | undefined>;
  updateNote(
    noteId: string,
    requestBody: UpdateNoteDto
  ): Promise<UpdateNoteResponse>;
  deleteNote(noteId: string): Promise<void>;
  getNoteScreenshot(noteId: string): Promise<{ id: string; fileUrl: string }>;
}

export class NotesServiceImpl implements NotesService {
  constructor(
    private dataSource: DataSource,
    private service: {
      screenshotFileRepository: FileRepository;
      timestamp: TimestampService;
    }
  ) {}

  public async createNote(
    testResultId: string,
    requestBody: CreateNoteDto
  ): Promise<CreateNoteResponse> {
    const testResultEntity = await this.dataSource
      .getRepository(TestResultEntity)
      .findOneByOrFail({ id: testResultId });

    const tagEntities = await Promise.all(
      (requestBody.tags ?? []).map(async (tagName) => {
        const tag = await this.dataSource.getRepository(TagEntity).findOneBy({
          name: tagName,
        });

        return tag ?? new TagEntity({ name: tagName });
      })
    );

    const registeredNoteEntity = await this.dataSource
      .getRepository(NoteEntity)
      .save({
        value: requestBody.value,
        details: requestBody.details,
        timestamp:
          requestBody.timestamp ?? this.service.timestamp.epochMilliseconds(),
        testResult: testResultEntity,
        tags: tagEntities,
      });

    if (requestBody.imageData) {
      const fileName = `${registeredNoteEntity.id}.png`;
      await this.service.screenshotFileRepository.outputFile(
        fileName,
        requestBody.imageData,
        "base64"
      );
      const fileUrl = requestBody.imageData
        ? this.service.screenshotFileRepository.getFileUrl(fileName)
        : "";

      const screenshotEntity = new ScreenshotEntity({
        fileUrl,
      });

      registeredNoteEntity.screenshot = screenshotEntity;
    }

    if (requestBody.videoId) {
      registeredNoteEntity.video = await this.dataSource
        .getRepository(VideoEntity)
        .findOneByOrFail({ id: requestBody.videoId });
      registeredNoteEntity.videoTime = requestBody.videoTime ?? 0;
    }

    const updatedNoteEntity = await this.dataSource
      .getRepository(NoteEntity)
      .save(registeredNoteEntity);

    return this.convertToResponse(updatedNoteEntity);
  }

  public async getNote(noteId: string): Promise<GetNoteResponse | undefined> {
    const noteEntity = await this.dataSource.getRepository(NoteEntity).findOne({
      where: { id: noteId },
      relations: ["tags", "screenshot", "video"],
    });

    if (!noteEntity) {
      return undefined;
    }

    return this.convertToResponse(noteEntity);
  }

  public async updateNote(
    noteId: string,
    requestBody: UpdateNoteDto
  ): Promise<UpdateNoteResponse> {
    const noteEntity = await this.dataSource
      .getRepository(NoteEntity)
      .findOneOrFail({
        where: { id: noteId },
        relations: ["tags", "screenshot", "video"],
      });

    const tagEntities = await Promise.all(
      (requestBody.tags ?? []).map(async (tagName) => {
        const tag = await this.dataSource.getRepository(TagEntity).findOneBy({
          name: tagName,
        });

        return tag ?? new TagEntity({ name: tagName });
      })
    );

    noteEntity.value = requestBody.value;
    noteEntity.details = requestBody.details;
    noteEntity.tags = tagEntities;

    await this.dataSource.getRepository(NoteEntity).save(noteEntity);

    return this.convertToResponse(noteEntity);
  }

  public async deleteNote(noteId: string): Promise<void> {
    const noteEntity = await this.dataSource
      .getRepository(NoteEntity)
      .findOneOrFail({
        where: { id: noteId },
        relations: ["testResult", "tags", "testSteps", "screenshot", "video"],
      });

    await this.dataSource.getRepository(NoteEntity).remove(noteEntity);
  }

  public async getNoteScreenshot(
    noteId: string
  ): Promise<{ id: string; fileUrl: string }> {
    const noteEntity = await this.dataSource.getRepository(NoteEntity).findOne({
      where: { id: noteId },
      relations: ["screenshot"],
    });

    return {
      id: noteEntity?.screenshot?.id ?? "",
      fileUrl: noteEntity?.screenshot?.fileUrl ?? "",
    };
  }

  private convertToResponse(noteEntity: NoteEntity) {
    return {
      id: noteEntity.id,
      type: "notice",
      value: noteEntity.value,
      details: noteEntity.details,
      imageFileUrl: noteEntity.screenshot?.fileUrl ?? "",
      tags: noteEntity.tags?.map((tag) => tag.name) ?? [],
      timestamp: noteEntity.timestamp,
      videoFrame: noteEntity.video
        ? {
            url: noteEntity.video.fileUrl,
            time: noteEntity.videoTime ?? 0,
            width: noteEntity.video.width,
            height: noteEntity.video.height,
          }
        : undefined,
    };
  }
}
