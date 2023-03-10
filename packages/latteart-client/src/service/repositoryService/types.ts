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

import { ServiceResult } from "../result";
import {
  TestStep,
  CapturedOperation,
  Operation,
  CoverageSource,
  InputElementInfo,
  TestStepNote,
  Note,
  TestResultViewOption,
} from "../types";
import { RepositoryContainer } from "./testResultAccessor";

/**
 * Repository Service
 */
export type RepositoryService = {
  /**
   * service url
   */
  readonly serviceUrl: string;

  /**
   * create an empty Test Result
   * @param option option
   */
  createEmptyTestResult(option?: {
    initialUrl?: string;
    name?: string;
    parentTestResultId?: string;
  }): Promise<ServiceResult<{ id: string; name: string }>>;

  /**
   * create an interface to access a Test Result
   * @param testResultId target Test Result ID
   */
  createTestResultAccessor(testResultId: string): TestResultAccessor;
} & RepositoryContainer;

/**
 * Interface to access a Test Result
 */
export type TestResultAccessor = {
  /**
   * collect Test Steps
   */
  collectTestSteps(): Promise<ServiceResult<TestStep[]>>;

  /**
   * get a Test Step
   * @param testStepId target Test Step ID
   */
  getTestStep(testStepId: string): Promise<ServiceResult<TestStep>>;

  /**
   * add an Operation
   * @param operation new Operation context
   * @param option option
   */
  addOperation(
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
  >;

  /**
   * add a Note to a Test Step
   * @param note new Note context
   * @param testStepId Test Step ID
   * @param option option
   */
  addNoteToTestStep(
    note: {
      value: string;
      details?: string;
      tags?: string[];
      imageData?: string;
    },
    testStepId: string,
    option?: {
      compressScreenshot?: boolean;
    }
  ): Promise<ServiceResult<TestStepNote>>;

  /**
   * edit a Note
   * @param noteId target Note ID
   * @param note new Note context
   */
  editNote(
    noteId: string,
    note: {
      value: string;
      details: string;
      tags: string[];
    }
  ): Promise<ServiceResult<Note>>;

  /**
   * remove a Note from a Test Step
   * @param noteId target Note ID
   * @param testStepId Test Step ID
   */
  removeNoteFromTestStep(
    noteId: string,
    testStepId: string
  ): Promise<ServiceResult<TestStep>>;

  /**
   * add a Test Purpose to a Test Step
   * @param testPurpose new Test Purpose context
   * @param testStepId Test Step ID
   */
  addTestPurposeToTestStep(
    testPurpose: {
      value: string;
      details?: string;
    },
    testStepId: string
  ): Promise<ServiceResult<TestStepNote>>;

  /**
   * edit a Test Purpose
   * @param testPurposeId target Test Purpose ID
   * @param testPurpose new Test Purpose context
   */
  editTestPurpose(
    testPurposeId: string,
    testPurpose: {
      value: string;
      details: string;
    }
  ): Promise<ServiceResult<Note>>;

  /**
   * remove a Test Purpose from a Test Step
   * @param testPurposeId target Test Purpose ID
   * @param testStepId Test Step ID
   */
  removeTestPurposeFromTestStep(
    testPurposeId: string,
    testStepId: string
  ): Promise<ServiceResult<TestStep>>;

  /**
   * generate Sequence View of Test Result
   * @param option option
   */
  generateSequenceView(
    option?: TestResultViewOption
  ): Promise<ServiceResult<SequenceView>>;
};

export type SequenceView = {
  windows: {
    id: string;
    name: string;
  }[];
  screens: {
    id: string;
    name: string;
  }[];
  scenarios: {
    testPurpose?: {
      id: string;
      value: string;
      details?: string;
    };
    nodes: SequenceViewNode[];
  }[];
};

export type SequenceViewNode = {
  windowId: string;
  screenId: string;
  testSteps: {
    id: string;
    type: string;
    input?: string;
    element?: {
      xpath: string;
      tagname: string;
      text: string;
    };
    notes?: {
      id: string;
      value: string;
      details?: string;
      tags: string[];
    }[];
  }[];
  disabled?: boolean | undefined;
};

export type RepositoryServiceErrorCode =
  | "create_empty_test_result_failed"
  | "get_test_result_failed"
  | "get_test_step_failed"
  | "add_test_step_failed"
  | "compress_test_step_screenshot_failed"
  | "add_note_failed"
  | "edit_note_failed"
  | "delete_note_failed"
  | "link_note_to_test_step_failed"
  | "unlink_note_from_test_step_failed"
  | "compress_note_screenshot_failed"
  | "add_test_purpose_failed"
  | "edit_test_purpose_failed"
  | "delete_test_purpose_failed"
  | "link_test_purpose_to_test_step_failed"
  | "unlink_test_purpose_from_test_step_failed"
  | "generate_sequence_view_failed";
