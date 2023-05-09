import { ProjectEntity } from "@/entities/ProjectEntity";
import { TestMatrixEntity } from "@/entities/TestMatrixEntity";
import { getRepository } from "typeorm";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";
import { TransactionRunner } from "@/TransactionRunner";
import { TestTargetGroupEntity } from "@/entities/TestTargetGroupEntity";
import { TestTargetGroupsService } from "@/services/TestTargetGroupsService";
import { TestTargetEntity } from "@/entities/TestTargetEntity";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("TestTargetGroupsService", () => {
  describe("#get", () => {
    it("正常系", async () => {
      const projectEntity = await getRepository(ProjectEntity).save(
        new ProjectEntity("projectName")
      );

      const testMatrixEntity = await getRepository(TestMatrixEntity).save(
        new TestMatrixEntity("testMatrixName", 0, projectEntity)
      );

      const testTargetGroupEntity = await getRepository(
        TestTargetGroupEntity
      ).save({
        name: "testTargetGroupName",
        index: 0,
        testMatrix: testMatrixEntity,
      });

      const testTarget1 = await getRepository(TestTargetEntity).save({
        name: "testTargetName",
        index: 0,
        testTargetGroup: testTargetGroupEntity,
        text: "[]",
      });

      const testTarget2 = await getRepository(TestTargetEntity).save({
        name: "testTargetName2",
        index: 1,
        testTargetGroup: testTargetGroupEntity,
        text: "[]",
      });

      const result = await new TestTargetGroupsService().get(
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
        await new TestTargetGroupsService().get(dummyId);
      } catch (e) {
        expect((e as Error).message).toEqual(
          `TestTargetGroup not found. ${dummyId}`
        );
      }
    });
  });

  describe("#post", () => {
    it("正常系", async () => {
      const projectEntity = await getRepository(ProjectEntity).save(
        new ProjectEntity("projectName")
      );

      const testMatrixEntity = await getRepository(TestMatrixEntity).save(
        new TestMatrixEntity("testMatrixName", 0, projectEntity)
      );

      const result = await new TestTargetGroupsService().post({
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
        await new TestTargetGroupsService().post({
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
      const projectEntity = await getRepository(ProjectEntity).save(
        new ProjectEntity("projectName")
      );

      const testMatrixEntity = await getRepository(TestMatrixEntity).save(
        new TestMatrixEntity("testMatrixName", 0, projectEntity)
      );

      const testTargetGroupEntity = await getRepository(
        TestTargetGroupEntity
      ).save({
        name: "testTargetGroupName",
        index: 0,
        testMatrix: testMatrixEntity,
      });

      const result = await new TestTargetGroupsService().patch(
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
        await new TestTargetGroupsService().patch(dummyId, {
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
      const projectEntity = await getRepository(ProjectEntity).save(
        new ProjectEntity("projectName")
      );

      const testMatrixRepository = getRepository(TestMatrixEntity);
      const testMatrixEntity = await testMatrixRepository.save(
        new TestMatrixEntity("testMatrixName", 0, projectEntity)
      );

      const testTargetGroupRepository = getRepository(TestTargetGroupEntity);
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

      await new TestTargetGroupsService().delete(
        testTargetGroupEntity1.id,
        new TransactionRunner()
      );

      const result = await testMatrixRepository.findOne(testMatrixEntity.id, {
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
        await new TestTargetGroupsService().delete(
          dummyId,
          new TransactionRunner()
        );
      } catch (e) {
        expect((e as Error).message).toEqual(
          `TestTargetGroup not found. ${dummyId}`
        );
      }
    });
  });
});
