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

import { AttachedFileEntity } from "@/entities/AttachedFilesEntity";
import { SessionEntity } from "@/entities/SessionEntity";
import { StoryEntity } from "@/entities/StoryEntity";
import { TestResultEntity } from "@/entities/TestResultEntity";
import {
  ListSessionResponse,
  PatchSessionDto,
  PatchSessionResponse,
  PostSessionResponse,
  Session,
} from "@/interfaces/Sessions";
import { FileRepository } from "@/interfaces/fileRepository";
import { sessionEntityToResponse } from "@/services/helper/entityToResponse";
import { TransactionRunner } from "@/TransactionRunner";
import { getRepository } from "typeorm";
import { TestProgressServiceImpl } from "./TestProgressService";
import { TimestampService } from "./TimestampService";

export class SessionsService {
  public async postSession(
    projectId: string,
    storyId: string,
    transactionRunner: TransactionRunner
  ): Promise<PostSessionResponse> {
    const storyRepository = getRepository(StoryEntity);
    const story = await storyRepository.findOne(storyId, {
      relations: ["sessions"],
    });
    if (!story) {
      throw new Error(`Story not found. ${storyId}`);
    }

    const session = await getRepository(SessionEntity).save(
      new SessionEntity({
        name: "",
        memo: "",
        index: story.sessions.length,
        testItem: "",
        testUser: "",
        testingTime: 0,
        doneDate: "",
        story,
      })
    );

    await new TestProgressServiceImpl(
      transactionRunner
    ).saveTodayTestProgresses(projectId, storyId);

    return await this.entityToResponse(session.id);
  }

  public async patchSession(
    projectId: string,
    sessionId: string,
    requestBody: PatchSessionDto,
    service: {
      timestampService: TimestampService;
      attachedFileRepository: FileRepository;
    },
    transactionRunner: TransactionRunner
  ): Promise<PatchSessionResponse> {
    const sessionRepository = getRepository(SessionEntity);
    const updateTargetSession = await sessionRepository.findOne(sessionId, {
      relations: ["testResult", "story", "attachedFiles"],
    });
    if (!updateTargetSession) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (requestBody.attachedFiles !== undefined) {
      updateTargetSession.attachedFiles = await this.updateAttachedFiles(
        updateTargetSession,
        requestBody.attachedFiles,
        service
      );
    }

    if (requestBody.isDone !== undefined) {
      updateTargetSession.doneDate = requestBody.isDone
        ? service.timestampService.format("YYYYMMDDHHmmss")
        : "";
    }
    if (requestBody.memo !== undefined) {
      updateTargetSession.memo = requestBody.memo;
    }
    if (requestBody.testItem !== undefined) {
      updateTargetSession.testItem = requestBody.testItem;
    }
    if (requestBody.testerName !== undefined) {
      updateTargetSession.testUser = requestBody.testerName;
    }

    if (requestBody.testResultFiles) {
      if (requestBody.testResultFiles.length > 0) {
        const testResult = await getRepository(TestResultEntity).findOne(
          requestBody.testResultFiles[0].id
        );
        if (!testResult) {
          throw new Error("test result not found.");
        }
        updateTargetSession.testResult = testResult;
      } else {
        updateTargetSession.testResult = null;
      }
    }
    const result = await sessionRepository.save(updateTargetSession);

    await new TestProgressServiceImpl(
      transactionRunner
    ).saveTodayTestProgresses(projectId, result.story.id);

    return await this.entityToResponse(result.id);
  }

  public async deleteSession(
    projectId: string,
    sessionId: string,
    transactionRunner: TransactionRunner
  ): Promise<void> {
    const sessionRepository = getRepository(SessionEntity);
    const storyId = (
      await sessionRepository.findOneOrFail(sessionId, { relations: ["story"] })
    ).story.id;
    await sessionRepository.delete(sessionId);

    await new TestProgressServiceImpl(
      transactionRunner
    ).saveTodayTestProgresses(projectId, storyId);

    return;
  }

  public async getSessionIdentifiers(
    testResultId: string
  ): Promise<ListSessionResponse> {
    const sessionEntities = await getRepository(SessionEntity).find({
      testResult: { id: testResultId },
    });

    return sessionEntities.map((session) => {
      return session.id;
    });
  }

  private async updateAttachedFiles(
    existsSession: SessionEntity,
    requestAttachedFiles: PatchSessionDto["attachedFiles"],
    service: {
      timestampService: TimestampService;
      attachedFileRepository: FileRepository;
    }
  ): Promise<AttachedFileEntity[]> {
    if (!requestAttachedFiles) {
      return [];
    }

    const existsAttachedFiles = existsSession.attachedFiles ?? [];
    const result = [];

    for (const attachedFile of requestAttachedFiles) {
      if (attachedFile.fileUrl) {
        const existsAttachedFile = existsAttachedFiles.find(
          (existsAttachedFile) =>
            existsAttachedFile.fileUrl === attachedFile.fileUrl
        );
        if (!existsAttachedFile) {
          throw new Error(`AttachedFile not found: ${attachedFile.fileUrl}`);
        }
        result.push(existsAttachedFile);
      } else if (attachedFile.fileData) {
        const fileName = `${service.timestampService.unix().toString()}_${
          attachedFile.name
        }`;
        await service.attachedFileRepository.outputFile(
          fileName,
          attachedFile.fileData,
          "base64"
        );
        const attachedFileImageUrl =
          service.attachedFileRepository.getFileUrl(fileName);

        result.push(
          new AttachedFileEntity({
            session: existsSession,
            name: attachedFile.name,
            fileUrl: attachedFileImageUrl,
          })
        );
      }
    }
    return result;
  }

  private async entityToResponse(sessionId: string): Promise<Session> {
    const session = await getRepository(SessionEntity).findOne(sessionId, {
      relations: [
        "attachedFiles",
        "testResult",
        "testResult.testPurposes",
        "testResult.notes",
        "testResult.notes.testSteps",
        "testResult.notes.testSteps.screenshot",
        "testResult.notes.tags",
      ],
    });
    if (!session) {
      throw new Error(`Session not found. ${sessionId}`);
    }
    return sessionEntityToResponse(session);
  }
}
