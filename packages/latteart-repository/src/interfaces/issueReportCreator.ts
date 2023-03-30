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

/**
 * Issue report creator.
 */
export type IssueReportCreator = {
  output(
    outputDirectoryPath: string,
    reportSource: {
      testMatrixName: string;
      rows: IssueReportRow[];
    }
  ): void;
};

/**
 * Issue report row.
 */
export type IssueReportRow = {
  groupName: string;
  testTargetName: string;
  viewPointName: string;
  sessionName: string;
  tester: string;
  memo: string;
  testPurposeValue: string;
  testPurposeDetails: string;
  noteValue: string;
  noteDetails: string;
  tags: string;
};

/**
 * Test purpose sheet row.
 */
export type TestPurposeSheetRow = Pick<
  IssueReportRow,
  | "groupName"
  | "testTargetName"
  | "viewPointName"
  | "sessionName"
  | "testPurposeValue"
  | "testPurposeDetails"
>;

/**
 * Sheet name.
 */
export type SheetName = "Findings" | "TestPurposes";
