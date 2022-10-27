/* tslint:disable:max-line-length */

import ScreenHistory from "@/lib/operationHistory/ScreenHistory";
import ScreenTransitionDiagramGraphConverter from "@/lib/operationHistory/graphConverter/ScreenTransitionDiagramGraphConverter";
import { Operation } from "@/lib/operationHistory/Operation";

describe("ScreenTransitionDiagramGraphConverterは", () => {
  describe("convertが呼ばれた場合、screenHistoryをMermaidのフローチャート形式の文字列に変換して返す", () => {
    let testScreenHistory: ScreenHistory;

    describe("画面遷移なし", () => {
      beforeEach(() => {
        testScreenHistory = new ScreenHistory([
          {
            url: "urlA",
            title: "A",
            screenDef: "defA",
            operationHistory: [
              {
                operation: Operation.createOperation({
                  type: "type1",
                  elementInfo: { text: "elementValue1" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
            ],
            screenElements: [],
            inputElements: [],
          },
        ]);
      });

      it("画面A", async () => {
        expect(
          (
            await ScreenTransitionDiagramGraphConverter.convert(
              testScreenHistory,
              "window1"
            )
          ).graphText
        ).toEqual("graph TD;" + '0["defA"];' + "0;");
      });
    });

    describe("他画面遷移", () => {
      beforeEach(() => {
        testScreenHistory = new ScreenHistory([
          {
            url: "urlA",
            title: "A",
            screenDef: "defA",
            operationHistory: [
              {
                operation: Operation.createOperation({
                  type: "typeA-1",
                  elementInfo: { text: "elementValueA-1" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
              {
                operation: Operation.createOperation({
                  type: "typeA-2",
                  elementInfo: { text: "elementValueA-2" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
            ],
            screenElements: [],
            inputElements: [],
          },
          {
            url: "urlB",
            title: "B",
            screenDef: "defB",
            operationHistory: [
              {
                operation: Operation.createOperation({
                  type: "typeB-1",
                  elementInfo: { text: "elementValueB-1" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
              {
                operation: Operation.createOperation({
                  type: "typeB-2",
                  elementInfo: { text: "elementValueB-2" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
            ],
            screenElements: [],
            inputElements: [],
          },
          {
            url: "urlC",
            title: "C",
            screenDef: "defC",
            operationHistory: [
              {
                operation: Operation.createOperation({
                  type: "typeC-1",
                  elementInfo: { text: "elementValueC-1" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
              {
                operation: Operation.createOperation({
                  type: "typeC-2",
                  elementInfo: { text: "elementValueC-2" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
            ],
            screenElements: [],
            inputElements: [],
          },
        ]);
      });

      it("画面A → 画面B → 画面C", async () => {
        expect(
          (
            await ScreenTransitionDiagramGraphConverter.convert(
              testScreenHistory,
              "window1"
            )
          ).graphText
        ).toEqual(
          "graph TD;" +
            '0["defA"];' +
            '1["defB"];' +
            '2["defC"];' +
            "0;" +
            '0 --> |"typeA-2: elementValueA-2"|1;' +
            '1 --> |"typeB-2: elementValueB-2"|2;'
        );
      });
    });

    describe("他画面遷移して戻る", () => {
      beforeEach(() => {
        testScreenHistory = new ScreenHistory([
          {
            url: "urlA",
            title: "A",
            screenDef: "defA",
            operationHistory: [
              {
                operation: Operation.createOperation({
                  type: "typeA-1",
                  elementInfo: { text: "elementValueA-1" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
              {
                operation: Operation.createOperation({
                  type: "typeA-2",
                  elementInfo: { text: "elementValueA-2" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
            ],
            screenElements: [],
            inputElements: [],
          },
          {
            url: "urlB",
            title: "B",
            screenDef: "defB",
            operationHistory: [
              {
                operation: Operation.createOperation({
                  type: "typeB-1",
                  elementInfo: { text: "elementValueB-1" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
              {
                operation: Operation.createOperation({
                  type: "typeB-2",
                  elementInfo: { text: "elementValueB-2" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
            ],
            screenElements: [],
            inputElements: [],
          },
          {
            url: "urlA",
            title: "A",
            screenDef: "defA",
            operationHistory: [
              {
                operation: Operation.createOperation({
                  type: "typeA-1",
                  elementInfo: { text: "elementValueA-1" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
              {
                operation: Operation.createOperation({
                  type: "typeA-2",
                  elementInfo: { text: "elementValueA-2" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
            ],
            screenElements: [],
            inputElements: [],
          },
        ]);
      });

      it("画面A → 画面B → 画面A", async () => {
        expect(
          (
            await ScreenTransitionDiagramGraphConverter.convert(
              testScreenHistory,
              "window1"
            )
          ).graphText
        ).toEqual(
          "graph TD;" +
            '0["defA"];' +
            '1["defB"];' +
            "0;" +
            '0 --> |"typeA-2: elementValueA-2"|1;' +
            '1 --> |"typeB-2: elementValueB-2"|0;'
        );
      });
    });

    describe("同一画面遷移", () => {
      beforeEach(() => {
        testScreenHistory = new ScreenHistory([
          {
            url: "urlA",
            title: "A",
            screenDef: "defA",
            operationHistory: [
              {
                operation: Operation.createOperation({
                  type: "typeA-1",
                  elementInfo: { text: "elementValueA-1" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
              {
                operation: Operation.createOperation({
                  type: "typeA-2",
                  elementInfo: { text: "elementValueA-2" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
            ],
            screenElements: [],
            inputElements: [],
          },
          {
            url: "urlA",
            title: "A",
            screenDef: "defA",
            operationHistory: [
              {
                operation: Operation.createOperation({
                  type: "typeA-3",
                  elementInfo: { text: "elementValueA-3" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
              {
                operation: Operation.createOperation({
                  type: "typeA-4",
                  elementInfo: { text: "elementValueA-4" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
            ],
            screenElements: [],
            inputElements: [],
          },
        ]);
      });

      it("画面A → 画面A", async () => {
        expect(
          (
            await ScreenTransitionDiagramGraphConverter.convert(
              testScreenHistory,
              "window1"
            )
          ).graphText
        ).toEqual(
          "graph TD;" +
            '0["defA"];' +
            "0;" +
            '0 --> |"typeA-2: elementValueA-2"|0;'
        );
      });
    });

    describe("画面遷移直後に操作なしで遷移した場合", () => {
      beforeEach(() => {
        testScreenHistory = new ScreenHistory([
          {
            url: "urlA",
            title: "A",
            screenDef: "defA",
            operationHistory: [
              {
                operation: Operation.createOperation({
                  type: "typeA-1",
                  elementInfo: { text: "elementValueA-1" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
              {
                operation: Operation.createOperation({
                  type: "screen_transition",
                  elementInfo: null,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
            ],
            screenElements: [],
            inputElements: [],
          },
          {
            url: "urlB",
            title: "B",
            screenDef: "defB",
            operationHistory: [
              {
                operation: Operation.createOperation({
                  type: "typeB-1",
                  elementInfo: { text: "elementValueB-1" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
              {
                operation: Operation.createOperation({
                  type: "typeB-2",
                  elementInfo: { text: "elementValueB-2" } as any,
                  windowHandle: "window1",
                  isAutomation: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
            ],
            screenElements: [],
            inputElements: [],
          },
        ]);
      });

      it("画面A → 画面B", async () => {
        expect(
          (
            await ScreenTransitionDiagramGraphConverter.convert(
              testScreenHistory,
              "window1"
            )
          ).graphText
        ).toEqual(
          "graph TD;" +
            '0["defA"];' +
            '1["defB"];' +
            "0;" +
            '0 --> |"screen_transition: "|1;'
        );
      });
    });
  });

  describe("画面遷移図にエッジが表示されているとき", () => {
    let testScreenHistory: ScreenHistory;

    beforeEach(() => {
      testScreenHistory = new ScreenHistory([
        {
          url: "urlA",
          title: "A",
          screenDef: "defA",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "typeA-1",
                elementInfo: { text: "elementValueA-1" } as any,
                windowHandle: "window1",
                isAutomation: false,
              }),
              intention: null,
              bugs: null,
              notices: null,
            },
          ],
          screenElements: [],
          inputElements: [],
        },
        {
          url: "urlB",
          title: "B",
          screenDef: "defB",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "typeB-1",
                elementInfo: { text: "elementValueB-1" } as any,
                windowHandle: "window1",
                isAutomation: false,
              }),
              intention: null,
              bugs: null,
              notices: null,
            },
          ],
          screenElements: [],
          inputElements: [],
        },
      ]);
    });

    it("エッジ文字列に表示する遷移時のトリガーとなる要素のvalue値に改行が含まれる場合は改行を半角スペースに変換して表示する", async () => {
      testScreenHistory.body[0].operationHistory[0].operation.elementInfo!.text =
        "element\r\nValue1";

      expect(
        (
          await ScreenTransitionDiagramGraphConverter.convert(
            testScreenHistory,
            "window1"
          )
        ).graphText
      ).toEqual(
        "graph TD;" +
          '0["defA"];' +
          '1["defB"];' +
          "0;" +
          '0 --> |"typeA-1: element Value1"|1;'
      );
    });

    it("エッジ文字列に表示する遷移時のトリガーとなる要素のvalue値が20文字より大きい場合、省略した上で末尾に...を表示する", async () => {
      testScreenHistory.body[0].operationHistory[0].operation.elementInfo!.text =
        "aaaaaaaaaaaaaaaaaaaaa";

      expect(
        (
          await ScreenTransitionDiagramGraphConverter.convert(
            testScreenHistory,
            "window1"
          )
        ).graphText
      ).toEqual(
        "graph TD;" +
          '0["defA"];' +
          '1["defB"];' +
          "0;" +
          '0 --> |"typeA-1: aaaaaaaaaaaaaaaaaaaa..."|1;'
      );
    });

    it('エッジ文字列に表示する遷移時のトリガーとなる要素のvalue値に「#;<>"」が含まれる場合は数値文字参照変換して表示する', async () => {
      testScreenHistory.body[0].operationHistory[0].operation.elementInfo!.text =
        'aa##;;<<>>""aa';

      expect(
        (
          await ScreenTransitionDiagramGraphConverter.convert(
            testScreenHistory,
            "window1"
          )
        ).graphText
      ).toEqual(
        "graph TD;" +
          '0["defA"];' +
          '1["defB"];' +
          "0;" +
          '0 --> |"typeA-1: aa#35;#35;#59;#59;#60;#60;#62;#62;#34;#34;aa"|1;'
      );
    });
  });

  describe("タブを切り替えたとき", () => {
    it("window1 -> window2 -> windows1 -> windows3", async () => {
      const testScreenHistory = new ScreenHistory([
        {
          url: "url1",
          title: "titie1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: Operation.createOperation({
                elementInfo: {
                  attributes: { type: "type1" },
                  text: "elementValue1",
                } as any,
                windowHandle: "window1",
                isAutomation: false,
              }),
              intention: null,
              bugs: null,
              notices: null,
            },
          ],
          screenElements: [],
          inputElements: [],
        },
        {
          url: "url2",
          title: "titie2",
          screenDef: "screenDef2",
          operationHistory: [
            {
              operation: Operation.createOperation({
                elementInfo: {
                  attributes: { type: "type2" },
                  text: "elementValue2",
                } as any,
                windowHandle: "window2",
                isAutomation: false,
              }),
              intention: null,
              bugs: null,
              notices: null,
            },
          ],
          screenElements: [],
          inputElements: [],
        },
        {
          url: "url1",
          title: "titie1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: Operation.createOperation({
                elementInfo: {
                  attributes: { type: "type3" },
                  text: "elementValue3",
                } as any,
                windowHandle: "window1",
                isAutomation: false,
              }),
              intention: null,
              bugs: null,
              notices: null,
            },
          ],
          screenElements: [],
          inputElements: [],
        },
        {
          url: "url3",
          title: "titie3",
          screenDef: "screenDef3",
          operationHistory: [
            {
              operation: Operation.createOperation({
                elementInfo: {
                  attributes: { type: "type4" },
                  text: "elementValue4",
                } as any,
                windowHandle: "window3",
                isAutomation: false,
              }),
              intention: null,
              bugs: null,
              notices: null,
            },
          ],
          screenElements: [],
          inputElements: [],
        },
      ]);

      expect(
        (
          await ScreenTransitionDiagramGraphConverter.convert(
            testScreenHistory,
            "window1"
          )
        ).graphText
      ).toEqual("graph TD;" + '0["screenDef1"];' + "0;");

      expect(
        (
          await ScreenTransitionDiagramGraphConverter.convert(
            testScreenHistory,
            "window2"
          )
        ).graphText
      ).toEqual("graph TD;" + '0["screenDef2"];' + "0;");

      expect(
        (
          await ScreenTransitionDiagramGraphConverter.convert(
            testScreenHistory,
            "window3"
          )
        ).graphText
      ).toEqual("graph TD;" + '0["screenDef3"];' + "0;");
    });

    it("window1[scrDef1] -> window1[scrDef2] -> window2[scrDef3] -> window2[scrDef4] -> window1[scrDef5]", async () => {
      const testScreenHistory = new ScreenHistory([
        {
          url: "url1",
          title: "titie1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: Operation.createOperation({
                elementInfo: { text: "elementValue1" } as any,
                type: "type1",
                windowHandle: "window1",
                isAutomation: false,
              }),
              intention: null,
              bugs: null,
              notices: null,
            },
          ],
          screenElements: [],
          inputElements: [],
        },
        {
          url: "url2",
          title: "titie2",
          screenDef: "screenDef2",
          operationHistory: [
            {
              operation: Operation.createOperation({
                elementInfo: { text: "elementValue2" } as any,
                type: "type2",
                windowHandle: "window1",
                isAutomation: false,
              }),
              intention: null,
              bugs: null,
              notices: null,
            },
          ],
          screenElements: [],
          inputElements: [],
        },
        {
          url: "url3",
          title: "titie3",
          screenDef: "screenDef3",
          operationHistory: [
            {
              operation: Operation.createOperation({
                elementInfo: { text: "elementValue3" } as any,
                type: "type3",
                windowHandle: "window2",
                isAutomation: false,
              }),
              intention: null,
              bugs: null,
              notices: null,
            },
          ],
          screenElements: [],
          inputElements: [],
        },
        {
          url: "url4",
          title: "titie4",
          screenDef: "screenDef4",
          operationHistory: [
            {
              operation: Operation.createOperation({
                elementInfo: { text: "elementValue4" } as any,
                type: "type4",
                windowHandle: "window2",
                isAutomation: false,
              }),
              intention: null,
              bugs: null,
              notices: null,
            },
          ],
          screenElements: [],
          inputElements: [],
        },
        {
          url: "url5",
          title: "titie5",
          screenDef: "screenDef5",
          operationHistory: [
            {
              operation: Operation.createOperation({
                elementInfo: { text: "elementValue5" } as any,
                type: "type5",
                windowHandle: "window1",
                isAutomation: false,
              }),
              intention: null,
              bugs: null,
              notices: null,
            },
          ],
          screenElements: [],
          inputElements: [],
        },
        {
          url: "url5",
          title: "titie5",
          screenDef: "screenDef5",
          operationHistory: [
            {
              operation: Operation.createOperation({
                elementInfo: { text: "elementValue6" } as any,
                type: "type6",
                windowHandle: "window1",
                isAutomation: false,
              }),
              intention: null,
              bugs: null,
              notices: null,
            },
          ],
          screenElements: [],
          inputElements: [],
        },
      ]);

      expect(
        (
          await ScreenTransitionDiagramGraphConverter.convert(
            testScreenHistory,
            "window1"
          )
        ).graphText
      ).toEqual(
        "graph TD;" +
          '0["screenDef1"];' +
          '1["screenDef2"];' +
          '2["screenDef5"];' +
          "0;" +
          '0 --> |"type1: elementValue1"|1;' +
          '2 --> |"type5: elementValue5"|2;'
      );

      expect(
        (
          await ScreenTransitionDiagramGraphConverter.convert(
            testScreenHistory,
            "window2"
          )
        ).graphText
      ).toEqual(
        "graph TD;" +
          '0["screenDef3"];' +
          '1["screenDef4"];' +
          "0;" +
          '0 --> |"type3: elementValue3"|1;'
      );
    });
  });
});
