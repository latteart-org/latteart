import {
  FileRepositoryManager,
  StaticDirectory,
} from "@/gateways/fileRepository";
import { TestResultImportServiceImpl } from "@/services/TestResultImportService";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { ImportFileRepositoryImpl } from "@/gateways/importFileRepository";
import { TimestampService } from "@/services/TimestampService";
import { getRepository } from "typeorm";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { TestStepEntity } from "@/entities/TestStepEntity";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";
import { NoteEntity } from "@/entities/NoteEntity";
import { TagEntity } from "@/entities/TagEntity";
import { ScreenshotEntity } from "@/entities/ScreenshotEntity";
import { CoverageSourceEntity } from "@/entities/CoverageSourceEntity";
import { TestPurposeEntity } from "@/entities/TestPurposeEntity";
import {
  TestResultExportDataV1,
  TestResultExportDataV2,
} from "@/interfaces/exportData";

const packageRootDirPath = path.join(__dirname, "..", "..");
const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("TestResultImportService", () => {
  describe("#saveImportFileData", () => {
    let tmpDirPath: string;

    beforeEach(async () => {
      tmpDirPath = await fs.mkdtemp(path.join(os.tmpdir(), "latteart-"));
    });

    afterEach(async () => {
      await fs.remove(tmpDirPath);
    });

    it("バージョン1のインポートデータをDBに保存する", async () => {
      const timestampService: TimestampService = {
        unix: jest.fn().mockReturnValue(0),
        format: jest.fn().mockReturnValue("0"),
        epochMilliseconds: jest.fn().mockReturnValue(0),
      };

      const fileRepositories = new Map([
        [
          "screenshot",
          new StaticDirectory(path.join(tmpDirPath, "screenshots")),
        ],
      ]);
      const screenshotFileRepository = new FileRepositoryManager(
        fileRepositories,
        tmpDirPath
      ).getRepository("screenshot");

      const importFileRepository = new ImportFileRepositoryImpl();

      const service = new TestResultImportServiceImpl({
        screenshotFileRepository,
        importFileRepository,
        timestamp: timestampService,
      });

      const testImage = await fs.promises.readFile(
        path.join(packageRootDirPath, "resources", "test.png")
      );

      const screenshots = [
        { filePath: "noteScreenshot.png", data: testImage },
        { filePath: "testStepScreenshot.webp", data: testImage },
      ];
      const element1 = {
        tagname: "tagname",
        text: "text",
        xpath: "xpath",
        value: "value",
        checked: false,
        attributes: {},
      };
      const testPurpose1 = {
        id: "testPurpose1",
        type: "intention",
        value: "testPurposeValue",
        details: "testPurposeDetails",
        imageFileUrl: "",
        tags: [],
      };
      const note1 = {
        id: "notice1",
        type: "notice",
        value: "noticeValue",
        details: "noticeDetails",
        imageFileUrl: screenshots[0].filePath,
        tags: ["tag"],
      };

      const historyItem1 = {
        testStep: {
          timestamp: "10",
          imageFileUrl: screenshots[1].filePath,
          windowInfo: {
            windowHandle: "windowHandle",
          },
          pageInfo: { title: "title", url: "url", keywordTexts: [] },
          operation: {
            input: "input",
            type: "type",
            elementInfo: element1,
            isAutomatic: false,
          },
          inputElements: [element1],
        },
        testPurpose: testPurpose1.id,
        notes: [note1.id],
      };
      const testResultExportData: TestResultExportDataV1 = {
        version: 1,
        name: "testResultName",
        sessionId: "testResultId",
        startTimeStamp: 0,
        endTimeStamp: -1,
        initialUrl: "initialUrl",
        history: { "1": historyItem1 },
        notes: [testPurpose1, note1],
        coverageSources: [
          { title: "title", url: "url", screenElements: [element1] },
        ],
      };

      const result = await service.saveImportFileData(
        {
          testResultFile: {
            fileName: "log.json",
            data: JSON.stringify(testResultExportData),
          },
          screenshots,
        },
        null
      );

      const testResultEntities = await getRepository(TestResultEntity).find({
        relations: [
          "testSteps",
          "testSteps.notes",
          "testSteps.notes.screenshot",
          "testSteps.notes.tags",
          "testSteps.testPurpose",
          "testSteps.screenshot",
          "coverageSources",
        ],
      });

      const testResultEntity = testResultEntities[0];

      // TestStepの確認
      const testStepEntities = testResultEntities[0].testSteps ?? [];
      const testStepEntity = testStepEntities[0];
      expect(testStepEntity.inputElements).toEqual(
        JSON.stringify(historyItem1.testStep.inputElements)
      );
      expect(testStepEntity.keywordTexts).toEqual(
        JSON.stringify(historyItem1.testStep.pageInfo.keywordTexts)
      );
      expect(testStepEntity.operationElement).toEqual(
        JSON.stringify(historyItem1.testStep.operation.elementInfo)
      );
      expect(testStepEntity.operationInput).toEqual(
        historyItem1.testStep.operation.input
      );
      expect(testStepEntity.operationType).toEqual(
        historyItem1.testStep.operation.type
      );
      expect(testStepEntity.pageTitle).toEqual(
        historyItem1.testStep.pageInfo.title
      );
      expect(testStepEntity.pageUrl).toEqual(
        historyItem1.testStep.pageInfo.url
      );

      // TestStepのスクリーンショットの確認
      const testStepScreenshotEntity = testStepEntity.screenshot;
      const testStepImageFileUrl = screenshotFileRepository.getFileUrl(
        `${testStepScreenshotEntity?.id}.webp`
      );
      expect(testStepScreenshotEntity?.fileUrl).toEqual(testStepImageFileUrl);
      const testStepImageFilePath = screenshotFileRepository.getFilePath(
        `${testStepScreenshotEntity?.id}.webp`
      );
      expect(
        (await fs.promises.readFile(testStepImageFilePath)).toString("base64")
      ).toEqual(testImage.toString("base64"));

      // Noteの確認
      const noteEntities = testStepEntity.notes ?? [];
      const noteEntity = noteEntities[0];
      expect(noteEntity.value).toEqual(note1.value);
      expect(noteEntity.details).toEqual(note1.details);
      expect((noteEntity.tags ?? []).length).toEqual(1);
      expect((noteEntity.tags ?? [])[0].name).toEqual(note1.tags[0]);

      // Noteのスクリーンショットの確認
      const noteScreenshotEntity = noteEntity.screenshot;
      const noteImageFileUrl = screenshotFileRepository.getFileUrl(
        `${noteScreenshotEntity?.id}.png`
      );
      expect(noteScreenshotEntity?.fileUrl).toEqual(noteImageFileUrl);
      const noteImageFilePath = screenshotFileRepository.getFilePath(
        `${noteScreenshotEntity?.id}.png`
      );
      expect(
        (await fs.promises.readFile(noteImageFilePath)).toString("base64")
      ).toEqual(testImage.toString("base64"));

      // TestPurposeの確認
      const testPurposeEntity = testStepEntity.testPurpose;
      expect(testPurposeEntity?.title).toEqual(testPurpose1.value);
      expect(testPurposeEntity?.details).toEqual(testPurpose1.details);

      expect(testStepEntity.timestamp).toEqual(
        parseInt(historyItem1.testStep.timestamp, 10)
      );
      expect(testStepEntity.windowHandle).toEqual(
        historyItem1.testStep.windowInfo.windowHandle
      );

      // TestResultの確認
      expect(testResultEntity.id).toEqual(result.newTestResultId);

      expect(testResultEntity.name).toEqual(testResultExportData.name);
      expect(testResultEntity.startTimestamp).toEqual(
        testResultExportData.startTimeStamp
      );
      expect(testResultEntity.lastUpdateTimestamp).toEqual(10);
      expect(testResultEntity.initialUrl).toEqual(
        testResultExportData.initialUrl
      );
      expect(testResultEntity.testingTime).toEqual(0);

      expect(testResultEntity.noteIds).toContain(noteEntity.id);
      expect(testResultEntity.screenshotIds).toContain(
        noteScreenshotEntity?.id
      );
      expect(testResultEntity.screenshotIds).toContain(
        testStepScreenshotEntity?.id
      );
      expect(testResultEntity.testPurposeIds).toContain(testPurposeEntity?.id);

      // CoverageSourceの確認
      const coverageSourceEntity = (testResultEntity.coverageSources ?? [])[0];
      expect(coverageSourceEntity.title).toEqual(
        testResultExportData.coverageSources[0].title
      );
      expect(coverageSourceEntity.url).toEqual(
        testResultExportData.coverageSources[0].url
      );
      expect(coverageSourceEntity.screenElements).toEqual(
        JSON.stringify(testResultExportData.coverageSources[0].screenElements)
      );

      // 各テーブルのレコード数の確認
      expect(testResultEntities.length).toEqual(1);
      expect((await getRepository(TestStepEntity).find()).length).toEqual(1);
      expect((await getRepository(NoteEntity).find()).length).toEqual(1);
      expect((await getRepository(TestPurposeEntity).find()).length).toEqual(1);
      expect((await getRepository(TagEntity).find()).length).toEqual(1);
      expect((await getRepository(ScreenshotEntity).find()).length).toEqual(2);
      expect((await getRepository(CoverageSourceEntity).find()).length).toEqual(
        1
      );
    });

    it("バージョン2のインポートデータをDBに保存する", async () => {
      const timestampService: TimestampService = {
        unix: jest.fn().mockReturnValue(0),
        format: jest.fn().mockReturnValue("0"),
        epochMilliseconds: jest.fn().mockReturnValue(0),
      };

      const screenshotFileRepository = new FileRepositoryManager(
        new Map([
          [
            "screenshot",
            new StaticDirectory(path.join(tmpDirPath, "screenshots")),
          ],
        ]),
        tmpDirPath
      ).getRepository("screenshot");

      const importFileRepository = new ImportFileRepositoryImpl();

      const service = new TestResultImportServiceImpl({
        screenshotFileRepository,
        importFileRepository,
        timestamp: timestampService,
      });

      const testImage = await fs.promises.readFile(
        path.join(packageRootDirPath, "resources", "test.png")
      );

      const screenshots = [
        { filePath: "noteScreenshot.png", data: testImage },
        { filePath: "testStepScreenshot.webp", data: testImage },
      ];
      const element1 = {
        tagname: "tagname",
        text: "text",
        xpath: "xpath",
        value: "value",
        checked: false,
        attributes: {},
      };
      const testPurpose1 = {
        id: "testPurpose1",
        type: "intention",
        value: "testPurposeValue",
        details: "testPurposeDetails",
        imageFileUrl: "",
        tags: [],
      };
      const note1 = {
        id: "notice1",
        type: "notice",
        value: "noticeValue",
        details: "noticeDetails",
        imageFileUrl: screenshots[0].filePath,
        tags: ["tag"],
      };

      const historyItem1 = {
        testStep: {
          timestamp: "0",
          imageFileUrl: screenshots[1].filePath,
          windowInfo: {
            windowHandle: "windowHandle",
          },
          pageInfo: { title: "title", url: "url", keywordTexts: [] },
          operation: {
            input: "input",
            type: "type",
            elementInfo: element1,
            isAutomatic: false,
          },
          inputElements: [element1],
        },
        testPurpose: testPurpose1.id,
        notes: [note1.id],
      };
      const testResultExportData: TestResultExportDataV2 = {
        version: 2,
        name: "testResultName",
        sessionId: "testResultId",
        startTimeStamp: 0,
        lastUpdateTimeStamp: -1,
        initialUrl: "initialUrl",
        testingTime: 0,
        history: { "1": historyItem1 },
        notes: [testPurpose1, note1],
        coverageSources: [
          { title: "title", url: "url", screenElements: [element1] },
        ],
      };

      const result = await service.saveImportFileData(
        {
          testResultFile: {
            fileName: "log.json",
            data: JSON.stringify(testResultExportData),
          },
          screenshots,
        },
        null
      );

      const testResultEntities = await getRepository(TestResultEntity).find({
        relations: [
          "testSteps",
          "testSteps.notes",
          "testSteps.notes.screenshot",
          "testSteps.notes.tags",
          "testSteps.testPurpose",
          "testSteps.screenshot",
          "coverageSources",
        ],
      });

      const testResultEntity = testResultEntities[0];

      // TestStepの確認
      const testStepEntities = testResultEntities[0].testSteps ?? [];
      const testStepEntity = testStepEntities[0];
      expect(testStepEntity.inputElements).toEqual(
        JSON.stringify(historyItem1.testStep.inputElements)
      );
      expect(testStepEntity.keywordTexts).toEqual(
        JSON.stringify(historyItem1.testStep.pageInfo.keywordTexts)
      );
      expect(testStepEntity.operationElement).toEqual(
        JSON.stringify(historyItem1.testStep.operation.elementInfo)
      );
      expect(testStepEntity.operationInput).toEqual(
        historyItem1.testStep.operation.input
      );
      expect(testStepEntity.operationType).toEqual(
        historyItem1.testStep.operation.type
      );
      expect(testStepEntity.pageTitle).toEqual(
        historyItem1.testStep.pageInfo.title
      );
      expect(testStepEntity.pageUrl).toEqual(
        historyItem1.testStep.pageInfo.url
      );

      // TestStepのスクリーンショットの確認
      const testStepScreenshotEntity = testStepEntity.screenshot;
      const testStepImageFileUrl = screenshotFileRepository.getFileUrl(
        `${testStepScreenshotEntity?.id}.webp`
      );
      expect(testStepScreenshotEntity?.fileUrl).toEqual(testStepImageFileUrl);
      const testStepImageFilePath = screenshotFileRepository.getFilePath(
        `${testStepScreenshotEntity?.id}.webp`
      );
      expect(
        (await fs.promises.readFile(testStepImageFilePath)).toString("base64")
      ).toEqual(testImage.toString("base64"));

      // Noteの確認
      const noteEntities = testStepEntity.notes ?? [];
      const noteEntity = noteEntities[0];
      expect(noteEntity.value).toEqual(note1.value);
      expect(noteEntity.details).toEqual(note1.details);
      expect((noteEntity.tags ?? []).length).toEqual(1);
      expect((noteEntity.tags ?? [])[0].name).toEqual(note1.tags[0]);

      // Noteのスクリーンショットの確認
      const noteScreenshotEntity = noteEntity.screenshot;
      const noteImageFileUrl = screenshotFileRepository.getFileUrl(
        `${noteScreenshotEntity?.id}.png`
      );
      expect(noteScreenshotEntity?.fileUrl).toEqual(noteImageFileUrl);
      const noteImageFilePath = screenshotFileRepository.getFilePath(
        `${noteScreenshotEntity?.id}.png`
      );
      expect(
        (await fs.promises.readFile(noteImageFilePath)).toString("base64")
      ).toEqual(testImage.toString("base64"));

      // TestPurposeの確認
      const testPurposeEntity = testStepEntity.testPurpose;
      expect(testPurposeEntity?.title).toEqual(testPurpose1.value);
      expect(testPurposeEntity?.details).toEqual(testPurpose1.details);

      expect(testStepEntity.timestamp).toEqual(
        parseInt(historyItem1.testStep.timestamp, 10)
      );
      expect(testStepEntity.windowHandle).toEqual(
        historyItem1.testStep.windowInfo.windowHandle
      );

      // TestResultの確認
      expect(testResultEntity.id).toEqual(result.newTestResultId);

      expect(testResultEntity.name).toEqual(testResultExportData.name);
      expect(testResultEntity.startTimestamp).toEqual(
        testResultExportData.startTimeStamp
      );
      expect(testResultEntity.lastUpdateTimestamp).toEqual(-1);
      expect(testResultEntity.initialUrl).toEqual(
        testResultExportData.initialUrl
      );
      expect(testResultEntity.testingTime).toEqual(0);

      expect(testResultEntity.noteIds).toContain(noteEntity.id);
      expect(testResultEntity.screenshotIds).toContain(
        noteScreenshotEntity?.id
      );
      expect(testResultEntity.screenshotIds).toContain(
        testStepScreenshotEntity?.id
      );
      expect(testResultEntity.testPurposeIds).toContain(testPurposeEntity?.id);

      // CoverageSourceの確認
      const coverageSourceEntity = (testResultEntity.coverageSources ?? [])[0];
      expect(coverageSourceEntity.title).toEqual(
        testResultExportData.coverageSources[0].title
      );
      expect(coverageSourceEntity.url).toEqual(
        testResultExportData.coverageSources[0].url
      );
      expect(coverageSourceEntity.screenElements).toEqual(
        JSON.stringify(testResultExportData.coverageSources[0].screenElements)
      );

      // 各テーブルのレコード数の確認
      expect(testResultEntities.length).toEqual(1);
      expect((await getRepository(TestStepEntity).find()).length).toEqual(1);
      expect((await getRepository(NoteEntity).find()).length).toEqual(1);
      expect((await getRepository(TestPurposeEntity).find()).length).toEqual(1);
      expect((await getRepository(TagEntity).find()).length).toEqual(1);
      expect((await getRepository(ScreenshotEntity).find()).length).toEqual(2);
      expect((await getRepository(CoverageSourceEntity).find()).length).toEqual(
        1
      );
    });
  });
});
