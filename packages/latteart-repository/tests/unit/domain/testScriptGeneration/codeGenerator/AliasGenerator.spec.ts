import { AliasGenerator } from "@/domain/testScriptGeneration/codeGenerator/AliasGenerator";

describe("AliasGenerator", () => {
  describe("#generate", () => {
    describe("渡されたnameフィールドを持つオブジェクトから別名を生成し、aliasフィールドを追加したオブジェクトを返す", () => {
      it("渡された名前をコンストラクタで指定した文字数でカットし、複数同名のものがある場合は通番を付与する", () => {
        const word1 = "あ".repeat(16);
        const word2 = "あ".repeat(17);
        const word3 = "あ".repeat(18);

        const result = new AliasGenerator(17).generate([
          { name: word1 },
          { name: word2 },
          { name: word3, aaa: "hoge" },
        ]);

        expect(result).toEqual([
          { name: word1, alias: word1 },
          { name: word2, alias: word2 },
          { name: word3, alias: `${word2}2`, aaa: "hoge" },
        ]);
      });
    });
  });
});
