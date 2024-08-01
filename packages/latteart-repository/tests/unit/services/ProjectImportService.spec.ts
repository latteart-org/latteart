import { NotesService } from "@/services/NotesService";
import { ProjectImportService } from "@/services/ProjectImportService";
import { TestPurposeService } from "@/services/TestPurposeService";
import { TestResultService } from "@/services/TestResultService";
import { TestStepService } from "@/services/TestStepService";
import { TimestampService } from "@/services/TimestampService";
import { TransactionRunner } from "@/TransactionRunner";
import {
  SqliteTestConnectionHelper,
  TestDataSource,
} from "../../helper/TestConnectionHelper";
import {
  createTimestampServiceMock,
  createTestResultServiceMock,
  createTestStepServiceMock,
  createNotesServiceMock,
  createTestPurposeServiceMock,
  createStaticDirectoryServiceMock,
  createImportFileRepositoryMock,
} from "../../helper/createServiceMock";
import { ProgressData, Project } from "@/interfaces/Projects";
import { ProjectEntity } from "@/entities/ProjectEntity";
import { FileRepository } from "@/interfaces/fileRepository";
import { TestResultImportServiceImpl } from "@/services/TestResultImportService";
import { ImportFileRepository } from "@/interfaces/importFileRepository";
import { ConfigsService } from "@/services/ConfigsService";
import { TestHintsService } from "../../../src/services/TestHintsService";
import { CommentsService } from "@/services/CommentsService";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { CommentEntity } from "@/entities/CommentEntity";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection();
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("ProjectImportService", () => {
  describe("#import", () => {
    let timestampService: TimestampService;
    let testResultService: TestResultService;
    let testStepService: TestStepService;
    let screenshotFileRepository: FileRepository;
    let videoFileRepository: FileRepository;
    let attachedFileRepository: FileRepository;
    let notesService: NotesService;
    let testPurposeService: TestPurposeService;
    let importFileRepository: ImportFileRepository;
    let configService: ConfigsService;

    beforeEach(() => {
      timestampService = createTimestampServiceMock();
      testResultService = createTestResultServiceMock();
      testStepService = createTestStepServiceMock();
      screenshotFileRepository = createStaticDirectoryServiceMock();
      videoFileRepository = createStaticDirectoryServiceMock();
      attachedFileRepository = createStaticDirectoryServiceMock();
      notesService = createNotesServiceMock();
      testPurposeService = createTestPurposeServiceMock();
      importFileRepository = createImportFileRepositoryMock();
    });

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

    it("includeProject: true, includeTestResults: true, includeTestHints: true, includeConfig: true", async () => {
      jest.mock("./../../../src/services/TestHintsService");
      jest.mock("./../../../src/services/CommentsService");

      TestHintsService as jest.Mock;
      CommentsService as jest.Mock;

      const service = new ProjectImportService();
      service["readImportFile"] = jest.fn().mockResolvedValue({
        configFiles: [{ filePath: "config/config.json", data: "{}" }],
        testResultFiles: [
          { filePath: "test-results/testResultId/log.json", data: "{}" },
        ],
        projectFiles: [
          { filePath: "projects/projectId/project.json", data: "{}" },
        ],
        testHintFiles: [
          {
            filePath: "projects/test-hints/test-hints.json",
            data: "{}",
          },
        ],
        commentFiles: [
          {
            filePath: "projects/testResultId/comments.json",
            data: "[]",
          },
        ],
      });
      service["importConfig"] = jest.fn().mockResolvedValue(settings);
      service["importTestResults"] = jest.fn().mockResolvedValue(new Map());
      service["importProject"] = jest.fn().mockResolvedValue("1");
      service["importComments"] = jest.fn().mockResolvedValue("1");
      service["importTestHints"] = jest.fn().mockResolvedValue("1");

      const commentsService = new CommentsService(TestDataSource);
      commentsService.importComments = jest.fn();
      const testHintsService = new TestHintsService(TestDataSource);
      testHintsService.importAllTestHints = jest.fn();

      const testResultImportService = new TestResultImportServiceImpl(
        TestDataSource,
        {
          importFileRepository,
          screenshotFileRepository,
          videoFileRepository,
          timestamp: timestampService,
        }
      );

      const importFile = { data: "data", name: "importFileName" };
      const option = {
        includeProject: true,
        includeTestResults: true,
        includeTestHints: true,
        includeConfig: true,
      };
      await service.import(
        importFile,
        option.includeProject,
        option.includeTestResults,
        option.includeTestHints,
        option.includeConfig,
        {
          timestampService,
          testResultService,
          configService,
          testStepService,
          screenshotFileRepository,
          attachedFileRepository,
          notesService,
          testPurposeService,
          transactionRunner: new TransactionRunner(TestDataSource),
          testResultImportService,
          importFileRepository,
          commentsService,
          testHintsService,
        }
      );

      expect(service["readImportFile"]).toBeCalledWith(
        importFileRepository,
        importFile.data,
        option
      );
      expect(service["importConfig"]).toBeCalledTimes(1);
      expect(service["importTestResults"]).toBeCalledTimes(1);
      expect(service["importProject"]).toBeCalledTimes(1);
      expect(service["importComments"]).toBeCalledTimes(1);
      expect(service["importTestHints"]).toBeCalledTimes(1);
    });

    it("includeProject: false, includeTestResults: false, includeConfig: false", async () => {
      const service = new ProjectImportService();
      service["readImportFile"] = jest.fn().mockResolvedValue({
        configFiles: [{ filePath: "config/config.json", data: "{}" }],
        testResultFiles: [
          { filePath: "test-results/testResultId/log.json", data: "{}" },
        ],
        projectFiles: [
          { filePath: "projects/projectId/project.json", data: "{}" },
        ],
      });
      service["importConfig"] = jest.fn().mockResolvedValue(settings);
      service["importTestResults"] = jest.fn().mockResolvedValue(new Map());
      service["importProject"] = jest.fn().mockResolvedValue("1");

      const testHintsService = TestHintsService as jest.Mock;
      const commentsService = CommentsService as jest.Mock;

      const testResultImportService = new TestResultImportServiceImpl(
        TestDataSource,
        {
          importFileRepository,
          screenshotFileRepository,
          videoFileRepository,
          timestamp: timestampService,
        }
      );

      const importFile = { data: "data", name: "importFileName" };
      const option = {
        includeProject: false,
        includeTestResults: false,
        includeTestHints: false,
        includeConfig: false,
      };
      await service.import(
        importFile,
        option.includeProject,
        option.includeTestResults,
        option.includeTestHints,
        option.includeConfig,
        {
          timestampService,
          testResultService,
          configService,
          testStepService,
          screenshotFileRepository,
          attachedFileRepository,
          notesService,
          testPurposeService,
          transactionRunner: new TransactionRunner(TestDataSource),
          testResultImportService,
          importFileRepository,
          commentsService: new CommentsService(TestDataSource),
          testHintsService: new TestHintsService(TestDataSource),
        }
      );

      expect(service["readImportFile"]).toBeCalledWith(
        importFileRepository,
        importFile.data,
        option
      );
      expect(service["importConfig"]).toBeCalledTimes(0);
      expect(service["importTestResults"]).toBeCalledTimes(0);
      expect(service["importProject"]).toBeCalledTimes(0);
    });
  });

  describe("#importProject", () => {
    it("プロジェクトの登録", async () => {
      const timestampService = createTimestampServiceMock();
      const attachedFileRepositoryService = createStaticDirectoryServiceMock();
      const progressJson = {};

      const projectJson: Project & {
        progressDatas: ProgressData[];
      } = {
        id: "projectId",
        name: "projectName",
        testMatrices: [
          {
            id: "testMatrixId",
            name: "testMatrixName",
            index: 0,
            groups: [
              {
                id: "groupId",
                name: "groupName",
                index: 0,
                testTargets: [
                  {
                    id: "testTargetId",
                    name: "testTargetName",
                    index: 0,
                    plans: [
                      {
                        viewPointId: "viewPointId",
                        value: 0,
                      },
                    ],
                  },
                ],
              },
            ],
            viewPoints: [
              {
                id: "viewPointId",
                name: "viewPointName",
                description: "viewPointDescription",
                index: 0,
              },
            ],
          },
        ],
        stories: [
          {
            id: "storyId",
            testMatrixId: "testMatrixId",
            testTargetId: "testTargetId",
            viewPointId: "viewPointId",
            status: "ok",
            index: 0,
            sessions: [],
          },
        ],
        progressDatas: [
          {
            testMatrixId: "testMatrixId",
            testMatrixProgressDatas: [
              {
                date: "20200101",
                groups: [
                  {
                    id: "groupId",
                    name: "groupName",
                    testTargets: [
                      {
                        id: "testTargetId",
                        name: "testTargetName",
                        progress: {
                          completedNumber: 0,
                          incompletedNumber: 0,
                          planNumber: 0,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };
      const projectData = {
        projectId: "projectId",
        projectFile: {
          fileName: "project.json",
          data: JSON.stringify(projectJson),
        },
        stories: [],
        progressesFile: {
          fileName: "progress.json",
          data: JSON.stringify(progressJson),
        },
      };

      const service = new ProjectImportService();
      const projectId = await service["importProject"](projectData, new Map(), {
        timestampService,
        attachedFileRepository: attachedFileRepositoryService,
        transactionRunner: new TransactionRunner(TestDataSource),
      });

      const project = await TestDataSource.getRepository(
        ProjectEntity
      ).findOneBy({
        id: projectId,
      });

      expect(projectId).toEqual(project?.id);
    });
    it("TestHintの登録", async () => {
      const testHintData = {
        props: [{ name: "name", id: "propId", type: "string" }],
        data: [
          {
            id: "testHintId",
            value: "value",
            testMatrixName: "tm",
            groupName: "gn",
            testTargetName: "tt",
            viewPointName: "vp",
            customs: [],
            commentWords: [],
            createdAt: 10,
            operationElements: [],
          },
        ],
      };
      const service = new ProjectImportService();
      await service["importTestHints"](
        new TestHintsService(TestDataSource),
        new TransactionRunner(TestDataSource),
        JSON.stringify(testHintData)
      );

      const result = await new TestHintsService(
        TestDataSource
      ).getAllTestHints();

      expect(result).toEqual({
        props: [
          {
            ...testHintData.props[0],

            id: expect.any(String),
          },
        ],
        data: [
          {
            ...testHintData.data[0],
            id: expect.any(String),
            createdAt: expect.any(Number),
          },
        ],
      });
    });
    it("Commentsの登録", async () => {
      const testResultEntity = await TestDataSource.getRepository(
        TestResultEntity
      ).save(new TestResultEntity());
      const commentData = [
        {
          testResult: "oldId",
          id: "commentId",
          value: "value",
          timestamp: 10,
        },
      ];
      const idMap = new Map<string, string>();
      idMap.set("oldId", testResultEntity.id);

      const service = new ProjectImportService();
      await service["importComments"](
        new CommentsService(TestDataSource),
        [JSON.stringify(commentData)],
        idMap
      );

      const comments = await TestDataSource.getRepository(CommentEntity).find();

      expect(comments).toEqual([
        {
          id: expect.any(String),
          timestamp: 10,
          value: "value",
        },
      ]);
    });
  });
});
