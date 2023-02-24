import InputValueTable from "@/lib/operationHistory/InputValueTable";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { OperationWithNotes } from "@/lib/operationHistory/types";
import { ElementInfo } from "latteart-client";

function createTestOperation(
  sequence: number,
  elementInfo: ElementInfo
): OperationWithNotes {
  return {
    operation: new OperationForGUI(
      sequence,
      `input${sequence}`,
      `eventType${sequence}`,
      elementInfo,
      "",
      "",
      "",
      "",
      false
    ),
    intention: null,
    bugs: [],
    notices: [],
  };
}

function createElement(index: number): ElementInfo {
  return {
    tagname: `elementTagname${index}`,
    text: `elementText${index}`,
    xpath: `elementXPath${index}`,
    value: `elementValue${index}`,
    checked: false,
    attributes: {
      id: `elementId${index}`,
      name: `elementName${index}`,
      type: `elementType${index}`,
    },
  };
}

describe("InputValueTableは", () => {
  it("引数なしで初期化すると、空のテーブルとして生成される", () => {
    const table = new InputValueTable();

    expect(table.columnSize).toStrictEqual(0);
    expect(table.headerColumns).toStrictEqual([]);
    expect(table.rows).toStrictEqual([]);
  });

  describe("コンストラクタで登録された情報を元にテーブルを構築する", () => {
    it("画面遷移が１つ", () => {
      const element1 = createElement(1);
      const element2 = createElement(2);

      const operation1 = createTestOperation(1, element1);
      const operation2 = createTestOperation(2, element2);
      const operation3 = {
        operation: OperationForGUI.createFromOtherOperation({
          other: createTestOperation(3, element2).operation,
          overrideParams: {
            input: "input2-2",
          },
        }),
        intention: null,
        bugs: [],
        notices: [],
      };

      const screenTransition = {
        sourceScreenDef: "screen1",
        targetScreenDef: "screen2",
        history: [
          operation1,
          operation2,
          operation3, // operation2と同一要素で入力が異なる
        ],
        screenElements: [],
        inputElements: [],
      };

      const table = new InputValueTable([screenTransition]);

      expect(table.columnSize).toStrictEqual(1);
      expect(table.headerColumns).toStrictEqual([
        {
          index: 0,
          notes: [],
          operationHistory: [],
          sourceScreenDef: "screen1",
          targetScreenDef: "screen2",
          trigger: {
            elementText: "elementText2",
            eventType: "eventType3",
          },
        },
      ]);
      expect(table.rows).toStrictEqual([
        {
          elementId: "elementId1",
          elementName: "elementName1",
          elementType: "elementType1",
          sequence: 1,
          inputs: [{ value: "input1", isDefaultValue: false }],
        },
        {
          elementId: "elementId2",
          elementName: "elementName2",
          elementType: "elementType2",
          sequence: 2,
          inputs: [{ value: "input2-2", isDefaultValue: false }],
        },
      ]);
    });

    it("画面遷移が2つ", () => {
      const element1 = createElement(1);
      const element2 = createElement(2);

      const operation1 = createTestOperation(1, element1);
      const operation2 = createTestOperation(2, element2);
      const operation3 = {
        operation: OperationForGUI.createFromOtherOperation({
          other: createTestOperation(3, element2).operation,
          overrideParams: {
            input: "input2-2",
          },
        }),
        intention: null,
        bugs: [],
        notices: [],
      };

      const screenTransition1 = {
        sourceScreenDef: "screen1",
        targetScreenDef: "screen2",
        history: [],
        screenElements: [element1, element2],
        inputElements: [],
      };
      const screenTransition2 = {
        sourceScreenDef: "screen2",
        targetScreenDef: "screen3",
        history: [
          operation1,
          operation2,
          operation3, // operation2と同一要素で入力が異なる
        ],
        screenElements: [element1, element2],
        inputElements: [],
      };

      const table = new InputValueTable([screenTransition1, screenTransition2]);

      expect(table.columnSize).toStrictEqual(2);

      expect(table.headerColumns).toStrictEqual([
        {
          index: 0,
          notes: [],
          operationHistory: [],
          sourceScreenDef: "screen1",
          targetScreenDef: "screen2",
          trigger: {
            elementText: "",
            eventType: "",
          },
        },
        {
          index: 1,
          notes: [],
          operationHistory: [],
          sourceScreenDef: "screen2",
          targetScreenDef: "screen3",
          trigger: {
            elementText: "elementText2",
            eventType: "eventType3",
          },
        },
      ]);

      expect(table.rows).toStrictEqual([
        {
          elementId: "elementId1",
          elementName: "elementName1",
          elementType: "elementType1",
          sequence: 1,
          inputs: [
            { value: "", isDefaultValue: true },
            { value: "input1", isDefaultValue: false },
          ],
        },
        {
          elementId: "elementId2",
          elementName: "elementName2",
          elementType: "elementType2",
          sequence: 2,
          inputs: [
            { value: "", isDefaultValue: true },
            { value: "input2-2", isDefaultValue: false },
          ],
        },
      ]);
    });

    describe("同一要素に対する操作が複数ある場合は、最後の操作を採用する", () => {
      it("xpathが同じものは同一要素とみなす", () => {
        const element1 = createElement(1);
        const transition = {
          sourceScreenDef: "screen1",
          targetScreenDef: "screen2",
          history: [
            createTestOperation(1, element1), // input: input1
            createTestOperation(2, element1), // input: input2
          ],
          screenElements: [],
          inputElements: [],
        };

        const table = new InputValueTable([transition]);

        expect(table.rows).toStrictEqual([
          {
            elementId: "elementId1",
            elementName: "elementName1",
            elementType: "elementType1",
            sequence: 1,
            inputs: [{ value: "input2", isDefaultValue: false }],
          },
        ]);
      });

      it("xpathの要素に[1]がついている場合、ついていない要素と同一とみなす", () => {
        const element1 = createElement(1);
        const element1_2 = {
          tagname: element1.tagname,
          text: element1.text,
          xpath: `${element1.xpath}[1]`,
          value: element1.value,
          checked: element1.checked,
          attributes: element1.attributes,
        };

        const screenTransition = {
          sourceScreenDef: "screen1",
          targetScreenDef: "screen2",
          history: [
            createTestOperation(1, element1), // input: input1
            createTestOperation(2, element1_2), // input: input2
          ],
          screenElements: [],
          inputElements: [],
        };

        const table = new InputValueTable([screenTransition]);

        expect(table.rows).toStrictEqual([
          {
            elementId: "elementId1",
            elementName: "elementName1",
            elementType: "elementType1",
            sequence: 1,
            inputs: [{ value: "input2", isDefaultValue: false }],
          },
        ]);
      });
    });
  });
});
