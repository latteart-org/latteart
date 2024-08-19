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

import path from "path";
import { deserializeTestResult } from "@/services/helper/testResultImportHelper";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { TestStepEntity } from "@/entities/TestStepEntity";
import { ScreenshotEntity } from "@/entities/ScreenshotEntity";
import { TestPurposeEntity } from "@/entities/TestPurposeEntity";
import { NoteEntity } from "@/entities/NoteEntity";
import { CoverageSourceEntity } from "@/entities/CoverageSourceEntity";
import { TagEntity } from "@/entities/TagEntity";
import { TimestampService } from "./TimestampService";
import { FileRepository } from "@/interfaces/fileRepository";
import { ImportFileRepository } from "@/interfaces/importFileRepository";
import {
  DeserializedTestResult,
  DeserializedTestStep,
} from "@/interfaces/exportData";
import { VideoEntity } from "@/entities/VideoEntity";
import { VideoFrame } from "@/interfaces/Videos";
import { DataSource } from "typeorm";
import { extracttData, TestResultData } from "@/domain/dataExtractor";
import { deserializeComments } from "./helper/commentHelper";
import { MutationService } from "./MutationsService";
import { CommentsService } from "./CommentsService";
import { deserializeMutations } from "./helper/mutationHelper";

export interface TestResultImportService {
  importTestResult(
    importFile: { data: string; name: string },
    testResultId: string | null
  ): Promise<{
    testResultId: string;
  }>;
  saveImportFileDatas(
    ...args: {
      importFileData: {
        testResultFile: {
          fileName: string;
          data: string;
        };
        fileData: {
          filePath: string;
          data: Buffer;
        }[];
      };
      testResultId: string | null;
    }[]
  ): Promise<
    {
      newTestResultId: string;
      oldTestResultId?: string;
    }[]
  >;
  saveTestResultFileData(
    importFileData: {
      testResultFile: {
        fileName: string;
        data: string;
      };
      fileData: {
        filePath: string;
        data: Buffer;
      }[];
    },
    testResultId: string | null
  ): Promise<{ newTestResultId: string; oldTestResultId?: string }>;
}

export class TestResultImportServiceImpl implements TestResultImportService {
  constructor(
    private dataSource: DataSource,
    private service: {
      importFileRepository: ImportFileRepository;
      screenshotFileRepository: FileRepository;
      videoFileRepository: FileRepository;
      timestamp: TimestampService;
      mutationService: MutationService;
      commentsService: CommentsService;
    }
  ) {}

  public async importTestResult(
    importFile: { data: string; name: string },
    testResultId: string | null
  ): Promise<{
    testResultId: string;
  }> {
    console.log(importFile.name);

    const { testResultData, commentFiles, mutationFiles, mutationImageFiles } =
      await this.readImportFile(importFile.data);

    const { newTestResultId } = await this.saveTestResultFileData(
      testResultData,
      testResultId
    );

    const commentsDatas = extracttData("comments.json", commentFiles);
    const importCommentsData = deserializeComments(
      commentsDatas,
      newTestResultId
    );
    await this.service.commentsService.importComments(importCommentsData);

    const mutationsDatas = extracttData("mutations.json", mutationFiles);
    const importMutationsData = deserializeMutations(
      mutationsDatas,
      newTestResultId
    );
    await this.service.mutationService.importMutations(
      importMutationsData,
      mutationImageFiles,
      this.service.screenshotFileRepository
    );

    return {
      testResultId: newTestResultId,
    };
  }

  private async readImportFile(base64FileData: string) {
    const files = await this.service.importFileRepository.read(base64FileData);
    const testResultFile = files.find((file) => file.filePath === "log.json");

    if (!testResultFile || typeof testResultFile.data !== "string") {
      throw Error("Invalid test result file.");
    }

    const fileData = files
      .filter((file): file is { filePath: string; data: Buffer } => {
        return (
          [".png", ".webp", ".webm"].includes(path.extname(file.filePath)) &&
          typeof file.data !== "string"
        );
      })
      .filter((file) => !file.filePath.includes("mutation_"));
    const mutationImageFiles = files.filter((file) =>
      file.filePath.includes("mutation_")
    );

    const commentFiles = files.filter((file) => {
      return file.filePath.includes("comments.json");
    });
    const mutationFiles = files.filter((file) => {
      return file.filePath.includes("mutations.json");
    });

    const testResultData: TestResultData = {
      testResultId: "",
      testResultFile: {
        fileName: testResultFile.filePath,
        data: testResultFile.data,
      },
      fileData,
    };
    return {
      testResultData,
      commentFiles,
      mutationFiles,
      mutationImageFiles,
    };
  }

  public async saveImportFileDatas(
    ...args: {
      importFileData: {
        testResultFile: {
          fileName: string;
          data: string;
        };
        fileData: {
          filePath: string;
          data: Buffer;
        }[];
      };
      testResultId: string | null;
    }[]
  ): Promise<
    {
      newTestResultId: string;
      oldTestResultId?: string;
    }[]
  > {
    return Promise.all(
      args.map(({ importFileData, testResultId }) =>
        this.saveTestResultFileData(importFileData, testResultId)
      )
    );
  }

  public async saveTestResultFileData(
    importFileData: {
      testResultFile: {
        fileName: string;
        data: string;
      };
      fileData: {
        filePath: string;
        data: Buffer;
      }[];
    },
    testResultId: string | null
  ): Promise<{
    newTestResultId: string;
    oldTestResultId?: string;
  }> {
    const testResult = deserializeTestResult(
      importFileData.testResultFile.data
    );

    const videoFilePathToEntity = new Map<string, VideoEntity>();
    const screenshotFilePathToEntity = new Map<string, ScreenshotEntity>();

    await Promise.all(
      importFileData.fileData.map(async (videoOrScreenshot) => {
        if (videoOrScreenshot.filePath.split(".")[1] === "webm") {
          const videoEntity = await this.dataSource
            .getRepository(VideoEntity)
            .save(new VideoEntity());

          const substrings = videoOrScreenshot.filePath.split(".");
          const fileExt = substrings.length >= 2 ? `.${substrings.pop()}` : "";

          const fileName = `${videoEntity.id}${fileExt}`;
          await this.service.videoFileRepository.outputFile(
            fileName,
            videoOrScreenshot.data
          );
          const videoFileUrl =
            this.service.videoFileRepository.getFileUrl(fileName);
          videoEntity.fileUrl = videoFileUrl;
          videoFilePathToEntity.set(videoOrScreenshot.filePath, videoEntity);
          return [videoOrScreenshot.filePath, videoEntity];
        } else {
          const screenshotEntity = await this.dataSource
            .getRepository(ScreenshotEntity)
            .save(new ScreenshotEntity());
          const substrings = videoOrScreenshot.filePath.split(".");
          const fileExt = substrings.length >= 2 ? `.${substrings.pop()}` : "";
          const fileName = `${screenshotEntity.id}${fileExt}`;
          await this.service.screenshotFileRepository.outputFile(
            fileName,
            videoOrScreenshot.data
          );
          const imageFileUrl =
            this.service.screenshotFileRepository.getFileUrl(fileName);
          screenshotEntity.fileUrl = imageFileUrl;
          screenshotFilePathToEntity.set(
            videoOrScreenshot.filePath,
            screenshotEntity
          );
        }
      })
    );

    const tagNameToEntity = new Map(
      (await this.dataSource.getRepository(TagEntity).find()).map<
        [string, TagEntity]
      >((tagEntity) => {
        return [tagEntity.name, tagEntity];
      })
    );

    const newTestResultEntity = await this.dataSource
      .getRepository(TestResultEntity)
      .save(
        this.createTestResultEntity(
          testResult,
          tagNameToEntity,
          screenshotFilePathToEntity,
          videoFilePathToEntity
        )
      );

    return {
      newTestResultId: newTestResultEntity.id,
      oldTestResultId: testResultId ?? undefined,
    };
  }

  private createTestResultEntity(
    testResult: DeserializedTestResult,
    tagNameToEntity: Map<string, TagEntity>,
    screenshotFilePathToEntity: Map<string, ScreenshotEntity>,
    videoFilePathToEntity?: Map<string, VideoEntity>
  ) {
    const testStepEntities = testResult.testSteps.map((testStep) => {
      return this.createTestStepEntity(
        testStep,
        tagNameToEntity,
        screenshotFilePathToEntity,
        videoFilePathToEntity
      );
    });
    const coverageSourceEntities: CoverageSourceEntity[] =
      testResult.coverageSources.map((coverageSource) => {
        return new CoverageSourceEntity({
          title: coverageSource.title,
          url: coverageSource.url,
          screenElements: JSON.stringify(coverageSource.screenElements),
        });
      });

    const noteEntities = testStepEntities.flatMap(({ notes }) => notes ?? []);

    const testPurposeEntities = testStepEntities.flatMap(({ testPurpose }) =>
      testPurpose ? [testPurpose] : []
    );

    return new TestResultEntity({
      name:
        testResult.name ??
        `session_${this.service.timestamp.format("YYYYMMDD_HHmmss")}`,
      startTimestamp:
        testResult.startTimeStamp ??
        (testResult.initialUrl
          ? this.service.timestamp.epochMilliseconds()
          : 0),
      lastUpdateTimestamp: testResult.lastUpdateTimeStamp,
      initialUrl: testResult.initialUrl ?? "",
      testingTime: testResult.testingTime,
      creationTimestamp: testResult.creationTimestamp,
      testSteps: testStepEntities,
      coverageSources: coverageSourceEntities,
      notes: noteEntities,
      testPurposes: testPurposeEntities,
    });
  }

  private createTestStepEntity(
    testStep: DeserializedTestStep,
    tagNameToEntity: Map<string, TagEntity>,
    screenshotFilePathToEntity?: Map<string, ScreenshotEntity>,
    videoFilePathToEntity?: Map<string, VideoEntity>
  ) {
    const screenshotEntity = screenshotFilePathToEntity?.get(
      path.basename(testStep.operation.imageFileUrl)
    );

    const testPurposeEntity = testStep.testPurpose
      ? this.createTestPurposeEntity(testStep.testPurpose)
      : null;

    const noteEntities = testStep.notes.map((note) => {
      const tagEntities = note.tags.map(
        (tagName) =>
          tagNameToEntity.get(tagName) ?? new TagEntity({ name: tagName })
      );
      return this.createNoteEntity(
        note,
        tagEntities,
        screenshotFilePathToEntity,
        videoFilePathToEntity
      );
    });

    const videoFileUrl = testStep.operation.videoFrame?.url;
    const videoEntity = videoFileUrl
      ? videoFilePathToEntity?.get(path.basename(videoFileUrl))
      : undefined;

    if (videoEntity) {
      videoEntity.height = testStep.operation.videoFrame?.height ?? 0;
      videoEntity.width = testStep.operation.videoFrame?.width ?? 0;
    }

    return new TestStepEntity({
      pageTitle: testStep.operation.title,
      pageUrl: testStep.operation.url,
      operationType: testStep.operation.type,
      operationInput: testStep.operation.input,
      operationElement: JSON.stringify(testStep.operation.elementInfo),
      inputElements: JSON.stringify(testStep.operation.inputElements),
      windowHandle: testStep.operation.windowHandle,
      keywordTexts: JSON.stringify(testStep.operation.keywordTexts ?? []),
      isAutomatic: testStep.operation.isAutomatic,
      timestamp: parseInt(testStep.operation.timestamp, 10),
      scrollPositionX: testStep.operation.scrollPosition?.x ?? undefined,
      scrollPositionY: testStep.operation.scrollPosition?.y ?? undefined,
      clientSizeWidth: testStep.operation.clientSize?.width ?? undefined,
      clientSizeHeight: testStep.operation.clientSize?.height ?? undefined,
      screenshot: screenshotEntity,
      video: videoEntity,
      videoTime: testStep.operation.videoFrame?.time,
      testPurpose: testPurposeEntity,
      notes: noteEntities,
    });
  }

  private createNoteEntity(
    note: {
      value: string;
      details: string;
      imageFileUrl: string;
      timestamp: number;
      videoFrame?: VideoFrame;
    },
    tagEntities: TagEntity[],
    screenshotFilePathToEntity?: Map<string, ScreenshotEntity>,
    videoFilePathToEntity?: Map<string, VideoEntity>
  ) {
    const screenshotEntity = screenshotFilePathToEntity
      ? screenshotFilePathToEntity.get(path.basename(note.imageFileUrl))
      : undefined;

    const videoFileUrl = note.videoFrame?.url;
    const videoEntity = videoFileUrl
      ? videoFilePathToEntity?.get(path.basename(videoFileUrl))
      : undefined;

    return new NoteEntity({
      value: note.value,
      details: note.details,
      timestamp: note.timestamp,
      videoTime: note.videoFrame?.time,
      screenshot: screenshotEntity,
      tags: tagEntities,
      video: videoEntity,
    });
  }

  private createTestPurposeEntity(testPurpose: {
    value: string;
    details: string;
  }) {
    return new TestPurposeEntity({
      title: testPurpose.value,
      details: testPurpose.details,
    });
  }
}
