import { ProjectEntity } from "@/entities/ProjectEntity";
import { TestMatrixEntity } from "@/entities/TestMatrixEntity";
import { TestMatricesService } from "@/services/TestMatricesService";
import { getRepository } from "typeorm";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";
import { TransactionRunner } from "@/TransactionRunner";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("TestMatrixService", () => {
  describe("#get", () => {
    it("正常系", async () => {
      const projectRepository = getRepository(ProjectEntity);
      const projectEntity = await projectRepository.save(
        new ProjectEntity("projectName")
      );

      const testMatrixRepository = getRepository(TestMatrixEntity);
      const testMatrixEntity = await testMatrixRepository.save(
        new TestMatrixEntity("testMatrixName", 0, projectEntity)
      );

      const result = await new TestMatricesService().get(testMatrixEntity.id);

      expect(result).toEqual({
        id: testMatrixEntity.id,
        name: testMatrixEntity.name,
        index: 0,
        groups: [],
        viewPoints: [],
      });
    });
    it("異常系", async () => {
      const dummyId = "dummyId";
      try {
        await new TestMatricesService().get(dummyId);
      } catch (e) {
        expect((e as Error).message).toEqual(
          `TestMatrix not found. ${dummyId}`
        );
      }
    });
  });

  describe("#post", () => {
    it("正常系", async () => {
      const projectRepository = getRepository(ProjectEntity);
      const projectEntity = await projectRepository.save(
        new ProjectEntity("projectName")
      );

      const result = await new TestMatricesService().post({
        projectId: projectEntity.id,
        name: "testMatrixName",
      });

      const project = await projectRepository.findOne(projectEntity.id, {
        relations: ["testMatrices"],
      });

      expect(result).toEqual({
        id: project?.testMatrices[0].id,
        name: "testMatrixName",
        index: 0,
        groups: [],
        viewPoints: [],
      });
    });

    it("異常系", async () => {
      const dummyId = "dummyId";
      try {
        await new TestMatricesService().post({
          projectId: dummyId,
          name: "testMatrixName",
        });
      } catch (e) {
        expect((e as Error).message).toEqual(`Project not found. ${dummyId}`);
      }
    });
  });

  describe("#patch", () => {
    it("正常系", async () => {
      const projectRepository = getRepository(ProjectEntity);
      const projectEntity = await projectRepository.save(
        new ProjectEntity("projectName")
      );

      const testMatrixRepository = getRepository(TestMatrixEntity);
      const testMatrixEntity = await testMatrixRepository.save(
        new TestMatrixEntity("testMatrixName", 0, projectEntity)
      );

      const result = await new TestMatricesService().patch(
        testMatrixEntity.id,
        { name: "testMatrixName2" }
      );

      expect(result).toEqual({
        id: testMatrixEntity.id,
        name: "testMatrixName2",
        index: 0,
        groups: [],
        viewPoints: [],
      });
    });

    it("異常系", async () => {
      const dummyId = "dummyId";
      try {
        await new TestMatricesService().patch(dummyId, {
          name: "testMatrixName",
        });
      } catch (e) {
        expect((e as Error).message).toEqual(
          `TestMatrix not found. ${dummyId}`
        );
      }
    });
  });

  describe("#delete", () => {
    it("正常系", async () => {
      const projectRepository = getRepository(ProjectEntity);
      const projectEntity = await projectRepository.save(
        new ProjectEntity("projectName")
      );

      const testMatrixRepository = getRepository(TestMatrixEntity);
      const testMatrixEntity0 = await testMatrixRepository.save(
        new TestMatrixEntity("testMatrixName0", 0, projectEntity)
      );
      const testMatrixEntity1 = await testMatrixRepository.save(
        new TestMatrixEntity("testMatrixName0", 1, projectEntity)
      );
      const testMatrixEntity2 = await testMatrixRepository.save(
        new TestMatrixEntity("testMatrixName2", 2, projectEntity)
      );

      await new TestMatricesService().delete(
        testMatrixEntity1.id,
        new TransactionRunner()
      );

      const result = await projectRepository.findOne(projectEntity.id, {
        relations: ["testMatrices"],
      });

      const sortedResult = result?.testMatrices.sort(
        (t1, t2) => t1.index - t2.index
      );

      expect((sortedResult ?? [])[0]).toEqual({
        id: testMatrixEntity0.id,
        name: "testMatrixName0",
        index: 0,
      });

      expect((sortedResult ?? [])[1]).toEqual({
        id: testMatrixEntity2.id,
        name: "testMatrixName2",
        index: 1,
      });
    });

    it("異常系", async () => {
      const dummyId = "dummyId";
      try {
        await new TestMatricesService().delete(
          dummyId,
          new TransactionRunner()
        );
      } catch (e) {
        expect((e as Error).message).toEqual(
          `TestMatrix not found. ${dummyId}`
        );
      }
    });
  });
});
