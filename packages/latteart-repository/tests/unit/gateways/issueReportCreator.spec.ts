import fs from "fs-extra";
import path from "path";
import os from "os";
import * as XLSX from "xlsx";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";
import { IssueReportCreatorImpl } from "@/gateways/issueReportCreator";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("IssueReportCreator", () => {
  describe("#output", () => {
    let tmpDirPath: string;

    beforeEach(async () => {
      tmpDirPath = await fs.mkdtemp(path.join(os.tmpdir(), "latteart-"));
    });

    afterEach(async () => {
      await fs.remove(tmpDirPath);
    });

    const commonRow = {
      groupName: "groupName",
      testTargetName: "testTargetName",
      viewPointName: "viewPointName",
      sessionName: "sessionName",
      tester: "tester",
      memo: "memo",
    };

    it("渡したデータが目的ありだった場合Findings、TestPurposesのシートに分けてExcelが出力される", async () => {
      const service = new IssueReportCreatorImpl();

      const row1 = {
        ...commonRow,
        testPurposeValue: "testPurposeValue1",
        testPurposeDetails: "testPurposeDetails1",
        noteValue: "noteValue1",
        noteDetails: "noteDetails1",
        tags: "bug,test",
      };

      const row2 = {
        ...commonRow,
        testPurposeValue: "testPurposeValue2",
        testPurposeDetails: "testPurposeDetails2",
        noteValue: "noteValue2",
        noteDetails: "noteDetails2",
        tags: "",
      };

      const reportSource = {
        testMatrixName: "testMatrixName",
        rows: [row1, row2],
      };

      service.output(tmpDirPath, reportSource);

      const filePath = path.join(
        tmpDirPath,
        `${reportSource.testMatrixName}.xlsx`
      );

      const workbook = XLSX.readFile(filePath);
      const sheet1 = workbook.Sheets["Findings"];
      const findings = XLSX.utils.sheet_to_json(sheet1);

      const sheetNames = workbook.SheetNames;

      expect(sheetNames.length).toEqual(2);
      expect(sheetNames[0]).toEqual("Findings");
      expect(sheetNames[1]).toEqual("TestPurposes");

      expect(findings).toEqual([
        {
          GroupName: "groupName",
          TestTargetName: "testTargetName",
          ViewPointName: "viewPointName",
          Session: "sessionName",
          Tester: "tester",
          Memo: "memo",
          TestPurpose: "testPurposeValue1",
          TestPurposeDetail: "testPurposeDetails1",
          Finding: "noteValue1",
          FindingDetail: "noteDetails1",
          Tags: "bug,test",
        },
        {
          GroupName: "groupName",
          TestTargetName: "testTargetName",
          ViewPointName: "viewPointName",
          Session: "sessionName",
          Tester: "tester",
          Memo: "memo",
          TestPurpose: "testPurposeValue2",
          TestPurposeDetail: "testPurposeDetails2",
          Finding: "noteValue2",
          FindingDetail: "noteDetails2",
          Tags: "",
        },
      ]);

      const sheet2 = workbook.Sheets["TestPurposes"];
      const testPurposes = XLSX.utils.sheet_to_json(sheet2);

      expect(testPurposes).toEqual([
        {
          GroupName: "groupName",
          TestTargetName: "testTargetName",
          ViewPointName: "viewPointName",
          Session: "sessionName",
          TestPurpose: "testPurposeValue1",
          TestPurposeDetail: "testPurposeDetails1",
        },
        {
          GroupName: "groupName",
          TestTargetName: "testTargetName",
          ViewPointName: "viewPointName",
          Session: "sessionName",
          TestPurpose: "testPurposeValue2",
          TestPurposeDetail: "testPurposeDetails2",
        },
      ]);
    });

    it("渡したデータが目的なしだった場合、Findings、TestPurposesのシートに分けてExcelが出力される", async () => {
      const service = new IssueReportCreatorImpl();

      const row1 = {
        ...commonRow,
        testPurposeValue: "",
        testPurposeDetails: "",
        noteValue: "noteValue1",
        noteDetails: "noteDetails1",
        tags: "bug,test",
      };

      const row2 = {
        ...commonRow,
        testPurposeValue: "",
        testPurposeDetails: "",
        noteValue: "noteValue2",
        noteDetails: "noteDetails2",
        tags: "",
      };

      const reportSource = {
        testMatrixName: "testMatrixName",
        rows: [row1, row2],
      };

      service.output(tmpDirPath, reportSource);

      const filePath = path.join(
        tmpDirPath,
        `${reportSource.testMatrixName}.xlsx`
      );

      const workbook = XLSX.readFile(filePath);
      const sheet1 = workbook.Sheets["Findings"];
      const findings = XLSX.utils.sheet_to_json(sheet1);

      const sheetNames = workbook.SheetNames;

      expect(sheetNames.length).toEqual(2);
      expect(sheetNames[0]).toEqual("Findings");
      expect(sheetNames[1]).toEqual("TestPurposes");

      expect(findings).toEqual([
        {
          GroupName: "groupName",
          TestTargetName: "testTargetName",
          ViewPointName: "viewPointName",
          Session: "sessionName",
          Tester: "tester",
          Memo: "memo",
          TestPurpose: "",
          TestPurposeDetail: "",
          Finding: "noteValue1",
          FindingDetail: "noteDetails1",
          Tags: "bug,test",
        },
        {
          GroupName: "groupName",
          TestTargetName: "testTargetName",
          ViewPointName: "viewPointName",
          Session: "sessionName",
          Tester: "tester",
          Memo: "memo",
          TestPurpose: "",
          TestPurposeDetail: "",
          Finding: "noteValue2",
          FindingDetail: "noteDetails2",
          Tags: "",
        },
      ]);

      const sheet2 = workbook.Sheets["TestPurposes"];
      const testPurposes = XLSX.utils.sheet_to_json(sheet2);

      expect(testPurposes).toEqual([
        {
          GroupName: "groupName",
          TestTargetName: "testTargetName",
          ViewPointName: "viewPointName",
          Session: "sessionName",
          TestPurpose: "",
          TestPurposeDetail: "",
        },
      ]);
    });

    it("渡したデータのセッション内に目的が重複するデータがある場合はTestPurposesのシート内で重複削除された結果が出力される", async () => {
      const service = new IssueReportCreatorImpl();

      const row1 = {
        ...commonRow,
        testPurposeValue: "testPurposeValue1",
        testPurposeDetails: "testPurposeDetails1",
        noteValue: "noteValue1",
        noteDetails: "noteDetails1",
        tags: "bug,test",
      };

      const row2 = {
        ...commonRow,
        testPurposeValue: "testPurposeValue1",
        testPurposeDetails: "testPurposeDetails1",
        noteValue: "noteValue2",
        noteDetails: "noteDetails2",
        tags: "",
      };

      const reportSource = {
        testMatrixName: "testMatrixName",
        rows: [row1, row2],
      };

      service.output(tmpDirPath, reportSource);

      const filePath = path.join(
        tmpDirPath,
        `${reportSource.testMatrixName}.xlsx`
      );

      const workbook = XLSX.readFile(filePath);
      const sheet1 = workbook.Sheets["Findings"];
      const findings = XLSX.utils.sheet_to_json(sheet1);

      const sheetNames = workbook.SheetNames;

      expect(sheetNames.length).toEqual(2);
      expect(sheetNames[0]).toEqual("Findings");
      expect(sheetNames[1]).toEqual("TestPurposes");

      expect(findings).toEqual([
        {
          GroupName: "groupName",
          TestTargetName: "testTargetName",
          ViewPointName: "viewPointName",
          Session: "sessionName",
          Tester: "tester",
          Memo: "memo",
          TestPurpose: "testPurposeValue1",
          TestPurposeDetail: "testPurposeDetails1",
          Finding: "noteValue1",
          FindingDetail: "noteDetails1",
          Tags: "bug,test",
        },
        {
          GroupName: "groupName",
          TestTargetName: "testTargetName",
          ViewPointName: "viewPointName",
          Session: "sessionName",
          Tester: "tester",
          Memo: "memo",
          TestPurpose: "testPurposeValue1",
          TestPurposeDetail: "testPurposeDetails1",
          Finding: "noteValue2",
          FindingDetail: "noteDetails2",
          Tags: "",
        },
      ]);

      const sheet2 = workbook.Sheets["TestPurposes"];
      const testPurposes = XLSX.utils.sheet_to_json(sheet2);

      expect(testPurposes).toEqual([
        {
          GroupName: "groupName",
          TestTargetName: "testTargetName",
          ViewPointName: "viewPointName",
          Session: "sessionName",
          TestPurpose: "testPurposeValue1",
          TestPurposeDetail: "testPurposeDetails1",
        },
      ]);
    });

    it("渡したデータが複数セッションだった場合、Findings、TestPurposesのシートに分けてExcelが出力される", async () => {
      const service = new IssueReportCreatorImpl();

      const row1 = {
        ...commonRow,
        testPurposeValue: "testPurposeValue1",
        testPurposeDetails: "testPurposeDetails1",
        noteValue: "noteValue1",
        noteDetails: "noteDetails1",
        tags: "bug,test",
      };

      const row2 = {
        ...commonRow,
        sessionName: "sessionName2",
        testPurposeValue: "testPurposeValue1",
        testPurposeDetails: "testPurposeDetails1",
        noteValue: "noteValue1",
        noteDetails: "noteDetails1",
        tags: "",
      };

      const reportSource = {
        testMatrixName: "testMatrixName",
        rows: [row1, row2],
      };

      service.output(tmpDirPath, reportSource);

      const filePath = path.join(
        tmpDirPath,
        `${reportSource.testMatrixName}.xlsx`
      );

      const workbook = XLSX.readFile(filePath);
      const sheet1 = workbook.Sheets["Findings"];
      const findings = XLSX.utils.sheet_to_json(sheet1);

      const sheetNames = workbook.SheetNames;

      expect(sheetNames.length).toEqual(2);
      expect(sheetNames[0]).toEqual("Findings");
      expect(sheetNames[1]).toEqual("TestPurposes");

      expect(findings).toEqual([
        {
          GroupName: "groupName",
          TestTargetName: "testTargetName",
          ViewPointName: "viewPointName",
          Session: "sessionName",
          Tester: "tester",
          Memo: "memo",
          TestPurpose: "testPurposeValue1",
          TestPurposeDetail: "testPurposeDetails1",
          Finding: "noteValue1",
          FindingDetail: "noteDetails1",
          Tags: "bug,test",
        },
        {
          GroupName: "groupName",
          TestTargetName: "testTargetName",
          ViewPointName: "viewPointName",
          Session: "sessionName2",
          Tester: "tester",
          Memo: "memo",
          TestPurpose: "testPurposeValue1",
          TestPurposeDetail: "testPurposeDetails1",
          Finding: "noteValue1",
          FindingDetail: "noteDetails1",
          Tags: "",
        },
      ]);

      const sheet2 = workbook.Sheets["TestPurposes"];
      const testPurposes = XLSX.utils.sheet_to_json(sheet2);

      expect(testPurposes).toEqual([
        {
          GroupName: "groupName",
          TestTargetName: "testTargetName",
          ViewPointName: "viewPointName",
          Session: "sessionName",
          TestPurpose: "testPurposeValue1",
          TestPurposeDetail: "testPurposeDetails1",
        },
        {
          GroupName: "groupName",
          TestTargetName: "testTargetName",
          ViewPointName: "viewPointName",
          Session: "sessionName2",
          TestPurpose: "testPurposeValue1",
          TestPurposeDetail: "testPurposeDetails1",
        },
      ]);
    });
  });
});
