import {
  PageObject,
  PageObjectElement,
  PageObjectOperation,
} from "@/domain/testScriptGeneration/model";
import { JSSimplePageObjectCodeGenerator } from "@/domain/testScriptGeneration/codeGenerator/js/pageObject/JSSimplePageObjectCodeGenerator";

describe("JSSimplePageObjectCodeGenerator", () => {
  describe("#generateFrom", () => {
    it("渡されたページオブジェクトからJavaScriptのコードを生成する", () => {
      const element: PageObjectElement = {
        identifier: "param1",
        locator: "#param1",
        type: "Other",
      };

      const operation: PageObjectOperation = {
        target: element,
        type: "change",
        input: "test",
      };

      const operation2: PageObjectOperation = {
        target: element,
        type: "click",
        input: "",
      };

      const operation3: PageObjectOperation = {
        target: element,
        type: "switch_window",
        input: "targetUrl",
      };

      const pageObject: PageObject = {
        comment: "PageObjectComment1",
        id: "PageObject1",
        url: "PageObjectUrl1",
        methods: [
          {
            id: "method1",
            pageObjectId: "PageObject1",
            operations: [],
            returnPageObjectId: "PageObject1",
            includes: jest.fn(),
          },
          {
            id: "method2",
            pageObjectId: "PageObject1",
            operations: [operation],
            returnPageObjectId: "PageObject2",
            includes: jest.fn(),
          },
          {
            id: "method3",
            pageObjectId: "PageObject1",
            operations: [operation2, operation3],
            returnPageObjectId: "PageObject2",
            includes: jest.fn(),
          },
        ],
        collectMethodInputVariations: jest.fn(),
        methodComparator: undefined,
      };

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

      const testSuiteCode = new JSSimplePageObjectCodeGenerator(
        nameGenerator
      ).generateFrom(pageObject);

      const expected = `\
import name_of_PageObject2 from './name_of_PageObject2.page';

/**
 * PageObjectComment1
 */
class name_of_PageObject1 {
  get param1() { return $('#param1'); }

  name_of_method1() {
    // no operation

    return new name_of_PageObject1();
  }

  name_of_method2() {
    this.param1.setValue('test');

    return new name_of_PageObject2();
  }

  name_of_method3() {
    this.param1.click();
    browser.switchWindow("targetUrl");

    return new name_of_PageObject2();
  }
}
export default name_of_PageObject1;
`;

      expect(testSuiteCode).toEqual(expected);
    });

    it("skipped_operationsがページオブジェクトに含まれる場合は手動で記載させる旨をコメントで出力する", () => {
      const element: PageObjectElement = {
        identifier: "param1",
        locator: "#param1",
        type: "Other",
      };

      const operation: PageObjectOperation = {
        target: element,
        type: "change",
        input: "test",
      };

      const operation2: PageObjectOperation = {
        target: element,
        type: "skipped_operations",
        input: "",
      };

      const operation3: PageObjectOperation = {
        target: element,
        type: "switch_window",
        input: "targetUrl",
      };

      const pageObject: PageObject = {
        comment: "PageObjectComment1",
        id: "PageObject1",
        url: "PageObjectUrl1",
        methods: [
          {
            id: "method1",
            pageObjectId: "PageObject1",
            operations: [],
            returnPageObjectId: "PageObject1",
            includes: jest.fn(),
          },
          {
            id: "method2",
            pageObjectId: "PageObject1",
            operations: [operation],
            returnPageObjectId: "PageObject2",
            includes: jest.fn(),
          },
          {
            id: "method3",
            pageObjectId: "PageObject1",
            operations: [operation2, operation3],
            returnPageObjectId: "PageObject2",
            includes: jest.fn(),
          },
        ],
        collectMethodInputVariations: jest.fn(),
        methodComparator: undefined,
      };

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

      const testSuiteCode = new JSSimplePageObjectCodeGenerator(
        nameGenerator
      ).generateFrom(pageObject);

      const expected = `\
import name_of_PageObject2 from './name_of_PageObject2.page';

/**
 * PageObjectComment1
 */
class name_of_PageObject1 {
  get param1() { return $('#param1'); }

  name_of_method1() {
    // no operation

    return new name_of_PageObject1();
  }

  name_of_method2() {
    this.param1.setValue('test');

    return new name_of_PageObject2();
  }

  name_of_method3() {
    // Please insert code for operations while pausing here.
    browser.switchWindow("targetUrl");

    return new name_of_PageObject2();
  }
}
export default name_of_PageObject1;
`;

      expect(testSuiteCode).toEqual(expected);
    });
  });
});
