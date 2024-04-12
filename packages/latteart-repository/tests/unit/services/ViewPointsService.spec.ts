import { ProjectEntity } from "@/entities/ProjectEntity";
import { TestMatrixEntity } from "@/entities/TestMatrixEntity";
import {
  SqliteTestConnectionHelper,
  TestDataSource,
} from "../../helper/TestConnectionHelper";
import { TransactionRunner } from "@/TransactionRunner";
import { ViewPointEntity } from "@/entities/ViewPointEntity";
import { ViewPointsService } from "@/services/ViewPointsService";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection();
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("ViewPointsService", () => {
  describe("#get", () => {
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

      const result = await new ViewPointsService(TestDataSource).get(
        viewPointEntity.id
      );

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
        await new ViewPointsService(TestDataSource).get(dummyId);
      } catch (e) {
        expect((e as Error).message).toEqual(`ViewPoint not found. ${dummyId}`);
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

      const result = await new ViewPointsService(TestDataSource).post(
        {
          testMatrixId: testMatrixEntity.id,
          index: 0,
          name: "viewPointName",
          description: "description",
        },
        new TransactionRunner(TestDataSource)
      );

      const testTarget = await TestDataSource.getRepository(
        ViewPointEntity
      ).findOneBy({
        id: result.id,
      });

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
        await new ViewPointsService(TestDataSource).post(
          {
            testMatrixId: dummyId,
            index: 3,
            name: "viewPointName3",
            description: "description3",
          },
          new TransactionRunner(TestDataSource)
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
      const projectEntity = await TestDataSource.getRepository(
        ProjectEntity
      ).save(new ProjectEntity("projectName"));

      const testMatrixEntity = await TestDataSource.getRepository(
        TestMatrixEntity
      ).save(new TestMatrixEntity("testMatrixName", 0, projectEntity));

      const viewPointEntity = await new ViewPointsService(TestDataSource).post(
        {
          testMatrixId: testMatrixEntity.id,
          index: 0,
          name: "viewPointName",
          description: "description",
        },
        new TransactionRunner(TestDataSource)
      );

      const result = await new ViewPointsService(TestDataSource).patch(
        viewPointEntity.id,
        {
          name: "viewPointName2",
          index: 2,
          description: "description2",
        }
      );

      const testTarget = await TestDataSource.getRepository(
        ViewPointEntity
      ).findOneBy({
        id: result.id,
      });

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
        await new ViewPointsService(TestDataSource).patch(dummyId, {
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
      const projectEntity = await TestDataSource.getRepository(
        ProjectEntity
      ).save(new ProjectEntity("projectName"));

      const testMatrixEntity = await TestDataSource.getRepository(
        TestMatrixEntity
      ).save(new TestMatrixEntity("testMatrixName", 0, projectEntity));

      const target0 = await new ViewPointsService(TestDataSource).post(
        {
          testMatrixId: testMatrixEntity.id,
          index: 0,
          name: "viewPointName",
          description: "description",
        },
        new TransactionRunner(TestDataSource)
      );

      const target1 = await new ViewPointsService(TestDataSource).post(
        {
          testMatrixId: testMatrixEntity.id,
          index: 1,
          name: "viewPointName1",
          description: "description1",
        },
        new TransactionRunner(TestDataSource)
      );

      const target2 = await new ViewPointsService(TestDataSource).post(
        {
          testMatrixId: testMatrixEntity.id,
          index: 2,
          name: "viewPointName2",
          description: "description2",
        },
        new TransactionRunner(TestDataSource)
      );

      await new ViewPointsService(TestDataSource).delete(target1.id);

      const viewPointRepository = TestDataSource.getRepository(ViewPointEntity);
      const result = await viewPointRepository.find();

      const t0 = await viewPointRepository.findOneBy({ id: target0.id });
      const t2 = await viewPointRepository.findOneBy({ id: target2.id });

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
