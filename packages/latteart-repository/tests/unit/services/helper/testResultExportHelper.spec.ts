import { TestResultExportDataV2 } from "@/interfaces/exportData";
import { GetTestResultResponse } from "@/interfaces/TestResults";
import { serializeTestResult } from "@/services/helper/testResultExportHelper";

describe("testResultExportHelper", () => {
  describe("#serializeTestResult", () => {
    it("testResultをexport用の型に変換し、データを文字列にして返す", async () => {
      const operation = {
        input: "",
        type: "",
        elementInfo: null,
        title: "",
        url: "",
        timestamp: "",
        windowHandle: "",
        inputElements: [],
        isAutomatic: false,
        imageFileUrl: "",
      };
      const intention = {
        id: "intentionId",
        type: "intention",
        value: "intention1",
        details: "intention1",
        tags: [],
        imageFileUrl: "",
      };
      const testResult: GetTestResultResponse = {
        id: "testResultId",
        name: "testResultName",
        startTimeStamp: 0,
        lastUpdateTimeStamp: 0,
        initialUrl: "",
        testingTime: 0,
        testSteps: [
          { id: "id1", operation, intention, bugs: [], notices: [] },
          { id: "id2", operation, intention: null, bugs: [], notices: [] },
        ],
        coverageSources: [],
      };

      const testStep = {
        timestamp: "",
        imageFileUrl: "",
        windowInfo: {
          windowHandle: "",
        },
        pageInfo: {
          title: "",
          url: "",
          keywordTexts: [],
        },
        operation: {
          input: "",
          type: "",
          elementInfo: null,
          isAutomatic: false,
        },
        inputElements: [],
      };

      const resultData: TestResultExportDataV2 = {
        version: 2,
        name: "testResultName",
        sessionId: "testResultId",
        startTimeStamp: 0,
        lastUpdateTimeStamp: 0,
        initialUrl: "",
        testingTime: 0,
        history: {
          "1": {
            testStep,
            testPurpose: "intentionId",
            notes: [],
          },
          "2": {
            testStep,
            testPurpose: null,
            notes: [],
          },
        },
        notes: [intention],
        coverageSources: [],
      };

      const result = serializeTestResult(testResult);
      expect(result).toEqual(JSON.stringify(resultData));
    });
  });
});
