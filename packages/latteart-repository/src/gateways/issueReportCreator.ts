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

import * as XLSX from "xlsx";
import path from "path";
import {
  IssueReportCreator,
  IssueReportRow,
  SheetName,
  TestPurposeSheetRow,
} from "@/interfaces/issueReportCreator";

export class IssueReportCreatorImpl implements IssueReportCreator {
  public output(
    outputDirectoryPath: string,
    reportSource: {
      testMatrixName: string;
      rows: IssueReportRow[];
    }
  ): void {
    const report = new IssueReport(reportSource.testMatrixName);
    const workbook = XLSX.utils.book_new();

    this.writeWorkSheet(reportSource.rows, report, workbook, "Findings");

    const testPurposeRows = this.createtestPurposeRows(reportSource.rows);

    this.writeWorkSheet(testPurposeRows, report, workbook, "TestPurposes");

    const filePath = path.join(
      outputDirectoryPath,
      `${report.sanitizeName}.xlsx`
    );

    XLSX.writeFile(workbook, filePath);
  }

  private writeWorkSheet(
    rows: IssueReportRow[] | TestPurposeSheetRow[],
    report: IssueReport,
    workbook: XLSX.WorkBook,
    sheetName: SheetName
  ) {
    for (const row of rows) {
      report.addRow(row, sheetName);
    }

    const header =
      sheetName === "Findings"
        ? report.header
        : {
            groupName: report.header.groupName,
            testTargetName: report.header.testTargetName,
            viewPointName: report.header.viewPointName,
            sessionName: report.header.sessionName,
            testPurposeValue: report.header.testPurposeValue,
            testPurposeDetails: report.header.testPurposeDetails,
          };

    const reportRows =
      sheetName === "Findings" ? report.rows : report.testPurposeRows;

    const ws = XLSX.utils.aoa_to_sheet([Object.values(header)]);

    reportRows.forEach((row, index) => {
      XLSX.utils.sheet_add_aoa(ws, [Object.values(row)], {
        origin: `A${index + 2}`,
      });
    });

    XLSX.utils.book_append_sheet(workbook, ws, sheetName);
  }

  private createtestPurposeRows(rows: IssueReportRow[]) {
    return rows.reduce((acc: TestPurposeSheetRow[], row) => {
      const lastItem = acc.at(-1);

      if (!lastItem) {
        acc.push({
          groupName: row.groupName,
          testTargetName: row.testTargetName,
          viewPointName: row.viewPointName,
          sessionName: row.sessionName,
          testPurposeValue: row.testPurposeValue,
          testPurposeDetails: row.testPurposeDetails,
        });
      } else if (
        lastItem.groupName !== row.groupName ||
        lastItem.testTargetName !== row.testTargetName ||
        lastItem.viewPointName !== row.viewPointName ||
        lastItem.sessionName !== row.sessionName
      ) {
        acc.push({
          groupName: row.groupName,
          testTargetName: row.testTargetName,
          viewPointName: row.viewPointName,
          sessionName: row.sessionName,
          testPurposeValue: row.testPurposeValue,
          testPurposeDetails: row.testPurposeDetails,
        });
      } else if (
        lastItem.testPurposeValue !== row.testPurposeValue ||
        lastItem.testPurposeDetails !== row.testPurposeDetails
      ) {
        acc.push({
          groupName: row.groupName,
          testTargetName: row.testTargetName,
          viewPointName: row.viewPointName,
          sessionName: row.sessionName,
          testPurposeValue: row.testPurposeValue,
          testPurposeDetails: row.testPurposeDetails,
        });
      }

      return acc;
    }, []);
  }
}

class IssueReport {
  private _name: string;

  private _header: IssueReportRow = {
    groupName: "GroupName",
    testTargetName: "TestTargetName",
    viewPointName: "ViewPointName",
    sessionName: "Session",
    tester: "Tester",
    memo: "Memo",
    testPurposeValue: "TestPurpose",
    testPurposeDetails: "TestPurposeDetail",
    noteValue: "Finding",
    noteDetails: "FindingDetail",
    tags: "Tags",
  };

  private _rows: IssueReportRow[] = [];

  private _testPurposeRows: TestPurposeSheetRow[] = [];

  get name(): string {
    return this._name;
  }

  get sanitizeName(): string {
    return this._name
      .replace(/"/g, "_")
      .replace(/</g, "_")
      .replace(/>/g, "_")
      .replace(/\|/g, "_")
      .replace(/:/g, "_")
      .replace(/\*/g, "_")
      .replace(/\?/g, "_")
      .replace(/\\/g, "_")
      .replace(/\//g, "_");
  }

  get header(): IssueReportRow {
    return this._header;
  }

  set header(value: IssueReportRow) {
    this._header = value;
  }

  get rows(): IssueReportRow[] {
    return this._rows;
  }

  get testPurposeRows(): TestPurposeSheetRow[] {
    return this._testPurposeRows;
  }

  constructor(name: string) {
    this._name = name;
  }

  public addRow(
    row: IssueReportRow | TestPurposeSheetRow,
    sheetName: SheetName
  ): void {
    if (sheetName === "Findings") {
      this._rows.push(row as IssueReportRow);
    } else {
      this._testPurposeRows.push(row as TestPurposeSheetRow);
    }
  }
}
