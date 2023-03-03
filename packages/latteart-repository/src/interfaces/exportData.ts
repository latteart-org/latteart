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
  CoverageSource,
  ElementInfo,
  Note,
  Operation,
  TestResult,
  TestStep,
} from "@/domain/types";

export type DeserializedTestResult = Omit<
  TestResult,
  "testSteps" | "coverageSources"
> & {
  testSteps: DeserializedTestStep[];
  coverageSources: (Pick<CoverageSource, "title" | "url"> & {
    screenElements: DeserializedElementInfo[];
  })[];
};
export type DeserializedTestStep = Pick<TestStep, "id"> & {
  operation: Omit<
    Operation,
    "elementInfo" | "inputElements" | "keywordTexts" | "screenshot"
  > & {
    elementInfo: DeserializedElementInfo | null;
    inputElements: DeserializedElementInfo[];
    keywordTexts: (string | { tagname: string; value: string })[];
    imageFileUrl: string;
  };
  testPurpose: (Omit<Note, "screenshot"> & { imageFileUrl: string }) | null;
  notes: (Omit<Note, "screenshot"> & { imageFileUrl: string })[];
};

type DeserializedElementInfo = Pick<ElementInfo, "tagname" | "xpath"> & {
  text: string;
  value: string;
  checked: boolean;
  attributes: {
    [key: string]: string;
  };
};

// V0 Format
export type TestResultExportDataV0 = {
  name: string;
  sessionId: string;
  startTimeStamp: number;
  endTimeStamp: number;
  initialUrl: string;
  notes: {
    id: string;
    type: string;
    value: string;
    details: string;
    imageFileUrl: string;
    tags: string[];
  }[];
  coverageSources: CoverageSourceExportDataV0[];
  history: { [k: string]: HistoryItemExportDataV0 };
};
type CoverageSourceExportDataV0 = {
  title: string;
  url: string;
  screenElements: ElementInfoExportDataV0[];
};
export type HistoryItemExportDataV0 = {
  testStep: {
    timestamp: string;
    imageFileUrl: string;
    windowInfo: { windowHandle: string };
    pageInfo: { title: string; url: string; keywordTexts: string[] };
    operation: OperationExportDataV0;
    inputElements: ElementInfoExportDataV0[];
  };
  intention: string | null;
  bugs: string[];
  notices: string[];
};
type OperationExportDataV0 = {
  input: string;
  type: string;
  elementInfo: ElementInfoExportDataV0 | null;
  isAutomatic?: boolean;
};
type ElementInfoExportDataV0 = {
  tagname: string;
  text: string;
  xpath: string;
  value: string;
  checked: boolean;
  attributes: { [key: string]: string };
};

// V1 Format
export type TestResultExportDataV1 = Omit<TestResultExportDataV0, "history"> & {
  version: number;
  history: { [k: string]: HistoryItemExportDataV1 };
};
type CoverageSourceExportDataV1 = CoverageSourceExportDataV0;
export type HistoryItemExportDataV1 = Pick<
  HistoryItemExportDataV0,
  "testStep"
> & {
  testPurpose: string | null;
  notes: string[];
};
type OperationExportDataV1 = HistoryItemExportDataV1["testStep"]["operation"];
type ElementInfoExportDataV1 = ElementInfoExportDataV0;

// V2 Format
export type TestResultExportDataV2 = Omit<
  TestResultExportDataV1,
  "endTimeStamp" | "coverageSources" | "history"
> & {
  lastUpdateTimeStamp: number;
  testingTime: number;
  coverageSources: CoverageSourceExportDataV2[];
  history: { [k: string]: HistoryItemExportDataV2 };
};
type CoverageSourceExportDataV2 = Omit<
  CoverageSourceExportDataV1,
  "screenElements"
> & {
  screenElements: ElementInfoExportDataV2[];
};
export type HistoryItemExportDataV2 = Omit<
  HistoryItemExportDataV1,
  "testStep"
> & {
  testStep: Omit<
    HistoryItemExportDataV1["testStep"],
    "operation" | "inputElements" | "pageInfo"
  > & {
    operation: OperationExportDataV2;
    inputElements: ElementInfoExportDataV2[];
    pageInfo: {
      title: string;
      url: string;
      keywordTexts: (string | { tagname: string; value: string })[];
    };
  };
};
type OperationExportDataV2 = Omit<OperationExportDataV1, "elementInfo"> & {
  elementInfo: ElementInfoExportDataV2 | null;
  scrollPosition?: { x: number; y: number };
  clientSize?: { width: number; height: number };
};
type ElementInfoExportDataV2 = ElementInfoExportDataV1 & {
  boundingRect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  textWithoutChildren?: string;
};
