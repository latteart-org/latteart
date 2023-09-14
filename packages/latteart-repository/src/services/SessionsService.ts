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
import { In, getRepository } from "typeorm";
import { TestProgressServiceImpl } from "./TestProgressService";
import { TimestampService } from "./TimestampService";

export class SessionsService {
  public async postSession(
    projectId: string,
    storyId: string
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
        doneDate: "",
        story,
        testResults: [],
      })
    );

    await new TestProgressServiceImpl().saveTodayTestProgresses(
      projectId,
      storyId
    );

    return await this.entityToResponse(session.id);
  }

  public async patchSession(
    projectId: string,
    sessionId: string,
    requestBody: PatchSessionDto,
    service: {
      timestampService: TimestampService;
      attachedFileRepository: FileRepository;
    }
  ): Promise<PatchSessionResponse> {
    const sessionRepository = getRepository(SessionEntity);
    const updateTargetSession = await sessionRepository.findOne(sessionId, {
      relations: ["testResults", "story", "attachedFiles"],
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
        const testResults = await getRepository(TestResultEntity).find({
          where: {
            id: In(
              requestBody.testResultFiles.map(
                (testResultFile) => testResultFile.id
              )
            ),
          },
        });
        if (testResults.length !== requestBody.testResultFiles.length) {
          throw new Error(
            `test result not found. request(${requestBody.testResultFiles.map(
              (result) => result.id
            )}, exists(${testResults.map((result) => result.id)})`
          );
        }
        updateTargetSession.testResults = testResults;
      } else {
        updateTargetSession.testResults = [];
      }
    }
    const result = await sessionRepository.save(updateTargetSession);

    await new TestProgressServiceImpl().saveTodayTestProgresses(
      projectId,
      result.story.id
    );

    return await this.entityToResponse(result.id);
  }

  public async deleteSession(
    projectId: string,
    sessionId: string
  ): Promise<void> {
    const sessionRepository = getRepository(SessionEntity);
    const storyId = (
      await sessionRepository.findOneOrFail(sessionId, { relations: ["story"] })
    ).story.id;
    await sessionRepository.delete(sessionId);

    await new TestProgressServiceImpl().saveTodayTestProgresses(
      projectId,
      storyId
    );

    return;
  }

  public async getSessionIdentifiers(
    testResultId: string
  ): Promise<ListSessionResponse> {
    const sessionEntities = await getRepository(SessionEntity).find({
      relations: ["testResults"],
      where: {
        testResults: {
          id: testResultId,
        },
      },
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
        "testResults",
        "testResults.testPurposes",
        "testResults.testPurposes.testSteps",
        "testResults.notes",
        "testResults.notes.testSteps",
        "testResults.notes.testSteps.screenshot",
        "testResults.notes.testSteps.video",
        "testResults.notes.tags",
        "testResults.notes.screenshot",
        "testResults.notes.video",
      ],
    });
    if (!session) {
      throw new Error(`Session not found. ${sessionId}`);
    }
    return sessionEntityToResponse(session);
  }
}
