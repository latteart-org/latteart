import { Operation } from "@/lib/operationHistory/Operation";
import ScreenHistory from "@/lib/operationHistory/ScreenHistory";
import {
  OperationHistory,
  ElementInfo,
  CoverageSource,
  InputElementInfo,
} from "@/lib/operationHistory/types";

describe("ScreenHistoryクラスは", () => {
  let testOperation1: Operation;
  let testOperation2: Operation;
  let testOperation3: Operation;
  let testElement1: ElementInfo;
  let testElement2: ElementInfo;

  beforeEach(() => {
    testElement1 = {
      tagname: "tagname1",
      text: "text1",
      xpath: "xpath1",
      attributes: {
        type: "type1",
        id: "id1",
        name: "name1",
        value: "value1",
      },
    };
    testElement2 = {
      tagname: "tagname2",
      text: "text2",
      xpath: "xpath2",
      attributes: {
        type: "type2",
        id: "id2",
        name: "name2",
        value: "value2",
      },
    };
    testOperation1 = new Operation(
      1,
      "input1",
      "type1",
      testElement1,
      "title1",
      "url1",
      "screenDef1",
      ""
    );

    testOperation2 = new Operation(
      2,
      "input2",
      "type2",
      testElement2,
      "title2",
      "url2",
      "screenDef2",
      ""
    );

    testOperation3 = new Operation(
      3,
      "input3",
      "type3",
      null,
      "title3",
      "url3",
      "screenDef3",
      ""
    );
  });

  describe("createFromOperationHistoryが呼ばれたとき指定された操作履歴を元にScreenHistoryインスタンスを構築して返す", () => {
    let coverageSources: CoverageSource[];

    beforeEach(() => {
      coverageSources = [
        {
          title: "title1",
          url: "url1",
          screenElements: [testElement1],
        },
        {
          title: "title2",
          url: "url2",
          screenElements: [testElement2],
        },
      ];
    });

    it("operationの画面定義が変更された場合は画面遷移として画面情報を追加登録する", () => {
      const operationHistory = [
        {
          operation: testOperation1,
          intention: null,
          bugs: null,
          notices: null,
        },
        {
          operation: testOperation2,
          intention: null,
          bugs: null,
          notices: null,
        },
      ] as OperationHistory;

      expect(
        ScreenHistory.createFromOperationHistory(
          operationHistory,
          coverageSources
        ).body
      ).toEqual([
        {
          url: "url1",
          title: "title1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: testOperation1,
              intention: null,
              bugs: null,
              notices: null,
            },
          ],
          screenElements: [testElement1],
          inputElements: [],
        },
        {
          url: "url2",
          title: "title2",
          screenDef: "screenDef2",
          operationHistory: [
            {
              operation: testOperation2,
              intention: null,
              bugs: null,
              notices: null,
            },
          ],
          screenElements: [testElement2],
          inputElements: [],
        },
      ]);
    });

    it("operationの画面定義が変わらない場合は画面遷移していないとして既存の操作履歴に操作を追加する", () => {
      testOperation2.screenDef = "screenDef1";
      const operationHistory = [
        {
          operation: testOperation1,
          intention: null,
          bugs: null,
          notices: null,
        },
        {
          operation: testOperation2,
          intention: null,
          bugs: null,
          notices: null,
        },
      ] as OperationHistory;

      expect(
        ScreenHistory.createFromOperationHistory(
          operationHistory,
          coverageSources
        ).body
      ).toEqual([
        {
          url: "url1",
          title: "title1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: testOperation1,
              intention: null,
              bugs: null,
              notices: null,
            },
            {
              operation: testOperation2,
              intention: null,
              bugs: null,
              notices: null,
            },
          ],
          screenElements: [testElement1],
          inputElements: [],
        },
      ]);
    });
  });

  describe("appearedScreensのgetterが呼ばれたとき画面遷移履歴内のScreenDefの値が同じ画面を同一画面としてまとめて、画面の配列を返却する", () => {
    beforeEach(() => {
      testOperation1.type = "screen_transition";
      testOperation2.type = "screen_transition";
      testOperation3.type = "screen_transition";
    });

    it("画面1→画面2→画面3", () => {
      const operationHistory = [
        {
          operation: testOperation1,
          intention: null,
          bugs: null,
          notices: null,
        },
        {
          operation: testOperation2,
          intention: null,
          bugs: null,
          notices: null,
        },
        {
          operation: testOperation3,
          intention: null,
          bugs: null,
          notices: null,
        },
      ] as OperationHistory;

      expect(
        ScreenHistory.createFromOperationHistory(operationHistory, [])
          .appearedScreens
      ).toEqual([
        {
          url: "url1",
          title: "title1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: testOperation1,
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
              operation: testOperation2,
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
              operation: testOperation3,
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

    it("画面1→画面2→画面2", () => {
      testOperation3.screenDef = "screenDef2";

      const operationHistory = [
        {
          operation: testOperation1,
          intention: null,
          bugs: null,
          notices: null,
        },
        {
          operation: testOperation2,
          intention: null,
          bugs: null,
          notices: null,
        },
        {
          operation: testOperation3,
          intention: null,
          bugs: null,
          notices: null,
        },
      ] as OperationHistory;

      expect(
        ScreenHistory.createFromOperationHistory(operationHistory, [])
          .appearedScreens
      ).toEqual([
        {
          url: "url1",
          title: "title1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: testOperation1,
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
              operation: testOperation2,
              intention: null,
              bugs: null,
              notices: null,
            },
            {
              operation: testOperation3,
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

    it("画面1→画面2→画面1", () => {
      testOperation3.screenDef = "screenDef1";

      const operationHistory = [
        {
          operation: testOperation1,
          intention: null,
          bugs: null,
          notices: null,
        },
        {
          operation: testOperation2,
          intention: null,
          bugs: null,
          notices: null,
        },
        {
          operation: testOperation3,
          intention: null,
          bugs: null,
          notices: null,
        },
      ] as OperationHistory;

      expect(
        ScreenHistory.createFromOperationHistory(operationHistory, [])
          .appearedScreens
      ).toEqual([
        {
          url: "url1",
          title: "title1",
          screenDef: "screenDef1",
          operationHistory: [
            {
              operation: testOperation1,
              intention: null,
              bugs: null,
              notices: null,
            },
            {
              operation: testOperation3,
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
              operation: testOperation2,
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
  });
  describe("tagNameAndXPathToUpperCaseが呼ばれたとき、operationHistory内のtagnameとxpathを大文字に変換する", () => {
    const upper = (text: string, isUpperCase: boolean): string => {
      if (isUpperCase) {
        return text.toUpperCase();
      }
      return text;
    };

    const createOperation = (isUpperCase: boolean): OperationHistory => {
      const elementInfo1: ElementInfo = {
        tagname: upper("svg", isUpperCase),
        text: "aaa",
        xpath: upper("/HTML/BODY/SPAN/A/MAT-ICON/svg", isUpperCase),
        attributes: { href: "http://localhost" },
      };
      const elementInfo2: ElementInfo = {
        tagname: "",
        text: "",
        xpath: "",
        attributes: { href: "" },
      };

      return [
        {
          intention: null,
          bugs: null,
          notices: null,
          operation: new Operation(1, "", "", null, "", "", "", ""),
        },
        {
          intention: null,
          bugs: null,
          notices: null,
          operation: new Operation(2, "", "", elementInfo1, "", "", "", ""),
        },
        {
          intention: null,
          bugs: null,
          notices: null,
          operation: new Operation(3, "", "", elementInfo2, "", "", "", ""),
        },
      ];
    };

    it("正常系", () => {
      const operationHistory1 = createOperation(false);
      const operationHistory2 = createOperation(true);
      const screenElements1 = [
        {
          tagname: upper("path", false),
          text: "aaa",
          xpath: upper("/HTML/BODY/SPAN/A/MAT-ICON/svg/path", false),
          attributes: { href: "http://localhost" },
        },
        { tagname: "", text: "", xpath: "", attributes: { href: "" } },
      ];
      const screenElements2 = [
        {
          tagname: upper("path", true),
          text: "aaa",
          xpath: upper("/HTML/BODY/SPAN/A/MAT-ICON/svg/path", true),
          attributes: { href: "http://localhost" },
        },
        { tagname: "", text: "", xpath: "", attributes: { href: "" } },
      ];

      ScreenHistory.tagNameAndXPathToUpperCase(operationHistory1);
      expect(operationHistory1).toEqual(operationHistory2);

      ScreenHistory.tagNameAndXPathToUpperCaseForElementInfo(
        screenElements1[0]
      );
      expect(screenElements1).toEqual(screenElements2);
    });
  });
});
