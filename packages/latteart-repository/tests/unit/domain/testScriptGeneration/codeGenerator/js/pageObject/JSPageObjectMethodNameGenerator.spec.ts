import { JSPageObjectMethodNameGenerator } from "@/domain/testScriptGeneration/codeGenerator/js/pageObject/JSPageObjectMethodNameGenerator";
import { NameGenerator } from "@/domain/testScriptGeneration/codeGenerator/types";

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
              type: "Button",
              locator: "",
            },
            type: "other",
            input: "",
          } as const,
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
              type: "Other",
              locator: "",
            },
            type: "other",
            input: "",
          } as const,
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
