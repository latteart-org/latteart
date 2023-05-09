import { TestDataRepository } from "@/domain/testScriptGeneration/testDataRepository/TestDataRepository";
import { MethodCall } from "@/domain/testScriptGeneration/model";
import {
  CombinationTestDataSelector,
  CombinationGenerator,
} from "@/domain/testScriptGeneration/testDataRepository";

describe("CombinationTestDataSelector", () => {
  describe("#select", () => {
    it("受け取ったメソッド呼び出し群に対応するテストデータ群をリポジトリから受け取り、組み合わせのデータセットを作成して返す", () => {
      const repository: TestDataRepository = {
        collectScenarioArguments: jest.fn().mockReturnValue([
          {
            pageObjectId: "pageObject1",
            methodId: "methodId1",
            testDataVariations: [
              [
                { name: "A", value: "aaa" },
                { name: "B", value: "bbb" },
              ],
            ],
          },
          {
            pageObjectId: "pageObject1",
            methodId: "methodId2",
            testDataVariations: [
              [
                { name: "C", value: "ccc" },
                { name: "D", value: "ddd" },
              ],
              [
                { name: "C", value: "eee" },
                { name: "D", value: "fff" },
              ],
            ],
          },
          {
            pageObjectId: "pageObject1",
            methodId: "methodId3",
            testDataVariations: [], // 1つもバリエーションがないメソッドは無視されること
          },
        ]),
      };

      const methodCalls: MethodCall[] = [];

      const combinationGenerator = new CombinationGenerator(10);

      const testDataSet = new CombinationTestDataSelector(
        repository,
        combinationGenerator
      ).select(methodCalls, "scenarioName");

      expect(repository.collectScenarioArguments).toBeCalledWith(
        ...methodCalls
      );

      expect(testDataSet).toEqual({
        name: "scenarioName",
        variations: [
          {
            methodCallTestDatas: [
              {
                pageObjectId: "pageObject1",
                methodId: "methodId1",
                methodArguments: [
                  { name: "A", value: "aaa" },
                  { name: "B", value: "bbb" },
                ],
              },
              {
                pageObjectId: "pageObject1",
                methodId: "methodId2",
                methodArguments: [
                  { name: "C", value: "ccc" },
                  { name: "D", value: "ddd" },
                ],
              },
            ],
          },
          {
            methodCallTestDatas: [
              {
                pageObjectId: "pageObject1",
                methodId: "methodId1",
                methodArguments: [
                  { name: "A", value: "aaa" },
                  { name: "B", value: "bbb" },
                ],
              },
              {
                pageObjectId: "pageObject1",
                methodId: "methodId2",
                methodArguments: [
                  { name: "C", value: "eee" },
                  { name: "D", value: "fff" },
                ],
              },
            ],
          },
        ],
      });
    });
  });
});
