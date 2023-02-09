import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";
import { getRepository } from "typeorm";
import { ProjectExportService } from "@/services/ProjectExportService";
import { ProjectsService } from "@/services/ProjectsService";
import { TestResultService } from "@/services/TestResultService";

import { ExportService } from "@/services/ExportService";
import { ExportFileRepositoryService } from "@/services/ExportFileRepositoryService";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { TestProgressService } from "@/services/TestProgressService";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("ProjectExportService", () => {
  describe("export", () => {
    const projectData = {
      id: "projectId",
      name: "projectName",
      stories: [
        {
          id: "storyId",
          sessions: [
            {
              id: "sessionId",
              attachedFiles: [
                {
                  fileUrl: "fileUrl",
                },
              ],
            },
          ],
        },
      ],
    };
    const projectService: ProjectsService = {
      getProjectIdentifiers: jest.fn(),
      createProject: jest.fn(),
      getProject: jest.fn().mockResolvedValue(projectData),
    };

    const testResultService: TestResultService = {
      getTestResultIdentifiers: jest.fn(),
      getTestResult: jest.fn().mockResolvedValue({
        id: "testResultId",
      }),
      createTestResult: jest.fn(),
      patchTestResult: jest.fn(),
      collectAllTestStepIds: jest.fn(),
      collectAllTestPurposeIds: jest.fn(),
      collectAllTestStepScreenshots: jest.fn().mockResolvedValue([
        {
          id: "id",
          fileUrl: "fileUrl",
        },
      ]),
      generateSequenceView: jest.fn(),
    };

    const exportFileRepositoryService: ExportFileRepositoryService = {
      exportProject: jest.fn(),
      exportTestResult: jest.fn(),
    };

    const exportService: ExportService = {
      exportTestResult: jest.fn(),
      serializeTestResult: jest.fn().mockReturnValue("serializedTestResult"),
    };

    const testProgressService: TestProgressService = {
      registerStoryTestProgresses: jest.fn(),
      registerProjectTestProgresses: jest.fn(),
      saveTodayTestProgresses: jest.fn(),
      collectStoryDailyTestProgresses: jest.fn(),
      collectProjectDailyTestProgresses: jest.fn(),
    };

    it("includeProject: true, includeTestResults: true", async () => {
      projectService.getProject = jest.fn().mockResolvedValue(projectData);
      testResultService.collectAllTestStepScreenshots = jest
        .fn()
        .mockResolvedValue([
          {
            id: "id",
            fileUrl: "fileUrl",
          },
        ]);

      await getRepository(TestResultEntity).save(new TestResultEntity());

      await new ProjectExportService().export("1", true, true, {
        projectService,
        testResultService,
        exportService,
        exportFileRepositoryService,
        testProgressService,
      });

      expect(projectService.getProject).toBeCalledTimes(1);
      expect(testResultService.collectAllTestStepScreenshots).toBeCalledTimes(
        1
      );
    });

    it("includeProject: false, includeTestResults: false", async () => {
      projectService.getProject = jest.fn();
      testResultService.collectAllTestStepScreenshots = jest.fn();

      await getRepository(TestResultEntity).save(new TestResultEntity());

      await new ProjectExportService().export("1", false, false, {
        projectService,
        testResultService,
        exportService,
        exportFileRepositoryService,
        testProgressService,
      });

      expect(projectService.getProject).toBeCalledTimes(0);
      expect(testResultService.collectAllTestStepScreenshots).toBeCalledTimes(
        0
      );
    });
  });
});
