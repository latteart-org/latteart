import { deepStrictEqual } from "assert";
import {
  PageObjectOperation,
  ElementType,
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
        type: "click",
        input: "",
      };

      const operation4: PageObjectOperation = {
        target: {
          identifier: "id4",
          type: ElementType.RadioButton,
          name: "name4",
          locator: "",
        },
        type: "click",
        input: "",
      };

      const operation5: PageObjectOperation = {
        target: {
          identifier: "id5",
          type: ElementType.Other,
          locator: "",
        },
        type: "change",
        input: "",
      };

      const operation6: PageObjectOperation = {
        target: {
          identifier: "id6",
          type: ElementType.CheckBox,
          locator: "",
        },
        type: "click",
        input: "",
      };

      const actual = new FormalArgumentCollector().collect([
        operation1,
        operation4,
        operation5,
        operation6,
      ]);

      const expect = new Set(["id4", "id5", "id6"]);

      deepStrictEqual(actual, expect);
    });
  });
});
