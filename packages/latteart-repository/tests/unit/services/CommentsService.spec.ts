import { CommentEntity } from "@/entities/CommentEntity";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { CommentsService } from "@/services/CommentsService";
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

const registerTestData = async (): Promise<TestResultEntity> => {
  const testResult = await TestDataSource.getRepository(TestResultEntity).save(
    new TestResultEntity()
  );
  const commentRepository = TestDataSource.getRepository(CommentEntity);
  await commentRepository.save([
    { testResult, value: "value1", timestamp: 101 },
    { testResult, value: "value2", timestamp: 102 },
    { testResult, value: "value3", timestamp: 103 },
    { testResult, value: "value4", timestamp: 104 },
  ]);
  return testResult;
};

describe("CommentsService", () => {
  describe("getComments", () => {
    describe("commentの取得", () => {
      it("since無し, until無し", async () => {
        const testResult = await registerTestData();
        const result = await new CommentsService(TestDataSource).getComments(
          testResult.id
        );

        expect(result).toEqual([
          {
            id: expect.any(String),
            testResultId: testResult.id,
            value: "value1",
            timestamp: 101,
          },
          {
            id: expect.any(String),
            testResultId: testResult.id,
            value: "value2",
            timestamp: 102,
          },
          {
            id: expect.any(String),
            testResultId: testResult.id,
            value: "value3",
            timestamp: 103,
          },
          {
            id: expect.any(String),
            testResultId: testResult.id,
            value: "value4",
            timestamp: 104,
          },
        ]);
      });
      it("since有り, until無し", async () => {
        const testResult = await registerTestData();
        const result = await new CommentsService(TestDataSource).getComments(
          testResult.id,
          { since: 102 }
        );

        expect(result).toEqual([
          {
            id: expect.any(String),
            testResultId: testResult.id,
            value: "value2",
            timestamp: 102,
          },
          {
            id: expect.any(String),
            testResultId: testResult.id,
            value: "value3",
            timestamp: 103,
          },
          {
            id: expect.any(String),
            testResultId: testResult.id,
            value: "value4",
            timestamp: 104,
          },
        ]);
      });
      it("since無し, until有り", async () => {
        const testResult = await registerTestData();
        const result = await new CommentsService(TestDataSource).getComments(
          testResult.id,
          { until: 103 }
        );

        expect(result).toEqual([
          {
            id: expect.any(String),
            testResultId: testResult.id,
            value: "value1",
            timestamp: 101,
          },
          {
            id: expect.any(String),
            testResultId: testResult.id,
            value: "value2",
            timestamp: 102,
          },
          {
            id: expect.any(String),
            testResultId: testResult.id,
            value: "value3",
            timestamp: 103,
          },
        ]);
      });
      it("since有り, util有り", async () => {
        const testResult = await registerTestData();
        const result = await new CommentsService(TestDataSource).getComments(
          testResult.id,
          { since: 102, until: 103 }
        );

        expect(result).toEqual([
          {
            id: expect.any(String),
            testResultId: testResult.id,
            value: "value2",
            timestamp: 102,
          },
          {
            id: expect.any(String),
            testResultId: testResult.id,
            value: "value3",
            timestamp: 103,
          },
        ]);
      });
    });
  });

  describe("postComment", () => {
    it("commentの登録", async () => {
      const testResult = await TestDataSource.getRepository(
        TestResultEntity
      ).save(new TestResultEntity());

      const result = await new CommentsService(TestDataSource).postComment(
        testResult.id,
        "value",
        100
      );

      expect(result).toEqual({
        id: expect.any(String),
        value: "value",
        testResultId: testResult.id,
        timestamp: 100,
      });
    });
  });
});
