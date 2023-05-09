import {
  PageObjectMethodImpl,
  PageObjectOperation,
} from "@/domain/testScriptGeneration/model";

describe("PageObjectMethodImpl", () => {
  describe("#includes", () => {
    it("渡されたメソッドの遷移先ページオブジェクトが同名で且つ全ての操作が包含される場合はtrueを返し、そうでなければfalseを返す", () => {
      const operation1: PageObjectOperation = {
        target: {
          identifier: "id1",
          type: "Other",
          locator: "",
        },
        type: "other",
        input: "",
      };
      const operation2: PageObjectOperation = {
        target: {
          identifier: "id2",
          type: "Other",
          locator: "",
        },
        type: "other",
        input: "",
      };
      const operation3: PageObjectOperation = {
        target: {
          identifier: "id3",
          type: "Other",
          locator: "",
        },
        type: "other",
        input: "",
      };

      const method = new PageObjectMethodImpl({
        id: "id1",
        pageObjectId: "Page1",
        operations: [operation1, operation2],
        returnPageObjectId: "Page1",
      });

      expect(
        method.includes({
          id: "",
          pageObjectId: "",
          operations: [operation1, operation2],
          returnPageObjectId: "Page1",
          includes: jest.fn(),
        })
      ).toEqual(true);
      expect(
        method.includes({
          id: "",
          pageObjectId: "",
          operations: [operation1],
          returnPageObjectId: "Page1",
          includes: jest.fn(),
        })
      ).toEqual(true);
      expect(
        method.includes({
          id: "",
          pageObjectId: "",
          operations: [operation2],
          returnPageObjectId: "Page1",
          includes: jest.fn(),
        })
      ).toEqual(true);

      expect(
        method.includes({
          id: "",
          pageObjectId: "",
          operations: [operation1, operation2],
          returnPageObjectId: "Page2",
          includes: jest.fn(),
        })
      ).toEqual(false);
      expect(
        method.includes({
          id: "",
          pageObjectId: "",
          operations: [operation1, operation3],
          returnPageObjectId: "Page1",
          includes: jest.fn(),
        })
      ).toEqual(false);
    });
  });
});
