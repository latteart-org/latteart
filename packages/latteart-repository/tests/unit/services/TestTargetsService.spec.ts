import { ProjectEntity } from "@/entities/ProjectEntity";
import { TestMatrixEntity } from "@/entities/TestMatrixEntity";
import {
  SqliteTestConnectionHelper,
  TestDataSource,
} from "../../helper/TestConnectionHelper";
import { TransactionRunner } from "@/TransactionRunner";
import { TestTargetGroupEntity } from "@/entities/TestTargetGroupEntity";
import { TestTargetService } from "@/services/TestTargetsService";
import { TestTargetEntity } from "@/entities/TestTargetEntity";
import { ViewPointEntity } from "@/entities/ViewPointEntity";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection();
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("TestTargetService", () => {
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

      const testTargetEntity = await TestDataSource.getRepository(
        TestTargetEntity
      ).save({
        name: "testTargetName",
        index: 0,
        testTargetGroup: testTargetGroupEntity,
        text: "[]",
      });

      const result = await new TestTargetService(TestDataSource).get(
        testTargetEntity.id
      );

      expect(result).toEqual({
        id: testTargetEntity.id,
        name: testTargetEntity.name,
        index: 0,
        plans: [],
      });
    });
    it("異常系", async () => {
      const dummyId = "dummyId";
      try {
        await new TestTargetService(TestDataSource).get(dummyId);
      } catch (e) {
        expect((e as Error).message).toEqual(
          `TestTarget not found. ${dummyId}`
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

      const viewPointEntity = await TestDataSource.getRepository(
        ViewPointEntity
      ).save({
        name: "viewPointName",
        description: "",
        index: 0,
        testMatrices: [testMatrixEntity],
      });

      const testTargetGroupEntity = await TestDataSource.getRepository(
        TestTargetGroupEntity
      ).save({
        name: "testTargetGroupName",
        index: 0,
        testMatrix: testMatrixEntity,
      });

      const result = await new TestTargetService(TestDataSource).post(
        {
          testTargetGroupId: testTargetGroupEntity.id,
          name: "testTargetName",
        },
        new TransactionRunner(TestDataSource)
      );

      const testTarget = await TestDataSource.getRepository(
        TestTargetEntity
      ).findOne({
        where: { id: result.id },
        relations: ["stories"],
      });

      expect(result).toEqual({
        id: testTarget?.id,
        name: "testTargetName",
        index: 0,
        plans: [
          {
            viewPointId: viewPointEntity.id,
            value: 0,
          },
        ],
      });

      expect(testTarget?.stories[0]).toEqual({
        id: expect.any(String),
        status: "out-of-scope",
        index: 0,
        planedSessionNumber: 0,
        testMatrixId: testMatrixEntity.id,
        testTargetId: result.id,
        viewPointId: viewPointEntity.id,
      });
    });

    it("異常系", async () => {
      const dummyId = "dummyId";
      try {
        await new TestTargetService(TestDataSource).post(
          {
            testTargetGroupId: dummyId,
            name: "testTargetName",
          },
          new TransactionRunner(TestDataSource)
        );
      } catch (e) {
        expect((e as Error).message).toEqual(
          `TestTargetGroup not found. ${dummyId}`
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

      const viewPointEntity = await TestDataSource.getRepository(
        ViewPointEntity
      ).save({
        name: "viewPointName",
        description: "",
        index: 0,
        testMatrices: [testMatrixEntity],
      });

      const testTargetGroupEntity = await TestDataSource.getRepository(
        TestTargetGroupEntity
      ).save({
        name: "testTargetGroupName",
        index: 0,
        testMatrix: testMatrixEntity,
      });

      const testTarget = await new TestTargetService(TestDataSource).post(
        {
          testTargetGroupId: testTargetGroupEntity.id,
          name: "testTargetName",
        },
        new TransactionRunner(TestDataSource)
      );

      const result = await new TestTargetService(TestDataSource).patch(
        projectEntity.id,
        testTarget.id,
        {
          name: "testTargetName2",
          index: 2,
          plans: [{ viewPointId: viewPointEntity.id, value: 1 }],
        },
        new TransactionRunner(TestDataSource)
      );

      const testTargetEntityResult = await TestDataSource.getRepository(
        TestTargetEntity
      ).findOne({ where: { id: result.id }, relations: ["stories"] });

      expect(result).toEqual({
        id: result.id,
        name: "testTargetName2",
        index: 2,
        plans: [
          {
            viewPointId: viewPointEntity.id,
            value: 1,
          },
        ],
      });

      expect(testTargetEntityResult?.stories[0]).toEqual({
        id: expect.any(String),
        status: "ng",
        index: 0,
        planedSessionNumber: 0,
        testMatrixId: testMatrixEntity.id,
        testTargetId: result.id,
        viewPointId: viewPointEntity.id,
      });
    });

    it("異常系", async () => {
      const projectId = "projectId";
      const dummyId = "dummyId";
      try {
        await new TestTargetService(TestDataSource).patch(
          projectId,
          dummyId,
          {
            name: "testTargetService",
          },
          new TransactionRunner(TestDataSource)
        );
      } catch (e) {
        expect((e as Error).message).toEqual(`TestTargetnot found. ${dummyId}`);
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

      const testTargetGroupEntity = await TestDataSource.getRepository(
        TestTargetGroupEntity
      ).save({
        name: "testTargetGroupName",
        index: 0,
        testMatrix: testMatrixEntity,
      });

      await TestDataSource.getRepository(ViewPointEntity).save({
        name: "viewPointName",
        description: "",
        index: 0,
        testMatrices: [testMatrixEntity],
      });

      const target0 = await new TestTargetService(TestDataSource).post(
        {
          testTargetGroupId: testTargetGroupEntity.id,
          name: "testTargetName0",
        },
        new TransactionRunner(TestDataSource)
      );
      const target1 = await new TestTargetService(TestDataSource).post(
        {
          testTargetGroupId: testTargetGroupEntity.id,
          name: "testTargetName1",
        },
        new TransactionRunner(TestDataSource)
      );
      const target2 = await new TestTargetService(TestDataSource).post(
        {
          testTargetGroupId: testTargetGroupEntity.id,
          name: "testTargetName2",
        },
        new TransactionRunner(TestDataSource)
      );

      await new TestTargetService(TestDataSource).delete(
        target1.id,
        new TransactionRunner(TestDataSource)
      );

      const result = await testMatrixRepository.findOne({
        where: { id: testMatrixEntity.id },
        relations: ["testTargetGroups", "testTargetGroups.testTargets"],
      });

      const testTargetRepository =
        TestDataSource.getRepository(TestTargetEntity);
      const t0 = await testTargetRepository.findOne({
        where: { id: target0.id },
        relations: ["stories"],
      });
      const t2 = await testTargetRepository.findOne({
        where: { id: target2.id },
        relations: ["stories"],
      });

      const sortedResult = result?.testTargetGroups[0].testTargets.sort(
        (t1, t2) => t1.index - t2.index
      );

      expect((sortedResult ?? [])[0]).toEqual({
        id: target0.id,
        name: "testTargetName0",
        index: 0,
        text: JSON.stringify([
          { viewPointId: t0?.stories[0].viewPointId, value: 0 },
        ]),
      });

      expect((sortedResult ?? [])[1]).toEqual({
        id: target2.id,
        name: "testTargetName2",
        index: 1,
        text: JSON.stringify([
          { viewPointId: t2?.stories[0].viewPointId, value: 0 },
        ]),
      });

      expect((sortedResult ?? []).length).toEqual(2);
    });

    it("異常系", async () => {
      const dummyId = "dummyId";
      try {
        await new TestTargetService(TestDataSource).delete(
          dummyId,
          new TransactionRunner(TestDataSource)
        );
      } catch (e) {
        expect((e as Error).message).toEqual(
          `TestTarget not found. ${dummyId}`
        );
      }
    });
  });
});
