import {
  InputGroupCollector,
  PageObjectOperation,
} from "@/domain/testScriptGeneration/model";

describe("InputGroupCollector", () => {
  describe("#collectFrom", () => {
    describe("渡された操作列の入力値セットを取得する", () => {
      it("change操作と，radioのクリックの場合はinput, checkboxの場合はinputのon/offがtrue/falseとして得られ，それ以外の操作は入力値はない", () => {
        const radio = {
          identifier: "radio",
          type: "RadioButton",
          locator: "",
          name: "radioName",
        } as const;

        const checkbox = {
          identifier: "checkbox",
          type: "CheckBox",
          locator: "",
        } as const;

        const other = {
          identifier: "other",
          type: "Other",
          locator: "",
        } as const;

        // type: changeの操作
        const operation1: PageObjectOperation = {
          target: other,
          type: "change",
          input: "input1\ninput1\ninput1", // 改行はエスケープされること
        };

        // ラジオボタンに対する操作
        const operation2: PageObjectOperation = {
          target: radio,
          type: "click",
          input: "input2\ninput2\ninput2", // 改行はエスケープされること
        };

        // チェックボックスに対する操作
        const operation3: PageObjectOperation = {
          target: checkbox,
          type: "click",
          input: "on",
        };

        // それ以外(無視されること)
        const operation4: PageObjectOperation = {
          target: other,
          type: "other",
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
          radio: "input2\\ninput2\\ninput2",
          checkbox: "true",
        });
      });
    });
  });
});
