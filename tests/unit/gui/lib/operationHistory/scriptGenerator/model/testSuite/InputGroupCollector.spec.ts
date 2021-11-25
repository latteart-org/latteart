import { InputGroupCollector } from "@/lib/operationHistory/scriptGenerator/model/testSuite/InputGroupCollector";
import {
  ElementType,
  OperationType,
  PageObjectOperation,
} from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/operation/PageObjectOperation";

describe("InputGroupCollector", () => {
  describe("#collectFrom", () => {
    describe("渡された操作列の入力値セットを取得する", () => {
      it("change操作と，radioのクリックの場合はinput, checkboxの場合はinputのon/offがtrue/falseとして得られ，それ以外の操作は入力値はない", () => {
        const radio = {
          identifier: "radio",
          type: ElementType.RadioButton,
          locator: "",
          name: "radioName",
        };

        const checkbox = {
          identifier: "checkbox",
          type: ElementType.CheckBox,
          locator: "",
        };

        const other = {
          identifier: "other",
          type: ElementType.Other,
          locator: "",
        };

        // type: changeの操作
        const operation1: PageObjectOperation = {
          target: other,
          type: OperationType.Change,
          input: "input1\ninput1\ninput1", // 改行はエスケープされること
        };

        // ラジオボタンに対する操作
        const operation2: PageObjectOperation = {
          target: radio,
          type: OperationType.Click,
          input: "input2\ninput2\ninput2", // 改行はエスケープされること
        };

        // チェックボックスに対する操作
        const operation3: PageObjectOperation = {
          target: checkbox,
          type: OperationType.Click,
          input: "on",
        };

        // それ以外(無視されること)
        const operation4: PageObjectOperation = {
          target: other,
          type: OperationType.Other,
          input: "",
        };

        const result = new InputGroupCollector().collectFrom([
          operation1,
          operation2,
          operation3,
          operation4,
        ]);

        expect(result).toEqual({
          other: "input1\\ninput1\\ninput1",
          radioName: "input2\\ninput2\\ninput2",
          checkbox: "true",
        });
      });
    });
  });
});
