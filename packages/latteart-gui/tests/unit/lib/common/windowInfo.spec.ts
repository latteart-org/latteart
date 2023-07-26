import { extractWindowInfo } from "@/lib/common/windowInfo";

describe("window", () => {
  describe("#extractWindowInfo", () => {
    it("操作履歴から重複を省いたウィンドウ情報を抽出して返す", () => {
      const history = [
        { operation: { windowHandle: "aaa", title: "test1" } },
        { operation: { windowHandle: "bbb", title: "test2" } },
        { operation: { windowHandle: "aaa", title: "test1" } },
        { operation: { windowHandle: "ccc", title: "test3" } },
      ];

      const windows = extractWindowInfo(history);

      expect(windows).toEqual([
        { windowHandle: "aaa", title: "test1" },
        { windowHandle: "bbb", title: "test2" },
        { windowHandle: "ccc", title: "test3" },
      ]);
    });
  });
});
