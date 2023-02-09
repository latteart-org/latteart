import { TestResultEntity } from "@/entities/TestResultEntity";
import { TestStepEntity } from "@/entities/TestStepEntity";
import { CreateTestResultDto } from "@/interfaces/TestResults";
import { TestResultServiceImpl } from "@/services/TestResultService";
import { getRepository } from "typeorm";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("TestResultService", () => {
  describe("#collectAllTestStepIds", () => {
    it("保有するすべてのテストステップIDを取得する", async () => {
      const testResultEntity = await getRepository(TestResultEntity).save(
        new TestResultEntity()
      );

      const testStepEntities = await getRepository(TestStepEntity).save([
        new TestStepEntity({ testResult: testResultEntity }),
        new TestStepEntity({ testResult: testResultEntity }),
      ]);

      const service = new TestResultServiceImpl({
        timestamp: {
          unix: jest.fn(),
          format: jest.fn(),
          epochMilliseconds: jest.fn(),
        },
        testStep: {
          getTestStep: jest.fn(),
          createTestStep: jest.fn(),
          attachNotesToTestStep: jest.fn(),
          attachTestPurposeToTestStep: jest.fn(),
          getTestStepOperation: jest.fn(),
          getTestStepScreenshot: jest.fn(),
        },
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
      const service = new TestResultServiceImpl({
        timestamp: {
          unix: jest.fn().mockReturnValue(0),
          format: jest.fn(),
          epochMilliseconds: jest.fn().mockReturnValue(0),
        },
        testStep: {
          getTestStep: jest.fn(),
          createTestStep: jest.fn(),
          attachNotesToTestStep: jest.fn(),
          attachTestPurposeToTestStep: jest.fn(),
          getTestStepOperation: jest.fn(),
          getTestStepScreenshot: jest.fn(),
        },
      });

      const body: CreateTestResultDto = {
        initialUrl: "initialUrl",
        name: "session_name",
      };

      const result = await service.createTestResult(body, null);

      expect(result).toEqual({
        id: expect.any(String),
        name: body.name,
      });
    });
  });
});
