import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";
import { IssueReportServiceImpl } from "@/services/IssueReportService";
import { IssueReportCreator } from "@/interfaces/issueReportCreator";
import { TestResultService } from "@/services/TestResultService";
import { TestStepService } from "@/services/TestStepService";
import { Project } from "@/interfaces/Projects";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("IssueReportService", () => {
  describe("#writeReport", () => {
    it("プロジェクト情報を元に指定の出力先にIssueのレポートを出力する", async () => {
      const issueReportCreator: IssueReportCreator = {
        output: jest.fn(),
      };

      const expectedTestStepIds = ["testStep1"];
      const expectedTestPurpose1 = {
        id: "testPurpose1",
        value: "testPurposeValue1",
        details: "testPurposeDetails1",
      };
      const expectedNote1 = {
        id: "note1",
        value: "noteValue1",
        details: "noteDetails1",
        tags: "",
      };

      const testResultService: TestResultService = {
        getTestResultIdentifiers: jest.fn(),
        getTestResult: jest.fn(),
        createTestResult: jest.fn(),
        patchTestResult: jest.fn(),
        collectAllTestStepIds: jest.fn().mockResolvedValue(expectedTestStepIds),
        collectAllTestPurposeIds: jest.fn(),
        collectAllTestStepScreenshots: jest.fn(),
        generateSequenceView: jest.fn(),
        compareTestResults: jest.fn(),
      };

      const testStepService: TestStepService = {
        getTestStep: jest.fn().mockResolvedValue({
          intention: expectedTestPurpose1.id,
          notices: [expectedNote1.id],
        }),
        createTestStep: jest.fn(),
        attachNotesToTestStep: jest.fn(),
        attachTestPurposeToTestStep: jest.fn(),
        getTestStepOperation: jest.fn(),
        getTestStepScreenshot: jest.fn(),
      };

      const testPurposeService: any = {
        createTestPurpose: jest.fn(),
        getTestPurpose: jest.fn().mockResolvedValue(expectedTestPurpose1),
        updateTestPurpose: jest.fn(),
        deleteTestPurpose: jest.fn(),
      };

      const noteService: any = {
        createNote: jest.fn(),
        getNote: jest.fn().mockResolvedValue(expectedNote1),
        updateNote: jest.fn(),
        deleteNote: jest.fn(),
        getNoteScreenshot: jest.fn(),
      };

      const service = new IssueReportServiceImpl({
        issueReportCreator,
        testResult: testResultService,
        testStep: testStepService,
        testPurpose: testPurposeService,
        note: noteService,
      });

      const project: Project = {
        id: "",
        name: "",
        testMatrices: [
          {
            id: "testMatrix1",
            name: "testMatrixName1",
            index: 0,
            groups: [
              {
                id: "group1",
                name: "groupName1",
                index: 0,
                testTargets: [
                  {
                    id: "testTarget1",
                    name: "testTargetName1",
                    index: 0,
                    plans: [
                      {
                        viewPointId: "viewPoint1",
                        value: 0,
                      },
                    ],
                  },
                ],
              },
            ],
            viewPoints: [
              {
                id: "viewPoint1",
                name: "viewPointName1",
                description: "viewPointDescription1",
                index: 0,
              },
            ],
          },
        ],
        stories: [
          {
            id: "story1",
            testMatrixId: "testMatrix1",
            testTargetId: "testTarget1",
            viewPointId: "viewPoint1",
            status: "",
            index: 0,
            sessions: [
              {
                index: 0,
                name: "sessionName1",
                id: "session1",
                isDone: false,
                doneDate: "",
                testItem: "testItem1",
                testerName: "",
                memo: "",
                attachedFiles: [],
                testResultFiles: [
                  { id: "testResult1", name: "testResultName1" },
                ],
                initialUrl: "",
                testPurposes: [],
                notes: [],
                testingTime: 0,
              },
            ],
          },
        ],
      };

      const outputDirectoryPath = "outputDirectoryPath";

      await service.writeReport(project, outputDirectoryPath);

      const expectedReport = [
        {
          testMatrixName: project.testMatrices[0].name,
          rows: [
            {
              noteValue: expectedNote1.value,
              noteDetails: expectedNote1.details,
              tags: expectedNote1.tags,
              testPurposeValue: expectedTestPurpose1.value,
              testPurposeDetails: expectedTestPurpose1.details,
              groupName: project.testMatrices[0].groups[0].name,
              testTargetName:
                project.testMatrices[0].groups[0].testTargets[0].name,
              viewPointName: project.testMatrices[0].viewPoints[0].name,
              sessionName: "1", // セッション名によらず通番になる
              tester: project.stories[0].sessions[0].testerName,
              memo: project.stories[0].sessions[0].memo,
            },
          ],
        },
      ];

      expect(issueReportCreator.output).toBeCalledWith(
        outputDirectoryPath,
        expectedReport[0]
      );
      expect(testStepService.getTestStep).toBeCalledWith(
        expectedTestStepIds[0]
      );
      expect(testPurposeService.getTestPurpose).toBeCalledWith(
        expectedTestPurpose1.id
      );
      expect(noteService.getNote).toBeCalledWith(expectedNote1.id);
    });
  });
});
