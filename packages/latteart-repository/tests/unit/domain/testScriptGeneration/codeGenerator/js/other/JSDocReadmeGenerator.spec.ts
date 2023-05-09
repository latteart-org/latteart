import { JSDocReadmeGenerator } from "@/domain/testScriptGeneration/codeGenerator/js/other/JSDocReadmeGenerator";

describe("JSDocReadmeGenerator", () => {
  describe("#generate", () => {
    it("テストスイートとページオブジェクトの一覧を持つMarkdownファイルを生成する", () => {
      const testSuiteIdToTopPageUrl = new Map([
        ["TestSuite1", "TopPage1"],
        ["TestSuite2", "TopPage2"],
      ]);
      const pageObjectIdToAlias = [
        { name: "PageObject1", alias: "Alias1", invalidTypeExists: false },
        { name: "PageObject2", alias: "Alias2", invalidTypeExists: false },
      ];

      const markdown = new JSDocReadmeGenerator().generate(
        testSuiteIdToTopPageUrl,
        pageObjectIdToAlias
      );

      expect(markdown).toEqual(`\
## Test suites

|#|name|top page url|
|:--|:--|:--|
|1|<a href="./TestSuite1.html">TestSuite1</a>|TopPage1|
|2|<a href="./TestSuite2.html">TestSuite2</a>|TopPage2|

## Page objects

|#|name|source|remarks|
|:--|:--|:--|:--|
|1|<a href="./Alias1.html">Alias1</a>|PageObject1||
|2|<a href="./Alias2.html">Alias2</a>|PageObject2||
`);
    });

    it("空の場合はテーブルを表示しない", () => {
      const testSuiteNameToTopPageUrl = new Map<string, string>([]);

      const markdown = new JSDocReadmeGenerator().generate(
        testSuiteNameToTopPageUrl,
        []
      );

      expect(markdown).toEqual(`\
## Test suites

## Page objects
`);
    });

    it("JSDocのページとリンクできるようにページオブジェクトのエイリアスに日本語名が含まれている場合はhrefを2回URLエンコードする", () => {
      const testSuiteNameToTopPageUrl = new Map<string, string>([]);
      const pageObjectInfos = [
        { name: "PageObject1", alias: "あ", invalidTypeExists: false },
      ];

      const markdown = new JSDocReadmeGenerator().generate(
        testSuiteNameToTopPageUrl,
        pageObjectInfos
      );

      expect(markdown).toEqual(`\
## Test suites

## Page objects

|#|name|source|remarks|
|:--|:--|:--|:--|
|1|<a href="./%25E3%2581%2582.html">あ</a>|PageObject1||
`);
    });
  });
});
