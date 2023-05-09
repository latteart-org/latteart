import { getRepository } from "typeorm";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";
import { ProjectsServiceImpl } from "@/services/ProjectsService";
import { ProjectEntity } from "@/entities/ProjectEntity";
import { TestMatrixEntity } from "@/entities/TestMatrixEntity";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("ProjectsService", () => {
  describe("#getProject", () => {
    it("projectを取得する", async () => {
      const service = new ProjectsServiceImpl();

      const projectEntity = await getRepository(ProjectEntity).save(
        new ProjectEntity("1")
      );

      const testMatrixRepository = getRepository(TestMatrixEntity);
      const testMatrixEntity = await testMatrixRepository.save(
        new TestMatrixEntity("testMatrixName", 0, projectEntity)
      );

      const result = await service.getProject(projectEntity.id);

      expect(result).toEqual({
        id: projectEntity.id,
        name: projectEntity.name,
        testMatrices: [
          {
            id: testMatrixEntity.id,
            name: testMatrixEntity.name,
            index: 0,
            groups: [],
            viewPoints: [],
          },
        ],
        stories: [],
      });
    });
  });

  describe("#createProject", () => {
    it("projectを1件新規追加する", async () => {
      const result = await new ProjectsServiceImpl().createProject();

      const projectEntity = await getRepository(ProjectEntity).findOne();

      expect(result).toEqual({
        id: projectEntity?.id,
        name: projectEntity?.name,
      });
    });
  });
});
