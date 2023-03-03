import { SequencePathBuilder } from "@/domain/testScriptGeneration/model";
import { TestScriptSourceOperation } from "@/domain/testScriptGeneration";

const emptyOperation: TestScriptSourceOperation = {
  screenDef: "",
  type: "",
  elementInfo: null,
  url: "",
  input: "",
  imageFilePath: "",
};

describe("SequencePathBuilder", () => {
  describe("#build", () => {
    it("操作列を元にテストシナリオのシーケンスパスを生成する", () => {
      const operation1: TestScriptSourceOperation = {
        ...emptyOperation,
        screenDef: "Page1",
        type: "click",
        elementInfo: {
          tagname: "tagname1",
          xpath: "xpath1",
          attributes: {
            id: "id1",
          },
          locator: "locator",
        },
        url: "url1",
        imageFilePath: "imageFilePath1",
      };

      const operation2: TestScriptSourceOperation = {
        ...emptyOperation,
        screenDef: "Page2",
        type: "change",
        elementInfo: {
          tagname: "SPAN",
          xpath: "xpath2",
          attributes: {
            id: "id2",
          },
          locator: "locator",
        },
        url: "url2",
        imageFilePath: "imageFilePath2",
      };

      const operation3: TestScriptSourceOperation = {
        ...emptyOperation,
        screenDef: "Page3",
        url: "url3",
        imageFilePath: "imageFilePath3",
      };

      const builder = new SequencePathBuilder();

      expect(builder.build([[operation1]])).toEqual([
        [
          {
            className: "Page1",
            destination: "Page1",
            destinationUrl: "url1",
            operations: [operation1],
            url: "url1",
            imageUrl: "imageFilePath1",
          },
        ],
      ]);

      expect(builder.build([[operation2]])).toEqual([
        [
          {
            className: "Page2",
            destination: "Page2",
            destinationUrl: "url2",
            operations: [operation2],
            url: "url2",
            imageUrl: "imageFilePath2",
          },
        ],
      ]);

      expect(builder.build([[operation3]])).toEqual([
        [
          {
            className: "Page3",
            destination: "Page3",
            destinationUrl: "url3",
            operations: [operation3],
            url: "url3",
            imageUrl: "imageFilePath3",
          },
        ],
      ]);
    });

    it("screenDef名をJSのクラス名として合法なものになるように変換する", () => {
      const operation1: TestScriptSourceOperation = {
        screenDef: "page1", // 先頭大文字に変換されること
        type: "change",
        elementInfo: {
          tagname: "tagname1",
          xpath: "xpath1",
          attributes: {
            id: "id1",
          },
          locator: "locator",
        },
        url: "url1",
        input: "",
        imageFilePath: "imageFilePath1",
      };

      const operation2: TestScriptSourceOperation = {
        screenDef: "0Page2", // 先頭数字の場合は先頭にアンダースコアが付与されること
        type: "change",
        elementInfo: {
          tagname: "A",
          xpath: "xpath2",
          attributes: {
            id: "id2",
          },
          locator: "locator",
        },
        url: "url2",
        input: "",
        imageFilePath: "imageFilePath2",
      };

      const builder = new SequencePathBuilder();

      expect(builder.build([[operation1]])).toEqual([
        [
          {
            className: "Page1",
            destination: "Page1",
            destinationUrl: "url1",
            operations: [{ ...operation1, screenDef: "Page1" }],
            url: "url1",
            imageUrl: "imageFilePath1",
          },
        ],
      ]);

      expect(builder.build([[operation2]])).toEqual([
        [
          {
            className: "_0page2",
            destination: "_0page2",
            destinationUrl: "url2",
            operations: [{ ...operation2, screenDef: "_0page2" }],
            url: "url2",
            imageUrl: "imageFilePath2",
          },
        ],
      ]);
    });
  });
});
