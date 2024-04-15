import { TestResultEntity } from "@/entities/TestResultEntity";
import { TestStepEntity } from "@/entities/TestStepEntity";
import { FileRepository } from "@/interfaces/fileRepository";
import { CreateTestResultDto } from "@/interfaces/TestResults";
import { TestResultServiceImpl } from "@/services/TestResultService";
import { TestStepService } from "@/services/TestStepService";
import {
  SqliteTestConnectionHelper,
  TestDataSource,
} from "../../helper/TestConnectionHelper";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection();
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("TestResultService", () => {
  let screenshotFileRepository: FileRepository;
  let workingFileRepository: FileRepository;
  let compareReportRepository: FileRepository;
  let testStepService: TestStepService;

  beforeEach(() => {
    screenshotFileRepository = {
      readFile: jest.fn(),
      outputFile: jest.fn(),
      outputJSON: jest.fn(),
      outputZip: jest.fn(),
      removeFile: jest.fn(),
      getFileUrl: jest.fn(),
      getFilePath: jest.fn(),
      moveFile: jest.fn(),
      copyFile: jest.fn(),
      appendFile: jest.fn(),
    };
    workingFileRepository = {
      readFile: jest.fn(),
      outputFile: jest.fn(),
      outputJSON: jest.fn(),
      outputZip: jest.fn(),
      removeFile: jest.fn(),
      getFileUrl: jest.fn(),
      getFilePath: jest.fn(),
      moveFile: jest.fn(),
      copyFile: jest.fn(),
      appendFile: jest.fn(),
    };
    compareReportRepository = {
      readFile: jest.fn(),
      outputFile: jest.fn(),
      outputJSON: jest.fn(),
      outputZip: jest.fn(),
      removeFile: jest.fn(),
      getFileUrl: jest.fn(),
      getFilePath: jest.fn(),
      moveFile: jest.fn(),
      copyFile: jest.fn(),
      appendFile: jest.fn(),
    };
    testStepService = {
      getTestStep: jest.fn(),
      createTestStep: jest.fn(),
      attachNotesToTestStep: jest.fn(),
      attachTestPurposeToTestStep: jest.fn(),
      getTestStepOperation: jest.fn(),
      getTestStepScreenshot: jest.fn(),
    };
  });

  describe("#collectAllTestStepIds", () => {
    it("保有するすべてのテストステップIDを取得する", async () => {
      const testResultEntity = await TestDataSource.getRepository(
        TestResultEntity
      ).save(new TestResultEntity());

      const testStepEntities = await TestDataSource.getRepository(
        TestStepEntity
      ).save([
        new TestStepEntity({ testResult: testResultEntity }),
        new TestStepEntity({ testResult: testResultEntity }),
      ]);

      const service = new TestResultServiceImpl(TestDataSource, {
        timestamp: {
          unix: jest.fn(),
          format: jest.fn(),
          epochMilliseconds: jest.fn(),
        },
        testStep: testStepService,
        screenshotFileRepository,
        workingFileRepository,
        compareReportRepository,
      });

      const testStepIds = await service.collectAllTestStepIds(
        testResultEntity.id
      );

      expect(testStepIds).toEqual([
        testStepEntities[0].id,
        testStepEntities[1].id,
      ]);
    });
  });

  describe("#createTestResult", () => {
    it("テスト結果を1件新規追加する", async () => {
      const service = new TestResultServiceImpl(TestDataSource, {
        timestamp: {
          unix: jest.fn().mockReturnValue(0),
          format: jest.fn(),
          epochMilliseconds: jest.fn().mockReturnValue(0),
        },
        testStep: testStepService,
        screenshotFileRepository,
        workingFileRepository,
        compareReportRepository,
      });

      const body: CreateTestResultDto = {
        initialUrl: "initialUrl",
        name: "session_name",
      };

      const result = await service.createTestResult(body);

      expect(result).toEqual({
        id: expect.any(String),
        name: body.name,
      });
    });
  });
});
