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
import { DataSource, EntityManager, In } from "typeorm";
import { TestProgressServiceImpl } from "./TestProgressService";
import { TimestampService } from "./TimestampService";
import { TransactionRunner } from "@/TransactionRunner";

export class SessionsService {
  constructor(private dataSource: DataSource) {}

  public async postSession(
    projectId: string,
    storyId: string
  ): Promise<PostSessionResponse> {
    const storyRepository = this.dataSource.getRepository(StoryEntity);
    const story = await storyRepository.findOne({
      where: { id: storyId },
      relations: ["sessions"],
    });
    if (!story) {
      throw new Error(`Story not found. ${storyId}`);
    }

    const session = await this.dataSource.getRepository(SessionEntity).save(
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

    await new TestProgressServiceImpl(this.dataSource).saveTodayTestProgresses(
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
      transactionRunner: TransactionRunner;
    }
  ): Promise<PatchSessionResponse> {
    const sessionRepository = this.dataSource.getRepository(SessionEntity);
    const updateTargetSession = await sessionRepository.findOne({
      where: { id: sessionId },
      relations: ["testResults", "story", "attachedFiles"],
    });
    if (!updateTargetSession) {
      throw new Error(`Session not found: ${sessionId}`);
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
        const testResults = await this.dataSource
          .getRepository(TestResultEntity)
          .find({
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
    let savedSessionId = "";
    await service.transactionRunner.waitAndRun(
      async (transactionalEntityManager) => {
        const result =
          await transactionalEntityManager.save(updateTargetSession);
        savedSessionId = result.id;

        await new TestProgressServiceImpl(
          this.dataSource
        ).saveTodayTestProgresses(projectId, result.story.id);

        if (requestBody.attachedFiles !== undefined) {
          await this.updateAttachedFiles(
            result,
            requestBody.attachedFiles,
            transactionalEntityManager,
            service
          );
        }
      }
    );

    return await this.entityToResponse(savedSessionId);
  }

  public async deleteSession(
    projectId: string,
    sessionId: string
  ): Promise<void> {
    const sessionRepository = this.dataSource.getRepository(SessionEntity);
    const storyId = (
      await sessionRepository.findOneOrFail({
        where: { id: sessionId },
        relations: ["story"],
      })
    ).story.id;
    await sessionRepository.delete(sessionId);

    await new TestProgressServiceImpl(this.dataSource).saveTodayTestProgresses(
      projectId,
      storyId
    );

    return;
  }

  public async getSessionIdentifiers(
    testResultId: string
  ): Promise<ListSessionResponse> {
    const testResultEntity = await this.dataSource
      .getRepository(TestResultEntity)
      .findOneOrFail({ where: { id: testResultId }, relations: ["sessions"] });

    return testResultEntity.sessions?.map(({ id }) => id) ?? [];
  }

  public async getAttachedFile(
    fileName: string,
    service: {
      attachedFileRepository: FileRepository;
    }
  ): Promise<string | Buffer> {
    return await service.attachedFileRepository.readFile(fileName, "base64");
  }

  private async updateAttachedFiles(
    session: SessionEntity,
    requestAttachedFiles: PatchSessionDto["attachedFiles"],
    entityManager: EntityManager,
    service: {
      timestampService: TimestampService;
      attachedFileRepository: FileRepository;
    }
  ): Promise<void> {
    const existsAttachedFile = await entityManager.find(AttachedFileEntity, {
      where: { sessionId: session.id },
    });

    const addFile = requestAttachedFiles?.filter((newFile) => newFile.fileData);
    await Promise.all(
      (addFile ?? []).map(async (file) => {
        const fileName = `${service.timestampService.unix().toString()}_${
          file.name
        }`;
        const attachedFileImageUrl =
          service.attachedFileRepository.getFileUrl(fileName);
        await service.attachedFileRepository.outputFile(
          fileName,
          file.fileData as string,
          "base64"
        );
        await entityManager.save(
          new AttachedFileEntity({
            sessionId: session.id,
            session,
            name: fileName,
            fileUrl: attachedFileImageUrl,
          })
        );
      })
    );

    let deleteFile: AttachedFileEntity[] = [];
    if (
      requestAttachedFiles === undefined ||
      requestAttachedFiles.length === 0
    ) {
      deleteFile = existsAttachedFile;
    } else {
      deleteFile = existsAttachedFile.filter(
        (existsFile) =>
          !requestAttachedFiles.find(
            (newFile) => existsFile.name === newFile.name
          )
      );
    }
    await Promise.all(
      deleteFile.map(async (file) => {
        await entityManager.delete(AttachedFileEntity, {
          sessionId: file.sessionId,
          fileUrl: file.fileUrl,
          name: file.name,
        });
      })
    );
  }

  private async entityToResponse(sessionId: string): Promise<Session> {
    const session = await this.dataSource.getRepository(SessionEntity).findOne({
      where: { id: sessionId },
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
