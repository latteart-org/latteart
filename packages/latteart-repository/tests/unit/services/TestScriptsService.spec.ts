import { GetTestResultResponse } from "@/interfaces/TestResults";
import { CreateTestScriptDto } from "@/interfaces/TestScripts";
import { TestScript } from "@/lib/scriptGenerator/TestScript";
import { ServerError } from "@/ServerError";
import { TestResultService } from "@/services/TestResultService";
import { TestScriptFileRepositoryService } from "@/services/TestScriptFileRepositoryService";
import { TestScriptsService } from "@/services/TestScriptsService";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";

const testConnectionHelper = new SqliteTestConnectionHelper();

const emptyElementInfo = {
  tagname: "",
  text: "",
  xpath: "",
  value: "",
  checked: false,
  attributes: {},
};
const emptyOperation = {
  input: "",
  type: "",
  elementInfo: null,
  title: "",
  url: "",
  imageFileUrl: "",
  timestamp: "",
  windowHandle: "",
  inputElements: [],
};
const emptyTestStep = {
  id: "",
  operation: { ...emptyOperation },
  intention: null,
  bugs: [],
  notices: [],
};
const emptyTestResult: GetTestResultResponse = {
  id: "",
  name: "",
  startTimeStamp: 0,
  lastUpdateTimeStamp: 0,
  initialUrl: "",
  testingTime: 0,
  testSteps: [],
  coverageSources: [],
};

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("TestScriptsService", () => {
  describe("#createTestScriptByTestResult", () => {
    let emptyTestResultService: TestResultService;
    let emptyTestScriptFileRepositoryService: TestScriptFileRepositoryService;

    beforeEach(() => {
      emptyTestResultService = {
        getTestResultIdentifiers: jest.fn(),
        getTestResult: jest.fn(),
        createTestResult: jest.fn(),
        patchTestResult: jest.fn(),
        collectAllTestStepIds: jest.fn(),
        collectAllTestPurposeIds: jest.fn(),
        collectAllTestStepScreenshots: jest.fn(),
        generateSequenceView: jest.fn(),
      };
      emptyTestScriptFileRepositoryService = {
        write: jest.fn().mockResolvedValue("url"),
      };
    });

    describe("テスト結果内の操作群からテストスクリプトを生成する", () => {
      describe("テストケースを1つ以上生成できた場合は、ダウンロード用URLと生成したスクリプト内に無効な操作があるか否かを返す", () => {
        it("無効な操作が無い場合", async () => {
          const url = "testScriptArchiveUrl";
          const testResult = {
            ...emptyTestResult,
            initialUrl: "",
            testSteps: [
              {
                ...emptyTestStep,
                operation: {
                  ...emptyOperation,
                  input: "hoge",
                  type: "change",
                  elementInfo: {
                    ...emptyElementInfo,
                    tagname: "input",
                    attributes: { id: "textField1" },
                  },
                  title: "Page1",
                  url: "url1",
                  imageFileUrl: "imageFileUrl1",
                },
              },
            ],
          };
          const screenshots: { id: string; fileUrl: string }[] = [
            { id: "id1", fileUrl: "fileUrl1" },
          ];

          const services = {
            testResult: {
              ...emptyTestResultService,
              getTestResult: jest.fn().mockResolvedValue(testResult),
              collectAllTestStepScreenshots: jest
                .fn()
                .mockResolvedValue(screenshots),
            },
            testScriptFileRepository: {
              ...emptyTestScriptFileRepositoryService,
              write: jest.fn().mockResolvedValue(url),
            },
          };

          const testResultId = "testResultId";
          const requestBody: CreateTestScriptDto = {
            optimized: false,
            testData: { useDataDriven: false, maxGeneration: 0 },
            view: {
              node: {
                unit: "title",
                definitions: [],
              },
            },
            buttonDefinitions: [],
          };
          const result = await new TestScriptsService(
            services
          ).createTestScriptByTestResult(testResultId, requestBody);

          expect(result.url).toEqual(url);
          expect(result.invalidOperationTypeExists).toEqual(false);
          const expectedTestScripts: TestScript = {
            pageObjects: [
              {
                name: "Page1.page.js",
                script: `\
/**
 * @class Page1
 * @description Page1
 * @mermaid
 * graph TD;
 *   Page1 ==> |dotextfield1|Page1;
 */
class Page1 {
  get textfield1() { return $('#textField1'); }

  /**
   * <ol><li>Change [ <a href="imageFileUrl1">textfield1</a> ]</li>
   * <li>Move to [ <a href="imageFileUrl1">Page1</a> ]</li></ol>
   */
  dotextfield1() {
    this.textfield1.setValue('hoge');

    return new Page1();
  }
}
export default Page1;
`,
              },
            ],
            testData: [],
            testSuite: {
              name: "test.spec.js",
              spec: `\
import Page1 from './page_objects/Page1.page';

/**
 * @namespace TestSuite1
 * @mermaid
 * graph TD;
 *   Page1 --> Page1;
 */
describe('TestSuite1', () => {
  beforeEach('open top page', () => {
    browser.url('');
  });

  /**
   * @function Page1
   * @memberof TestSuite1
   * @mermaid
   * graph TD;
   *   Page1 ==> |dotextfield1|Page1;
   */
  it('Page1', () => {
    new Page1()
      // Page1.page.js
      .dotextfield1();
  });
});
`,
            },
            others: [
              {
                name: "readme.md",
                script: `\
## Test suites

|#|name|top page url|
|:--|:--|:--|
|1|<a href="./TestSuite1.html">TestSuite1</a>||

## Page objects

|#|name|source|remarks|
|:--|:--|:--|:--|
|1|<a href="./Page1.html">Page1</a>|Page1||
`,
              },
            ],
          };
          expect(services.testScriptFileRepository.write).toBeCalledWith(
            expectedTestScripts,
            screenshots
          );
        });

        it("無効な操作がある場合", async () => {
          const url = "testScriptArchiveUrl";
          const testResult = {
            ...emptyTestResult,
            initialUrl: "",
            testSteps: [
              {
                ...emptyTestStep,
                operation: {
                  ...emptyOperation,
                  type: "accept_alert",
                  title: "Page1",
                  url: "url1",
                  imageFileUrl: "imageFileUrl1",
                },
              },
            ],
          };
          const screenshots: { id: string; fileUrl: string }[] = [
            { id: "id1", fileUrl: "fileUrl1" },
          ];

          const services = {
            testResult: {
              ...emptyTestResultService,
              getTestResult: jest.fn().mockResolvedValue(testResult),
              collectAllTestStepScreenshots: jest
                .fn()
                .mockResolvedValue(screenshots),
            },
            testScriptFileRepository: {
              ...emptyTestScriptFileRepositoryService,
              write: jest.fn().mockResolvedValue(url),
            },
          };

          const testResultId = "testResultId";
          const requestBody: CreateTestScriptDto = {
            optimized: false,
            testData: { useDataDriven: false, maxGeneration: 0 },
            view: {
              node: {
                unit: "title",
                definitions: [],
              },
            },
            buttonDefinitions: [],
          };
          const result = await new TestScriptsService(
            services
          ).createTestScriptByTestResult(testResultId, requestBody);

          expect(result.url).toEqual(url);
          expect(result.invalidOperationTypeExists).toEqual(true);
          const expectedTestScripts: TestScript = {
            pageObjects: [
              {
                name: "Page1.page.js",
                script: `\
/**
 * @class Page1
 * @description Page1
 * @mermaid
 * graph TD;
 *   Page1 ==> |do|Page1;
 */
class Page1 {
  /**
   * <ol><li><span style="color:red">Do 'Accept alert'</span><span style="color:gray"># Please implement it manually</span></li>
   * <li>Move to [ <a href="imageFileUrl1">Page1</a> ]</li></ol>
   */
  do() {
    // Please insert code for 'accept_alert' here.

    return new Page1();
  }
}
export default Page1;
`,
              },
            ],
            testData: [],
            testSuite: {
              name: "test.spec.js",
              spec: `\
import Page1 from './page_objects/Page1.page';

/**
 * @namespace TestSuite1
 * @mermaid
 * graph TD;
 *   Page1 --> Page1;
 */
describe('TestSuite1', () => {
  beforeEach('open top page', () => {
    browser.url('');
  });

  /**
   * @function Page1
   * @memberof TestSuite1
   * @mermaid
   * graph TD;
   *   Page1 ==> |do|Page1;
   */
  it('Page1', () => {
    new Page1()
      // Page1.page.js
      .do();
  });
});
`,
            },
            others: [
              {
                name: "readme.md",
                script: `\
## Test suites

|#|name|top page url|
|:--|:--|:--|
|1|<a href="./TestSuite1.html">TestSuite1</a>||

## Page objects

|#|name|source|remarks|
|:--|:--|:--|:--|
|1|<a href="./Page1.html">Page1</a>|Page1|<span style="color:red">Code for some operations is not generated. Please click the link on the left for more information.</span>|
`,
              },
            ],
          };
          expect(services.testScriptFileRepository.write).toBeCalledWith(
            expectedTestScripts,
            screenshots
          );
        });
      });

      it("テストケースを1つも生成できなかった場合は、エラーをthrowする", async () => {
        const testResult = {
          ...emptyTestResult,
          initialUrl: "",
          testSteps: [],
        };

        const services = {
          testResult: {
            ...emptyTestResultService,
            getTestResult: jest.fn().mockResolvedValue(testResult),
          },
          testScriptFileRepository: {
            ...emptyTestScriptFileRepositoryService,
          },
        };

        const testResultId = "testResultId";
        const requestBody: CreateTestScriptDto = {
          optimized: false,
          testData: { useDataDriven: false, maxGeneration: 0 },
          view: {
            node: {
              unit: "title",
              definitions: [],
            },
          },
          buttonDefinitions: [],
        };
        await expect(
          new TestScriptsService(services).createTestScriptByTestResult(
            testResultId,
            requestBody
          )
        ).rejects.toThrow(
          new ServerError(500, {
            code: "no_test_cases_generated",
          })
        );

        expect(services.testScriptFileRepository.write).not.toBeCalled();
      });
    });
  });
});
