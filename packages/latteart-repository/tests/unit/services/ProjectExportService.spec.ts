import {
  SqliteTestConnectionHelper,
  TestDataSource,
} from "../../helper/TestConnectionHelper";
import { ProjectExportService } from "@/services/ProjectExportService";
import { ProjectsService } from "@/services/ProjectsService";
import { TestResultService } from "@/services/TestResultService";
import { ExportFileRepositoryService } from "@/services/ExportFileRepositoryService";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { TestProgressService } from "@/services/TestProgressService";
import { ConfigsService } from "@/services/ConfigsService";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection();
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

    const testResultData = {
      id: "testResultId",
      name: "testResultName",
      startTimeStamp: 0,
      lastUpdateTimeStamp: 0,
      initialUrl: "",
      testingTime: 0,
      testSteps: [],
      coverageSources: [],
      creationTimestamp: 10,
    };

    const dailyTestProgress = [
      {
        date: "2023/01/01",
        storyProgresses: [
          {
            storyId: "storyId",
            testMatrixId: "testMatrixId",
            testTargetGroupId: "testTargetGroupId",
            testTargetId: "testTargetId",
            viewPointId: "viewPointId",
            plannedSessionNumber: 1,
            completedSessionNumber: 0,
            incompletedSessionNumber: 1,
          },
        ],
      },
    ];

    const settings = {
      config: {
        autofillSetting: { conditionGroups: [] },
        autoOperationSetting: { conditionGroups: [] },
        screenDefinition: { screenDefType: "url", conditionGroups: [] },
        coverage: { include: { tags: [] } },
        imageCompression: { format: "png" },
        testResultComparison: {
          excludeItems: { isEnabled: false, values: [] },
          excludeElements: { isEnabled: false, values: [] },
        },
      },
      defaultTagList: [],
      viewPointsPreset: [],
    };

    const projectService: ProjectsService = {
      getProjectIdentifiers: jest.fn(),
      createProject: jest.fn(),
      getProject: jest.fn().mockResolvedValue(projectData),
    };

    const testResultService: TestResultService = {
      getTestResultIdentifiers: jest.fn(),
      getTestResult: jest.fn(),
      getTestResultForExport: jest.fn().mockResolvedValue(testResultData),
      createTestResult: jest.fn(),
      patchTestResult: jest.fn(),
      collectAllTestStepIds: jest.fn(),
      collectAllTestPurposeIds: jest.fn(),
      collectAllTestStepScreenshots: jest.fn(),
      generateSequenceView: jest.fn(),
      generateGraphView: jest.fn(),
      compareTestResults: jest.fn(),
      collectAllScreenshots: jest
        .fn()
        .mockResolvedValue([{ id: "id", fileUrl: "fileUrl" }]),
      collectAllVideos: jest
        .fn()
        .mockResolvedValue([{ id: "id", fileUrl: `video/testResultId.webm` }]),
    };

    const exportFileRepositoryService: ExportFileRepositoryService = {
      exportProject: jest.fn().mockResolvedValue("project.zip"),
      exportTestResult: jest.fn(),
    };

    const testProgressService: TestProgressService = {
      saveTodayTestProgresses: jest.fn(),
      collectStoryDailyTestProgresses: jest
        .fn()
        .mockResolvedValue(dailyTestProgress),
      collectProjectDailyTestProgresses: jest.fn(),
    };

    const configService = new ConfigsService(TestDataSource);

    it("includeProject: true, includeTestResults: true, includeConfig: trueの場合、Project・TestResult・Configのexport処理が実行される", async () => {
      const service = new ProjectExportService(TestDataSource);
      projectService.getProject = jest.fn().mockResolvedValue(projectData);
      testResultService.collectAllScreenshots = jest
        .fn()
        .mockResolvedValue([{ id: "id", fileUrl: "fileUrl" }]);
      configService.getProjectConfig = jest.fn().mockResolvedValue(settings);

      await TestDataSource.getRepository(TestResultEntity).save(
        new TestResultEntity()
      );

      const result = await service.export("1", true, true, true, {
        projectService,
        testResultService,
        configService,
        exportFileRepositoryService,
        testProgressService,
      });

      expect(result).toEqual("project.zip");
      expect(projectService.getProject).toBeCalledTimes(1);
      expect(testResultService.collectAllScreenshots).toBeCalledTimes(1);
      expect(configService.getProjectConfig).toBeCalledTimes(1);
    });

    it("includeProject: false, includeTestResults: false, includeConfig: falseの場合、Project・TestResult・Configのexport処理が共に実行しない", async () => {
      projectService.getProject = jest.fn();
      testResultService.collectAllScreenshots = jest.fn();
      configService.getProjectConfig = jest.fn();

      await TestDataSource.getRepository(TestResultEntity).save(
        new TestResultEntity()
      );

      await new ProjectExportService(TestDataSource).export(
        "1",
        false,
        false,
        false,
        {
          projectService,
          testResultService,
          configService,
          exportFileRepositoryService,
          testProgressService,
        }
      );

      expect(projectService.getProject).toBeCalledTimes(0);
      expect(testResultService.collectAllScreenshots).toBeCalledTimes(0);
      expect(configService.getProjectConfig).toBeCalledTimes(0);
    });

    it("extractProjectExportDataで、ProjectのexportDataを返す", async () => {
      const service = new ProjectExportService(TestDataSource);
      projectService.getProject = jest.fn().mockResolvedValue(projectData);
      testProgressService.collectStoryDailyTestProgresses = jest
        .fn()
        .mockResolvedValue(dailyTestProgress);
      const project = await service["extractProjectExportData"](
        projectData.id,
        {
          projectService,
          testProgressService,
        }
      );

      const projectFileData = {
        ...projectData,
        version: 1,
      };

      expect(project).toEqual({
        projectId: "projectId",
        projectFile: {
          fileName: "project.json",
          data: JSON.stringify(projectFileData),
        },
        stories: [
          {
            storyId: "storyId",
            sessions: [
              {
                sessionId: "sessionId",
                attachedFiles: [{ fileUrl: "fileUrl" }],
              },
            ],
          },
        ],
        progressesFile: {
          fileName: "progress.json",
          data: JSON.stringify(dailyTestProgress),
        },
      });
    });

    it("extractTestResultsExportDataで、TestResultのexportDataを返す", async () => {
      const service = new ProjectExportService(TestDataSource);
      projectService.getProject = jest.fn().mockResolvedValue(projectData);
      testResultService.collectAllScreenshots = jest
        .fn()
        .mockResolvedValue([{ id: "id1", fileUrl: "fileUrl1" }]);
      testResultService.collectAllVideos = jest
        .fn()
        .mockResolvedValue([{ id: "id2", fileUrl: "fileUrl2" }]);

      await TestDataSource.getRepository(TestResultEntity).save(
        new TestResultEntity()
      );

      const testResult = await service["extractTestResultsExportData"]({
        testResultService,
      });

      expect(testResult).toEqual([
        {
          testResultId: "testResultId",
          testResultFile: {
            fileName: "log.json",
            data: JSON.stringify({
              version: 3,
              name: "testResultName",
              sessionId: "testResultId",
              startTimeStamp: 0,
              lastUpdateTimeStamp: 0,
              initialUrl: "",
              testingTime: 0,
              history: {},
              notes: [],
              coverageSources: [],
              creationTimestamp: 10,
            }),
          },
          fileData: [
            { id: "id1", fileUrl: "fileUrl1" },
            { id: "id2", fileUrl: "fileUrl2" },
          ],
        },
      ]);
    });

    it("extractConfigExportDataで、ConfigのexportDataを返す", async () => {
      const service = new ProjectExportService(TestDataSource);
      configService.getProjectConfig = jest.fn().mockResolvedValue(settings);

      const config = await service["extractConfigExportData"](projectData.id, {
        configService,
      });

      expect(config).toEqual({
        fileName: "config.json",
        data: JSON.stringify(settings, null, 2),
      });
    });
  });
});
