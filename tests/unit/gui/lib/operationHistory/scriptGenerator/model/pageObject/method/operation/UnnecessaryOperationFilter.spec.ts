import { UnnecessaryOperationFilter } from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/operation/UnnecessaryOperationFilter";
import {
  PageObjectOperation,
  ElementType,
} from "@/lib/operationHistory/scriptGenerator/model/pageObject/method/operation/PageObjectOperation";

describe("UnnecessaryOperationFilter", () => {
  describe("#filter", () => {
    it("操作種別がswitch_windowの操作は除外しない", () => {
      const operation1: PageObjectOperation = {
        target: {
          identifier: "",
          type: ElementType.Other,
          locator: "",
        },
        type: "switch_window",
        input: "",
      };

      const operations = new UnnecessaryOperationFilter().filter([operation1]);

      expect(operations).toEqual([operation1]);
    });

    it("操作対象要素の識別子が空の操作は除外する", () => {
      const operation1: PageObjectOperation = {
        target: {
          identifier: "",
          type: ElementType.Other,
          locator: "",
        },
        type: "change",
        input: "",
      };

      const operations = new UnnecessaryOperationFilter().filter([operation1]);

      expect(operations).toEqual([]);
    });

    it("changeイベントもしくはラジオボタン、チェックボックス、リンクへのclickイベント以外の操作は除外する", () => {
      const operation1: PageObjectOperation = {
        target: {
          identifier: "id",
          type: ElementType.Other,
          locator: "",
        },
        type: "change",
        input: "",
      };

      const operation2: PageObjectOperation = {
        target: {
          identifier: "id",
          type: ElementType.Link,
          locator: "",
        },
        type: "click",
        input: "",
      };

      const operation3: PageObjectOperation = {
        target: {
          identifier: "id",
          type: ElementType.RadioButton,
          locator: "",
        },
        type: "click",
        input: "",
      };

      const operation4: PageObjectOperation = {
        target: {
          identifier: "id",
          type: ElementType.CheckBox,
          locator: "",
        },
        type: "click",
        input: "",
      };

      // 除外対象
      const operation5: PageObjectOperation = {
        target: {
          identifier: "id",
          type: ElementType.SelectBox,
          locator: "",
        },
        type: "click",
        input: "",
      };

      // 除外対象
      const operation6: PageObjectOperation = {
        target: {
          identifier: "id",
          type: ElementType.Other,
          locator: "",
        },
        type: "other",
        input: "",
      };

      const operations = new UnnecessaryOperationFilter().filter([
        operation1,
        operation2,
        operation3,
        operation4,
        operation5,
        operation6,
      ]);

      expect(operations).toEqual([
        operation1,
        operation2,
        operation3,
        operation4,
      ]);
    });
  });
});
