import { extractWindowHandles } from "@/lib/common/windowHandle";

describe("windowHandle", () => {
  describe("#extractWindowHandles", () => {
    it("操作履歴から重複を省いたウィンドウハンドルを抽出して返す", () => {
      const history = [
        { operation: { windowHandle: "aaa", title: "test1" } },
        { operation: { windowHandle: "bbb", title: "test2" } },
        { operation: { windowHandle: "aaa", title: "test1" } },
        { operation: { windowHandle: "ccc", title: "test3" } },
      ];

      const windowHandles = extractWindowHandles(history);

      expect(windowHandles).toEqual([
        { windowHandle: "aaa", title: "test1" },
        { windowHandle: "bbb", title: "test2" },
        { windowHandle: "ccc", title: "test3" },
      ]);
    });
  });
});
