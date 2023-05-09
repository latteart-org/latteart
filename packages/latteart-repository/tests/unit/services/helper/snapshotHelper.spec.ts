import { GetTestResultResponse } from "@/interfaces/TestResults";
import { createTestPurposes } from "@/services/helper/snapshotHelper";

describe("snapshotHelper", () => {
  describe("#createTestPurposes", () => {
    it("testResultがある場合、snapshot用のTestPurposeを返す", async () => {
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

      const result = await createTestPurposes(testResult);
      expect(result).toEqual([intention]);
    });

    it("testResultがない場合、空配列を返す", async () => {
      const testResult = undefined;

      const result = await createTestPurposes(testResult);
      expect(result).toEqual([]);
    });
  });
});
