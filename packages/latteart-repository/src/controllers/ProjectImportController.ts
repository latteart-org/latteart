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

import {
  Body,
  Controller,
  Post,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";
import { transactionRunner } from "..";
import { ProjectImportService } from "@/services/ProjectImportService";
import { ServerError, ServerErrorData } from "../ServerError";
import { TimestampServiceImpl } from "@/services/TimestampService";
import { TestResultServiceImpl } from "@/services/TestResultService";
import { TestStepServiceImpl } from "@/services/TestStepService";
import { ConfigsService } from "@/services/ConfigsService";
import { NotesServiceImpl } from "@/services/NotesService";
import { TestPurposeServiceImpl } from "@/services/TestPurposeService";
import { createFileRepositoryManager } from "@/gateways/fileRepository";
import { createLogger } from "@/logger/logger";
import { TestResultImportServiceImpl } from "@/services/TestResultImportService";
import { ImportFileRepositoryImpl } from "@/gateways/importFileRepository";
import { CreateProjectImportDto } from "@/interfaces/importFileRepository";

@Route("imports/projects")
@Tags("imports")
export class ProjectImportController extends Controller {
  /**
   * Import project information and test result information into repository.
   * @param requestBody Project information and test result information to import.
   * @returns Imported project id.
   */
  @Response<ServerErrorData<"import_test_result_not_exist">>(
    500,
    "Test result information does not exist"
  )
  @Response<ServerErrorData<"import_project_not_exist">>(
    500,
    "Project information does not exist"
  )
  @Response<ServerErrorData<"import_project_failed">>(
    500,
    "Import project failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async importProject(
    @Body() requestBody: CreateProjectImportDto
  ): Promise<{ projectId: string }> {
    try {
      const timestampService = new TimestampServiceImpl();
      const fileRepositoryManager = await createFileRepositoryManager();
      const screenshotFileRepository =
        fileRepositoryManager.getRepository("screenshot");
      const attachedFileRepository =
        fileRepositoryManager.getRepository("attachedFile");
      const workingFileRepository = fileRepositoryManager.getRepository("work");
      const compareReportRepository =
        fileRepositoryManager.getRepository("temp");

      const configService = new ConfigsService();
      const testStepService = new TestStepServiceImpl({
        screenshotFileRepository,
        timestamp: timestampService,
        config: configService,
      });

      const testResultService = new TestResultServiceImpl({
        timestamp: timestampService,
        testStep: testStepService,
        screenshotFileRepository,
        workingFileRepository,
        compareReportRepository,
      });
      const notesService = new NotesServiceImpl({
        screenshotFileRepository,
        timestamp: timestampService,
      });

      const testPurposeService = new TestPurposeServiceImpl();

      const importFileRepository = new ImportFileRepositoryImpl();

      const testResultImportService = new TestResultImportServiceImpl({
        importFileRepository,
        screenshotFileRepository: screenshotFileRepository,
        timestamp: timestampService,
      });

      const response = await new ProjectImportService().import(
        requestBody.source.projectFile,
        requestBody.includeProject,
        requestBody.includeTestResults,
        {
          timestampService,
          testResultService,
          testStepService,
          screenshotFileRepository,
          attachedFileRepository,
          notesService,
          testPurposeService,
          transactionRunner,
          testResultImportService,
          importFileRepository,
        }
      );

      return response;
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Import project failed.", error);
        if (error.message === "Test result information does not exist.") {
          throw new ServerError(500, {
            code: "import_test_result_not_exist",
          });
        }
        if (error.message === "Project information does not exist.") {
          throw new ServerError(500, {
            code: "import_project_not_exist",
          });
        }
        throw new ServerError(500, {
          code: "import_project_failed",
        });
      }
      throw error;
    }
  }
}
