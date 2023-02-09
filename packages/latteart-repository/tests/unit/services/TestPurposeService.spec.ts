import { TestPurposeEntity } from "@/entities/TestPurposeEntity";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { CreateNoteDto } from "@/interfaces/Notes";
import { TestPurposeServiceImpl } from "@/services/TestPurposeService";
import { getRepository } from "typeorm";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("TestPurposeService", () => {
  describe("#createTestPurpose", () => {
    it("テスト目的を1件新規追加する", async () => {
      const service = new TestPurposeServiceImpl();

      const testResultEntity = await getRepository(TestResultEntity).save(
        new TestResultEntity()
      );

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
        type: "intention",
        value: "value",
        details: "details",
        imageFileUrl: "",
        tags: [],
      });
    });
  });

  describe("#updateTestPurpose", () => {
    it("テスト目的1件の内容を更新する", async () => {
      const service = new TestPurposeServiceImpl();

      const testResultEntity = await getRepository(TestResultEntity).save(
        new TestResultEntity()
      );

      const testPurposeEntity = await getRepository(TestPurposeEntity).save(
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
        type: "intention",
        value: "changedValue",
        details: "changedDetails",
        imageFileUrl: "",
        tags: [],
      });
    });
  });
});
