import { Operation } from "@/lib/operationHistory/Operation";
import { SequenceSourceFactory } from "@/lib/operationHistory/scriptGenerator/model/sequencePath/SequenceSourceFactory";

describe("SequenceSourceFactory", () => {
  describe("#create", () => {
    it("画面遷移が発生するまでの操作群の内、screen_transition以外のものをグループ化して返す", () => {
      const operation1 = Operation.createOperation({
        screenDef: "Page1",
        type: "change",
        elementInfo: {
          tagname: "tagname1",
          xpath: "xpath1",
          attributes: {
            id: "id1",
          },
        },
        url: "url1",
        imageFilePath: "imageFilePath1",
      });

      const operation2 = Operation.createOperation({
        screenDef: "Page1",
        type: "change",
        elementInfo: {
          tagname: "tagname2",
          xpath: "xpath2",
          attributes: {
            id: "id2",
          },
        },
        url: "url1",
        imageFilePath: "imageFilePath1",
      });

      const operation3 = Operation.createOperation({
        screenDef: "Page2",
        type: "screen_transition",
        elementInfo: {
          tagname: "tagname3",
          xpath: "xpath3",
          attributes: {
            id: "id3",
          },
        },
        url: "url2",
        imageFilePath: "imageFilePath2",
      });

      const operation4 = Operation.createOperation({
        screenDef: "Page2",
        type: "change",
        elementInfo: {
          tagname: "tagname4",
          xpath: "xpath4",
          attributes: {
            id: "id4",
          },
        },
        url: "url2",
        imageFilePath: "imageFilePath2",
      });

      const operation5 = Operation.createOperation({
        screenDef: "Page3",
        type: "screen_transition",
        elementInfo: {
          tagname: "tagname3",
          xpath: "xpath3",
          attributes: {
            id: "id5",
          },
        },
        url: "url3",
        imageFilePath: "imageFilePath3",
      });

      const operation6 = Operation.createOperation({
        screenDef: "Page3",
        type: "change",
        elementInfo: {
          tagname: "tagname4",
          xpath: "xpath4",
          attributes: {
            id: "id6",
          },
        },
        url: "url3",
        imageFilePath: "imageFilePath3",
      });

      const histories = [
        [operation1, operation2, operation3, operation4],
        [operation5, operation6],
      ];

      const paths = new SequenceSourceFactory().create(histories);

      expect(paths).toEqual([
        [
          {
            screenDef: "Page1",
            operations: [operation1, operation2],
            url: "url1",
            imageUrl: "imageFilePath1",
          },
          {
            screenDef: "Page2",
            operations: [operation4],
            url: "url2",
            imageUrl: "imageFilePath2",
          },
        ],
        [
          {
            screenDef: "Page3",
            operations: [operation6],
            url: "url3",
            imageUrl: "imageFilePath3",
          },
        ],
      ]);
    });
  });
});
