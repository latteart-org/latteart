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

import { SequenceView, TestResult, TestResultViewOption } from "@/domain/types";
import { GetNoteResponse } from "./Notes";
import { GetTestStepResponse } from "./TestSteps";

/**
 * Test result data for new registration.
 */
export interface CreateTestResultDto {
  initialUrl?: string;
  name?: string;
  startTimeStamp?: number;
  parentTestResultId?: string;
}

/**
 * Test result list record.
 */
export type ListTestResultResponse = Pick<
  TestResult,
  "id" | "name" | "initialUrl" | "testingTime"
> & {
  parentTestResultId?: string;
  testPurposes: { value: string }[];
  creationTimestamp: number;
};

/**
 * Registered test result data.
 */
export interface CreateTestResultResponse {
  id: string;
  name: string;
}

/**
 * Test result data for the specified ID.
 */
export type GetTestResultResponse = Omit<TestResult, "testSteps"> & {
  testSteps: (Pick<TestResult["testSteps"][0], "id"> & {
    operation: GetTestStepResponse["operation"];
    intention: GetNoteResponse | null;
    bugs: GetNoteResponse[];
    notices: GetNoteResponse[];
  })[];
  parentTestResultId?: string;
};

/**
 * Test result data for export.
 */
export type ExportTestResultResponse = GetTestResultResponse & {
  creationTimestamp: number;
};

/**
 * Updated test result data.
 */
export type PatchTestResultResponse = GetTestResultResponse;

/**
 * Sequence view generation option.
 */
export type GetSequenceViewDto = TestResultViewOption;

/**
 * Generated sequence view.
 */
export type GetSequenceViewResponse = SequenceView;

/**
 * Graph view generation option.
 */
export type GetGraphViewDto = TestResultViewOption;

/**
 * Generated graph view.
 */
export type GetGraphViewResponse = {
  nodes: {
    windowId: string;
    screenId: string;
    testSteps: {
      id: string;
      type: string;
      input?: string;
      targetElementId?: string;
      noteIds: string[];
      testPurposeId?: string;
      pageUrl: string;
      pageTitle: string;
      imageFileUrl?: string;
      iframeIndex?: number;
    }[];
    defaultValues: { elementId: string; value?: string }[];
  }[];
  store: {
    windows: { id: string; name: string }[];
    screens: { id: string; name: string; elementIds: string[] }[];
    elements: {
      id: string;
      pageUrl: string;
      pageTitle: string;
      xpath: string;
      tagname: string;
      text: string;
      attributes: { [key: string]: string };
    }[];
    testPurposes: { id: string; value: string; details: string }[];
    notes: {
      id: string;
      value: string;
      details: string;
      tags?: string[];
      imageFileUrl?: string;
    }[];
  };
};
