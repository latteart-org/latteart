import { ProjectEntity } from "@/entities/ProjectEntity";
import { TestMatrixEntity } from "@/entities/TestMatrixEntity";
import {
  SqliteTestConnectionHelper,
  TestDataSource,
} from "../../helper/TestConnectionHelper";
import { TransactionRunner } from "@/TransactionRunner";
import { TestTargetGroupEntity } from "@/entities/TestTargetGroupEntity";
import { TestTargetGroupsService } from "@/services/TestTargetGroupsService";
import { TestTargetEntity } from "@/entities/TestTargetEntity";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection();
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("TestTargetGroupsService", () => {
  describe("#get", () => {
    it("正常系", async () => {
      const projectEntity = await TestDataSource.getRepository(
        ProjectEntity
      ).save(new ProjectEntity("projectName"));

      const testMatrixEntity = await TestDataSource.getRepository(
        TestMatrixEntity
      ).save(new TestMatrixEntity("testMatrixName", 0, projectEntity));

      const testTargetGroupEntity = await TestDataSource.getRepository(
        TestTargetGroupEntity
      ).save({
        name: "testTargetGroupName",
        index: 0,
        testMatrix: testMatrixEntity,
      });

      const testTarget1 = await TestDataSource.getRepository(
        TestTargetEntity
      ).save({
        name: "testTargetName",
        index: 0,
        testTargetGroup: testTargetGroupEntity,
        text: "[]",
      });

      const testTarget2 = await TestDataSource.getRepository(
        TestTargetEntity
      ).save({
        name: "testTargetName2",
        index: 1,
        testTargetGroup: testTargetGroupEntity,
        text: "[]",
      });

      const result = await new TestTargetGroupsService(TestDataSource).get(
        testTargetGroupEntity.id
      );

      expect(result).toEqual({
        id: testTargetGroupEntity.id,
        name: testTargetGroupEntity.name,
        index: 0,
        testTargets: [
          {
            id: testTarget1.id,
            name: testTarget1.name,
            index: testTarget1.index,
            plans: JSON.parse(testTarget1.text),
          },
          {
            id: testTarget2.id,
            name: testTarget2.name,
            index: testTarget2.index,
            plans: JSON.parse(testTarget2.text),
          },
        ],
      });
    });
    it("異常系", async () => {
      const dummyId = "dummyId";
      try {
        await new TestTargetGroupsService(TestDataSource).get(dummyId);
      } catch (e) {
        expect((e as Error).message).toEqual(
          `TestTargetGroup not found. ${dummyId}`
        );
      }
    });
  });

  describe("#post", () => {
    it("正常系", async () => {
      const projectEntity = await TestDataSource.getRepository(
        ProjectEntity
      ).save(new ProjectEntity("projectName"));

      const testMatrixEntity = await TestDataSource.getRepository(
        TestMatrixEntity
      ).save(new TestMatrixEntity("testMatrixName", 0, projectEntity));

      const result = await new TestTargetGroupsService(TestDataSource).post({
        testMatrixId: testMatrixEntity.id,
        name: "testTargetGroupName",
      });

      expect(result).toEqual({
        id: result.id,
        name: "testTargetGroupName",
        index: 0,
        testTargets: [],
      });
    });

    it("異常系", async () => {
      const dummyId = "dummyId";
      try {
        await new TestTargetGroupsService(TestDataSource).post({
          testMatrixId: dummyId,
          name: "testMatrixName",
        });
      } catch (e) {
        expect((e as Error).message).toEqual(
          `TestMatrix not found. ${dummyId}`
        );
      }
    });
  });

  describe("#patch", () => {
    it("正常系", async () => {
      const projectEntity = await TestDataSource.getRepository(
        ProjectEntity
      ).save(new ProjectEntity("projectName"));

      const testMatrixEntity = await TestDataSource.getRepository(
        TestMatrixEntity
      ).save(new TestMatrixEntity("testMatrixName", 0, projectEntity));

      const testTargetGroupEntity = await TestDataSource.getRepository(
        TestTargetGroupEntity
      ).save({
        name: "testTargetGroupName",
        index: 0,
        testMatrix: testMatrixEntity,
      });

      const result = await new TestTargetGroupsService(TestDataSource).patch(
        testTargetGroupEntity.id,
        {
          name: "testTargetGroupName2",
        }
      );

      expect(result).toEqual({
        id: testTargetGroupEntity.id,
        name: "testTargetGroupName2",
        index: 0,
        testTargets: [],
      });
    });

    it("異常系", async () => {
      const dummyId = "dummyId";
      try {
        await new TestTargetGroupsService(TestDataSource).patch(dummyId, {
          name: "testTargetGroupName",
        });
      } catch (e) {
        expect((e as Error).message).toEqual(
          `TestTargetGroup not found. ${dummyId}`
        );
      }
    });
  });

  describe("#delete", () => {
    it("正常系", async () => {
      const projectEntity = await TestDataSource.getRepository(
        ProjectEntity
      ).save(new ProjectEntity("projectName"));

      const testMatrixRepository =
        TestDataSource.getRepository(TestMatrixEntity);
      const testMatrixEntity = await testMatrixRepository.save(
        new TestMatrixEntity("testMatrixName", 0, projectEntity)
      );

      const testTargetGroupRepository = TestDataSource.getRepository(
        TestTargetGroupEntity
      );
      const testTargetGroupEntity0 = await testTargetGroupRepository.save({
        name: "testTargetGroupName0",
        index: 0,
        testMatrix: testMatrixEntity,
      });
      const testTargetGroupEntity1 = await testTargetGroupRepository.save({
        name: "testTargetGroupName1",
        index: 1,
        testMatrix: testMatrixEntity,
      });

      const testTargetGroupEntity2 = await testTargetGroupRepository.save({
        name: "testTargetGroupName2",
        index: 2,
        testMatrix: testMatrixEntity,
      });

      await new TestTargetGroupsService(TestDataSource).delete(
        testTargetGroupEntity1.id,
        new TransactionRunner(TestDataSource)
      );

      const result = await testMatrixRepository.findOne({
        where: { id: testMatrixEntity.id },
        relations: ["testTargetGroups"],
      });

      const sortedResult = result?.testTargetGroups.sort(
        (t1, t2) => t1.index - t2.index
      );

      expect((sortedResult ?? [])[0]).toEqual({
        id: testTargetGroupEntity0.id,
        name: "testTargetGroupName0",
        index: 0,
      });

      expect((sortedResult ?? [])[1]).toEqual({
        id: testTargetGroupEntity2.id,
        name: "testTargetGroupName2",
        index: 1,
      });
    });

    it("異常系", async () => {
      const dummyId = "dummyId";
      try {
        await new TestTargetGroupsService(TestDataSource).delete(
          dummyId,
          new TransactionRunner(TestDataSource)
        );
      } catch (e) {
        expect((e as Error).message).toEqual(
          `TestTargetGroup not found. ${dummyId}`
        );
      }
    });
  });
});
