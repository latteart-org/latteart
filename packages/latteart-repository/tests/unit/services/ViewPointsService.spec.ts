import { ProjectEntity } from "@/entities/ProjectEntity";
import { TestMatrixEntity } from "@/entities/TestMatrixEntity";
import { getRepository } from "typeorm";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";
import { TransactionRunner } from "@/TransactionRunner";
import { ViewPointEntity } from "@/entities/ViewPointEntity";
import { ViewPointsService } from "@/services/ViewPointsService";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("ViewPointsService", () => {
  describe("#get", () => {
    it("正常系", async () => {
      const projectEntity = await getRepository(ProjectEntity).save(
        new ProjectEntity("projectName")
      );

      const testMatrixEntity = await getRepository(TestMatrixEntity).save(
        new TestMatrixEntity("testMatrixName", 0, projectEntity)
      );

      const viewPointEntity = await getRepository(ViewPointEntity).save({
        name: "viewPointName",
        description: "",
        index: 0,
        testMatrices: [testMatrixEntity],
      });

      const result = await new ViewPointsService().get(viewPointEntity.id);

      expect(result).toEqual({
        id: viewPointEntity.id,
        name: viewPointEntity.name,
        index: 0,
        description: viewPointEntity.description,
      });
    });
    it("異常系", async () => {
      const dummyId = "dummyId";
      try {
        await new ViewPointsService().get(dummyId);
      } catch (e) {
        expect((e as Error).message).toEqual(`ViewPoint not found. ${dummyId}`);
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

      const result = await new ViewPointsService().post(
        {
          testMatrixId: testMatrixEntity.id,
          index: 0,
          name: "viewPointName",
          description: "description",
        },
        new TransactionRunner()
      );

      const testTarget = await getRepository(ViewPointEntity).findOne(
        result.id
      );

      expect(result).toEqual({
        id: testTarget?.id,
        name: "viewPointName",
        index: 0,
        description: "description",
      });
    });

    it("異常系", async () => {
      const dummyId = "dummyId";
      try {
        await new ViewPointsService().post(
          {
            testMatrixId: dummyId,
            index: 3,
            name: "viewPointName3",
            description: "description3",
          },
          new TransactionRunner()
        );
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

      const viewPointEntity = await new ViewPointsService().post(
        {
          testMatrixId: testMatrixEntity.id,
          index: 0,
          name: "viewPointName",
          description: "description",
        },
        new TransactionRunner()
      );

      const result = await new ViewPointsService().patch(viewPointEntity.id, {
        name: "viewPointName2",
        index: 2,
        description: "description2",
      });

      const testTarget = await getRepository(ViewPointEntity).findOne(
        result.id
      );

      expect(result).toEqual({
        id: testTarget?.id,
        name: "viewPointName2",
        index: 2,
        description: "description2",
      });
    });

    it("異常系", async () => {
      const dummyId = "dummyId";
      try {
        await new ViewPointsService().patch(dummyId, {
          name: "viewPointName2",
          index: 2,
          description: "description2",
        });
      } catch (e) {
        expect((e as Error).message).toEqual(`ViewPoint found. ${dummyId}`);
      }
    });
  });

  describe("#delete", () => {
    it("正常系", async () => {
      const projectEntity = await getRepository(ProjectEntity).save(
        new ProjectEntity("projectName")
      );

      const testMatrixEntity = await getRepository(TestMatrixEntity).save(
        new TestMatrixEntity("testMatrixName", 0, projectEntity)
      );

      const target0 = await new ViewPointsService().post(
        {
          testMatrixId: testMatrixEntity.id,
          index: 0,
          name: "viewPointName",
          description: "description",
        },
        new TransactionRunner()
      );

      const target1 = await new ViewPointsService().post(
        {
          testMatrixId: testMatrixEntity.id,
          index: 1,
          name: "viewPointName1",
          description: "description1",
        },
        new TransactionRunner()
      );

      const target2 = await new ViewPointsService().post(
        {
          testMatrixId: testMatrixEntity.id,
          index: 2,
          name: "viewPointName2",
          description: "description2",
        },
        new TransactionRunner()
      );

      await new ViewPointsService().delete(target1.id);

      const viewPointRepository = getRepository(ViewPointEntity);
      const result = await viewPointRepository.find();

      const t0 = await viewPointRepository.findOne(target0.id);
      const t2 = await viewPointRepository.findOne(target2.id);

      expect((result ?? [])[0]).toEqual({
        id: t0?.id,
        name: "viewPointName",
        index: 0,
        description: "description",
        createdAt: t0?.createdAt,
      });

      expect((result ?? [])[1]).toEqual({
        id: t2?.id,
        name: "viewPointName2",
        index: 2,
        description: "description2",
        createdAt: t2?.createdAt,
      });

      expect((result ?? []).length).toEqual(2);
    });
  });
});
