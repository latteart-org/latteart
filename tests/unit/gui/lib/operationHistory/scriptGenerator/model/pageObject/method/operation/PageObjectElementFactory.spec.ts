import { LocatorGenerator } from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/operation/LocatorGenerator";
import { ElementType } from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/operation/PageObjectOperation";
import { PageObjectElementFactoryImpl } from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/operation/PageObjectElementFactory";

describe("PageObjectElementFactoryImpl", () => {
  describe("#createFrom", () => {
    let locatorGenerator: LocatorGenerator;
    let factory: PageObjectElementFactoryImpl;

    const dummyLocator = "locator";

    beforeEach(() => {
      locatorGenerator = {
        generateFrom: jest.fn().mockReturnValue(dummyLocator),
      };

      factory = new PageObjectElementFactoryImpl(locatorGenerator);
    });

    describe("ElementInfoとimageUrlから操作対象画面要素を生成する", () => {
      const imageUrl = "imageUrl";

      it("ラジオボタン", () => {
        const targetElement = {
          tagname: "INPUT",
          xpath: "",
          attributes: { value: "", name: "", type: "radio" },
        };

        expect(factory.createFrom(targetElement, imageUrl)).toEqual({
          identifier: expect.any(String),
          type: ElementType.RadioButton,
          locator: dummyLocator,
          value: targetElement.attributes.value,
          name: targetElement.attributes.name,
          imageUrl,
        });
        expect(locatorGenerator.generateFrom).toBeCalledWith(targetElement);
      });

      it("チェックボックス", () => {
        const targetElement = {
          tagname: "INPUT",
          xpath: "",
          attributes: { value: "", name: "", type: "checkbox" },
        };

        expect(factory.createFrom(targetElement, imageUrl)).toEqual({
          identifier: expect.any(String),
          type: ElementType.CheckBox,
          locator: dummyLocator,
          value: targetElement.attributes.value,
          name: targetElement.attributes.name,
          imageUrl,
        });
        expect(locatorGenerator.generateFrom).toBeCalledWith(targetElement);
      });

      it("セレクトボックス", () => {
        const targetElement = {
          tagname: "SELECT",
          xpath: "",
          attributes: { value: "", name: "", type: "" },
        };

        expect(factory.createFrom(targetElement, imageUrl)).toEqual({
          identifier: expect.any(String),
          type: ElementType.SelectBox,
          locator: dummyLocator,
          value: targetElement.attributes.value,
          name: targetElement.attributes.name,
          imageUrl,
        });
        expect(locatorGenerator.generateFrom).toBeCalledWith(targetElement);
      });

      it("リンク", () => {
        const targetElement = {
          tagname: "A",
          xpath: "",
          attributes: { value: "", name: "", type: "" },
        };

        expect(factory.createFrom(targetElement, imageUrl)).toEqual({
          identifier: expect.any(String),
          type: ElementType.Link,
          locator: dummyLocator,
          value: targetElement.attributes.value,
          name: targetElement.attributes.name,
          imageUrl,
        });
        expect(locatorGenerator.generateFrom).toBeCalledWith(targetElement);
      });

      it("その他", () => {
        const targetElement = {
          tagname: "hogehoge",
          xpath: "",
          attributes: { value: "", name: "", type: "" },
        };

        expect(factory.createFrom(targetElement, imageUrl)).toEqual({
          identifier: expect.any(String),
          type: ElementType.Other,
          locator: dummyLocator,
          value: targetElement.attributes.value,
          name: targetElement.attributes.name,
          imageUrl,
        });
        expect(locatorGenerator.generateFrom).toBeCalledWith(targetElement);
      });
    });
  });
});
