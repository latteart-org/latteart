import {
  DeserializedTestResult,
  TestResultExportDataV0,
  TestResultExportDataV1,
  TestResultExportDataV2,
} from "@/interfaces/exportData";
import { deserializeTestResult } from "@/services/helper/testResultImportHelper";

describe("testResultImportHelper", () => {
  describe("#deserializeTestResult", () => {
    it("V2のtestResultDataをimport用の型に変換する(deserializeTestResultV2)", async () => {
      const testStep1 = {
        timestamp: "0",
        imageFileUrl: "test_compressed.webp",
        windowInfo: {
          windowHandle: "CDwindow-test",
        },
        pageInfo: {
          title: "テストサイト",
          url: "test",
          keywordTexts: ["TEST", "このサイトはテスト用のサイトです。"],
        },
        operation: {
          input: "",
          type: "screen_transition",
          elementInfo: null,
          isAutomatic: false,
        },
        inputElements: [],
      };

      const testStep2 = {
        timestamp: "0",
        imageFileUrl: "test1_compressed.webp",
        windowInfo: {
          windowHandle: "CDwindow-test",
        },
        pageInfo: {
          title: "テストサイト",
          url: "test",
          keywordTexts: ["TEST", "このサイトはテスト用のサイトです。"],
        },
        operation: {
          input: "",
          type: "click",
          elementInfo: {
            tagname: "SPAN",
            text: "",
            value: "",
            xpath: "/HTML/BODY/NAV/BUTTON/SPAN",
            checked: false,
            attributes: { class: "navbar-toggler-icon" },
          },
          isAutomatic: false,
        },
        inputElements: [],
      };

      const data: TestResultExportDataV2 = {
        version: 2,
        name: "V2_session",
        sessionId: "V2_sessionId",
        startTimeStamp: 0,
        lastUpdateTimeStamp: 0,
        initialUrl: "test",
        testingTime: 0,
        history: {
          "1": {
            testStep: testStep1,
            testPurpose: null,
            notes: [],
          },
          "2": {
            testStep: testStep2,
            testPurpose: null,
            notes: [],
          },
        },
        notes: [],
        coverageSources: [],
      };

      const resultTestStep1 = {
        id: "",
        operation: {
          input: testStep1.operation.input,
          type: testStep1.operation.type,
          elementInfo: testStep1.operation.elementInfo,
          title: testStep1.pageInfo.title,
          url: testStep1.pageInfo.url,
          imageFileUrl: testStep1.imageFileUrl,
          timestamp: testStep1.timestamp,
          windowHandle: testStep1.windowInfo.windowHandle,
          inputElements: testStep1.inputElements,
          keywordTexts: testStep1.pageInfo.keywordTexts,
          isAutomatic: testStep1.operation.isAutomatic,
        },
        testPurpose: null,
        notes: [],
      };

      const resultTestStep2 = {
        id: "",
        operation: {
          input: testStep2.operation.input,
          type: testStep2.operation.type,
          elementInfo: testStep2.operation.elementInfo,
          title: testStep2.pageInfo.title,
          url: testStep2.pageInfo.url,
          imageFileUrl: testStep2.imageFileUrl,
          timestamp: testStep2.timestamp,
          windowHandle: testStep2.windowInfo.windowHandle,
          inputElements: testStep2.inputElements,
          keywordTexts: testStep2.pageInfo.keywordTexts,
          isAutomatic: testStep2.operation.isAutomatic,
        },
        testPurpose: null,
        notes: [],
      };

      const resultData: DeserializedTestResult = {
        id: data.sessionId,
        name: data.name,
        startTimeStamp: data.startTimeStamp,
        lastUpdateTimeStamp: data.lastUpdateTimeStamp,
        initialUrl: data.initialUrl,
        testingTime: data.testingTime,
        testSteps: [resultTestStep1, resultTestStep2],
        coverageSources: data.coverageSources,
      };

      const result = deserializeTestResult(JSON.stringify(data));
      expect(result).toEqual(resultData);
    });

    it("V1のtestResultDataをimport用の型に変換する(deserializeTestResultV1)", async () => {
      const testStep1 = {
        timestamp: "1667536529193",
        imageFileUrl: "test_compressed.webp",
        windowInfo: {
          windowHandle: "CDwindow-test",
        },
        pageInfo: {
          title: "テストサイト",
          url: "test",
          keywordTexts: ["TEST", "このサイトはテスト用のサイトです。"],
        },
        operation: {
          input: "",
          type: "screen_transition",
          elementInfo: null,
        },
        inputElements: [],
      };

      const testStep2 = {
        timestamp: "1667536531659",
        imageFileUrl: "test1_compressed.webp",
        windowInfo: {
          windowHandle: "CDwindow-test",
        },
        pageInfo: {
          title: "テストサイト",
          url: "test",
          keywordTexts: ["TEST", "このサイトはテスト用のサイトです。"],
        },
        operation: {
          input: "",
          type: "click",
          elementInfo: {
            tagname: "SPAN",
            text: "",
            value: "",
            xpath: "/HTML/BODY/NAV/BUTTON/SPAN",
            checked: false,
            attributes: { class: "navbar-toggler-icon" },
          },
        },
        inputElements: [],
      };

      const data: TestResultExportDataV1 = {
        version: 1,
        name: "V1_session",
        sessionId: "V1_sessionId",
        startTimeStamp: 1667536521289,
        endTimeStamp: -1,
        initialUrl: "test",
        history: {
          "1": {
            testStep: testStep1,
            testPurpose: null,
            notes: [],
          },
          "2": {
            testStep: testStep2,
            testPurpose: null,
            notes: [],
          },
        },
        notes: [],
        coverageSources: [],
      };

      const resultTestStep1 = {
        id: "",
        operation: {
          input: testStep1.operation.input,
          type: testStep1.operation.type,
          elementInfo: testStep1.operation.elementInfo,
          title: testStep1.pageInfo.title,
          url: testStep1.pageInfo.url,
          imageFileUrl: testStep1.imageFileUrl,
          timestamp: testStep1.timestamp,
          windowHandle: testStep1.windowInfo.windowHandle,
          inputElements: testStep1.inputElements,
          keywordTexts: testStep1.pageInfo.keywordTexts,
          isAutomatic: false,
        },
        testPurpose: null,
        notes: [],
      };

      const resultTestStep2 = {
        id: "",
        operation: {
          input: testStep2.operation.input,
          type: testStep2.operation.type,
          elementInfo: testStep2.operation.elementInfo,
          title: testStep2.pageInfo.title,
          url: testStep2.pageInfo.url,
          imageFileUrl: testStep2.imageFileUrl,
          timestamp: testStep2.timestamp,
          windowHandle: testStep2.windowInfo.windowHandle,
          inputElements: testStep2.inputElements,
          keywordTexts: testStep2.pageInfo.keywordTexts,
          isAutomatic: false,
        },
        testPurpose: null,
        notes: [],
      };

      const resultData: DeserializedTestResult = {
        id: data.sessionId,
        name: data.name,
        startTimeStamp: data.startTimeStamp,
        lastUpdateTimeStamp: 1667536531659,
        initialUrl: data.initialUrl,
        testingTime: 2466,
        testSteps: [resultTestStep1, resultTestStep2],
        coverageSources: data.coverageSources,
      };

      const result = deserializeTestResult(JSON.stringify(data));
      expect(result).toEqual(resultData);
    });

    it("V0のtestResultDataをimport用の型に変換する(deserializeTestResultV0)", async () => {
      const testStep1 = {
        timestamp: "1667536529",
        imageFileUrl: "test_compressed.webp",
        windowInfo: {
          windowHandle: "CDwindow-test",
        },
        pageInfo: {
          title: "テストサイト",
          url: "test",
          keywordTexts: ["TEST", "このサイトはテスト用のサイトです。"],
        },
        operation: {
          input: "",
          type: "screen_transition",
          elementInfo: null,
        },
        inputElements: [],
      };

      const testStep2 = {
        timestamp: "1667536531",
        imageFileUrl: "test1_compressed.webp",
        windowInfo: {
          windowHandle: "CDwindow-test",
        },
        pageInfo: {
          title: "テストサイト",
          url: "test",
          keywordTexts: ["TEST", "このサイトはテスト用のサイトです。"],
        },
        operation: {
          input: "",
          type: "click",
          elementInfo: {
            tagname: "SPAN",
            text: "",
            value: "",
            xpath: "/HTML/BODY/NAV/BUTTON/SPAN",
            checked: false,
            attributes: { class: "navbar-toggler-icon" },
          },
        },
        inputElements: [],
      };

      const data: TestResultExportDataV0 = {
        name: "V0_session",
        sessionId: "V0_sessionId",
        startTimeStamp: 1667536521,
        endTimeStamp: -1,
        initialUrl: "test",
        history: {
          "1": {
            testStep: testStep1,
            intention: null,
            bugs: [],
            notices: [],
          },
          "2": {
            testStep: testStep2,
            intention: null,
            bugs: [],
            notices: [],
          },
        },
        notes: [],
        coverageSources: [],
      };

      const resultTestStep1 = {
        id: "",
        operation: {
          input: testStep1.operation.input,
          type: testStep1.operation.type,
          elementInfo: testStep1.operation.elementInfo,
          title: testStep1.pageInfo.title,
          url: testStep1.pageInfo.url,
          imageFileUrl: testStep1.imageFileUrl,
          timestamp: "1667536529000",
          windowHandle: testStep1.windowInfo.windowHandle,
          inputElements: testStep1.inputElements,
          keywordTexts: testStep1.pageInfo.keywordTexts,
          isAutomatic: false,
        },
        testPurpose: null,
        notes: [],
      };

      const resultTestStep2 = {
        id: "",
        operation: {
          input: testStep2.operation.input,
          type: testStep2.operation.type,
          elementInfo: testStep2.operation.elementInfo,
          title: testStep2.pageInfo.title,
          url: testStep2.pageInfo.url,
          imageFileUrl: testStep2.imageFileUrl,
          timestamp: "1667536531000",
          windowHandle: testStep2.windowInfo.windowHandle,
          inputElements: testStep2.inputElements,
          keywordTexts: testStep2.pageInfo.keywordTexts,
          isAutomatic: false,
        },
        testPurpose: null,
        notes: [],
      };

      const resultData: DeserializedTestResult = {
        id: data.sessionId,
        name: data.name,
        startTimeStamp: data.startTimeStamp,
        lastUpdateTimeStamp: 1667536531000,
        initialUrl: data.initialUrl,
        testingTime: 2000,
        testSteps: [resultTestStep1, resultTestStep2],
        coverageSources: data.coverageSources,
      };

      const result = deserializeTestResult(JSON.stringify(data));
      expect(result).toEqual(resultData);
    });

    it("不正なImportDataの場合はエラーをスローする", async () => {
      const testStep1 = {
        timestamp: "0",
        imageFileUrl: "test_compressed.webp",
        windowInfo: {
          windowHandle: "CDwindow-test",
        },
        pageInfo: {
          title: "テストサイト",
          url: "test",
          keywordTexts: ["TEST", "このサイトはテスト用のサイトです。"],
        },
        operation: {
          input: "",
          type: "screen_transition",
          elementInfo: null,
          isAutomatic: false,
        },
        inputElements: [],
      };

      const testStep2 = {
        timestamp: "0",
        imageFileUrl: "test1_compressed.webp",
        windowInfo: {
          windowHandle: "CDwindow-test",
        },
        pageInfo: {
          title: "テストサイト",
          url: "test",
          keywordTexts: ["TEST", "このサイトはテスト用のサイトです。"],
        },
        operation: {
          input: "",
          type: "click",
          elementInfo: {
            tagname: "SPAN",
            text: "",
            value: "",
            xpath: "/HTML/BODY/NAV/BUTTON/SPAN",
            checked: false,
            attributes: { class: "navbar-toggler-icon" },
          },
          isAutomatic: false,
        },
        inputElements: [],
      };

      const data = {
        version: 2,
        name: "V2_session",
        sessionId: "V2_sessionId",
        startTimeStamp: 0,
        lastUpdateTimeStamp: 0,
        initialUrl: "test",
        testingTime: 0,
        history: {
          "1": {
            testStep: testStep1,
            notes: [],
          },
          "2": {
            testStep: testStep2,
            notes: [],
          },
        },
        notes: [],
        coverageSources: [],
      };
      try {
        deserializeTestResult(JSON.stringify(data));
      } catch (error) {
        expect((error as Error).message).toEqual(
          `ImportData is invalid format.`
        );
      }
    });
  });
});
