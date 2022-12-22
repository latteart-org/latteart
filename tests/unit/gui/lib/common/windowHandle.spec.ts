import { extractWindowHandles } from "@/lib/common/windowHandle";

describe("windowHandle", () => {
  describe("#extractWindowHandles", () => {
    it("操作履歴から重複を省いたウィンドウハンドルを抽出して返す", () => {
      const history = [
        { operation: { windowHandle: "aaa" } },
        { operation: { windowHandle: "bbb" } },
        { operation: { windowHandle: "aaa" } },
        { operation: { windowHandle: "ccc" } },
      ];

      const windowHandles = extractWindowHandles(history);

      expect(windowHandles).toEqual(["aaa", "bbb", "ccc"]);
    });
  });
});
