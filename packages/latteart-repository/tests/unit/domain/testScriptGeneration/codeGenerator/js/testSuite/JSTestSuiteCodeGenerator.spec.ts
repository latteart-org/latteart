import {
  TestSuite,
  MethodCall,
  TestScriptModelGeneratorType,
} from "@/domain/testScriptGeneration/model";
import { JSTestSuiteCodeGenerator } from "@/domain/testScriptGeneration/codeGenerator/js/testSuite/JSTestSuiteCodeGenerator";
import { TestDataSet } from "@/domain/testScriptGeneration/testDataRepository";

describe("JSTestSuiteCodeGenerator", () => {
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
                pageObjectId: "",
                methodId: "methodId1-1",
                methodArguments: [
                  { name: "param1-1", value: "value1-1" },
                  { name: "param1-2", value: "value1-2" },
                ],
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
                pageObjectId: "",
                methodId: "methodId2-1",
                methodArguments: [{ name: "param2-1", value: "value2-1" }],
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

      const testSuiteCode = new JSTestSuiteCodeGenerator(
        TestScriptModelGeneratorType.Optimized,
        nameGenerator,
        testCaseIdToDataSet
      ).generateFrom(...testSuites);

      const expected = `\
import name_of_pageObjectId1 from './page_objects/name_of_pageObjectId1.page';
import name_of_pageObjectId2 from './page_objects/name_of_pageObjectId2.page';

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
  it('testCase1', () => {
    new name_of_pageObjectId1()
      // methodComment1
      .name_of_methodId1-1({
        param1-1: 'value1-1',
        param1-2: 'value1-2'
      })
      // methodComment2
      .name_of_methodId1-2();
  });

  /**
   * testCaseComment2
   */
  it('testCase2', () => {
    new name_of_pageObjectId2()
      .name_of_methodId2-1({
        param2-1: 'value2-1'
      })
      .name_of_methodId2-2();
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
  it('testCase1', () => {
    new name_of_pageObjectId1()
      // methodComment1
      .name_of_methodId1-1({
        param1-1: 'value1-1',
        param1-2: 'value1-2'
      })
      // methodComment2
      .name_of_methodId1-2();
  });

  /**
   * testCaseComment2
   */
  it('testCase2', () => {
    new name_of_pageObjectId2()
      .name_of_methodId2-1({
        param2-1: 'value2-1'
      })
      .name_of_methodId2-2();
  });
});
`;

      expect(testSuiteCode).toEqual(expected);
    });
  });
});
