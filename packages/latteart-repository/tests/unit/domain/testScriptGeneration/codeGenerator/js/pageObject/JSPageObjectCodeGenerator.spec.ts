import {
  PageObject,
  PageObjectElement,
  PageObjectOperation,
} from "@/domain/testScriptGeneration/model";
import { JSPageObjectCodeGenerator } from "@/domain/testScriptGeneration/codeGenerator/js/pageObject/JSPageObjectCodeGenerator";

describe("JSPageObjectCodeGenerator", () => {
  describe("#generateFrom", () => {
    it("渡されたページオブジェクトからJavaScriptのコードを生成する", () => {
      const element: PageObjectElement = {
        identifier: "param1",
        locators: [{ other: "#param1" }],
        type: "Other",
      };

      const operation: PageObjectOperation = {
        target: element,
        type: "change",
        input: "",
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

      const testSuiteCode = new JSPageObjectCodeGenerator(
        nameGenerator
      ).generateFrom(pageObject, false);

      const expected = `\
import name_of_PageObject2 from './name_of_PageObject2.page';

/**
 * PageObjectComment1
 */
class name_of_PageObject1 {
  get param1() {
    return driver
      .switchToFrame(null)
      .then(async () => $('#param1'));
  }

  async name_of_method1() {
    // no operation

    return new name_of_PageObject1();
  }

  async name_of_method2({
    param1
  }) {
    await (await this.param1).setValue(param1);

    return new name_of_PageObject2();
  }

  async name_of_method3() {
    await (await this.param1).click();
    await browser.switchWindow("targetUrl");

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
        locators: [{ other: "#param1" }],
        type: "Other",
      };

      const operation: PageObjectOperation = {
        target: element,
        type: "change",
        input: "",
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

      const testSuiteCode = new JSPageObjectCodeGenerator(
        nameGenerator
      ).generateFrom(pageObject, false);

      const expected = `\
import name_of_PageObject2 from './name_of_PageObject2.page';

/**
 * PageObjectComment1
 */
class name_of_PageObject1 {
  get param1() {
    return driver
      .switchToFrame(null)
      .then(async () => $('#param1'));
  }

  async name_of_method1() {
    // no operation

    return new name_of_PageObject1();
  }

  async name_of_method2({
    param1
  }) {
    await (await this.param1).setValue(param1);

    return new name_of_PageObject2();
  }

  async name_of_method3() {
    // Please insert code for operations while pausing here.
    await browser.switchWindow("targetUrl");

    return new name_of_PageObject2();
  }
}
export default name_of_PageObject1;
`;

      expect(testSuiteCode).toEqual(expected);
    });

    it("multi-locatorを使用する", () => {
      const element: PageObjectElement = {
        identifier: "param1",
        locators: [{ id: "param1" }, { xpath: "xpath/xpath" }],
        type: "Other",
      };

      const operation: PageObjectOperation = {
        target: element,
        type: "change",
        input: "",
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

      const testSuiteCode = new JSPageObjectCodeGenerator(
        nameGenerator
      ).generateFrom(pageObject, true);

      const expected = `\
import name_of_PageObject2 from './name_of_PageObject2.page';

/**
 * PageObjectComment1
 */
class name_of_PageObject1 {
  get param1() {
    return driver
      .switchToFrame(null)
      .then(async () => driver.findElementMulti(
        {"id":"param1"},
        {"xpath":"xpath/xpath"}
      ));
    }

  async name_of_method1() {
    // no operation

    return new name_of_PageObject1();
  }

  async name_of_method2({
    param1
  }) {
    await (await this.param1).setValue(param1);

    return new name_of_PageObject2();
  }

  async name_of_method3() {
    await (await this.param1).click();
    await browser.switchWindow("targetUrl");

    return new name_of_PageObject2();
  }
}
export default name_of_PageObject1;
`;

      expect(testSuiteCode).toEqual(expected);
    });
  });
});
