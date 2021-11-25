import { JSDocReadmeGenerator } from "@/lib/operationHistory/scriptGenerator/codeGenerator/js/other/JSDocReadmeGenerator";

describe("JSDocReadmeGenerator", () => {
  describe("#generate", () => {
    it("テストスイートとページオブジェクトの一覧を持つMarkdownファイルを生成する", () => {
      const testSuiteIdToTopPageUrl = new Map([
        ["TestSuite1", "TopPage1"],
        ["TestSuite2", "TopPage2"],
      ]);
      const pageObjectIdToAlias = new Map([
        ["PageObject1", "Alias1"],
        ["PageObject2", "Alias2"],
      ]);

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

|#|name|source|
|:--|:--|:--|
|1|<a href="./Alias1.html">Alias1</a>|PageObject1|
|2|<a href="./Alias2.html">Alias2</a>|PageObject2|
`);
    });

    it("空の場合はテービルを表示しない", () => {
      const testSuiteNameToTopPageUrl = new Map<string, string>([]);
      const pageObjectIdToAlias = new Map<string, string>([]);

      const markdown = new JSDocReadmeGenerator().generate(
        testSuiteNameToTopPageUrl,
        pageObjectIdToAlias
      );

      expect(markdown).toEqual(`\
## Test suites

## Page objects
`);
    });

    it("JSDocのページとリンクできるようにページオブジェクトのエイリアスに日本語名が含まれている場合はhrefを2回URLエンコードする", () => {
      const testSuiteNameToTopPageUrl = new Map<string, string>([]);
      const pageObjectIdToAlias = new Map([["PageObject1", "あ"]]);

      const markdown = new JSDocReadmeGenerator().generate(
        testSuiteNameToTopPageUrl,
        pageObjectIdToAlias
      );

      expect(markdown).toEqual(`\
## Test suites

## Page objects

|#|name|source|
|:--|:--|:--|
|1|<a href="./%25E3%2581%2582.html">あ</a>|PageObject1|
`);
    });
  });
});
