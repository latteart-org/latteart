import { TestResultEntity } from "@/entities/TestResultEntity";
import { TestStepEntity } from "@/entities/TestStepEntity";
import { TestStepServiceImpl } from "@/services/TestStepService";
import { TimestampService } from "@/services/TimestampService";
import { ConfigsService } from "@/services/ConfigsService";
import { getRepository } from "typeorm";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";
import { CreateTestStepDto } from "@/interfaces/TestSteps";
import { CoverageSourceEntity } from "@/entities/CoverageSourceEntity";
import { FileRepository } from "@/interfaces/fileRepository";
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
});
