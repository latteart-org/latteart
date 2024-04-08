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

/**
 * Class that handles reports.
 */
export default class Report {
  private _header: ReportRow = {
    groupName: "GroupName",
    testTargetName: "TestTargetName",
    viewPointName: "ViewPointName",
    sessionName: "Session",
    testItem: "TestItem",
    intentionValue: "Intention",
    intentionDetails: "IntentionDetails",
    bugValue: "Bug",
    bugDetails: "BugDetails"
  };
  private _rows: ReportRow[] = [];

  /**
   * Get the header.
   */
  get header(): ReportRow {
    return this._header;
  }

  set header(value: ReportRow) {
    this._header = value;
  }

  /**
   * Get all row data.
   */
  get rows(): ReportRow[] {
    return this._rows;
  }

  /**
   * Add row data.
   * @param row  Row data to add.
   */
  public addRow(row: ReportRow): void {
    this._rows.push(row);
  }
}

interface ReportRow {
  groupName: string;
  testTargetName: string;
  viewPointName: string;
  sessionName: string;
  testItem: string;
  intentionValue: string;
  intentionDetails: string;
  bugValue: string;
  bugDetails: string;
}
