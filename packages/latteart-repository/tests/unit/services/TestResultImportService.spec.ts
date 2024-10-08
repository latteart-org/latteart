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
import { TestResultEntity } from "@/entities/TestResultEntity";
import { TestStepEntity } from "@/entities/TestStepEntity";
import {
  SqliteTestConnectionHelper,
  TestDataSource,
} from "../../helper/TestConnectionHelper";
import { NoteEntity } from "@/entities/NoteEntity";
import { TagEntity } from "@/entities/TagEntity";
import { ScreenshotEntity } from "@/entities/ScreenshotEntity";
import { CoverageSourceEntity } from "@/entities/CoverageSourceEntity";
import { TestPurposeEntity } from "@/entities/TestPurposeEntity";
import {
  TestResultExportDataV0,
  TestResultExportDataV1,
  TestResultExportDataV2,
  TestResultExportDataV3,
} from "@/interfaces/exportData";
import { VideoEntity } from "@/entities/VideoEntity";
import { MutationService } from "@/services/MutationsService";
import { CommentsService } from "@/services/CommentsService";

const packageRootDirPath = path.join(__dirname, "..", "..");
const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection();
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

    it("バージョン0のインポートデータをDBに保存する", async () => {
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
        ["video", new StaticDirectory(path.join(tmpDirPath, "videos"))],
      ]);
      const screenshotFileRepository = new FileRepositoryManager(
        fileRepositories,
        tmpDirPath
      ).getRepository("screenshot");
      const videoFileRepository = new FileRepositoryManager(
        fileRepositories,
        tmpDirPath
      ).getRepository("video");

      const importFileRepository = new ImportFileRepositoryImpl();

      const service = new TestResultImportServiceImpl(TestDataSource, {
        screenshotFileRepository,
        videoFileRepository,
        importFileRepository,
        timestamp: timestampService,
        mutationService: new MutationService(TestDataSource),
        commentsService: new CommentsService(TestDataSource),
      });

      const testImage = await fs.promises.readFile(
        path.join(packageRootDirPath, "resources", "test.png")
      );

      const fileData = [
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
      const intention1 = {
        id: "intention1",
        type: "intention",
        value: "intentionValue",
        details: "intentionDetails",
        imageFileUrl: "",
        tags: [],
        timestamp: 0,
      };
      const notice1 = {
        id: "notice1",
        type: "notice",
        value: "noticeValue",
        details: "noticeDetails",
        imageFileUrl: fileData[0].filePath,
        tags: ["tag"],
        timestamp: 0,
      };

      const historyItem1 = {
        testStep: {
          timestamp: "10",
          imageFileUrl: fileData[1].filePath,
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
        intention: intention1.id,
        bugs: [],
        notices: [notice1.id],
      };

      const testResultExportData: TestResultExportDataV0 = {
        name: "testResultName",
        sessionId: "testResultId",
        startTimeStamp: 0,
        endTimeStamp: -1,
        initialUrl: "initialUrl",
        notes: [intention1, notice1],
        coverageSources: [
          { title: "title", url: "url", screenElements: [element1] },
        ],
        history: { "1": historyItem1 },
      };

      const result = await service.saveTestResultFileData(
        {
          testResultFile: {
            fileName: "log.json",
            data: JSON.stringify(testResultExportData),
          },
          fileData,
        },
        null
      );

      const testResultEntities = await TestDataSource.getRepository(
        TestResultEntity
      ).find({
        relations: [
          "testSteps",
          "testSteps.notes",
          "testSteps.notes.screenshot",
          "testSteps.notes.video",
          "testSteps.notes.tags",
          "testSteps.testPurpose",
          "testSteps.screenshot",
          "testSteps.video",
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
      expect(testStepEntity.scrollPositionX).toEqual(null);
      expect(testStepEntity.scrollPositionY).toEqual(null);
      expect(testStepEntity.clientSizeWidth).toEqual(null);
      expect(testStepEntity.clientSizeHeight).toEqual(null);

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
      expect(noteEntity.value).toEqual(notice1.value);
      expect(noteEntity.details).toEqual(notice1.details);
      expect((noteEntity.tags ?? []).length).toEqual(1);
      expect((noteEntity.tags ?? [])[0].name).toEqual(notice1.tags[0]);

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
      expect(testPurposeEntity?.title).toEqual(intention1.value);
      expect(testPurposeEntity?.details).toEqual(intention1.details);

      expect(testStepEntity.timestamp).toEqual(10000);
      expect(testStepEntity.windowHandle).toEqual(
        historyItem1.testStep.windowInfo.windowHandle
      );

      // TestResultの確認
      expect(testResultEntity.id).toEqual(result.newTestResultId);

      expect(testResultEntity.name).toEqual(testResultExportData.name);
      expect(testResultEntity.startTimestamp).toEqual(
        testResultExportData.startTimeStamp
      );
      expect(testResultEntity.lastUpdateTimestamp).toEqual(10000);
      expect(testResultEntity.initialUrl).toEqual(
        testResultExportData.initialUrl
      );
      expect(testResultEntity.testingTime).toEqual(0);

      expect(testResultEntity.creationTimestamp).toEqual(0);

      expect(testResultEntity.noteIds).toContain(noteEntity.id);

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
      expect(
        (await TestDataSource.getRepository(TestStepEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(NoteEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(TestPurposeEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(TagEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(ScreenshotEntity).find()).length
      ).toEqual(2);
      expect(
        (await TestDataSource.getRepository(CoverageSourceEntity).find()).length
      ).toEqual(1);
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
        ["video", new StaticDirectory(path.join(tmpDirPath, "videos"))],
      ]);
      const screenshotFileRepository = new FileRepositoryManager(
        fileRepositories,
        tmpDirPath
      ).getRepository("screenshot");
      const videoFileRepository = new FileRepositoryManager(
        fileRepositories,
        tmpDirPath
      ).getRepository("video");

      const importFileRepository = new ImportFileRepositoryImpl();

      const service = new TestResultImportServiceImpl(TestDataSource, {
        screenshotFileRepository,
        videoFileRepository,
        importFileRepository,
        timestamp: timestampService,
        mutationService: new MutationService(TestDataSource),
        commentsService: new CommentsService(TestDataSource),
      });

      const testImage = await fs.promises.readFile(
        path.join(packageRootDirPath, "resources", "test.png")
      );

      const fileData = [
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
        timestamp: 0,
      };
      const note1 = {
        id: "notice1",
        type: "notice",
        value: "noticeValue",
        details: "noticeDetails",
        imageFileUrl: fileData[0].filePath,
        tags: ["tag"],
        timestamp: 0,
      };

      const historyItem1 = {
        testStep: {
          timestamp: "10",
          imageFileUrl: fileData[1].filePath,
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

      const result = await service.saveTestResultFileData(
        {
          testResultFile: {
            fileName: "log.json",
            data: JSON.stringify(testResultExportData),
          },
          fileData,
        },
        null
      );

      const testResultEntities = await TestDataSource.getRepository(
        TestResultEntity
      ).find({
        relations: [
          "testSteps",
          "testSteps.notes",
          "testSteps.notes.screenshot",
          "testSteps.notes.video",
          "testSteps.notes.tags",
          "testSteps.testPurpose",
          "testSteps.screenshot",
          "testSteps.video",
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
      expect(testStepEntity.scrollPositionX).toEqual(null);
      expect(testStepEntity.scrollPositionY).toEqual(null);
      expect(testStepEntity.clientSizeWidth).toEqual(null);
      expect(testStepEntity.clientSizeHeight).toEqual(null);

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

      expect(testResultEntity.creationTimestamp).toEqual(0);

      expect(testResultEntity.noteIds).toContain(noteEntity.id);

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
      expect(
        (await TestDataSource.getRepository(TestStepEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(NoteEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(TestPurposeEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(TagEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(ScreenshotEntity).find()).length
      ).toEqual(2);
      expect(
        (await TestDataSource.getRepository(CoverageSourceEntity).find()).length
      ).toEqual(1);
    });

    it("バージョン2のインポートデータをDBに保存する", async () => {
      const timestampService: TimestampService = {
        unix: jest.fn().mockReturnValue(0),
        format: jest.fn().mockReturnValue("0"),
        epochMilliseconds: jest.fn().mockReturnValue(0),
      };

      const fileRepositories = new FileRepositoryManager(
        new Map([
          [
            "screenshot",
            new StaticDirectory(path.join(tmpDirPath, "screenshots")),
          ],
          ["video", new StaticDirectory(path.join(tmpDirPath, "videos"))],
        ]),
        tmpDirPath
      );

      const screenshotFileRepository =
        fileRepositories.getRepository("screenshot");
      const videoFileRepository = fileRepositories.getRepository("video");

      const importFileRepository = new ImportFileRepositoryImpl();

      const service = new TestResultImportServiceImpl(TestDataSource, {
        screenshotFileRepository,
        videoFileRepository,
        importFileRepository,
        timestamp: timestampService,
        mutationService: new MutationService(TestDataSource),
        commentsService: new CommentsService(TestDataSource),
      });

      const testImage = await fs.promises.readFile(
        path.join(packageRootDirPath, "resources", "test.png")
      );

      const fileData = [
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
        timestamp: 0,
      };
      const note1 = {
        id: "notice1",
        type: "notice",
        value: "noticeValue",
        details: "noticeDetails",
        imageFileUrl: fileData[0].filePath,
        tags: ["tag"],
        timestamp: 0,
      };

      const historyItem1 = {
        testStep: {
          timestamp: "0",
          imageFileUrl: fileData[1].filePath,
          windowInfo: {
            windowHandle: "windowHandle",
          },
          pageInfo: { title: "title", url: "url", keywordTexts: [] },
          operation: {
            input: "input",
            type: "type",
            elementInfo: element1,
            isAutomatic: false,
            scrollPosition: { x: 0, y: 0 },
            clientSize: { width: 945, height: 1020 },
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

      const result = await service.saveTestResultFileData(
        {
          testResultFile: {
            fileName: "log.json",
            data: JSON.stringify(testResultExportData),
          },
          fileData,
        },
        null
      );

      const testResultEntities = await TestDataSource.getRepository(
        TestResultEntity
      ).find({
        relations: [
          "testSteps",
          "testSteps.notes",
          "testSteps.notes.screenshot",
          "testSteps.notes.video",
          "testSteps.notes.tags",
          "testSteps.testPurpose",
          "testSteps.screenshot",
          "testSteps.video",
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
      expect(testStepEntity.scrollPositionX).toEqual(
        historyItem1.testStep.operation.scrollPosition.x
      );
      expect(testStepEntity.scrollPositionY).toEqual(
        historyItem1.testStep.operation.scrollPosition.y
      );
      expect(testStepEntity.clientSizeWidth).toEqual(
        historyItem1.testStep.operation.clientSize.width
      );
      expect(testStepEntity.clientSizeHeight).toEqual(
        historyItem1.testStep.operation.clientSize.height
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

      expect(testResultEntity.creationTimestamp).toEqual(0);

      expect(testResultEntity.noteIds).toContain(noteEntity.id);

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
      expect(
        (await TestDataSource.getRepository(TestStepEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(NoteEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(TestPurposeEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(TagEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(ScreenshotEntity).find()).length
      ).toEqual(2);
      expect(
        (await TestDataSource.getRepository(CoverageSourceEntity).find()).length
      ).toEqual(1);
    });

    it("バージョン3のインポートデータをDBに保存する(mediaTypeがimageの場合)", async () => {
      const timestampService: TimestampService = {
        unix: jest.fn().mockReturnValue(0),
        format: jest.fn().mockReturnValue("0"),
        epochMilliseconds: jest.fn().mockReturnValue(0),
      };

      const fileRepositories = new FileRepositoryManager(
        new Map([
          [
            "screenshot",
            new StaticDirectory(path.join(tmpDirPath, "screenshots")),
          ],
          ["video", new StaticDirectory(path.join(tmpDirPath, "videos"))],
        ]),
        tmpDirPath
      );

      const screenshotFileRepository =
        fileRepositories.getRepository("screenshot");
      const videoFileRepository = fileRepositories.getRepository("video");

      const importFileRepository = new ImportFileRepositoryImpl();

      const service = new TestResultImportServiceImpl(TestDataSource, {
        screenshotFileRepository,
        videoFileRepository,
        importFileRepository,
        timestamp: timestampService,
        mutationService: new MutationService(TestDataSource),
        commentsService: new CommentsService(TestDataSource),
      });

      const testImage = await fs.promises.readFile(
        path.join(packageRootDirPath, "resources", "test.png")
      );

      const fileData = [
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
        timestamp: 0,
      };
      const note1 = {
        id: "notice1",
        type: "notice",
        value: "noticeValue",
        details: "noticeDetails",
        imageFileUrl: fileData[0].filePath,
        tags: ["tag"],
        timestamp: 0,
      };

      const historyItem1 = {
        testStep: {
          timestamp: "0",
          imageFileUrl: fileData[1].filePath,
          windowInfo: {
            windowHandle: "windowHandle",
          },
          pageInfo: { title: "title", url: "url", keywordTexts: [] },
          operation: {
            input: "input",
            type: "type",
            elementInfo: element1,
            isAutomatic: false,
            scrollPosition: { x: 0, y: 0 },
            clientSize: { width: 945, height: 1020 },
          },
          inputElements: [element1],
        },
        testPurpose: testPurpose1.id,
        notes: [note1.id],
      };
      const testResultExportData: TestResultExportDataV3 = {
        version: 3,
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
        creationTimestamp: 10,
      };

      const result = await service.saveTestResultFileData(
        {
          testResultFile: {
            fileName: "log.json",
            data: JSON.stringify(testResultExportData),
          },
          fileData,
        },
        null
      );

      const testResultEntities = await TestDataSource.getRepository(
        TestResultEntity
      ).find({
        relations: [
          "testSteps",
          "testSteps.notes",
          "testSteps.notes.screenshot",
          "testSteps.notes.video",
          "testSteps.notes.tags",
          "testSteps.testPurpose",
          "testSteps.screenshot",
          "testSteps.video",
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
      expect(testStepEntity.scrollPositionX).toEqual(
        historyItem1.testStep.operation.scrollPosition.x
      );
      expect(testStepEntity.scrollPositionY).toEqual(
        historyItem1.testStep.operation.scrollPosition.y
      );
      expect(testStepEntity.clientSizeWidth).toEqual(
        historyItem1.testStep.operation.clientSize.width
      );
      expect(testStepEntity.clientSizeHeight).toEqual(
        historyItem1.testStep.operation.clientSize.height
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
      expect(noteEntity.timestamp).toEqual(note1.timestamp);

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

      expect(testResultEntity.creationTimestamp).toEqual(
        testResultExportData.creationTimestamp
      );

      expect(testResultEntity.noteIds).toContain(noteEntity.id);
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
      expect(
        (await TestDataSource.getRepository(TestStepEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(NoteEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(TestPurposeEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(TagEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(ScreenshotEntity).find()).length
      ).toEqual(2);
      expect(
        (await TestDataSource.getRepository(CoverageSourceEntity).find()).length
      ).toEqual(1);
    });

    it("バージョン3のインポートデータをDBに保存する(mediaTypeがvideoの場合)", async () => {
      const timestampService: TimestampService = {
        unix: jest.fn().mockReturnValue(0),
        format: jest.fn().mockReturnValue("0"),
        epochMilliseconds: jest.fn().mockReturnValue(0),
      };

      const fileRepositories = new FileRepositoryManager(
        new Map([
          [
            "screenshot",
            new StaticDirectory(path.join(tmpDirPath, "screenshots")),
          ],
          ["video", new StaticDirectory(path.join(tmpDirPath, "videos"))],
        ]),
        tmpDirPath
      );

      const screenshotFileRepository =
        fileRepositories.getRepository("screenshot");
      const videoFileRepository = fileRepositories.getRepository("video");

      const importFileRepository = new ImportFileRepositoryImpl();

      const service = new TestResultImportServiceImpl(TestDataSource, {
        importFileRepository,
        screenshotFileRepository,
        videoFileRepository,
        timestamp: timestampService,
        mutationService: new MutationService(TestDataSource),
        commentsService: new CommentsService(TestDataSource),
      });

      const testVideo = await fs.promises.readFile(
        path.join(packageRootDirPath, "resources", "test.webm")
      );

      const fileData = [{ filePath: "testResult.webm", data: testVideo }];

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
        timestamp: 0,
      };
      const note1 = {
        id: "notice1",
        type: "notice",
        value: "noticeValue",
        details: "noticeDetails",
        imageFileUrl: "",
        tags: ["tag"],
        timestamp: 0,
        videoId: "video1",
        videoFrame: {
          url: "video/testResult.webm",
          time: 0,
          width: 0,
          height: 0,
        },
      };

      const historyItem1 = {
        testStep: {
          timestamp: "0",
          imageFileUrl: "",
          windowInfo: {
            windowHandle: "windowHandle",
          },
          pageInfo: { title: "title", url: "url", keywordTexts: [] },
          operation: {
            input: "input",
            type: "type",
            elementInfo: element1,
            isAutomatic: false,
            scrollPosition: { x: 0, y: 0 },
            clientSize: { width: 945, height: 1020 },
            videoFrame: {
              url: "video/testResult.webm",
              time: 0,
              width: 0,
              height: 0,
            },
          },
          inputElements: [element1],
        },
        testPurpose: testPurpose1.id,
        notes: [note1.id],
      };
      const testResultExportData: TestResultExportDataV3 = {
        version: 3,
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
        creationTimestamp: 10,
      };

      const result = await service.saveTestResultFileData(
        {
          testResultFile: {
            fileName: "log.json",
            data: JSON.stringify(testResultExportData),
          },
          fileData,
        },
        null
      );

      const testResultEntities = await TestDataSource.getRepository(
        TestResultEntity
      ).find({
        relations: [
          "testSteps",
          "testSteps.notes",
          "testSteps.notes.screenshot",
          "testSteps.notes.video",
          "testSteps.notes.tags",
          "testSteps.testPurpose",
          "testSteps.screenshot",
          "testSteps.video",
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
      expect(testStepEntity.scrollPositionX).toEqual(
        historyItem1.testStep.operation.scrollPosition.x
      );
      expect(testStepEntity.scrollPositionY).toEqual(
        historyItem1.testStep.operation.scrollPosition.y
      );
      expect(testStepEntity.clientSizeWidth).toEqual(
        historyItem1.testStep.operation.clientSize.width
      );
      expect(testStepEntity.clientSizeHeight).toEqual(
        historyItem1.testStep.operation.clientSize.height
      );

      // TestStepのスクリーンショットの確認
      const testStepScreenshotEntity = testStepEntity.screenshot;
      expect(testStepScreenshotEntity).toEqual(null);

      // TestStepの動画の確認
      const testStepVideoEntity = testStepEntity.video;
      const testStepVideoFileUrl = videoFileRepository.getFileUrl(
        `${testStepVideoEntity?.id}.webm`
      );
      expect(testStepVideoEntity?.fileUrl).toEqual(testStepVideoFileUrl);
      const testStepVideoFilePath = videoFileRepository.getFilePath(
        `${testStepVideoEntity?.id}.webm`
      );
      expect(
        (await fs.promises.readFile(testStepVideoFilePath)).toString("base64")
      ).toEqual(testVideo.toString("base64"));

      // Noteの確認
      const noteEntities = testStepEntity.notes ?? [];
      const noteEntity = noteEntities[0];
      expect(noteEntity.value).toEqual(note1.value);
      expect(noteEntity.details).toEqual(note1.details);
      expect((noteEntity.tags ?? []).length).toEqual(1);
      expect((noteEntity.tags ?? [])[0].name).toEqual(note1.tags[0]);
      expect(noteEntity.timestamp).toEqual(note1.timestamp);

      // Noteのスクリーンショットの確認
      const noteScreenshotEntity = noteEntity.screenshot;
      expect(noteScreenshotEntity).toEqual(null);

      // Noteの動画の確認
      const noteVideoEntity = noteEntity.video;
      const noteVideoFileUrl = videoFileRepository.getFileUrl(
        `${noteVideoEntity?.id}.webm`
      );
      expect(noteVideoEntity?.fileUrl).toEqual(noteVideoFileUrl);
      const noteVideoFilePath = videoFileRepository.getFilePath(
        `${noteVideoEntity?.id}.webm`
      );
      expect(
        (await fs.promises.readFile(noteVideoFilePath)).toString("base64")
      ).toEqual(testVideo.toString("base64"));

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

      // Videosの確認
      const videoEntities =
        await TestDataSource.getRepository(VideoEntity).find();
      const videoEntity = videoEntities[0];
      expect(videoEntity.fileUrl).toEqual(
        videoFileRepository.getFileUrl(`${videoEntity.id}.webm`)
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
      expect(
        (await TestDataSource.getRepository(TestStepEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(NoteEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(TestPurposeEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(TagEntity).find()).length
      ).toEqual(1);
      expect(
        (await TestDataSource.getRepository(ScreenshotEntity).find()).length
      ).toEqual(0);
      expect(
        (await TestDataSource.getRepository(CoverageSourceEntity).find()).length
      ).toEqual(1);
      expect(videoEntities.length).toEqual(1);
    });
  });
});
