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

import LoggingService from "@/logger/LoggingService";
import { ServerError, ServerErrorData } from "../ServerError";
import { ConfigsService } from "@/services/ConfigsService";
import { ImageFileRepositoryServiceImpl } from "@/services/ImageFileRepositoryService";
import { IssueReportOutputServiceImpl } from "@/services/IssueReportOutputService";
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
import {
  attachedFileDirectoryService,
  screenshotDirectoryService,
  snapshotDirectoryService,
  transactionRunner,
} from "..";
import { CreateResponse } from "../interfaces/Snapshots";
import { SnapshotsService } from "../services/SnapshotsService";
import path from "path";
import { appRootPath } from "@/common";
import { TestProgressServiceImpl } from "@/services/TestProgressService";
import { SnapshotConfig } from "../interfaces/Configs";

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
      return await this.createSnapshotsService().createSnapshot(
        projectId,
        snapshotConfig
      );
    } catch (error) {
      if (error instanceof Error) {
        LoggingService.error("Save snapshot failed.", error);

        throw new ServerError(500, {
          code: "save_snapshot_failed",
        });
      }
      throw error;
    }
  }

  private createSnapshotsService() {
    const timestampService = new TimestampServiceImpl();
    const imageFileRepositoryService = new ImageFileRepositoryServiceImpl({
      staticDirectory: screenshotDirectoryService,
    });

    const testStepService = new TestStepServiceImpl({
      imageFileRepository: imageFileRepositoryService,
      timestamp: timestampService,
      config: new ConfigsService(),
    });

    const testResultService = new TestResultServiceImpl({
      timestamp: timestampService,
      testStep: testStepService,
    });

    const noteService = new NotesServiceImpl({
      imageFileRepository: imageFileRepositoryService,
      timestamp: timestampService,
    });

    const testPurposeService = new TestPurposeServiceImpl();

    const issueReportService = new IssueReportServiceImpl({
      issueReportOutput: new IssueReportOutputServiceImpl(),
      testResult: testResultService,
      testStep: testStepService,
      testPurpose: testPurposeService,
      note: noteService,
    });

    const snapshotFileRepositoryService = new SnapshotFileRepositoryServiceImpl(
      {
        staticDirectory: snapshotDirectoryService,
        imageFileRepository: imageFileRepositoryService,
        timestamp: timestampService,
        testResult: testResultService,
        testStep: testStepService,
        note: noteService,
        testPurpose: testPurposeService,
        config: new ConfigsService(),
        issueReport: issueReportService,
        attachedFileRepository: attachedFileDirectoryService,
        testProgress: new TestProgressServiceImpl(transactionRunner),
      },
      {
        snapshotViewer: { path: path.join(appRootPath, "snapshot-viewer") },
        historyViewer: { path: path.join(appRootPath, "history-viewer") },
      }
    );

    return new SnapshotsService({
      snapshotFileRepository: snapshotFileRepositoryService,
      project: new ProjectsServiceImpl(),
    });
  }
}
