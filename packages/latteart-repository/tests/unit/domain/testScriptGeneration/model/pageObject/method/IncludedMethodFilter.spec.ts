import {
  PageObjectOperation,
  IncludedMethodFilter,
  PageObjectMethod,
} from "@/domain/testScriptGeneration/model";

describe("IncludedMethodFilter", () => {
  describe("#filter", () => {
    it("既存のメソッドに包含されるメソッドは除外して返す", () => {
      const operation: PageObjectOperation = {
        target: {
          identifier: "",
          type: "Other",
          locator: "",
        },
        type: "other",
        input: "",
      };

      const method1: PageObjectMethod = {
        id: "",
        pageObjectId: "",
        operations: [operation],
        returnPageObjectId: "",
        includes: jest.fn((other) => {
          // 自身の他にmethod2を包含する
          if (other === method2) return true;
          if (other === method3) return false;
          return true;
        }),
      };

      const method2: PageObjectMethod = {
        id: "",
        pageObjectId: "",
        operations: [operation, operation],
        returnPageObjectId: "",
        includes: jest.fn((other) => {
          // 自身の他に何も包含しない
          if (other === method1) return false;
          if (other === method3) return false;
          return true;
        }),
      };

      const method3: PageObjectMethod = {
        id: "",
        pageObjectId: "",
        operations: [operation, operation, operation],
        returnPageObjectId: "",
        includes: jest.fn((other) => {
          // 自身の他にmethod2を包含する
          if (other === method1) return false;
          if (other === method2) return true;
          return true;
        }),
      };

      const filtered = new IncludedMethodFilter().filter([
        method3,
        method2,
        method1,
      ]);

      expect(filtered).toEqual([method3, method1]);
    });
  });
});
