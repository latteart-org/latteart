import { CoverageSourceEntity } from "@/entities/CoverageSourceEntity";
import { ScreenshotEntity } from "@/entities/ScreenshotEntity";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { TestStepEntity } from "@/entities/TestStepEntity";
import { TestScript } from "@/domain/testScriptGeneration";
import { ServerError } from "@/ServerError";
import { TestResultService } from "@/services/TestResultService";
import { TestScriptFileRepositoryService } from "@/services/TestScriptFileRepositoryService";
import { TestScriptsService } from "@/services/TestScriptsService";
import { getRepository } from "typeorm";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";
import { TestScriptOption } from "@/domain/types";

const testConnectionHelper = new SqliteTestConnectionHelper();

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
        compareTestResults: jest.fn(),
      };
      emptyTestScriptFileRepositoryService = {
        write: jest.fn().mockResolvedValue("url"),
      };
    });

    describe("テスト結果内の操作群からテストスクリプトを生成する", () => {
      describe("テストケースを1つ以上生成できた場合は、ダウンロード用URLと生成したスクリプト内に無効な操作があるか否かを返す", () => {
        it("無効な操作が無い場合", async () => {
          const { id: testResultId } = await getRepository(
            TestResultEntity
          ).save(
            new TestResultEntity({
              testSteps: [
                new TestStepEntity({
                  operationInput: "hoge",
                  operationType: "change",
                  operationElement: JSON.stringify({
                    tagname: "input",
                    text: "",
                    xpath: "",
                    value: "",
                    checked: false,
                    attributes: { id: "textField1" },
                  }),
                  pageTitle: "Page1",
                  pageUrl: "url1",
                  screenshot: new ScreenshotEntity({
                    fileUrl: "imageFileUrl1",
                  }),
                }),
              ],
              coverageSources: [new CoverageSourceEntity()],
            })
          );

          const testResultServiceMock = {
            ...emptyTestResultService,
            collectAllTestStepScreenshots: jest
              .fn()
              .mockResolvedValue([{ id: "id1", fileUrl: "fileUrl1" }]),
          };
          const testScriptFileRepositoryServiceMock = {
            ...emptyTestScriptFileRepositoryService,
            write: jest.fn().mockResolvedValue("testScriptArchiveUrl"),
          };
          const service = new TestScriptsService({
            testResult: testResultServiceMock,
            testScriptFileRepository: testScriptFileRepositoryServiceMock,
          });

          const option: TestScriptOption = {
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

          const result = await service.createTestScriptByTestResult(
            testResultId,
            option
          );

          const { testScript } = await service["generateTestScript"]({
            testResultIds: [testResultId],
            option,
          });

          expect(result.url).toEqual("testScriptArchiveUrl");
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
          expect(testScript).toEqual(expectedTestScripts);
          expect(testScriptFileRepositoryServiceMock.write).toBeCalledWith(
            expectedTestScripts,
            [{ id: "id1", fileUrl: "fileUrl1" }]
          );
        });

        it("無効な操作がある場合", async () => {
          const { id: testResultId } = await getRepository(
            TestResultEntity
          ).save(
            new TestResultEntity({
              testSteps: [
                new TestStepEntity({
                  operationType: "accept_alert",
                  pageTitle: "Page1",
                  pageUrl: "url1",
                  screenshot: new ScreenshotEntity({
                    fileUrl: "imageFileUrl1",
                  }),
                }),
              ],
              coverageSources: [new CoverageSourceEntity()],
            })
          );

          const testResultServiceMock = {
            ...emptyTestResultService,
            collectAllTestStepScreenshots: jest
              .fn()
              .mockResolvedValue([{ id: "id1", fileUrl: "fileUrl1" }]),
          };
          const testScriptFileRepositoryServiceMock = {
            ...emptyTestScriptFileRepositoryService,
            write: jest.fn().mockResolvedValue("testScriptArchiveUrl"),
          };
          const service = new TestScriptsService({
            testResult: testResultServiceMock,
            testScriptFileRepository: testScriptFileRepositoryServiceMock,
          });

          const option: TestScriptOption = {
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

          const result = await service.createTestScriptByTestResult(
            testResultId,
            option
          );

          const { testScript } = await service["generateTestScript"]({
            testResultIds: [testResultId],
            option,
          });

          expect(result.url).toEqual("testScriptArchiveUrl");
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
          expect(testScript).toEqual(expectedTestScripts);
          expect(testScriptFileRepositoryServiceMock.write).toBeCalledWith(
            expectedTestScripts,
            [{ id: "id1", fileUrl: "fileUrl1" }]
          );
        });
      });

      it("テストケースを1つも生成できなかった場合は、エラーをthrowする", async () => {
        const testScriptFileRepositoryServiceMock = {
          ...emptyTestScriptFileRepositoryService,
        };
        const service = new TestScriptsService({
          testResult: {
            ...emptyTestResultService,
          },
          testScriptFileRepository: testScriptFileRepositoryServiceMock,
        });

        const result = service.createTestScriptByTestResult("testResultId", {
          optimized: false,
          testData: { useDataDriven: false, maxGeneration: 0 },
          view: {
            node: {
              unit: "title",
              definitions: [],
            },
          },
          buttonDefinitions: [],
        });

        await expect(result).rejects.toThrow(
          new ServerError(500, {
            code: "no_test_cases_generated",
          })
        );

        expect(testScriptFileRepositoryServiceMock.write).not.toBeCalled();
      });
    });
  });
});
