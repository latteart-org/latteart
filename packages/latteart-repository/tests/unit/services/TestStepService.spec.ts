import { TestResultEntity } from "@/entities/TestResultEntity";
import { TestStepEntity } from "@/entities/TestStepEntity";
import { TestStepServiceImpl } from "@/services/TestStepService";
import { TimestampService } from "@/services/TimestampService";
import { ConfigsService } from "@/services/ConfigsService";
import { getRepository } from "typeorm";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";
import { CreateTestStepDto } from "@/interfaces/TestSteps";
import { CoverageSourceEntity } from "@/entities/CoverageSourceEntity";
import { FileRepository } from "@/interfaces/fileRepository";
import { NoteEntity } from "@/entities/NoteEntity";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("TestStepService", () => {
  const screenshotFileRepository: FileRepository = {
    readFile: jest.fn(),
    outputFile: jest.fn(),
    outputJSON: jest.fn(),
    outputZip: jest.fn(),
    removeFile: jest.fn(),
    getFileUrl: jest.fn(),
    getFilePath: jest.fn(),
    moveFile: jest.fn(),
    copyFile: jest.fn(),
  };

  const timestampService: TimestampService = {
    unix: jest.fn(),
    format: jest.fn(),
    epochMilliseconds: jest.fn(),
  };
  describe("#getTestStep", () => {
    it("テストステップを1件取得する", async () => {
      timestampService.unix = jest.fn().mockReturnValue(0);

      const service = new TestStepServiceImpl({
        screenshotFileRepository,
        timestamp: timestampService,
        config: new ConfigsService(),
      });
      const testResultEntity = await getRepository(TestResultEntity).save(
        new TestResultEntity()
      );

      const noteEntity = new NoteEntity();
      noteEntity.id = "note1";

      const testStepEntity = await getRepository(TestStepEntity).save(
        new TestStepEntity({
          testResult: testResultEntity,
          notes: [noteEntity],
        })
      );

      const operationData = {
        input: testStepEntity.operationInput,
        type: testStepEntity.operationType,
        elementInfo: JSON.parse(testStepEntity.operationElement),
        title: testStepEntity.pageTitle,
        url: testStepEntity.pageUrl,
        imageFileUrl: testStepEntity.screenshot?.fileUrl ?? "",
        timestamp: `${testStepEntity.timestamp}`,
        inputElements: JSON.parse(testStepEntity.inputElements),
        windowHandle: testStepEntity.windowHandle,
        keywordTexts: JSON.parse(testStepEntity.keywordTexts),
        isAutomatic: testStepEntity.isAutomatic,
      };

      const result = await service.getTestStep(testStepEntity.id);

      expect(result).toEqual({
        id: testStepEntity.id,
        operation: operationData,
        intention: null,
        bugs: [],
        notices: ["note1"],
      });
    });
  });

  describe("#createTestStep", () => {
    it("テストステップを1件新規追加する", async () => {
      screenshotFileRepository.getFileUrl = jest
        .fn()
        .mockReturnValue("testStep.png");
      timestampService.unix = jest.fn().mockReturnValue(0);

      const service = new TestStepServiceImpl({
        screenshotFileRepository,
        timestamp: timestampService,
        config: new ConfigsService(),
      });

      const element1 = {
        tagname: "tagname1",
        xpath: "xpath1",
        attributes: {},
      };
      const element2 = {
        tagname: "tagname2",
        xpath: "xpath2",
        attributes: {},
      };

      const defaultScreenElements = [element1];

      const coverageSourceEntity = new CoverageSourceEntity({
        title: "title",
        url: "url",
        screenElements: JSON.stringify(defaultScreenElements),
      });

      const testResultEntity = await getRepository(TestResultEntity).save(
        new TestResultEntity({
          coverageSources: [coverageSourceEntity],
          startTimestamp: 1,
          lastUpdateTimestamp: 10,
        })
      );

      const requestBody: CreateTestStepDto = {
        input: "input",
        type: "type",
        elementInfo: element2,
        title: "title",
        url: "url",
        imageData: "imageData",
        windowHandle: "windowHandle",
        screenElements: [element2],
        inputElements: [element2],
        keywordTexts: ["keywordTexts"],
        timestamp: 100,
        pageSource: "pageSource",
        isAutomatic: false,
      };

      const operationData = {
        input: requestBody.input,
        type: requestBody.type,
        elementInfo: requestBody.elementInfo,
        title: requestBody.title,
        url: requestBody.url,
        imageFileUrl: "testStep.png",
        timestamp: `${requestBody.timestamp}`,
        inputElements: requestBody.inputElements,
        windowHandle: requestBody.windowHandle,
        keywordTexts: requestBody.keywordTexts,
        isAutomatic: requestBody.isAutomatic,
      };

      const result = await service.createTestStep(
        testResultEntity.id,
        requestBody
      );

      const testTargetTestResult = await getRepository(
        TestResultEntity
      ).findOne(testResultEntity.id);

      expect(testTargetTestResult?.testingTime).toEqual(90);
      expect(testTargetTestResult?.lastUpdateTimestamp).toEqual(
        requestBody.timestamp
      );

      expect(result).toEqual({
        id: expect.any(String),
        operation: operationData,
        coverageSource: {
          title: requestBody.title,
          url: requestBody.url,
          screenElements: [
            ...defaultScreenElements,
            ...requestBody.screenElements,
          ],
        },
      });

      expect(screenshotFileRepository.outputFile).toBeCalledWith(
        expect.any(String),
        requestBody.imageData,
        "base64"
      );
    });
  });

  describe("#attachNotesToTestStep", () => {
    it("テストステップにnoteを1件追加する", async () => {
      timestampService.unix = jest.fn().mockReturnValue(0);

      const service = new TestStepServiceImpl({
        screenshotFileRepository,
        timestamp: timestampService,
        config: new ConfigsService(),
      });

      const testResultEntity = await getRepository(TestResultEntity).save(
        new TestResultEntity()
      );

      const testStepEntity = await getRepository(TestStepEntity).save(
        new TestStepEntity({ testResult: testResultEntity })
      );

      const noteEntity = await getRepository(NoteEntity).save({
        value: "value",
        details: "details",
        timestamp: timestampService.unix(),
        testResult: testResultEntity,
        tags: [],
      });

      const result = await service.attachNotesToTestStep(testStepEntity.id, [
        noteEntity.id,
      ]);

      expect(result).toEqual({
        id: testStepEntity.id,
        operation: {
          elementInfo: {},
          imageFileUrl: "",
          input: "",
          inputElements: [],
          isAutomatic: false,
          keywordTexts: [],
          timestamp: "0",
          title: "",
          type: "",
          url: "",
          windowHandle: "",
        },
        intention: null,
        bugs: [],
        notices: [noteEntity.id],
      });
    });
  });
});
