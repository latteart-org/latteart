import { TestPurposeEntity } from "@/entities/TestPurposeEntity";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { CreateNoteDto } from "@/interfaces/Notes";
import { TestPurposeServiceImpl } from "@/services/TestPurposeService";
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

describe("TestPurposeService", () => {
  describe("#createTestPurpose", () => {
    it("テスト目的を1件新規追加する", async () => {
      const service = new TestPurposeServiceImpl(TestDataSource);

      const testResultEntity = await TestDataSource.getRepository(
        TestResultEntity
      ).save(new TestResultEntity());

      const requestBody: CreateNoteDto = {
        type: "intention",
        value: "value",
        details: "details",
      };

      const result = await service.createTestPurpose(
        testResultEntity.id,
        requestBody
      );

      expect(result).toEqual({
        id: expect.any(String),
        testResultId: testResultEntity.id,
        type: "intention",
        value: "value",
        details: "details",
        imageFileUrl: "",
        tags: [],
        timestamp: 0,
      });
    });
  });

  describe("#updateTestPurpose", () => {
    it("テスト目的1件の内容を更新する", async () => {
      const service = new TestPurposeServiceImpl(TestDataSource);

      const testResultEntity = await TestDataSource.getRepository(
        TestResultEntity
      ).save(new TestResultEntity());

      const testPurposeEntity = await TestDataSource.getRepository(
        TestPurposeEntity
      ).save(
        new TestPurposeEntity({
          testResult: testResultEntity,
        })
      );

      const requestBody: CreateNoteDto = {
        type: "intention",
        value: "changedValue",
        details: "changedDetails",
      };

      const result = await service.updateTestPurpose(
        testPurposeEntity.id,
        requestBody
      );

      expect(result).toEqual({
        id: expect.any(String),
        testResultId: "",
        type: "intention",
        value: "changedValue",
        details: "changedDetails",
        imageFileUrl: "",
        tags: [],
        timestamp: 0,
      });
    });
  });

  describe("#deleteTestPurpose", () => {
    it("指定のIDのtestPurposeを削除する", async () => {
      const service = new TestPurposeServiceImpl(TestDataSource);

      const testResultEntity = await TestDataSource.getRepository(
        TestResultEntity
      ).save(new TestResultEntity());

      const purpose1 = await service.createTestPurpose(testResultEntity.id, {
        type: "intention",
        value: "value",
        details: "details",
      });

      const purpose2 = await service.createTestPurpose(testResultEntity.id, {
        type: "intention2",
        value: "value2",
        details: "details2",
      });

      await service.deleteTestPurpose(purpose1.id);

      const result =
        await TestDataSource.getRepository(TestPurposeEntity).find();

      expect((result ?? []).length).toEqual(1);

      expect((result ?? [])[0]).toEqual({
        id: purpose2.id,
        title: purpose2.value,
        details: purpose2.details,
      });
    });
  });
});
