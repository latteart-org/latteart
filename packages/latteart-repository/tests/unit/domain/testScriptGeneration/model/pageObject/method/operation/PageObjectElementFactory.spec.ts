import { PageObjectElementFactoryImpl } from "@/domain/testScriptGeneration/model";
import { IdentifierGenerator } from "@/domain/testScriptGeneration/IdentifierGenerator";

describe("PageObjectElementFactoryImpl", () => {
  describe("#createFrom", () => {
    describe("ElementInfoとimageUrlから操作対象画面要素を生成する", () => {
      const imageUrl = "imageUrl";

      it("ラジオボタン", () => {
        const targetElement = {
          tagname: "INPUT",
          xpath: "",
          attributes: { value: "", name: "", type: "radio" },
          locators: [],
        };

        const factory = new PageObjectElementFactoryImpl();

        expect(
          factory.createFrom(targetElement, imageUrl, new IdentifierGenerator())
        ).toEqual({
          identifier: expect.any(String),
          type: "RadioButton",
          locators: [],
          value: targetElement.attributes.value,
          name: targetElement.attributes.name,
          imageUrl,
        });
      });

      it("チェックボックス", () => {
        const targetElement = {
          tagname: "INPUT",
          xpath: "",
          attributes: { value: "", name: "", type: "checkbox" },
          locators: [],
        };

        const factory = new PageObjectElementFactoryImpl();

        expect(
          factory.createFrom(targetElement, imageUrl, new IdentifierGenerator())
        ).toEqual({
          identifier: expect.any(String),
          type: "CheckBox",
          locators: [],
          value: targetElement.attributes.value,
          name: targetElement.attributes.name,
          imageUrl,
        });
      });

      it("セレクトボックス", () => {
        const targetElement = {
          tagname: "SELECT",
          xpath: "",
          attributes: { value: "", name: "", type: "" },
          locators: [],
        };

        const factory = new PageObjectElementFactoryImpl();

        expect(
          factory.createFrom(targetElement, imageUrl, new IdentifierGenerator())
        ).toEqual({
          identifier: expect.any(String),
          type: "SelectBox",
          locators: [],
          value: targetElement.attributes.value,
          name: targetElement.attributes.name,
          imageUrl,
        });
      });

      describe("ボタン", () => {
        describe.each([undefined])("カスタムボタン定義: なし", (option) => {
          it.each`
            tagname     | elementType | expectedType
            ${"INPUT"}  | ${"submit"} | ${"Button"}
            ${"INPUT"}  | ${"button"} | ${"Button"}
            ${"A"}      | ${""}       | ${"Link"}
            ${"BUTTON"} | ${""}       | ${"Button"}
            ${"SPAN"}   | ${""}       | ${"Other"}
            ${"IMG"}    | ${""}       | ${"Other"}
            ${"I"}      | ${""}       | ${"Other"}
          `(
            "$tagname $elementType => $expectedType",
            ({ tagname, elementType, expectedType }) => {
              const targetElement = {
                tagname,
                xpath: "",
                attributes: { value: "", name: "", type: elementType },
                locators: [],
              };

              const factory = new PageObjectElementFactoryImpl(option);

              expect(
                factory.createFrom(
                  targetElement,
                  imageUrl,
                  new IdentifierGenerator()
                )
              ).toEqual({
                identifier: expect.any(String),
                type: expectedType,
                locators: [],
                value: targetElement.attributes.value,
                name: targetElement.attributes.name,
                imageUrl,
              });
            }
          );
        });

        describe.each([
          {
            buttonDefinitions: [],
          },
        ])("カスタムボタン定義: %j", (option) => {
          it.each`
            tagname     | elementType | expectedType
            ${"INPUT"}  | ${"submit"} | ${"Other"}
            ${"INPUT"}  | ${"button"} | ${"Other"}
            ${"A"}      | ${""}       | ${"Link"}
            ${"BUTTON"} | ${""}       | ${"Other"}
            ${"SPAN"}   | ${""}       | ${"Other"}
            ${"IMG"}    | ${""}       | ${"Other"}
            ${"I"}      | ${""}       | ${"Other"}
          `(
            "$tagname $elementType => $expectedType",
            ({ tagname, elementType, expectedType }) => {
              const targetElement = {
                tagname,
                xpath: "",
                attributes: { value: "", name: "", type: elementType },
                locators: [],
              };

              const factory = new PageObjectElementFactoryImpl(option);

              expect(
                factory.createFrom(
                  targetElement,
                  imageUrl,
                  new IdentifierGenerator()
                )
              ).toEqual({
                identifier: expect.any(String),
                type: expectedType,
                locators: [],
                value: targetElement.attributes.value,
                name: targetElement.attributes.name,
                imageUrl,
              });
            }
          );
        });

        describe.each([
          {
            buttonDefinitions: [
              { tagname: "SPAN" },
              { tagname: "IMG" },
              { tagname: "I" },
            ],
          },
        ])("カスタムボタン定義: %j", (option) => {
          it.each`
            tagname     | elementType | expectedType
            ${"INPUT"}  | ${"submit"} | ${"Other"}
            ${"INPUT"}  | ${"button"} | ${"Other"}
            ${"A"}      | ${""}       | ${"Link"}
            ${"BUTTON"} | ${""}       | ${"Other"}
            ${"SPAN"}   | ${""}       | ${"Button"}
            ${"IMG"}    | ${""}       | ${"Button"}
            ${"I"}      | ${""}       | ${"Button"}
          `(
            "$tagname $elementType => $expectedType",
            ({ tagname, elementType, expectedType }) => {
              const targetElement = {
                tagname,
                xpath: "",
                attributes: { value: "", name: "", type: elementType },
                locators: [],
              };

              const factory = new PageObjectElementFactoryImpl(option);

              expect(
                factory.createFrom(
                  targetElement,
                  imageUrl,
                  new IdentifierGenerator()
                )
              ).toEqual({
                identifier: expect.any(String),
                type: expectedType,
                locators: [],
                value: targetElement.attributes.value,
                name: targetElement.attributes.name,
                imageUrl,
              });
            }
          );
        });

        describe.each([
          {
            buttonDefinitions: [{ tagname: "INPUT" }],
          },
        ])("カスタムボタン定義: %j", (option) => {
          it.each`
            tagname     | elementType | expectedType
            ${"INPUT"}  | ${"submit"} | ${"Button"}
            ${"INPUT"}  | ${"button"} | ${"Button"}
            ${"A"}      | ${""}       | ${"Link"}
            ${"BUTTON"} | ${""}       | ${"Other"}
            ${"SPAN"}   | ${""}       | ${"Other"}
            ${"IMG"}    | ${""}       | ${"Other"}
            ${"I"}      | ${""}       | ${"Other"}
          `(
            "$tagname $elementType => $expectedType",
            ({ tagname, elementType, expectedType }) => {
              const targetElement = {
                tagname,
                xpath: "",
                attributes: { value: "", name: "", type: elementType },
                locators: [],
              };

              const factory = new PageObjectElementFactoryImpl(option);

              expect(
                factory.createFrom(
                  targetElement,
                  imageUrl,
                  new IdentifierGenerator()
                )
              ).toEqual({
                identifier: expect.any(String),
                type: expectedType,
                locators: [],
                value: targetElement.attributes.value,
                name: targetElement.attributes.name,
                imageUrl,
              });
            }
          );
        });

        describe.each([
          {
            buttonDefinitions: [
              {
                tagname: "INPUT",
                attribute: { name: "type", value: "submit" },
              },
            ],
          },
        ])("カスタムボタン定義: %j", (option) => {
          it.each`
            tagname     | elementType | expectedType
            ${"INPUT"}  | ${"submit"} | ${"Button"}
            ${"INPUT"}  | ${"button"} | ${"Other"}
            ${"A"}      | ${""}       | ${"Link"}
            ${"BUTTON"} | ${""}       | ${"Other"}
            ${"SPAN"}   | ${""}       | ${"Other"}
            ${"IMG"}    | ${""}       | ${"Other"}
            ${"I"}      | ${""}       | ${"Other"}
          `(
            "$tagname $elementType => $expectedType",
            ({ tagname, elementType, expectedType }) => {
              const targetElement = {
                tagname,
                xpath: "",
                attributes: { value: "", name: "", type: elementType },
                locators: [],
              };

              const factory = new PageObjectElementFactoryImpl(option);

              expect(
                factory.createFrom(
                  targetElement,
                  imageUrl,
                  new IdentifierGenerator()
                )
              ).toEqual({
                identifier: expect.any(String),
                type: expectedType,
                locators: [],
                value: targetElement.attributes.value,
                name: targetElement.attributes.name,
                imageUrl,
              });
            }
          );
        });
      });

      it("その他", () => {
        const targetElement = {
          tagname: "hogehoge",
          xpath: "",
          attributes: { value: "", name: "", type: "" },
          locators: [],
        };

        const factory = new PageObjectElementFactoryImpl();

        expect(
          factory.createFrom(targetElement, imageUrl, new IdentifierGenerator())
        ).toEqual({
          identifier: expect.any(String),
          type: "Other",
          locators: [],
          value: targetElement.attributes.value,
          name: targetElement.attributes.name,
          imageUrl,
        });
      });
    });
  });
});
