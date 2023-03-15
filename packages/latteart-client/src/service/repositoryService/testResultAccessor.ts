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
  ServiceFailure,
  ServiceSuccess,
  ServiceError,
  ServiceResult,
} from "../result";
import {
  CapturedOperation,
  TestStep,
  Operation,
  CoverageSource,
  InputElementInfo,
  TestStepNote,
  Note,
  TestResultViewOption,
} from "../types";
import {
  TestResultRepository,
  ImportTestResultRepository,
  ImportProjectRepository,
  TestScriptRepository,
  SettingsRepository,
  CompressedImageRepository,
  SessionRepository,
  SnapshotRepository,
  ScreenshotRepository,
  TestMatrixRepository,
  TestTargetGroupRepository,
  TestTargetRepository,
  ViewPointRepository,
  StoryRepository,
  TestStepRepository,
  NoteRepository,
  ProjectRepository,
} from "../../gateway/repository";
import { TestResultAccessor, SequenceView } from "./types";

export type RepositoryContainer = {
  readonly testStepRepository: TestStepRepository;
  readonly noteRepository: NoteRepository;
  readonly testResultRepository: TestResultRepository;
  readonly importTestResultRepository: ImportTestResultRepository;
  readonly importProjectRepository: ImportProjectRepository;
  readonly testScriptRepository: TestScriptRepository;
  readonly settingRepository: SettingsRepository;
  readonly compressedImageRepository: CompressedImageRepository;
  readonly projectRepository: ProjectRepository;
  readonly sessionRepository: SessionRepository;
  readonly snapshotRepository: SnapshotRepository;
  readonly screenshotRepository: ScreenshotRepository;
  readonly testMatrixRepository: TestMatrixRepository;
  readonly testTargetGroupRepository: TestTargetGroupRepository;
  readonly testTargetRepository: TestTargetRepository;
  readonly viewPointRepository: ViewPointRepository;
  readonly storyRepository: StoryRepository;
};

export class TestResultAccessorImpl implements TestResultAccessor {
  constructor(
    private serviceUrl: string,
    private repositories: RepositoryContainer,
    private testResultId: string
  ) {}

  async collectTestSteps(): Promise<ServiceResult<TestStep[]>> {
    const result = await this.repositories.testResultRepository.getTestResult(
      this.testResultId
    );

    if (result.isFailure()) {
      const error: ServiceError = {
        errorCode: "get_test_result_failed",
        message: "Get Test Result failed.",
        variables: { testResultId: this.testResultId },
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    const testSteps = result.data.testSteps.map((testStep) => {
      return {
        ...testStep,
        intention: testStep.intention?.id ?? null,
        bugs: [],
        notices: [
          ...testStep.bugs.map(({ id }) => id),
          ...testStep.notices.map(({ id }) => id),
        ],
      };
    });

    return new ServiceSuccess(testSteps);
  }

  async getTestStep(testStepId: string): Promise<ServiceResult<TestStep>> {
    const result = await this.repositories.testStepRepository.getTestSteps(
      this.testResultId,
      testStepId
    );

    if (result.isFailure()) {
      const error: ServiceError = {
        errorCode: "get_test_step_failed",
        message: "Get Test Step failed.",
        variables: { testResultId: this.testResultId, testStepId },
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    return new ServiceSuccess(result.data);
  }

  async addOperation(
    operation: CapturedOperation,
    option: {
      compressScreenshot: boolean;
    }
  ): Promise<
    ServiceResult<{
      operation: Operation;
      id: string;
      coverageSource: CoverageSource;
      inputElementInfo: InputElementInfo;
    }>
  > {
    const registerOperationResult =
      await this.repositories.testStepRepository.postTestSteps(
        this.testResultId,
        operation
      );

    if (registerOperationResult.isFailure()) {
      const error: ServiceError = {
        errorCode: "add_test_step_failed",
        message: "Add Test Step failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    if (
      !option.compressScreenshot ||
      !registerOperationResult.data.operation.imageFileUrl
    ) {
      const imageFileUrl = registerOperationResult.data.operation.imageFileUrl
        ? new URL(
            registerOperationResult.data.operation.imageFileUrl,
            this.serviceUrl
          ).toString()
        : "";

      return new ServiceSuccess({
        ...registerOperationResult.data,
        operation: {
          ...registerOperationResult.data.operation,
          imageFileUrl,
        },
      });
    }

    const compressImageResult =
      await this.repositories.compressedImageRepository.postTestStepImage(
        this.testResultId,
        registerOperationResult.data.id
      );

    if (compressImageResult.isFailure()) {
      const error: ServiceError = {
        errorCode: "compress_test_step_screenshot_failed",
        message: "Compress Test Step Screenshot failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    const imageFileUrl = compressImageResult.data.imageFileUrl
      ? new URL(
          compressImageResult.data.imageFileUrl,
          this.serviceUrl
        ).toString()
      : "";

    return new ServiceSuccess({
      ...registerOperationResult.data,
      operation: {
        ...registerOperationResult.data.operation,
        imageFileUrl,
      },
    });
  }

  async addNoteToTestStep(
    note: {
      value: string;
      details?: string;
      tags?: string[];
      imageData?: string;
    },
    testStepId: string,
    option: {
      compressScreenshot?: boolean;
    } = {}
  ): Promise<ServiceResult<TestStepNote>> {
    const postNotesResult = await this.repositories.noteRepository.postNotes(
      this.testResultId,
      {
        type: "notice",
        value: note.value,
        details: note.details ?? "",
        tags: note.tags ?? [],
        imageData: note.imageData,
      }
    );

    if (postNotesResult.isFailure()) {
      const error: ServiceError = {
        errorCode: "add_note_failed",
        message: "Add Note failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    const savedNote = postNotesResult.data;

    const linkTestStepResult = await (async () => {
      const getTestStepResult = await this.getTestStep(testStepId);

      if (getTestStepResult.isFailure()) {
        return getTestStepResult;
      }

      const { notices: replyNotices } = getTestStepResult.data;

      const notices = [...replyNotices, savedNote.id];
      const noteId = undefined;

      return this.repositories.testStepRepository.patchTestSteps(
        this.testResultId,
        testStepId,
        noteId,
        undefined,
        notices
      );
    })();

    if (linkTestStepResult.isFailure()) {
      const error: ServiceError = {
        errorCode: "link_note_to_test_step_failed",
        message: "Link Note to Test Step failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    const savedTestStep = linkTestStepResult.data;

    if (!option.compressScreenshot || !savedNote.imageFileUrl) {
      const imageFileUrl = savedNote.imageFileUrl
        ? new URL(savedNote.imageFileUrl, this.serviceUrl).toString()
        : "";

      return new ServiceSuccess({
        testStep: savedTestStep,
        note: {
          ...savedNote,
          imageFileUrl,
        },
      });
    }

    const compressImageResult =
      await this.repositories.compressedImageRepository.postNoteImage(
        this.testResultId,
        savedNote.id
      );

    if (compressImageResult.isFailure()) {
      const error: ServiceError = {
        errorCode: "compress_note_screenshot_failed",
        message: "Compress Note Screenshot failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    const imageFileUrl = compressImageResult.data.imageFileUrl
      ? new URL(
          compressImageResult.data.imageFileUrl,
          this.serviceUrl
        ).toString()
      : "";

    return new ServiceSuccess({
      testStep: savedTestStep,
      note: {
        ...savedNote,
        imageFileUrl,
      },
    });
  }

  async editNote(
    noteId: string,
    note: {
      value: string;
      details: string;
      tags: string[];
    }
  ): Promise<ServiceResult<Note>> {
    const result = await this.repositories.noteRepository.putNotes(
      this.testResultId,
      noteId,
      {
        type: "notice",
        value: note.value,
        details: note.details,
        tags: note.tags,
      }
    );

    if (result.isFailure()) {
      const error: ServiceError = {
        errorCode: "edit_note_failed",
        message: "Edit Note failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    const imageFileUrl = result.data.imageFileUrl
      ? new URL(result.data.imageFileUrl, this.serviceUrl).toString()
      : "";

    return new ServiceSuccess({
      ...result.data,
      imageFileUrl,
    });
  }

  async removeNoteFromTestStep(
    noteId: string,
    testStepId: string
  ): Promise<ServiceResult<TestStep>> {
    const deleteNotesResult =
      await this.repositories.noteRepository.deleteNotes(
        this.testResultId,
        noteId
      );

    if (deleteNotesResult.isFailure()) {
      const error: ServiceError = {
        errorCode: "delete_note_failed",
        message: "Delete Note failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    const getTestStepResult = await this.getTestStep(testStepId);

    if (getTestStepResult.isFailure()) {
      const error: ServiceError = {
        errorCode: "get_test_step_failed",
        message: "Get Test Step failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    const { notices } = getTestStepResult.data;

    const patchTestStepsResult =
      await this.repositories.testStepRepository.patchTestSteps(
        this.testResultId,
        testStepId,
        undefined,
        undefined,
        notices.filter((notice) => notice !== noteId)
      );

    if (patchTestStepsResult.isFailure()) {
      const error: ServiceError = {
        errorCode: "unlink_note_from_test_step_failed",
        message: "Unlink Note from Test Step failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    return new ServiceSuccess(patchTestStepsResult.data);
  }

  async addTestPurposeToTestStep(
    testPurpose: {
      value: string;
      details?: string;
    },
    testStepId: string
  ): Promise<ServiceResult<TestStepNote>> {
    const postNotesResult = await this.repositories.noteRepository.postNotes(
      this.testResultId,
      {
        type: "intention",
        value: testPurpose.value,
        details: testPurpose.details ?? "",
      }
    );

    if (postNotesResult.isFailure()) {
      const error: ServiceError = {
        errorCode: "add_test_purpose_failed",
        message: "Add Test Purpose failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    const savedNote = postNotesResult.data;

    const patchTestStepResult =
      await this.repositories.testStepRepository.patchTestSteps(
        this.testResultId,
        testStepId,
        savedNote?.id
      );

    if (patchTestStepResult.isFailure()) {
      const error: ServiceError = {
        errorCode: "link_test_purpose_to_test_step_failed",
        message: "Link Test Purpose to Test Step failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    return new ServiceSuccess({
      note: savedNote,
      testStep: patchTestStepResult.data,
    });
  }

  async editTestPurpose(
    testPurposeId: string,
    testPurpose: {
      value: string;
      details: string;
    }
  ): Promise<ServiceResult<Note>> {
    const putNotesResult = await this.repositories.noteRepository.putNotes(
      this.testResultId,
      testPurposeId,
      {
        type: "intention",
        value: testPurpose.value,
        details: testPurpose.details,
      }
    );

    if (putNotesResult.isFailure()) {
      const error: ServiceError = {
        errorCode: "edit_test_purpose_failed",
        message: "Edit Test Purpose failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    return new ServiceSuccess(putNotesResult.data);
  }

  async removeTestPurposeFromTestStep(
    testPurposeId: string,
    testStepId: string
  ): Promise<ServiceResult<TestStep>> {
    const deleteNotesResult =
      await this.repositories.noteRepository.deleteNotes(
        this.testResultId,
        testPurposeId
      );

    if (deleteNotesResult.isFailure()) {
      const error: ServiceError = {
        errorCode: "delete_test_purpose_failed",
        message: "Delete Test Purpose failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    const result = await (async () => {
      return this.repositories.testStepRepository.patchTestSteps(
        this.testResultId,
        testStepId,
        null
      );
    })();

    if (result.isFailure()) {
      const error: ServiceError = {
        errorCode: "unlink_test_purpose_from_test_step_failed",
        message: "Unlink Test Purpose from Test Step failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    return new ServiceSuccess(result.data);
  }

  async generateSequenceView(
    option?: TestResultViewOption
  ): Promise<ServiceResult<SequenceView>> {
    const result =
      await this.repositories.testResultRepository.generateSequenceView(
        this.testResultId,
        option
      );

    if (result.isFailure()) {
      const error: ServiceError = {
        errorCode: "generate_sequence_view_failed",
        message: "Generate Sequence View failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    return new ServiceSuccess(result.data);
  }
}
