import { IdentifierGenerator } from "@/domain/testScriptGeneration/IdentifierGenerator";
import { TestScriptSourceElement } from "@/domain/testScriptGeneration";
import { createHash } from "crypto";

describe("IdentifierUtilクラスの", () => {
  describe("normalizeIdentifierは識別子の正規化ができ，仮の区切り文字として$が用いられる", () => {
    it("前後の空白は削除される", () => {
      expect(
        (new IdentifierGenerator() as any)
          .normalizeIdentifier(`  test_identifier\t \n
        `)
      ).toBe("test$identifier");
    });

    it("空白,/,?,-,| は$に変換される", () => {
      expect(
        (new IdentifierGenerator() as any)
          .normalizeIdentifier(`test identifier/?-|_ \n
       1`)
      ).toBe("test$identifier$1");
    });

    it("？・〜｜＿→はアンダーバーに変換される", () => {
      expect(
        (new IdentifierGenerator() as any).normalizeIdentifier(
          `テストﾃｽﾄ＿・？〜識別子｜→1`
        )
      ).toBe("テストﾃｽﾄ_識別子_1");
    });

    it("その他記号は削除される", () => {
      expect(
        (new IdentifierGenerator() as any).normalizeIdentifier(
          `tes!@#$%^&*(){};:'",.<>\`!+=\\t_identifie−〒§【】r`
        )
      ).toBe("test$identifier");
    });
  });

  describe("generateIdentifierは識別子の生成ができ，", () => {
    it("ラジオボタンの場合はnameが最も優先的に用いられる", () => {
      const element: TestScriptSourceElement = {
        tagname: "input",
        text: "text1",
        xpath: "xpath1",
        attributes: {
          name: "name1",
          id: "id1",
          value: "value1",
          type: "radio",
        },
        locator: "locator",
      };
      const identifier =
        new IdentifierGenerator().generateIdentifierFromElement(element);
      expect(identifier).toBe("name1");
    });

    it("ラジオボタン以外の場合はidが最も優先的に用いられる", () => {
      const element: TestScriptSourceElement = {
        tagname: "input",
        text: "text1",
        xpath: "xpath1",
        attributes: { name: "name1", id: "id1", value: "value1" },
        locator: "locator",
      };
      const identifier =
        new IdentifierGenerator().generateIdentifierFromElement(element);
      expect(identifier).toBe("id1");
    });

    it("2番目にnameが優先的に用いられる, valueがない場合，識別子はnameから作られる", () => {
      const element: TestScriptSourceElement = {
        tagname: "input",
        text: "text1",
        xpath: "xpath1",
        attributes: { name: "name1", value: "" },
        locator: "locator",
      };
      const identifier =
        new IdentifierGenerator().generateIdentifierFromElement(element);
      expect(identifier).toBe("name1");
    });

    it("2番目にnameが優先的に用いられ，valueがある場合，識別子はnameとvalueから作られる", () => {
      const element: TestScriptSourceElement = {
        tagname: "input",
        text: "text1",
        xpath: "xpath1",
        attributes: { name: "name1", value: "value1" },
        locator: "locator",
      };
      const identifier =
        new IdentifierGenerator().generateIdentifierFromElement(element);
      expect(identifier).toBe("name1value1");
    });

    it("3番目にtextが優先的に用いられる", () => {
      const element: TestScriptSourceElement = {
        tagname: "input",
        text: "text1",
        xpath: "xpath1",
        attributes: { value: "value1" },
        locator: "locator",
      };
      const identifier =
        new IdentifierGenerator().generateIdentifierFromElement(element);
      expect(identifier).toBe("text1");
    });

    it("4番目にvalueが優先的に用いられる", () => {
      const element: TestScriptSourceElement = {
        tagname: "input",
        text: "",
        xpath: "xpath1",
        attributes: { value: "value1" },
        locator: "locator",
      };
      const identifier =
        new IdentifierGenerator().generateIdentifierFromElement(element);
      expect(identifier).toBe("value1");
    });

    it("識別子が正規化されキャメルケースになる", () => {
      const element: TestScriptSourceElement = {
        tagname: "input",
        text: "text1",
        xpath: "xpath1",
        attributes: { name: "name1", id: "test  id!{> \t1  ", value: "value1" },
        locator: "locator",
      };
      const identifier =
        new IdentifierGenerator().generateIdentifierFromElement(element);
      expect(identifier).toBe("testId1");
    });

    it("数字から始まる識別子は頭にアンダーバーがつく", () => {
      const element: TestScriptSourceElement = {
        tagname: "input",
        text: "text1",
        xpath: "xpath1",
        attributes: { name: "name1", id: "01", value: "value1" },
        locator: "locator",
      };
      const identifier =
        new IdentifierGenerator().generateIdentifierFromElement(element);
      expect(identifier).toBe("_01");
    });

    it("identifierが重複する且つxpathが同一の場合、identifierの後にhashが付かない", () => {
      const element: TestScriptSourceElement = {
        tagname: "input",
        text: "text1",
        xpath: "xpath1",
        attributes: { name: "name1", id: "id", value: "value1" },
        locator: "locator",
      };

      const generator = new IdentifierGenerator();

      generator.generateIdentifierFromElement(element);
      const identifier = generator.generateIdentifierFromElement(element);
      expect(identifier).toBe("id");
    });

    it("identifierが重複する且つxpathが異なる場合、identifierの後にhashが付く", () => {
      const element1: TestScriptSourceElement = {
        tagname: "input",
        text: "text1",
        xpath: "xpath1",
        attributes: { name: "name1", id: "id", value: "value1" },
        locator: "locator",
      };
      const element2: TestScriptSourceElement = {
        tagname: "input",
        text: "text1",
        xpath: "xpath2",
        attributes: { name: "name1", id: "id", value: "value1" },
        locator: "locator",
      };

      const generator = new IdentifierGenerator();

      generator.generateIdentifierFromElement(element1);
      const identifier = generator.generateIdentifierFromElement(element2);
      expect(identifier).toBe(
        `id${createHash("md5").update(element2.xpath).digest("hex")}`
      );
    });
  });

  describe("normalizeAndToCamelCaseは，正規化したcamel caseがの識別子が生成でき，", () => {
    it("第2引数をtrueにすることで，第1引数の文字列がupper camel caseになる", () => {
      const identifier = new IdentifierGenerator().normalizeAndToCamelCase(
        "TEST_Abc_ | dEF  ",
        true
      );
      expect(identifier).toBe("TestAbcDef");
    });

    it("第2引数を空にすることで，第1引数の文字列がlower camel caseになる", () => {
      const identifier = new IdentifierGenerator().normalizeAndToCamelCase(
        "TEST_Abc_ | dEF  "
      );
      expect(identifier).toBe("testAbcDef");
    });

    it("数字が入っていた場合，数字の前後は1つの単語とみなされる", () => {
      const identifier = new IdentifierGenerator().normalizeAndToCamelCase(
        "ABC123DEF",
        true
      );
      expect(identifier).toBe("Abc123def");
    });

    it("記号のみで構築される文字が与えられるとアンダーバーを返す", () => {
      const identifier = new IdentifierGenerator().normalizeAndToCamelCase(
        "/$#)@! )(*",
        true
      );
      expect(identifier).toBe("_");
    });

    it("日本語の場合は正規化のみ行う", () => {
      const identifier = new IdentifierGenerator().normalizeAndToCamelCase(
        "テストタイトル｜ログイン画面",
        true
      );
      expect(identifier).toBe("テストタイトル_ログイン画面");
    });

    it("文字数が100文字を超える場合は100文字までで切る", () => {
      const identifier = new IdentifierGenerator().normalizeAndToCamelCase(
        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        true
      );
      expect(identifier).toBe(
        "Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      );
    });
  });
});
