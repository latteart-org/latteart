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

import { ServerError, ServerErrorData } from "../ServerError";
import { TestPurposeServiceImpl } from "@/services/TestPurposeService";
import { TimestampServiceImpl } from "@/services/TimestampService";
import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Post,
  Route,
  Path,
  Tags,
  Response,
  SuccessResponse,
} from "tsoa";
import {
  CreateNoteDto,
  UpdateNoteDto,
  CreateNoteResponse,
  GetNoteResponse,
  UpdateNoteResponse,
} from "../interfaces/Notes";
import { NotesServiceImpl } from "../services/NotesService";
import { createFileRepositoryManager } from "@/gateways/fileRepository";
import { createLogger } from "@/logger/logger";

@Route("test-results/{testResultId}/notes")
@Tags("test-results")
export class NotesController extends Controller {
  /**
   * Add note (Purpose or Notice) on test results.
   * @param testResultId Target test result id.
   * @param requestBody Purpose or Notices.
   * @returns Registered Purpose or Notices.
   */
  @Response<ServerErrorData<"add_note_failed">>(400, "Invalid note type")
  @Response<ServerErrorData<"add_note_failed">>(500, "Add note failed")
  @SuccessResponse(200, "Success")
  @Post()
  public async addNote(
    @Path() testResultId: string,
    @Body() requestBody: CreateNoteDto
  ): Promise<CreateNoteResponse> {
    console.log("NotesController - addNote");

    const timestampService = new TimestampServiceImpl();
    const fileRepositoryManager = await createFileRepositoryManager();
    const screenshotFileRepository =
      fileRepositoryManager.getRepository("screenshot");

    const logger = createLogger();

    if (!["notice", "intention"].includes(requestBody.type)) {
      logger.error(`invalid note type: ${requestBody.type}`);

      throw new ServerError(400, {
        code: "add_note_failed",
      });
    }

    try {
      if (requestBody.type === "notice") {
        return new NotesServiceImpl({
          screenshotFileRepository,
          timestamp: timestampService,
        }).createNote(testResultId, requestBody);
      } else {
        return new TestPurposeServiceImpl().createTestPurpose(
          testResultId,
          requestBody
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Add note failed.", error);

        throw new ServerError(500, {
          code: "add_note_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Get note (Purpose or Notice).
   * @param testResultId Target test result id.
   * @param noteId Target note id.
   * @returns Purpose or Notice.
   */
  @Response<ServerErrorData<"get_note_failed">>(404, "Note not found")
  @Response<ServerErrorData<"get_note_failed">>(500, "Get note failed")
  @SuccessResponse(200, "Success")
  @Get("{noteId}")
  public async getNote(
    @Path() testResultId: string,
    @Path() noteId: string
  ): Promise<GetNoteResponse> {
    console.log("NotesController - getNote");

    const timestampService = new TimestampServiceImpl();
    const fileRepositoryManager = await createFileRepositoryManager();
    const screenshotFileRepository =
      fileRepositoryManager.getRepository("screenshot");

    const logger = createLogger();

    try {
      const note = await new NotesServiceImpl({
        screenshotFileRepository,
        timestamp: timestampService,
      }).getNote(noteId);

      if (note) {
        return note;
      }

      const testPurpose = await new TestPurposeServiceImpl().getTestPurpose(
        noteId
      );

      if (testPurpose) {
        return testPurpose;
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Get note failed.", error);

        throw new ServerError(500, {
          code: "get_note_failed",
        });
      }
      throw error;
    }

    logger.error(`Note not found. noteId: ${noteId}`);

    throw new ServerError(404, {
      code: "get_note_failed",
    });
  }

  /**
   * Update note (Purpose or Notice) to whatever you specify.
   * @param testResultId Target test result id.
   * @param noteId Target note id.
   * @param requestBody Purpose or Notices
   * @returns Updated Purpose or Notices.
   */
  @Response<ServerErrorData<"edit_note_failed">>(404, "Note not found")
  @Response<ServerErrorData<"edit_note_failed">>(500, "Edit note failed")
  @SuccessResponse(200, "Success")
  @Put("{noteId}")
  public async updateNote(
    @Path() testResultId: string,
    @Path() noteId: string,
    @Body() requestBody: UpdateNoteDto
  ): Promise<UpdateNoteResponse> {
    console.log("NotesController - updateNote");

    const timestampService = new TimestampServiceImpl();
    const fileRepositoryManager = await createFileRepositoryManager();
    const screenshotFileRepository =
      fileRepositoryManager.getRepository("screenshot");

    const logger = createLogger();

    try {
      const note = await new NotesServiceImpl({
        screenshotFileRepository,
        timestamp: timestampService,
      }).getNote(noteId);

      if (note) {
        return new NotesServiceImpl({
          screenshotFileRepository,
          timestamp: timestampService,
        }).updateNote(noteId, requestBody);
      }

      const testPurpose = await new TestPurposeServiceImpl().getTestPurpose(
        noteId
      );

      if (testPurpose) {
        return new TestPurposeServiceImpl().updateTestPurpose(
          noteId,
          requestBody
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Edit note failed.", error);

        throw new ServerError(500, {
          code: "edit_note_failed",
        });
      }
      throw error;
    }

    logger.error(`Note not found. noteId: ${noteId}`);

    throw new ServerError(404, {
      code: "edit_note_failed",
    });
  }

  /**
   * Delete note (Purpose or Notice).
   * @param testResultId Target test result id.
   * @param noteId Target note id.
   */
  @Response<ServerErrorData<"delete_note_failed">>(404, "Note not found")
  @Response<ServerErrorData<"delete_note_failed">>(500, "Delete note failed")
  @SuccessResponse(204, "Success")
  @Delete("{noteId}")
  public async deleteNote(
    @Path() testResultId: string,
    @Path() noteId: string
  ): Promise<void> {
    console.log("NotesController - deleteNote");

    const timestampService = new TimestampServiceImpl();
    const fileRepositoryManager = await createFileRepositoryManager();
    const screenshotFileRepository =
      fileRepositoryManager.getRepository("screenshot");

    const logger = createLogger();

    try {
      const note = await new NotesServiceImpl({
        screenshotFileRepository,
        timestamp: timestampService,
      }).getNote(noteId);

      if (note) {
        return new NotesServiceImpl({
          screenshotFileRepository,
          timestamp: timestampService,
        }).deleteNote(noteId);
      }

      const testPurpose = await new TestPurposeServiceImpl().getTestPurpose(
        noteId
      );

      if (testPurpose) {
        return new TestPurposeServiceImpl().deleteTestPurpose(noteId);
      }
    } catch (error) {
      if (error instanceof Error) {
        logger.error("Delete note failed.", error);

        throw new ServerError(500, {
          code: "delete_note_failed",
        });
      }
      throw error;
    }

    logger.error(`Note not found. noteId: ${noteId}`);

    throw new ServerError(404, {
      code: "delete_note_failed",
    });
  }
}
