import { TestSuite, MethodCall } from "@/domain/testScriptGeneration/model";
import { JSDataDrivenTestSuiteCodeGenerator } from "@/domain/testScriptGeneration/codeGenerator/js/testSuite/JSDataDrivenTestSuiteCodeGenerator";
import { TestDataSet } from "@/domain/testScriptGeneration/testDataRepository";

describe("JSDataDrivenTestSuiteCodeGenerator", () => {
  describe("#generateFrom", () => {
    it("渡されたテストスイートからJavaScriptのコードを生成する", () => {
      const methodCalls1: MethodCall[] = [
        {
          methodId: "methodId1-1",
          pageObjectId: "pageObjectId1",
          returnPageObjectId: "pageObjectId1",
          comment: "methodComment1",
        },
        {
          methodId: "methodId1-2",
          pageObjectId: "pageObjectId1",
          returnPageObjectId: "pageObjectId1",
          comment: "methodComment2",
        },
      ];

      const methodCalls2: MethodCall[] = [
        {
          methodId: "methodId2-1",
          pageObjectId: "pageObjectId2",
          returnPageObjectId: "pageObjectId2",
          comment: "",
        },
        {
          methodId: "methodId2-2",
          pageObjectId: "pageObjectId2",
          returnPageObjectId: "pageObjectId2",
          comment: "",
        },
      ];

      const testSuites: TestSuite[] = [
        {
          comment: "testSuiteComment1",
          name: "testSuite1",
          topPageUrl: "topPageUrl1",
          testCases: [
            {
              comment: "testCaseComment1",
              id: "testCaseId1-1",
              name: "testCase1",
              scenario: {
                methodCalls: methodCalls1,
              },
            },
            {
              comment: "testCaseComment2",
              id: "testCaseId1-2",
              name: "testCase2",
              scenario: {
                methodCalls: methodCalls2,
              },
            },
          ],
        },
        {
          comment: "testSuiteComment2",
          name: "testSuite2",
          topPageUrl: "topPageUrl2",
          testCases: [
            {
              comment: "testCaseComment1",
              id: "testCaseId2-1",
              name: "testCase1",
              scenario: {
                methodCalls: methodCalls1,
              },
            },
            {
              comment: "testCaseComment2",
              id: "testCaseId2-2",
              name: "testCase2",
              scenario: {
                methodCalls: methodCalls2,
              },
            },
          ],
        },
      ];

      const expectedTestDataSet1: TestDataSet = {
        name: "testDataSet1",
        variations: [
          {
            methodCallTestDatas: [
              {
                pageObjectId: "pageObjectId1",
                methodId: "methodId1-1",
                methodArguments: [{ name: "", value: "" }],
              },
            ],
          },
        ],
      };

      const expectedTestDataSet2: TestDataSet = {
        name: "testDataSet2",
        variations: [
          {
            methodCallTestDatas: [
              {
                pageObjectId: "pageObjectId2",
                methodId: "methodId2-1",
                methodArguments: [{ name: "", value: "" }],
              },
            ],
          },
        ],
      };

      const testCaseIdToDataSet = new Map<string, TestDataSet>([
        ["testCaseId1-1", expectedTestDataSet1],
        ["testCaseId1-2", expectedTestDataSet2],
        ["testCaseId2-1", expectedTestDataSet1],
        ["testCaseId2-2", expectedTestDataSet2],
      ]);

      const nameGenerator = {
        pageObject: {
          generate: jest.fn().mockImplementation((id) => {
            return `name_of_${id}`;
          }),
        },
        method: {
          generate: jest.fn().mockImplementation((id) => {
            return `name_of_${id}`;
          }),
        },
      };

      const testSuiteCode = new JSDataDrivenTestSuiteCodeGenerator(
        nameGenerator,
        testCaseIdToDataSet
      ).generateFrom(...testSuites);

      const expected = `\
import name_of_pageObjectId1 from './page_objects/name_of_pageObjectId1.page';
import name_of_pageObjectId2 from './page_objects/name_of_pageObjectId2.page';
import { testDataSet1, testDataSet2 } from './test_data/TestData';

/**
 * testSuiteComment1
 */
describe('testSuite1', () => {
  beforeEach('open top page', () => {
    browser.url('topPageUrl1');
  });

  /**
   * testCaseComment1
   */
  describe('testCase1', () => {
    testDataSet1.forEach((data) => {
      it(\`test data: \${JSON.stringify(data)}\`, () => {
        new name_of_pageObjectId1()
          // methodComment1
          .name_of_methodId1-1(data.name_of_pageObjectId1_name_of_methodId1-1)
          // methodComment2
          .name_of_methodId1-2();
      });
    });
  });

  /**
   * testCaseComment2
   */
  describe('testCase2', () => {
    testDataSet2.forEach((data) => {
      it(\`test data: \${JSON.stringify(data)}\`, () => {
        new name_of_pageObjectId2()
          .name_of_methodId2-1(data.name_of_pageObjectId2_name_of_methodId2-1)
          .name_of_methodId2-2();
      });
    });
  });
});

/**
 * testSuiteComment2
 */
describe('testSuite2', () => {
  beforeEach('open top page', () => {
    browser.url('topPageUrl2');
  });

  /**
   * testCaseComment1
   */
  describe('testCase1', () => {
    testDataSet1.forEach((data) => {
      it(\`test data: \${JSON.stringify(data)}\`, () => {
        new name_of_pageObjectId1()
          // methodComment1
          .name_of_methodId1-1(data.name_of_pageObjectId1_name_of_methodId1-1)
          // methodComment2
          .name_of_methodId1-2();
      });
    });
  });

  /**
   * testCaseComment2
   */
  describe('testCase2', () => {
    testDataSet2.forEach((data) => {
      it(\`test data: \${JSON.stringify(data)}\`, () => {
        new name_of_pageObjectId2()
          .name_of_methodId2-1(data.name_of_pageObjectId2_name_of_methodId2-1)
          .name_of_methodId2-2();
      });
    });
  });
});
`;

      expect(testSuiteCode).toEqual(expected);
    });
  });
});
