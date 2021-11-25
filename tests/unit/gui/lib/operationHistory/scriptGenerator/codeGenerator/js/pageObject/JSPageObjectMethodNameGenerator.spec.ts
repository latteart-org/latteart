import { JSPageObjectMethodNameGenerator } from "@/lib/operationHistory/scriptGenerator/codeGenerator/js/pageObject/JSPageObjectMethodNameGenerator";
import { NameGenerator } from "@/lib/operationHistory/scriptGenerator/codeGenerator/NameGenerator";
import {
  OperationType,
  ElementType,
} from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/operation/PageObjectOperation";

describe("JSPageObjectMethodNameGenerator", () => {
  describe("#generate", () => {
    it("メソッドで使用する画面要素、遷移先画面を元に名前を生成して返す", () => {
      const emptyMethod = {
        id: "emptyMethod",
        pageObjectId: "pageObject1",
        returnPageObjectId: "pageObject2",
        operations: [],
        includes: jest.fn(),
      };

      const linkMethod = {
        id: "linkMethod",
        pageObjectId: "pageObject1",
        returnPageObjectId: "pageObject2",
        operations: [
          {
            target: {
              identifier: "linkOperation",
              type: ElementType.Link,
              locator: "",
            },
            type: OperationType.Other,
            input: "",
          },
        ],
        includes: jest.fn(),
      };

      const otherMethod = {
        id: "otherMethod",
        pageObjectId: "pageObject1",
        returnPageObjectId: "pageObject2",
        operations: [
          {
            target: {
              identifier: "otherOperation",
              type: ElementType.Other,
              locator: "",
            },
            type: OperationType.Other,
            input: "",
          },
        ],
        includes: jest.fn(),
      };

      const pageObjects = [{ methods: [emptyMethod, linkMethod, otherMethod] }];
      const pageObjectNameGenerator: NameGenerator = {
        generate: jest.fn().mockImplementation((id) => `name_of_${id}`),
      };

      const generator = new JSPageObjectMethodNameGenerator(
        pageObjects,
        pageObjectNameGenerator
      );

      expect(generator.generate("emptyMethod")).toEqual(
        "goname_of_pageObject2Empty"
      );
      expect(generator.generate("linkMethod")).toEqual("goname_of_pageObject2");
      expect(generator.generate("otherMethod")).toEqual("dootherOperation");
    });
  });
});
