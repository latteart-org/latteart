import {
  PageObjectOperation,
  DuplicateElementOperationFilter,
} from "@/domain/testScriptGeneration/model";

describe("DuplicateElementOperationFilter", () => {
  describe("#filter", () => {
    it("操作種別がswitch_windowの操作は除外しない", () => {
      const operation1: PageObjectOperation = {
        target: {
          identifier: "",
          type: "Other",
          locator: "",
        },
        type: "switch_window",
        input: "",
      };

      const operations = new DuplicateElementOperationFilter().filter([
        operation1,
      ]);

      expect(operations).toEqual([operation1]);
    });

    it("操作対象要素の識別子が空の操作は除外しない", () => {
      const operation1: PageObjectOperation = {
        target: {
          identifier: "",
          type: "Other",
          locator: "",
        },
        type: "change",
        input: "",
      };

      const operations = new DuplicateElementOperationFilter().filter([
        operation1,
      ]);

      expect(operations).toEqual([operation1]);
    });

    it("画面遷移するまでに同一の要素への操作が複数ある場合は最後のもの以外を除外する", () => {
      const element = {
        identifier: "id",
        type: "Other",
        locator: "",
      } as const;

      const operation1: PageObjectOperation = {
        target: element,
        type: "change",
        input: "aaa",
      };

      const operation2: PageObjectOperation = {
        target: element,
        type: "change",
        input: "bbb",
      };

      const operations = new DuplicateElementOperationFilter().filter([
        operation1,
        operation2,
      ]);

      expect(operations).toEqual([operation2]);
    });
  });
});
