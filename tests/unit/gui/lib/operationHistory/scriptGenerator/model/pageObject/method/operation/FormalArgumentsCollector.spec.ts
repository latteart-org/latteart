import { deepStrictEqual } from "assert";
import {
  PageObjectOperation,
  ElementType,
  OperationType,
} from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/operation/PageObjectOperation";
import { FormalArgumentCollector } from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/operation/FormalArgumentsCollector";

describe("FormalArgumentsCollector", () => {
  describe("#collect", () => {
    it("操作群からメソッド化した際の仮引数のリストを得ることができ、入力操作と，radio, checkboxへのクリックは仮引数をリスト化する", () => {
      const operation1: PageObjectOperation = {
        target: {
          identifier: "id1",
          type: ElementType.Other,
          locator: "",
        },
        type: OperationType.Click,
        input: "",
      };

      const operation4: PageObjectOperation = {
        target: {
          identifier: "id4",
          type: ElementType.RadioButton,
          name: "name4",
          locator: "",
        },
        type: OperationType.Click,
        input: "",
      };

      const operation5: PageObjectOperation = {
        target: {
          identifier: "id5",
          type: ElementType.Other,
          locator: "",
        },
        type: OperationType.Change,
        input: "",
      };

      const operation6: PageObjectOperation = {
        target: {
          identifier: "id6",
          type: ElementType.CheckBox,
          locator: "",
        },
        type: OperationType.Click,
        input: "",
      };

      const actual = new FormalArgumentCollector().collect([
        operation1,
        operation4,
        operation5,
        operation6,
      ]);

      const expect = new Set(["name4", "id5", "id6"]);

      deepStrictEqual(actual, expect);
    });
  });
});
