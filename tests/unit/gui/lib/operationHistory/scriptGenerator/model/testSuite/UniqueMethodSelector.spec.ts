import { PageObject } from "@/lib/operationHistory/scriptGenerator/model/pageObject/PageObject";
import { PageObjectMethod } from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/PageObjectMethod";
import { UniqueMethodSelector } from "@/lib/operationHistory/scriptGenerator/model/testSuite/UniqueMethodSelector";

describe("UniqueMethodSelector", () => {
  describe("#selectMethods", () => {
    it("指定した画面遷移列の1画面遷移毎について、マッチするメソッドをページオブジェクトの中から重複しないように選択して返す", () => {
      const method1_1: PageObjectMethod = {
        id: "",
        operations: [],
        pageObjectId: "pageObject1",
        returnPageObjectId: "pageObject2",
        includes: jest.fn(),
      };

      const method1_2: PageObjectMethod = {
        id: "",
        operations: [],
        pageObjectId: "pageObject1",
        returnPageObjectId: "pageObject2",
        includes: jest.fn(),
      };

      const method2_1: PageObjectMethod = {
        id: "",
        operations: [],
        pageObjectId: "pageObject2",
        returnPageObjectId: "pageObject1",
        includes: jest.fn(),
      };

      const pageObjects: PageObject[] = [
        {
          id: "pageObject1",
          url: "url1",
          methods: [method1_2, method1_1],
          unSortedMethods: [method1_1, method1_2],
          collectMethodInputVariations: jest.fn(),
        },
        {
          id: "pageObject2",
          url: "url2",
          methods: [method2_1],
          unSortedMethods: [method2_1],
          collectMethodInputVariations: jest.fn(),
        },
      ];

      const selector = new UniqueMethodSelector();

      const methods = selector.selectMethods(pageObjects, [
        "pageObject1",
        "pageObject2",
        "pageObject1",
        "pageObject2",
      ]);

      expect(methods).toEqual([method1_1, method2_1, method1_2]);
    });
  });
});
