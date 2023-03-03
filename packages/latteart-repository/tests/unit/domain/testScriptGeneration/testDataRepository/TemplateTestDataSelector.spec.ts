import { TemplateTestDataSelector } from "@/domain/testScriptGeneration/testDataRepository";
import { TestDataRepository } from "@/domain/testScriptGeneration/testDataRepository/TestDataRepository";
import { MethodCall } from "@/domain/testScriptGeneration/model";

describe("TemplateTestDataSelector", () => {
  describe("#select", () => {
    it("受け取ったメソッド呼び出し群に対応するテストデータ群をリポジトリから受け取り、値が全て空かつ1バリエーションのみのテンプレートを作成して返す", () => {
      const repository: TestDataRepository = {
        collectScenarioArguments: jest.fn().mockReturnValue([
          {
            pageObjectId: "pageObjectId1",
            methodId: "methodId1",
            testDataVariations: [
              [
                { name: "A", value: "aaa" },
                { name: "B", value: "aaa" },
              ],
            ],
          },
          {
            pageObjectId: "pageObjectId1",
            methodId: "methodId2",
            testDataVariations: [
              [
                { name: "C", value: "aaa" },
                { name: "D", value: "aaa" },
              ],
              [
                { name: "C", value: "aaa" },
                { name: "D", value: "aaa" },
              ],
            ],
          },
          {
            pageObjectId: "pageObjectId1",
            methodId: "methodId3",
            testDataVariations: [], // 1つもバリエーションがないメソッドは無視されること
          },
        ]),
      };

      const methodCalls: MethodCall[] = [];

      const testDataSet = new TemplateTestDataSelector(repository).select(
        methodCalls,
        "scenarioName"
      );

      expect(repository.collectScenarioArguments).toBeCalledWith(
        ...methodCalls
      );

      expect(testDataSet).toEqual({
        name: "scenarioName",
        variations: [
          {
            methodCallTestDatas: [
              {
                pageObjectId: "pageObjectId1",
                methodId: "methodId1",
                methodArguments: [
                  { name: "A", value: "" },
                  { name: "B", value: "" },
                ],
              },
              {
                pageObjectId: "pageObjectId1",
                methodId: "methodId2",
                methodArguments: [
                  { name: "C", value: "" },
                  { name: "D", value: "" },
                ],
              },
            ],
          },
        ],
      });
    });
  });
});
