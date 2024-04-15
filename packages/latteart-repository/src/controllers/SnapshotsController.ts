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

import { ServerError, ServerErrorData } from "../ServerError";
import { ConfigsService } from "@/services/ConfigsService";
import { IssueReportCreatorImpl } from "@/gateways/issueReportCreator";
import { IssueReportServiceImpl } from "@/services/IssueReportService";
import { NotesServiceImpl } from "@/services/NotesService";
import { ProjectsServiceImpl } from "@/services/ProjectsService";
import { SnapshotFileRepositoryServiceImpl } from "@/services/SnapshotFileRepositoryService";
import { TestPurposeServiceImpl } from "@/services/TestPurposeService";
import { TestResultServiceImpl } from "@/services/TestResultService";
import { TestStepServiceImpl } from "@/services/TestStepService";
import { TimestampServiceImpl } from "@/services/TimestampService";
import {
  Controller,
  Post,
  Route,
  Path,
  Body,
  Tags,
  Response,
  SuccessResponse,
} from "tsoa";
import { CreateResponse } from "../interfaces/Snapshots";
import { SnapshotsService } from "../services/SnapshotsService";
import { TestProgressServiceImpl } from "@/services/TestProgressService";
import { SnapshotConfig } from "../interfaces/Configs";
import { createFileRepositoryManager } from "@/gateways/fileRepository";
import {
  createHistoryViewerTemplate,
  createSnapshotViewerTemplate,
} from "@/gateways/viewerTemplate";
import { createLogger } from "@/logger/logger";
import { AppDataSource } from "@/data-source";

@Route("projects/{projectId}/snapshots")
@Tags("projects")
export class SnapshotsController extends Controller {
  /**
   * Output project snapshot.
   * @param projectId Target project id.
   * @param snapshotConfig Settings added when exporting a snapshot.
   * @returns Output snapshot download url.
   */
  @Response<ServerErrorData<"save_snapshot_failed">>(
    500,
    "Save snapshot failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async outputProjectSnapshot(
    @Path() projectId: string,
    @Body() snapshotConfig: SnapshotConfig
  ): Promise<CreateResponse> {
    try {
      const createSnapshotsService = await this.createSnapshotsService();
      return await createSnapshotsService.createSnapshot(
        projectId,
        snapshotConfig
      );
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Save snapshot failed.", error);

        throw new ServerError(500, {
          code: "save_snapshot_failed",
        });
      }
      throw error;
    }
  }

  private async createSnapshotsService() {
    const timestampService = new TimestampServiceImpl();
    const fileRepositoryManager = await createFileRepositoryManager();
    const screenshotFileRepository =
      fileRepositoryManager.getRepository("screenshot");
    const snapshotRepository = fileRepositoryManager.getRepository("snapshot");
    const attachedFileRepository =
      fileRepositoryManager.getRepository("attachedFile");
    const workingFileRepository = fileRepositoryManager.getRepository("work");
    const compareReportRepository = fileRepositoryManager.getRepository("temp");
    const videoFileRepository = fileRepositoryManager.getRepository("video");
    const viewerTemplate = {
      snapshot: createSnapshotViewerTemplate(),
      history: createHistoryViewerTemplate(),
    };

    const testStepService = new TestStepServiceImpl(AppDataSource, {
      screenshotFileRepository,
      timestamp: timestampService,
      config: new ConfigsService(AppDataSource),
    });

    const testResultService = new TestResultServiceImpl(AppDataSource, {
      timestamp: timestampService,
      testStep: testStepService,
      screenshotFileRepository,
      workingFileRepository,
      compareReportRepository,
      videoFileRepository,
    });

    const noteService = new NotesServiceImpl(AppDataSource, {
      screenshotFileRepository,
      timestamp: timestampService,
    });

    const testPurposeService = new TestPurposeServiceImpl(AppDataSource);

    const issueReportService = new IssueReportServiceImpl({
      issueReportCreator: new IssueReportCreatorImpl(),
      testResult: testResultService,
      testStep: testStepService,
      testPurpose: testPurposeService,
      note: noteService,
    });

    const snapshotFileRepositoryService = new SnapshotFileRepositoryServiceImpl(
      {
        snapshotRepository,
        timestamp: timestampService,
        testResult: testResultService,
        testStep: testStepService,
        note: noteService,
        testPurpose: testPurposeService,
        config: new ConfigsService(AppDataSource),
        issueReport: issueReportService,
        attachedFileRepository,
        testProgress: new TestProgressServiceImpl(AppDataSource),
        workingFileRepository,
        viewerTemplate,
      }
    );

    return new SnapshotsService({
      snapshotFileRepository: snapshotFileRepositoryService,
      project: new ProjectsServiceImpl(AppDataSource),
    });
  }
}
