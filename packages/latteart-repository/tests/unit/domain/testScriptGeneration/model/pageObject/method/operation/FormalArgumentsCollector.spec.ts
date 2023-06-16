import { deepStrictEqual } from "assert";
import {
  PageObjectOperation,
  FormalArgumentCollector,
} from "@/domain/testScriptGeneration/model";

describe("FormalArgumentsCollector", () => {
  describe("#collect", () => {
    it("操作群からメソッド化した際の仮引数のリストを得ることができ、入力操作と，radio, checkboxへのクリックは仮引数をリスト化する", () => {
      const operation1: PageObjectOperation = {
        target: {
          identifier: "id1",
          type: "Other",
          locators: [],
        },
        type: "click",
        input: "",
      };

      const operation4: PageObjectOperation = {
        target: {
          identifier: "id4",
          type: "RadioButton",
          name: "name4",
          locators: [],
        },
        type: "click",
        input: "",
      };

      const operation5: PageObjectOperation = {
        target: {
          identifier: "id5",
          type: "Other",
          locators: [],
        },
        type: "change",
        input: "",
      };

      const operation6: PageObjectOperation = {
        target: {
          identifier: "id6",
          type: "CheckBox",
          locators: [],
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
