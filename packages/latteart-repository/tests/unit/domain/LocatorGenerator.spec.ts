import {
  createWDIOLocatorFormatter,
  ScreenElementLocatorGenerator,
  ElementLocatorSource,
} from "@/domain/elementLocator";
import { ElementInfo } from "@/domain/types";

describe("LocatorGeneratorImpl", () => {
  describe("#generateFrom", () => {
    describe("要素の情報からロケータを生成できる", () => {
      const generator = new ScreenElementLocatorGenerator(
        createWDIOLocatorFormatter(),
        [],
        false
      );

      it("idが最も優先的に用いられる", () => {
        const element: ElementLocatorSource = {
          tagname: "input",
          text: "text1",
          xpath: "xpath1",
          attributes: { name: "name1", id: "id1", value: "value1" },
        };
        const locator = generator.generateFrom(element);
        expect(locator).toEqual([{ other: "#id1" }]);
      });

      it("2番目にnameが優先的に用いられる", () => {
        const element: ElementLocatorSource = {
          tagname: "input",
          text: "text1",
          xpath: "xpath1",
          attributes: { name: "name1", value: "" },
        };
        const locator = generator.generateFrom(element);
        expect(locator).toEqual([{ other: '[name="name1"]' }]);
      });
      describe("3番目にtextが優先的に用いられる", () => {
        it("Aタグなら partial link text を使う", () => {
          const element: ElementLocatorSource = {
            tagname: "A",
            text: "text1",
            xpath: "xpath1",
            attributes: { value: "value1" },
          };
          const locator = generator.generateFrom(element);
          expect(locator).toEqual([{ other: "*=text1" }]);
        });
        it("Aタグ以外ならタグ名を頭につける", () => {
          const element: ElementLocatorSource = {
            tagname: "h1",
            text: "text1",
            xpath: "xpath1",
            attributes: { value: "value1" },
          };
          const locator = generator.generateFrom(element);
          expect(locator).toEqual([{ other: "h1*=text1" }]);
        });
      });
      it("4番目にxpathが優先的に用いられる", () => {
        const element: ElementLocatorSource = {
          tagname: "input",
          text: "",
          xpath: "xpath1",
          attributes: { value: "value1" },
        };
        const locator = generator.generateFrom(element);
        expect(locator).toEqual([{ other: "xpath1" }]);
      });
      it("textにHTML特殊文字が含まれている場合はxpathを返す", () => {
        const element1: ElementLocatorSource = {
          tagname: "button",
          text: "<xxx",
          xpath: "xpath1",
          attributes: { value: "value1" },
        };
        const locator1 = generator.generateFrom(element1);
        expect(locator1).toEqual([{ other: "xpath1" }]);

        const element2: ElementLocatorSource = {
          tagname: "button",
          text: ">xxx",
          xpath: "xpath2",
          attributes: { value: "value2" },
        };
        const locator2 = generator.generateFrom(element2);
        expect(locator2).toEqual([{ other: "xpath2" }]);

        const element3: ElementLocatorSource = {
          tagname: "button",
          text: "/xxx",
          xpath: "xpath3",
          attributes: { value: "value3" },
        };
        const locator3 = generator.generateFrom(element3);
        expect(locator3).toEqual([{ other: "xpath3" }]);

        const element4: ElementLocatorSource = {
          tagname: "button",
          text: "x xx",
          xpath: "xpath4",
          attributes: { value: "value4" },
        };
        const locator4 = generator.generateFrom(element4);
        expect(locator4).toEqual([{ other: "xpath4" }]);
      });
    });
    describe("重複するLocatorが存在する場合Locatorではなくxpathを返す", () => {
      const elementInfoList: ElementInfo[] = [
        {
          tagname: "BUTTON",
          text: "button",
          xpath: "button1",
          attributes: {
            id: "id",
          },
        },
        {
          tagname: "BUTTON",
          text: "button",
          xpath: "button2",
          attributes: {
            id: "id",
          },
        },

        {
          tagname: "INPUT",
          xpath: "input1",
          value: "value",
          attributes: {
            name: "name",
          },
        },
        {
          tagname: "INPUT",
          xpath: "input2",
          value: "value",
          attributes: {
            name: "name",
          },
        },
        {
          tagname: "INPUT",
          xpath: "input3",
          attributes: {
            name: "name",
          },
        },
        {
          tagname: "INPUT",
          xpath: "input4",
          attributes: {
            name: "name",
          },
        },
        {
          tagname: "A",
          xpath: "anchor1",
          text: "anchor",
          attributes: {},
        },
        {
          tagname: "A",
          xpath: "anchor2",
          text: "anchor",
          attributes: {},
        },
        {
          tagname: "SPAN",
          xpath: "span1",
          text: "span",
          attributes: {},
        },
        {
          tagname: "SPAN",
          xpath: "span2",
          text: "span",
          attributes: {},
        },
      ];
      const generator = new ScreenElementLocatorGenerator(
        createWDIOLocatorFormatter(),
        elementInfoList,
        false
      );

      it("idが存在する場合", () => {
        const element: ElementLocatorSource = {
          tagname: "BUTTON",
          text: "button",
          xpath: "button2",
          attributes: {
            id: "id",
          },
        };
        const locator = generator.generateFrom(element);
        expect(locator).toEqual([{ other: "button2" }]);
      });

      it("idが重複し、nameとvalueでLocatorが決定する場合", () => {
        const element: ElementLocatorSource = {
          tagname: "BUTTON",
          text: "button",
          xpath: "button2",
          attributes: {
            id: "id",
            name: "name-id",
            value: "value-id",
          },
        };
        const locator = generator.generateFrom(element);
        expect(locator).toEqual([
          {
            other: '//*[@name="name-id" and @value="value-id"]',
          },
        ]);
      });

      it("nameとvalueが存在する場合", () => {
        const element1: ElementLocatorSource = {
          tagname: "INPUT",
          xpath: "input2",
          attributes: {
            name: "name",
            value: "value",
          },
        };
        const locator1 = generator.generateFrom(element1);
        expect(locator1).toEqual([{ other: "input2" }]);
      });

      it("nameとvalueが重複し、textでLocatorが決定する場合", () => {
        const element1: ElementLocatorSource = {
          tagname: "INPUT",
          xpath: "input2",
          text: "name-value-text",
          attributes: {
            name: "name",
            value: "value",
          },
        };
        const locator1 = generator.generateFrom(element1);
        expect(locator1).toEqual([{ other: "input*=name-value-text" }]);
      });

      it("nameのみが存在する場合", () => {
        const element3: ElementLocatorSource = {
          tagname: "INPUT",
          xpath: "input4",
          attributes: {
            name: "name",
          },
        };
        const locator3 = generator.generateFrom(element3);
        expect(locator3).toEqual([{ other: "input4" }]);
      });

      it("nameが重複しtextでLocatorが決定する場合", () => {
        const element3: ElementLocatorSource = {
          tagname: "INPUT",
          xpath: "input4",
          text: "name-value-text",
          attributes: {
            name: "name",
          },
        };
        const locator3 = generator.generateFrom(element3);
        expect(locator3).toEqual([{ other: "input*=name-value-text" }]);
      });

      it("Aタグの場合", () => {
        const element: ElementLocatorSource = {
          tagname: "A",
          xpath: "anchor2",
          text: "anchor",
          attributes: {},
        };
        const locator = generator.generateFrom(element);
        expect(locator).toEqual([{ other: "anchor2" }]);
      });

      it("その他のタグの場合", () => {
        const element: ElementLocatorSource = {
          tagname: "SPAN",
          xpath: "span2",
          text: "span",
          attributes: {},
        };
        const locator = generator.generateFrom(element);
        expect(locator).toEqual([{ other: "span2" }]);
      });
    });
    describe("multi-locatorを使用する", () => {
      const generator = new ScreenElementLocatorGenerator(
        createWDIOLocatorFormatter(),
        [],
        true
      );
      it("id、linkTextを使用する", () => {
        const element: ElementLocatorSource = {
          tagname: "a",
          text: "go to home",
          xpath: "xpath1",
          attributes: { id: "anchor" },
        };
        const locator = generator.generateFrom(element);
        expect(locator).toEqual([
          { id: "anchor" },
          { linkText: "go to home" },
          { xpath: "xpath1" },
        ]);
      });
      it("name、innerTextを使用する", () => {
        const element: ElementLocatorSource = {
          tagname: "div",
          text: "go to home",
          xpath: "xpath1",
          attributes: { name: "div" },
        };
        const locator = generator.generateFrom(element);
        expect(locator).toEqual([
          { name: "div" },
          { innerText: "go to home" },
          { xpath: "xpath1" },
        ]);
      });
      it("textに改行がある場合は無効とする", () => {
        const text1 = `aaa
        bbb
        bbb`;
        const element1: ElementLocatorSource = {
          tagname: "a",
          text: text1,
          xpath: "xpath1",
          attributes: {},
        };
        const element2: ElementLocatorSource = {
          tagname: "div",
          text: text1,
          xpath: "xpath2",
          attributes: {},
        };
        const locator1 = generator.generateFrom(element1);
        const locator2 = generator.generateFrom(element2);
        expect(locator1).toEqual([{ xpath: "xpath1" }]);
        expect(locator2).toEqual([{ xpath: "xpath2" }]);
      });
    });
  });
});
