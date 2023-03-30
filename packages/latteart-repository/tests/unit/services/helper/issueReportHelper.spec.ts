import {
  createRowSources,
  extractRowsFromRowSource,
} from "@/services/helper/issueReportHelper";
import { TestPurposeService } from "@/services/TestPurposeService";
import { NotesService } from "@/services/NotesService";
import { TestResultService } from "@/services/TestResultService";
import { TestStepService } from "@/services/TestStepService";

describe("issueReportHelper", () => {
  const plan = { viewPointId: "viewPointId", value: 0 };
  const testTarget = {
    id: "testTargetId",
    name: "testTargetName",
    index: 0,
    plans: [plan],
  };
  const group = {
    id: "groupId",
    name: "groupName",
    index: 0,
    testTargets: [testTarget],
  };
  const viewPoint = {
    id: "viewPointId",
    name: "viewPointName",
    index: 0,
    description: "viewPointDescription",
  };
  const testMatrix = {
    id: "testMatrixId",
    name: "testMatrixName",
    index: 0,
    groups: [group],
    viewPoints: [viewPoint],
  };
  const session = {
    index: 0,
    name: "sessionName",
    id: "sessionId",
    isDone: false,
    doneDate: "",
    testItem: "testItem",
    testerName: "testerName",
    memo: "memo",
    attachedFiles: [],
    testResultFiles: [{ name: "testResultName", id: "testResultId" }],
    initialUrl: "",
    testPurposes: [],
    notes: [],
    testingTime: 0,
  };
  const stories = [
    {
      id: "storyId",
      testMatrixId: testMatrix.id,
      testTargetId: testTarget.id,
      viewPointId: viewPoint.id,
      status: "ok",
      index: 0,
      sessions: [session],
    },
  ];
  describe("#createRowSources", () => {
    it("projectからissueReport用の元データを作成して返す", async () => {
      const rowSources = [
        {
          sessionName: "1",
          tester: session.testerName,
          memo: session.memo,
          testResultId: session.testResultFiles[0].id,
          groupName: group.name,
          testTargetName: testTarget.name,
          viewPointName: viewPoint.name,
        },
      ];

      const result = createRowSources(
        group,
        testTarget,
        plan,
        testMatrix,
        stories
      );
      expect(result).toEqual(rowSources);
    });

    it("viewPointがない場合、空配列を返す", async () => {
      const viewPoint2 = {
        id: "viewPointId2",
        name: "viewPointName2",
        index: 1,
        description: "viewPointDescription2",
      };
      const testMatrix2 = {
        id: "testMatrixId",
        name: "testMatrixName",
        index: 0,
        groups: [group],
        viewPoints: [viewPoint2],
      };

      const result = createRowSources(
        group,
        testTarget,
        plan,
        testMatrix2,
        stories
      );
      expect(result).toEqual([]);
    });
  });

  describe("#extractRowsFromRowSource", () => {
    it("issueReport用の元データから出力用のデータを作成する", async () => {
      const testPurpose1 = {
        id: "testPurposeId",
        type: "intention",
        value: "testPurposeValue",
        details: "testPurposeDetails",
        tags: [],
        imageFileUrl: "",
      };
      const note1 = {
        id: "noteId",
        type: "notice",
        value: "noteValue",
        details: "noteDetails",
        tags: ["bug", "test"],
        imageFileUrl: "",
      };
      const testResult: TestResultService = {
        getTestResultIdentifiers: jest.fn(),
        getTestResult: jest.fn(),
        createTestResult: jest.fn(),
        patchTestResult: jest.fn(),
        collectAllTestStepIds: jest.fn().mockResolvedValue(["testStep1"]),
        collectAllTestPurposeIds: jest.fn(),
        collectAllTestStepScreenshots: jest.fn(),
        generateSequenceView: jest.fn(),
      };
      const testStep: TestStepService = {
        getTestStep: jest.fn().mockResolvedValue({
          intention: "intention1",
          notices: ["notice1"],
        }),
        createTestStep: jest.fn(),
        attachNotesToTestStep: jest.fn(),
        attachTestPurposeToTestStep: jest.fn(),
        getTestStepOperation: jest.fn(),
        getTestStepScreenshot: jest.fn(),
      };
      const testPurpose: TestPurposeService = {
        createTestPurpose: jest.fn(),
        getTestPurpose: jest.fn().mockResolvedValue(testPurpose1),
        updateTestPurpose: jest.fn(),
        deleteTestPurpose: jest.fn(),
      };
      const note: NotesService = {
        createNote: jest.fn(),
        getNote: jest.fn().mockResolvedValue(note1),
        updateNote: jest.fn(),
        deleteNote: jest.fn(),
        getNoteScreenshot: jest.fn(),
      };

      const service = { testResult, testStep, testPurpose, note };

      const rowSource = {
        sessionName: "1",
        tester: session.testerName,
        memo: session.memo,
        testResultId: session.testResultFiles[0].id,
        groupName: group.name,
        testTargetName: testTarget.name,
        viewPointName: viewPoint.name,
      };

      const extractRow = {
        noteValue: note1.value,
        noteDetails: note1.details,
        tags: "bug,test",
        testPurposeValue: testPurpose1.value,
        testPurposeDetails: testPurpose1.details,
        groupName: rowSource.groupName,
        testTargetName: rowSource.testTargetName,
        viewPointName: rowSource.viewPointName,
        sessionName: rowSource.sessionName,
        tester: rowSource.tester,
        memo: rowSource.memo,
      };

      const result = await extractRowsFromRowSource(rowSource, service);
      expect(result).toEqual([extractRow]);
    });
  });
});
