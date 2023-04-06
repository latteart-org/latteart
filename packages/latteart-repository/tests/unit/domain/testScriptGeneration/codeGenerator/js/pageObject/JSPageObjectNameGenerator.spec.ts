import { JSPageObjectNameGenerator } from "@/domain/testScriptGeneration/codeGenerator/js/pageObject/JSPageObjectNameGenerator";

describe("JSPageObjectNameGenerator", () => {
  describe("#generate", () => {
    it("ページオブジェクトIDが17文字を超える場合は17文字でカットし、カットした結果重複するものは末尾に通番を付与したものを名前として返す", () => {
      const id1 = "a".repeat(17);
      const id2 = "a".repeat(18);

      const pageObjects = [{ id: id1 }, { id: id2 }];
      const generator = new JSPageObjectNameGenerator(pageObjects);

      expect(generator.generate(id1)).toEqual(id1);
      expect(generator.generate(id2)).toEqual(`${id1}2`);
    });
  });
});
