import { PageObject } from "@/lib/operationHistory/scriptGenerator/model/pageObject/PageObject";

import { JSPageObjectCodeGenerator } from "@/lib/operationHistory/scriptGenerator/codeGenerator/js/pageObject/JSPageObjectCodeGenerator";
import {
  PageObjectElement,
  ElementType,
  PageObjectOperation,
} from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/operation/PageObjectOperation";

describe("JSPageObjectCodeGenerator", () => {
  describe("#generateFrom", () => {
    it("渡されたページオブジェクトからJavaScriptのコードを生成する", () => {
      const element: PageObjectElement = {
        identifier: "param1",
        locator: "#param1",
        type: ElementType.Other,
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

  name_of_method2({
    param1
  }) {
    this.param1.setValue(param1);

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
  });
});
