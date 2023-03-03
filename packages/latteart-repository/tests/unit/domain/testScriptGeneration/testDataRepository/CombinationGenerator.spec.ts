import { CombinationGenerator } from "@/domain/testScriptGeneration/testDataRepository";

describe("CombinationGenerator", () => {
  describe("#generate", () => {
    it("渡された複数の配列群の組み合わせを生成して返す", () => {
      const before = [
        ["a1", "a2"],
        ["b1", "b2", "b3"],
        ["c1"],
        [], // 空のものは無視されること
      ];

      // 最大生成数が十分に大きな数のgenerator
      const generator = new CombinationGenerator(1000);

      expect(generator.generate(...before)).toEqual([
        ["a1", "b1", "c1"],
        ["a1", "b2", "c1"],
        ["a1", "b3", "c1"],
        ["a2", "b1", "c1"],
        ["a2", "b2", "c1"],
        ["a2", "b3", "c1"],
      ]);

      // 最大生成数を3に絞ったgenerator
      const generator2 = new CombinationGenerator(3);

      expect(generator2.generate(...before)).toEqual([
        ["a1", "b1", "c1"],
        ["a1", "b2", "c1"],
        ["a1", "b3", "c1"],
      ]);
    });
  });
});
