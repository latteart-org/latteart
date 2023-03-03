import { NotesService } from "@/services/NotesService";
import { ProjectImportService } from "@/services/ProjectImportService";
import { TestPurposeService } from "@/services/TestPurposeService";
import { TestResultService } from "@/services/TestResultService";
import { TestStepService } from "@/services/TestStepService";
import { TimestampService } from "@/services/TimestampService";
import { TransactionRunner } from "@/TransactionRunner";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";

import {
  createTimestampServiceMock,
  createTestResultServiceMock,
  createTestStepServiceMock,
  createNotesServiceMock,
  createTestPurposeServiceMock,
  createStaticDirectoryServiceMock,
} from "../../helper/createServiceMock";
import { ProgressData, Project } from "@/interfaces/Projects";
import { getRepository } from "typeorm";
import { ProjectEntity } from "@/entities/ProjectEntity";
import { FileRepository } from "@/interfaces/fileRepository";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("ProjectImportService", () => {
  describe("#import", () => {
    let timestampService: TimestampService;
    let testResultService: TestResultService;
    let testStepService: TestStepService;
    let screenshotRepositoryService: FileRepository;
    let attachedFileRepositoryService: FileRepository;
    let notesService: NotesService;
    let testPurposeService: TestPurposeService;

    beforeEach(() => {
      timestampService = createTimestampServiceMock();
      testResultService = createTestResultServiceMock();
      testStepService = createTestStepServiceMock();
      screenshotRepositoryService = createStaticDirectoryServiceMock();
      attachedFileRepositoryService = createStaticDirectoryServiceMock();
      notesService = createNotesServiceMock();
      testPurposeService = createTestPurposeServiceMock();
    });

    it("includeProject: true, includeTestResults: true", async () => {
      const service = new ProjectImportService();
      service["readImportFile"] = jest.fn().mockResolvedValue({
        testResultFiles: [
          { filePath: "test-results/testResultId/log.json", data: "{}" },
        ],
        projectFiles: [
          { filePath: "projects/projectId/project.json", data: "{}" },
        ],
      });
      service["extractTestResultsData"] = jest.fn().mockReturnValue([]);
      service["importTestResults"] = jest.fn().mockResolvedValue(new Map());
      service["extractProjectData"] = jest.fn().mockReturnValue({});
      service["importProject"] = jest.fn().mockResolvedValue("1");

      const importFile = { data: "data", name: "importFileName" };
      const option = { includeProject: true, includeTestResults: true };
      await service.import(
        importFile,
        option.includeProject,
        option.includeTestResults,
        {
          timestampService,
          testResultService,
          testStepService,
          screenshotFileRepository: screenshotRepositoryService,
          attachedFileRepository: attachedFileRepositoryService,
          notesService,
          testPurposeService,
          transactionRunner: new TransactionRunner(),
        }
      );

      expect(service["readImportFile"]).toBeCalledWith(importFile.data, option);
      expect(service["extractTestResultsData"]).toBeCalledTimes(1);
      expect(service["importTestResults"]).toBeCalledTimes(1);
      expect(service["extractProjectData"]).toBeCalledTimes(1);
      expect(service["importProject"]).toBeCalledTimes(1);
    });

    it("includeProject: false, includeTestResults: false", async () => {
      const service = new ProjectImportService();
      service["readImportFile"] = jest.fn().mockResolvedValue({
        testResultFiles: [
          { filePath: "test-results/testResultId/log.json", data: "{}" },
        ],
        projectFiles: [
          { filePath: "projects/projectId/project.json", data: "{}" },
        ],
      });
      service["extractTestResultsData"] = jest.fn().mockReturnValue([]);
      service["importTestResults"] = jest.fn().mockResolvedValue(new Map());
      service["extractProjectData"] = jest.fn().mockReturnValue({});
      service["importProject"] = jest.fn().mockResolvedValue("1");

      const importFile = { data: "data", name: "importFileName" };
      const option = { includeProject: false, includeTestResults: false };
      await service.import(
        importFile,
        option.includeProject,
        option.includeTestResults,
        {
          timestampService,
          testResultService,
          testStepService,
          screenshotFileRepository: screenshotRepositoryService,
          attachedFileRepository: attachedFileRepositoryService,
          notesService,
          testPurposeService,
          transactionRunner: new TransactionRunner(),
        }
      );

      expect(service["readImportFile"]).toBeCalledWith(importFile.data, option);
      expect(service["extractTestResultsData"]).toBeCalledTimes(0);
      expect(service["importTestResults"]).toBeCalledTimes(0);
      expect(service["extractProjectData"]).toBeCalledTimes(0);
      expect(service["importProject"]).toBeCalledTimes(0);
    });
  });

  describe("#extractTestResultsData", () => {
    it("テスト実行結果データの抽出", () => {
      const testResultFiles = [
        {
          filePath: "test-results/testResultId1/log.json",
          data: "{1}",
        },
        {
          filePath: "test-results/testResultId1/aaaa.webp",
          data: Buffer.from(""),
        },
        {
          filePath: "test-results/testResultId2/log.json",
          data: "{2}",
        },
        {
          filePath: "test-results/testResultId2/bbbb.webp",
          data: Buffer.from(""),
        },
      ];
      const result = new ProjectImportService()["extractTestResultsData"](
        testResultFiles
      );
      expect(result).toEqual([
        {
          screenshots: [{ data: Buffer.from(""), filePath: "aaaa.webp" }],
          testResultFile: {
            data: "{1}",
            fileName: "test-results/testResultId1/log.json",
          },
          testResultId: "testResultId1",
        },
        {
          screenshots: [{ data: Buffer.from(""), filePath: "bbbb.webp" }],
          testResultFile: {
            data: "{2}",
            fileName: "test-results/testResultId2/log.json",
          },
          testResultId: "testResultId2",
        },
      ]);
    });
  });

  describe("#extractProjectData", () => {
    it("プロジェクトデータの抽出", () => {
      const files = [
        {
          filePath: "projects/projectId1/project.json",
          data: "{}",
        },
        {
          filePath: "projects/projectId1/progress.json",
          data: "{}",
        },
        {
          filePath: "projects/projectId1/storyId1/sessionId1/aaa.webp",
          data: "",
        },
        {
          filePath: "projects/projectId1/storyId1/sessionId2/bbb.webp",
          data: "",
        },
        {
          filePath: "projects/projectId1/storyId2/sessionId1/ccc.webp",
          data: "",
        },
      ];
      const service = new ProjectImportService();
      const result = service["extractProjectData"](files);

      const projectData = {
        projectId: "projectId1",
        projectFile: { fileName: "project.json", data: "{}" },
        stories: [
          {
            storyId: "storyId1",
            sessions: [
              {
                sessionId: "sessionId1",
                attachedFiles: [
                  {
                    filePath:
                      "projects/projectId1/storyId1/sessionId1/aaa.webp",
                    data: "",
                  },
                ],
              },
              {
                sessionId: "sessionId2",
                attachedFiles: [
                  {
                    filePath:
                      "projects/projectId1/storyId1/sessionId2/bbb.webp",
                    data: "",
                  },
                ],
              },
            ],
          },
          {
            storyId: "storyId2",
            sessions: [
              {
                sessionId: "sessionId1",
                attachedFiles: [
                  {
                    filePath:
                      "projects/projectId1/storyId2/sessionId1/ccc.webp",
                    data: "",
                  },
                ],
              },
            ],
          },
        ],
        progressesFile: { fileName: "progress.json", data: "{}" },
      };
      expect(result).toEqual(projectData);
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
        transactionRunner: new TransactionRunner(),
      });

      const project = await getRepository(ProjectEntity).findOne(projectId);

      expect(projectId).toEqual(project?.id);
    });
  });
});
