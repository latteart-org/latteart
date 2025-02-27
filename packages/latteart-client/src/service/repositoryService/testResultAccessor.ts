/**
 * Copyright 2025 NTT Corporation.
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
  TestStepNote,
  Note,
  TestResultViewOption,
  Video,
  ScreenMutation,
  Comment,
  CoverageSource,
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
  TestResultComparisonRepository,
  VideoRepository,
  MutationRepository,
  CommentRepository,
  TestHintRepository,
  TestHintPropRepository,
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
  readonly testResultComparisonRepository: TestResultComparisonRepository;
  readonly videoRepository: VideoRepository;
  readonly mutationRepository: MutationRepository;
  readonly commentRepository: CommentRepository;
  readonly testHintRepository: TestHintRepository;
  readonly testHintPropRepository: TestHintPropRepository;
};

export class TestResultAccessorImpl implements TestResultAccessor {
  constructor(
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

  async addMutations(
    screenMutations: ScreenMutation[]
  ): Promise<ServiceResult<void>> {
    const result = await this.repositories.mutationRepository.postMutation(
      this.testResultId,
      screenMutations
    );
    if (result.isFailure()) {
      const error: ServiceError = {
        errorCode: "add_mutation_failed",
        message: "Add Mutation failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    return new ServiceSuccess(result.data as void);
  }

  async collectComments(
    filter: { period?: { since?: number; until?: number } } = {}
  ): Promise<ServiceResult<Comment[]>> {
    const result = await this.repositories.commentRepository.getComments(
      this.testResultId,
      filter
    );

    if (result.isFailure()) {
      const error: ServiceError = {
        errorCode: "get_comments_failed",
        message: "Get Comments failed.",
        variables: { testResultId: this.testResultId },
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    const comments = result.data;

    return new ServiceSuccess(comments);
  }

  async addComment(
    comment: Omit<Comment, "id">
  ): Promise<ServiceResult<Comment>> {
    const result = await this.repositories.commentRepository.postComment(
      this.testResultId,
      comment
    );
    if (result.isFailure()) {
      const error: ServiceError = {
        errorCode: "add_comment_failed",
        message: "Add Comment failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    return new ServiceSuccess(result.data);
  }

  async addOperation(
    operation: CapturedOperation,
    option: { compressScreenshot: boolean }
  ): Promise<
    ServiceResult<{
      operation: Operation;
      id: string;
      coverageSource: CoverageSource;
    }>
  > {
    const registerOperationResult =
      await this.repositories.testStepRepository.postTestSteps(
        this.testResultId,
        {
          input: operation.input,
          type: operation.type,
          elementInfo: operation.elementInfo,
          title: operation.title,
          url: operation.url,
          imageData: operation.imageData,
          windowHandle: operation.windowHandle,
          timestamp: operation.timestamp,
          screenElements: operation.screenElements,
          pageSource: operation.pageSource,
          scrollPosition: operation.scrollPosition,
          clientSize: operation.clientSize,
          isAutomatic: operation.isAutomatic,
          videoId: operation.videoId,
          videoTime: operation.videoTime,
        }
      );

    if (registerOperationResult.isFailure()) {
      const error: ServiceError = {
        errorCode: "add_test_step_failed",
        message: "Add Test Step failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    const {
      input,
      type,
      elementInfo,
      title,
      url,
      timestamp,
      windowHandle,
      keywordTexts,
      scrollPosition,
      clientSize,
      isAutomatic,
      imageFileUrl,
      videoFrame,
      inputElements,
    } = registerOperationResult.data.operation;

    if (!option.compressScreenshot || !imageFileUrl) {
      return new ServiceSuccess({
        ...registerOperationResult.data,
        operation: {
          input,
          type,
          elementInfo,
          title,
          url,
          timestamp,
          windowHandle,
          keywordTexts,
          scrollPosition,
          clientSize,
          isAutomatic,
          imageFileUrl,
          videoFrame,
          inputElements,
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

    return new ServiceSuccess({
      ...registerOperationResult.data,
      operation: {
        input,
        type,
        elementInfo,
        title,
        url,
        timestamp,
        windowHandle,
        keywordTexts,
        scrollPosition,
        clientSize,
        isAutomatic,
        imageFileUrl: compressImageResult.data.imageFileUrl,
        videoFrame,
        inputElements,
      },
    });
  }

  async addNoteToTestStep(
    note: {
      value: string;
      details?: string;
      tags?: string[];
      imageData?: string;
      timestamp?: number;
      videoId?: string;
      videoTime?: number;
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
        timestamp: note.timestamp,
        videoId: note.videoId,
        videoTime: note.videoTime,
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

    const getTestResultsResult =
      await this.repositories.testResultRepository.getTestResults();

    if (getTestResultsResult.isFailure()) {
      const error: ServiceError = {
        errorCode: "generate_graph_view_failed",
        message: "Generate Graph View failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    const savedTestStep = {
      ...linkTestStepResult.data,
      operation: {
        input: linkTestStepResult.data.operation.input,
        type: linkTestStepResult.data.operation.type,
        elementInfo: linkTestStepResult.data.operation.elementInfo,
        title: linkTestStepResult.data.operation.title,
        url: linkTestStepResult.data.operation.url,
        imageFileUrl: linkTestStepResult.data.operation.imageFileUrl,
        timestamp: linkTestStepResult.data.operation.timestamp,
        windowHandle: linkTestStepResult.data.operation.windowHandle,
        keywordTexts: linkTestStepResult.data.operation.keywordTexts,
        scrollPosition: linkTestStepResult.data.operation.scrollPosition,
        clientSize: linkTestStepResult.data.operation.clientSize,
        isAutomatic: linkTestStepResult.data.operation.isAutomatic,
        videoFrame: linkTestStepResult.data.operation.videoFrame,
        inputElements: linkTestStepResult.data.operation.inputElements,
      },
    };

    const {
      id,
      type,
      value,
      details,
      tags,
      timestamp,
      imageFileUrl,
      videoFrame,
    } = savedNote;

    if (!option.compressScreenshot || !imageFileUrl) {
      return new ServiceSuccess({
        testStep: savedTestStep,
        note: {
          id,
          type,
          value,
          details,
          tags,
          timestamp,
          imageFileUrl,
          videoFrame,
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

    return new ServiceSuccess({
      testStep: savedTestStep,
      note: {
        id,
        type,
        value,
        details,
        tags,
        timestamp,
        imageFileUrl: compressImageResult.data.imageFileUrl,
        videoFrame,
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

    const {
      id,
      type,
      value,
      details,
      tags,
      timestamp,
      imageFileUrl,
      videoFrame,
    } = result.data;

    const getTestResultsResult =
      await this.repositories.testResultRepository.getTestResults();

    if (getTestResultsResult.isFailure()) {
      const error: ServiceError = {
        errorCode: "edit_note_failed",
        message: "Edit Note failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    return new ServiceSuccess({
      id,
      type,
      value,
      details,
      tags,
      timestamp,
      imageFileUrl,
      videoFrame,
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

  async createVideo(params: {
    width: number;
    height: number;
  }): Promise<ServiceResult<Video>> {
    const result = await this.repositories.videoRepository.createVideo(params);

    if (result.isFailure()) {
      const error: ServiceError = {
        errorCode: "create_video_failed",
        message: "Create video failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    return new ServiceSuccess(result.data);
  }

  async appendVideoBuffer(
    videoId: string,
    buffer: ArrayBuffer
  ): Promise<ServiceResult<string>> {
    const result = await this.repositories.videoRepository.appendBuffer(
      videoId,
      buffer
    );

    if (result.isFailure()) {
      const error: ServiceError = {
        errorCode: "append_video_buffer_failed",
        message: "Append video buffer failed.",
      };
      console.error(error.message);
      return new ServiceFailure(error);
    }

    return new ServiceSuccess(result.data);
  }
}
