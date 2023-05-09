import { ScenarioFactory } from "@/domain/testScriptGeneration/model/testSuite/ScenarioFactory";
import { PageObjectMethod } from "@/domain/testScriptGeneration/model";

describe("ScenarioFactory", () => {
  describe("#create", () => {
    it("指定したメソッド群からシナリオを生成する", () => {
      const method1: PageObjectMethod = {
        id: "id1",
        pageObjectId: "pageObject1",
        returnPageObjectId: "pageObject1",
        operations: [],
        includes: jest.fn(),
      };

      const method2: PageObjectMethod = {
        id: "id2",
        pageObjectId: "pageObject2",
        returnPageObjectId: "pageObject2",
        operations: [],
        includes: jest.fn(),
      };

      const factory = new ScenarioFactory();

      const scenario = factory.create([method1, method2]);

      expect(scenario).toEqual({
        methodCalls: [
          {
            pageObjectId: method1.pageObjectId,
            methodId: method1.id,
            returnPageObjectId: method1.returnPageObjectId,
          },
          {
            pageObjectId: method2.pageObjectId,
            methodId: method2.id,
            returnPageObjectId: method2.returnPageObjectId,
          },
        ],
      });
    });
  });
});
