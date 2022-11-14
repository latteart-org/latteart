/* tslint:disable:max-line-length */

import ScreenHistory from "@/lib/operationHistory/ScreenHistory";
import SequenceDiagramGraphConverter from "@/lib/operationHistory/graphConverter/SequenceDiagramGraphConverter";
import { Operation } from "@/lib/operationHistory/Operation";

describe("SequenceDiagramGraphConverterは", () => {
  describe("convertが呼ばれた場合、screenHistoryをMermaidのシーケンス図形式の文字列に変換して返す", () => {
    describe("1画面内かつ1オペレーション内でのバリエーション", () => {
      let testScreenHistory: ScreenHistory;
      const windowHandles = [
        { text: "window1-text", value: "window1-value", available: true },
      ];

      beforeEach(() => {
        testScreenHistory = new ScreenHistory([
          {
            url: "url1",
            title: "titie1",
            screenDef: "screenDef1",
            operationHistory: [
              {
                operation: Operation.createOperation({
                  elementInfo: { text: "elementValue1" } as any,
                  sequence: 1,
                  windowHandle: "window1-value",
                  isAutomatic: false,
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

      it("同一オペレーション内に目的、バグ、気づき全てなし", async () => {
        expect(
          (
            await SequenceDiagramGraphConverter.convert(
              testScreenHistory,
              windowHandles
            )
          ).graphText
        ).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: DUMMY_COMMENT;
deactivate s0;
end;
`
        );
      });

      it("同一オペレーション内に目的のみあり", async () => {
        testScreenHistory.body[0].operationHistory[0].intention = {
          value: "intent1",
          sequence: 1,
        } as any;

        expect(
          (
            await SequenceDiagramGraphConverter.convert(
              testScreenHistory,
              windowHandles
            )
          ).graphText
        ).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
alt (1)intent1;
opt (1)window1-text;
activate s0;
Note right of s0: DUMMY_COMMENT;
deactivate s0;
end;
end;
`
        );
      });

      it("同一オペレーション内にバグのみあり", async () => {
        testScreenHistory.body[0].operationHistory[0].bugs = [
          { value: "bug1", sequence: 1, tags: [] },
        ] as any;

        expect(
          (
            await SequenceDiagramGraphConverter.convert(
              testScreenHistory,
              windowHandles
            )
          ).graphText
        ).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)[bug]<br/>-<br/>bug1;
deactivate s0;
end;
`
        );
      });

      it("同一オペレーション内に気づきのみあり", async () => {
        testScreenHistory.body[0].operationHistory[0].notices = [
          { value: "notice1", sequence: 1, tags: [] },
        ] as any;

        expect(
          (
            await SequenceDiagramGraphConverter.convert(
              testScreenHistory,
              windowHandles
            )
          ).graphText
        ).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)<br/>-<br/>notice1;
deactivate s0;
end;
`
        );
      });

      it("同一オペレーション内にタグ付きの気づきのみあり", async () => {
        testScreenHistory.body[0].operationHistory[0].notices = [
          { value: "notice1", sequence: 1, tags: ["tag1", "tag2"] },
        ] as any;

        expect(
          (
            await SequenceDiagramGraphConverter.convert(
              testScreenHistory,
              windowHandles
            )
          ).graphText
        ).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)[tag1][tag2<br/>]<br/>-<br/>notice1;
deactivate s0;
end;
`
        );
      });

      it("同一オペレーション内に目的とバグのみあり", async () => {
        testScreenHistory.body[0].operationHistory[0].intention = {
          value: "intent1",
          sequence: 1,
        } as any;
        testScreenHistory.body[0].operationHistory[0].bugs = [
          { value: "bug1", sequence: 1, tags: [] },
        ] as any;

        expect(
          (
            await SequenceDiagramGraphConverter.convert(
              testScreenHistory,
              windowHandles
            )
          ).graphText
        ).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
alt (1)intent1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)[bug]<br/>-<br/>bug1;
deactivate s0;
end;
end;
`
        );
      });

      it("同一オペレーション内に目的と気づきのみあり", async () => {
        testScreenHistory.body[0].operationHistory[0].intention = {
          value: "intent1",
          sequence: 1,
        } as any;
        testScreenHistory.body[0].operationHistory[0].notices = [
          { value: "notice1", sequence: 1, tags: [] },
        ] as any;

        expect(
          (
            await SequenceDiagramGraphConverter.convert(
              testScreenHistory,
              windowHandles
            )
          ).graphText
        ).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
alt (1)intent1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)<br/>-<br/>notice1;
deactivate s0;
end;
end;
`
        );
      });

      it("同一オペレーション内にバグと気づきのみあり", async () => {
        testScreenHistory.body[0].operationHistory[0].bugs = [
          { value: "bug1", sequence: 1, tags: [] },
        ] as any;
        testScreenHistory.body[0].operationHistory[0].notices = [
          { value: "notice1", sequence: 1, tags: [] },
        ] as any;

        expect(
          (
            await SequenceDiagramGraphConverter.convert(
              testScreenHistory,
              windowHandles
            )
          ).graphText
        ).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)[bug]<br/>-<br/>bug1;
Note right of s0: (1-0)<br/>-<br/>notice1;
deactivate s0;
end;
`
        );
      });

      it("同一オペレーション内に目的とバグと気づき全てあり", async () => {
        testScreenHistory.body[0].operationHistory[0].intention = {
          value: "intent1",
          sequence: 1,
        } as any;
        testScreenHistory.body[0].operationHistory[0].bugs = [
          { value: "bug1", sequence: 1, tags: [] },
        ] as any;
        testScreenHistory.body[0].operationHistory[0].notices = [
          { value: "notice1", sequence: 1, tags: [] },
        ] as any;

        expect(
          (
            await SequenceDiagramGraphConverter.convert(
              testScreenHistory,
              windowHandles
            )
          ).graphText
        ).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
alt (1)intent1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)[bug]<br/>-<br/>bug1;
Note right of s0: (1-0)<br/>-<br/>notice1;
deactivate s0;
end;
end;
`
        );
      });
    });

    describe("1画面内かつ別オペレーションに紐づくノートあり", () => {
      let testScreenHistory: ScreenHistory;
      const windowHandles = [
        { text: "window1-text", value: "window1-value", available: true },
      ];

      beforeEach(() => {
        testScreenHistory = new ScreenHistory([
          {
            url: "url1",
            title: "titie1",
            screenDef: "screenDef1",
            operationHistory: [
              {
                operation: Operation.createOperation({
                  elementInfo: { text: "elementValue1" } as any,
                  sequence: 1,
                  windowHandle: "window1-value",
                  isAutomatic: false,
                }),
                intention: null,
                bugs: null,
                notices: null,
              },
              {
                operation: Operation.createOperation({
                  elementInfo: { text: "elementValue2" } as any,
                  sequence: 2,
                  windowHandle: "window1-value",
                  isAutomatic: false,
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

      it("同一オペレーション内に目的とバグと気づき全てあり", async () => {
        testScreenHistory.body[0].operationHistory[0].intention = {
          value: "intent1",
          sequence: 1,
        } as any;
        testScreenHistory.body[0].operationHistory[0].bugs = [
          { value: "bug1", sequence: 1, tags: [] },
        ] as any;
        testScreenHistory.body[0].operationHistory[0].notices = [
          { value: "notice1", sequence: 1, tags: [] },
        ] as any;
        testScreenHistory.body[0].operationHistory[1].intention = {
          value: "intent2",
          sequence: 2,
        } as any;
        testScreenHistory.body[0].operationHistory[1].bugs = [
          { value: "bug2", sequence: 2, tags: [] },
        ] as any;
        testScreenHistory.body[0].operationHistory[1].notices = [
          { value: "notice2", sequence: 2, tags: [] },
        ] as any;

        expect(
          (
            await SequenceDiagramGraphConverter.convert(
              testScreenHistory,
              windowHandles
            )
          ).graphText
        ).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
alt (1)intent1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)[bug]<br/>-<br/>bug1;
Note right of s0: (1-0)<br/>-<br/>notice1;
end;
end;
alt (2)intent2;
opt (2)window1-text;
Note right of s0: (2-0)[bug]<br/>-<br/>bug2;
Note right of s0: (2-0)<br/>-<br/>notice2;
deactivate s0;
end;
end;
`
        );
      });

      it("最後以外の目的の範囲内にバグも気づきもないケース", async () => {
        testScreenHistory.body[0].operationHistory[0].intention = {
          value: "intent1",
          sequence: 1,
        } as any;
        testScreenHistory.body[0].operationHistory[1].intention = {
          value: "intent2",
          sequence: 2,
        } as any;
        testScreenHistory.body[0].operationHistory[1].bugs = [
          { value: "bug2", sequence: 2, tags: [] },
        ] as any;
        testScreenHistory.body[0].operationHistory[1].notices = [
          { value: "notice2", sequence: 2, tags: [] },
        ] as any;

        expect(
          (
            await SequenceDiagramGraphConverter.convert(
              testScreenHistory,
              windowHandles
            )
          ).graphText
        ).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
alt (1)intent1;
opt (1)window1-text;
activate s0;
Note right of s0: DUMMY_COMMENT;
end;
end;
alt (2)intent2;
opt (2)window1-text;
Note right of s0: (2-0)[bug]<br/>-<br/>bug2;
Note right of s0: (2-0)<br/>-<br/>notice2;
deactivate s0;
end;
end;
`
        );
      });
    });

    describe("画面遷移ありで画面遷移したのちに最初の画面に戻ってくるパターン", () => {
      let testScreenHistory: ScreenHistory;
      const windowHandles = [
        { text: "window1-text", value: "window1-value", available: true },
      ];

      beforeEach(() => {
        testScreenHistory = new ScreenHistory([
          {
            url: "url1",
            title: "titie1",
            screenDef: "screenDef1",
            operationHistory: [
              {
                operation: Operation.createOperation({
                  type: "type1",
                  elementInfo: { text: "elementValue1" } as any,
                  sequence: 1,
                  windowHandle: "window1-value",
                  isAutomatic: false,
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
                  type: "type2",
                  elementInfo: { text: "elementValue2" } as any,
                  sequence: 2,
                  windowHandle: "window1-value",
                  isAutomatic: false,
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
                  type: "type3",
                  elementInfo: { text: "elementValue3" } as any,
                  sequence: 3,
                  windowHandle: "window1-value",
                  isAutomatic: false,
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

      it("全ての画面に目的、バグ、気づきありでそれぞれ同一オペレーション内に目的とバグと気づき全てあり", async () => {
        testScreenHistory.body[0].operationHistory[0].intention = {
          value: "intent1",
          sequence: 1,
        } as any;
        testScreenHistory.body[0].operationHistory[0].bugs = [
          { value: "bug1", sequence: 1, tags: [] },
        ] as any;
        testScreenHistory.body[0].operationHistory[0].notices = [
          { value: "notice1", sequence: 1, tags: [] },
        ] as any;
        testScreenHistory.body[1].operationHistory[0].intention = {
          value: "intent2",
          sequence: 2,
        } as any;
        testScreenHistory.body[1].operationHistory[0].bugs = [
          { value: "bug2", sequence: 2, tags: [] },
        ] as any;
        testScreenHistory.body[1].operationHistory[0].notices = [
          { value: "notice2", sequence: 2, tags: [] },
        ] as any;
        testScreenHistory.body[2].operationHistory[0].intention = {
          value: "intent3",
          sequence: 3,
        } as any;
        testScreenHistory.body[2].operationHistory[0].bugs = [
          { value: "bug3", sequence: 3, tags: [] },
        ] as any;
        testScreenHistory.body[2].operationHistory[0].notices = [
          { value: "notice3", sequence: 3, tags: [] },
        ] as any;

        expect(
          (
            await SequenceDiagramGraphConverter.convert(
              testScreenHistory,
              windowHandles
            )
          ).graphText
        ).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
participant s1 as screenDef2;
alt (1)intent1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)[bug]<br/>-<br/>bug1;
Note right of s0: (1-0)<br/>-<br/>notice1;
s0 ->> s1: (1)type1: elementValue1;
deactivate s0;
activate s1;
end;
end;
alt (2)intent2;
opt (2)window1-text;
Note right of s1: (2-0)[bug]<br/>-<br/>bug2;
Note right of s1: (2-0)<br/>-<br/>notice2;
s1 ->> s0: (2)type2: elementValue2;
deactivate s1;
activate s0;
end;
end;
alt (3)intent3;
opt (3)window1-text;
Note right of s0: (3-0)[bug]<br/>-<br/>bug3;
Note right of s0: (3-0)<br/>-<br/>notice3;
deactivate s0;
end;
end;
`
        );
      });
    });

    describe("自画面遷移の場合", () => {
      let testScreenHistory: ScreenHistory;
      const windowHandles = [
        { text: "window1-text", value: "window1-value", available: true },
      ];

      beforeEach(() => {
        testScreenHistory = new ScreenHistory([
          {
            url: "url1",
            title: "titie1",
            screenDef: "screenDef1",
            operationHistory: [
              {
                operation: Operation.createOperation({
                  type: "type1",
                  elementInfo: { text: "elementValue1" } as any,
                  sequence: 1,
                  windowHandle: "window1-value",
                  isAutomatic: false,
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
                  type: "type2",
                  elementInfo: { text: "elementValue2" } as any,
                  sequence: 3,
                  windowHandle: "window1-value",
                  isAutomatic: false,
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

      it("同一画面に対してエッジを張る", async () => {
        expect(
          (
            await SequenceDiagramGraphConverter.convert(
              testScreenHistory,
              windowHandles
            )
          ).graphText
        ).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
s0 ->> s0: (1)type1: elementValue1;
deactivate s0;
activate s0;
Note right of s0: DUMMY_COMMENT;
deactivate s0;
end;
`
        );
      });
    });

    describe("画面遷移した直後に操作を介さずに再度画面遷移した場合", () => {
      let testScreenHistory: ScreenHistory;
      const windowHandles = [
        { text: "window1-text", value: "window1-value", available: true },
      ];

      beforeEach(() => {
        testScreenHistory = new ScreenHistory([
          {
            url: "url1",
            title: "titie1",
            screenDef: "screenDef1",
            operationHistory: [
              {
                operation: Operation.createOperation({
                  type: "screen_transition",
                  elementInfo: null,
                  sequence: 1,
                  windowHandle: "window1-value",
                  isAutomatic: false,
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
                  type: "type2",
                  elementInfo: { text: "elementValue2" } as any,
                  sequence: 2,
                  windowHandle: "window1-value",
                  isAutomatic: false,
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

      it("画面遷移時のエッジにはscreen_transitionを表示して対応する要素は空白として表示する", async () => {
        expect(
          (
            await SequenceDiagramGraphConverter.convert(
              testScreenHistory,
              windowHandles
            )
          ).graphText
        ).toEqual(
          `sequenceDiagram;
participant s0 as screenDef1;
participant s1 as screenDef2;
opt (1)window1-text;
activate s0;
s0 ->> s1: (1)screen_transition: ;
deactivate s0;
activate s1;
Note left of s1: DUMMY_COMMENT;
deactivate s1;
end;
`
        );
      });
    });
  });

  describe("画面ノードが表示されているとき", () => {
    const windowHandles = [
      { text: "window1-text", value: "window1-value", available: true },
    ];

    it("画面ノードの文言を改行した上、一定文字数に達したら以降省略して表示する", async () => {
      const testScreenHistory = new ScreenHistory([
        {
          url: "url1",
          title: "title1",
          screenDef: "hogehogehugahugapiyopiyofoobarhogehogehugahugapiyopiyo",
          operationHistory: [
            {
              operation: Operation.createOperation({
                elementInfo: { text: "elementValue1" } as any,
                sequence: 1,
                windowHandle: "window1-value",
                isAutomatic: false,
              }),
              intention: { value: "intent1", sequence: 1 } as any,
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
          await SequenceDiagramGraphConverter.convert(
            testScreenHistory,
            windowHandles
          )
        ).graphText
      ).toEqual(
        `sequenceDiagram;
participant s0 as hogehogehugahug<br/>apiyopiyofoobar<br/>hogehogehugahug<br/>...;
alt (1)intent1;
opt (1)window1-text;
activate s0;
Note right of s0: DUMMY_COMMENT;
deactivate s0;
end;
end;
`
      );
    });
  });

  describe("シーケンス図にバグや気づきのノートが表示されているとき", () => {
    const windowHandles = [
      { text: "window1-text", value: "window1-value", available: true },
    ];

    it("ノートの文言は16文字(2バイト文字は2文字とカウント)毎に改行して表示する", async () => {
      const testScreenHistory = new ScreenHistory([
        {
          url: "url1",
          title: "title1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: Operation.createOperation({
                elementInfo: { text: "elementValue1" } as any,
                sequence: 1,
                windowHandle: "window1-value",
                isAutomatic: false,
              }),
              intention: null,
              bugs: [
                { value: "bug1bug1バグ1バグ1bug1bug1", sequence: 1, tags: [] },
              ] as any,
              notices: [
                { value: "notice1notice1気づき1not", sequence: 1, tags: [] },
              ] as any,
            },
          ],
          screenElements: [],
          inputElements: [],
        },
      ]);

      expect(
        (
          await SequenceDiagramGraphConverter.convert(
            testScreenHistory,
            windowHandles
          )
        ).graphText
      ).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
opt (1)window1-text;
activate s0;
Note right of s0: (1-0)[bug]<br/>-<br/>bug1bug1バグ1バ<br/>グ1bug1bug1;
Note right of s0: (1-0)<br/>-<br/>notice1notice1気<br/>づき1not;
deactivate s0;
end;
`
      );
    });
  });

  describe("シーケンス図に画面遷移を示す矢印が表示されているとき", () => {
    const windowHandles = [
      { text: "window1-text", value: "window1-value", available: true },
    ];

    it("エッジ文字列に表示する遷移時のトリガーとなる要素のvalue値に改行が含まれる場合は改行を半角スペースに変換して表示する", async () => {
      const testScreenHistory = new ScreenHistory([
        {
          url: "url1",
          title: "title1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "type1",
                elementInfo: { text: "element\r\nValue1" } as any,
                sequence: 1,
                windowHandle: "window1-value",
                isAutomatic: false,
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
          title: "title2",
          screenDef: "screenDef2",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "type2",
                elementInfo: { text: "elementValue2" } as any,
                sequence: 2,
                windowHandle: "window1-value",
                isAutomatic: false,
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
          await SequenceDiagramGraphConverter.convert(
            testScreenHistory,
            windowHandles
          )
        ).graphText
      ).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
participant s1 as screenDef2;
opt (1)window1-text;
activate s0;
s0 ->> s1: (1)type1: element Value1;
deactivate s0;
activate s1;
Note left of s1: DUMMY_COMMENT;
deactivate s1;
end;
`
      );
    });

    it('エッジ文字列に表示する遷移時のトリガーとなる要素のvalue値に「#;<>"」が含まれる場合は数値文字参照変換して表示する', async () => {
      const testScreenHistory = new ScreenHistory([
        {
          url: "url1",
          title: "title1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "type1",
                elementInfo: { text: 'aa##;;<<>>""aa' } as any,
                sequence: 1,
                windowHandle: "window1-value",
                isAutomatic: false,
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
          title: "title2",
          screenDef: "screenDef2",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "type2",
                elementInfo: { text: "elementValue2" } as any,
                sequence: 2,
                windowHandle: "window1-value",
                isAutomatic: false,
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
          await SequenceDiagramGraphConverter.convert(
            testScreenHistory,
            windowHandles
          )
        ).graphText
      ).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
participant s1 as screenDef2;
opt (1)window1-text;
activate s0;
s0 ->> s1: (1)type1: aa#35;#35;#59;#59;#60;#60;#62;#62;#34;#34;aa;
deactivate s0;
activate s1;
Note left of s1: DUMMY_COMMENT;
deactivate s1;
end;
`
      );
    });

    it("エッジ文字列に表示する遷移時のトリガーとなる要素のvalue値が20文字より大きい場合、省略した上で末尾に...を表示する", async () => {
      const testScreenHistory = new ScreenHistory([
        {
          url: "url1",
          title: "title1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "type1",
                elementInfo: { text: "aaaaaaaaaaaaaaaaaaaaa" } as any,
                sequence: 1,
                windowHandle: "window1-value",
                isAutomatic: false,
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
          title: "title2",
          screenDef: "screenDef2",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "type2",
                elementInfo: { text: "elementValue2" } as any,
                sequence: 2,
                windowHandle: "window1-value",
                isAutomatic: false,
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
          await SequenceDiagramGraphConverter.convert(
            testScreenHistory,
            windowHandles
          )
        ).graphText
      ).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
participant s1 as screenDef2;
opt (1)window1-text;
activate s0;
s0 ->> s1: (1)type1: aaaaaaaaaaaaaaaaaaaa...;
deactivate s0;
activate s1;
Note left of s1: DUMMY_COMMENT;
deactivate s1;
end;
`
      );
    });
  });

  describe("タブ切り替えが行われたとき", () => {
    const windowHandles = [
      { text: "window1-text", value: "window1-value", available: true },
      { text: "window2-text", value: "window2-value", available: false },
    ];

    it("タブ切り替え後に表示するものが有る場合、問題なしが表示されない", async () => {
      const testScreenHistory = new ScreenHistory([
        {
          url: "url1",
          title: "title1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "type1",
                elementInfo: { text: "elementValue1" } as any,
                sequence: 1,
                windowHandle: "window1-value",
                isAutomatic: false,
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
          title: "title1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "type2",
                elementInfo: { text: "elementValue2" } as any,
                sequence: 2,
                windowHandle: "window2-value",
                isAutomatic: false,
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
          title: "title3",
          screenDef: "screenDef3",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "type3",
                elementInfo: { text: "elementValue3" } as any,
                sequence: 3,
                windowHandle: "window2-value",
                isAutomatic: false,
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
          await SequenceDiagramGraphConverter.convert(
            testScreenHistory,
            windowHandles
          )
        ).graphText
      ).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
participant s1 as screenDef3;
opt (1)window1-text;
activate s0;
s0 --x s0: ;
deactivate s0;
end;
opt (2)window2-text;
activate s0;
s0 ->> s1: (2)type2: elementValue2;
deactivate s0;
activate s1;
Note left of s1: DUMMY_COMMENT;
deactivate s1;
end;
`
      );
    });

    it("タブ切り替え後に表示するものが無い場合、問題なしが表示される", async () => {
      const testScreenHistory = new ScreenHistory([
        {
          url: "url1",
          title: "title1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "type1",
                elementInfo: { text: "elementValue1" } as any,
                sequence: 1,
                windowHandle: "window1-value",
                isAutomatic: false,
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
          title: "title2",
          screenDef: "screenDef2",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "type2",
                elementInfo: { text: "elementValue2" } as any,
                sequence: 2,
                windowHandle: "window1-value",
                isAutomatic: false,
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
          title: "title3",
          screenDef: "screenDef3",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "type3",
                elementInfo: { text: "elementValue3" } as any,
                sequence: 3,
                windowHandle: "window2-value",
                isAutomatic: false,
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
          await SequenceDiagramGraphConverter.convert(
            testScreenHistory,
            windowHandles
          )
        ).graphText
      ).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
participant s1 as screenDef2;
participant s2 as screenDef3;
opt (1)window1-text;
activate s0;
s0 ->> s1: (1)type1: elementValue1;
deactivate s0;
activate s1;
s1 --x s1: ;
deactivate s1;
end;
opt (3)window2-text;
activate s2;
Note left of s2: DUMMY_COMMENT;
deactivate s2;
end;
`
      );
    });

    it("目的とタブ切り替えが同時に行われたとき", async () => {
      const testScreenHistory = new ScreenHistory([
        {
          url: "url1",
          title: "title1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "type1",
                elementInfo: { text: "elementValue1" } as any,
                sequence: 1,
                windowHandle: "window1-value",
                isAutomatic: false,
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
          title: "title2",
          screenDef: "screenDef2",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "type2",
                elementInfo: { text: "elementValue2" } as any,
                sequence: 2,
                windowHandle: "window1-value",
                isAutomatic: false,
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
          title: "title1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: Operation.createOperation({
                type: "type3",
                elementInfo: { text: "elementValue3" } as any,
                sequence: 3,
                windowHandle: "window2-value",
                isAutomatic: false,
              }),
              intention: { value: "intent3", sequence: 3 } as any,
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
          await SequenceDiagramGraphConverter.convert(
            testScreenHistory,
            windowHandles
          )
        ).graphText
      ).toEqual(
        `sequenceDiagram;
participant s0 as screenDef1;
participant s1 as screenDef2;
opt (1)window1-text;
activate s0;
s0 ->> s1: (1)type1: elementValue1;
deactivate s0;
activate s1;
s1 --x s1: ;
deactivate s1;
Note right of s0: DUMMY_COMMENT;
end;
alt (3)intent3;
opt (3)window2-text;
activate s0;
Note right of s0: DUMMY_COMMENT;
deactivate s0;
end;
end;
`
      );
    });
  });
});
