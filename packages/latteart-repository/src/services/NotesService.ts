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
import { getRepository } from "typeorm";
import { TimestampService } from "./TimestampService";
import { FileRepository } from "@/interfaces/fileRepository";

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
    private service: {
      screenshotFileRepository: FileRepository;
      timestamp: TimestampService;
    }
  ) {}

  public async createNote(
    testResultId: string,
    requestBody: CreateNoteDto
  ): Promise<CreateNoteResponse> {
    const testResultEntity = await getRepository(
      TestResultEntity
    ).findOneOrFail(testResultId);

    const tagEntities = await Promise.all(
      (requestBody.tags ?? []).map(async (tagName) => {
        const tag = await getRepository(TagEntity).findOne({ name: tagName });

        return tag ?? new TagEntity({ name: tagName });
      })
    );

    const registeredNoteEntity = await getRepository(NoteEntity).save({
      value: requestBody.value,
      details: requestBody.details,
      timestamp: this.service.timestamp.unix(),
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
        testResult: testResultEntity,
      });

      registeredNoteEntity.screenshot = screenshotEntity;
    }

    const updatedNoteEntity = await getRepository(NoteEntity).save(
      registeredNoteEntity
    );

    return {
      id: updatedNoteEntity.id,
      type: "notice",
      value: updatedNoteEntity.value,
      details: updatedNoteEntity.details,
      imageFileUrl: updatedNoteEntity.screenshot?.fileUrl ?? "",
      tags: updatedNoteEntity.tags.map((tag) => tag.name),
    };
  }

  public async getNote(noteId: string): Promise<GetNoteResponse | undefined> {
    const noteEntity = await getRepository(NoteEntity).findOne(noteId, {
      relations: ["tags", "screenshot"],
    });

    if (!noteEntity) {
      return undefined;
    }

    return {
      id: noteEntity.id,
      type: "notice",
      value: noteEntity.value,
      details: noteEntity.details,
      imageFileUrl: noteEntity.screenshot?.fileUrl ?? "",
      tags: noteEntity.tags?.map((tag) => tag.name) ?? [],
    };
  }

  public async updateNote(
    noteId: string,
    requestBody: UpdateNoteDto
  ): Promise<UpdateNoteResponse> {
    const noteEntity = await getRepository(NoteEntity).findOneOrFail(noteId, {
      relations: ["tags", "screenshot"],
    });

    const tagEntities = await Promise.all(
      (requestBody.tags ?? []).map(async (tagName) => {
        const tag = await getRepository(TagEntity).findOne({ name: tagName });

        return tag ?? new TagEntity({ name: tagName });
      })
    );

    noteEntity.value = requestBody.value;
    noteEntity.details = requestBody.details;
    noteEntity.tags = tagEntities;

    await getRepository(NoteEntity).save(noteEntity);

    return {
      id: noteEntity.id,
      type: "notice",
      value: noteEntity.value,
      details: noteEntity.details,
      imageFileUrl: noteEntity.screenshot?.fileUrl ?? "",
      tags: noteEntity.tags.map((tag) => tag.name),
    };
  }

  public async deleteNote(noteId: string): Promise<void> {
    const noteEntity = await getRepository(NoteEntity).findOneOrFail(noteId, {
      relations: ["testResult", "tags", "testSteps", "screenshot"],
    });

    await getRepository(NoteEntity).remove(noteEntity);
  }

  public async getNoteScreenshot(
    noteId: string
  ): Promise<{ id: string; fileUrl: string }> {
    const noteEntity = await getRepository(NoteEntity).findOne(noteId, {
      relations: ["screenshot"],
    });

    return {
      id: noteEntity?.screenshot?.id ?? "",
      fileUrl: noteEntity?.screenshot?.fileUrl ?? "",
    };
  }
}
