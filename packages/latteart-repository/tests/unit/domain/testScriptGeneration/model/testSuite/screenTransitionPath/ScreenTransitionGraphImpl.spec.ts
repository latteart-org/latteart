import {
  ScreenTransition,
  ScreenTransitionGraphImpl,
} from "@/domain/testScriptGeneration/model";

describe("ScreenTransitionGraphImpl", () => {
  describe("#toScreenNameGraph", () => {
    it("画面遷移の配列から画面名の遷移グラフを構築して返す", () => {
      const screenTransitions: ScreenTransition[] = [
        { sourceScreenName: "Page1", destScreenName: "Page2" },
        { sourceScreenName: "Page1", destScreenName: "Page3" },
        { sourceScreenName: "Page2", destScreenName: "Page3" },
        { sourceScreenName: "Page3", destScreenName: "Page1" },
      ];

      const graph = new ScreenTransitionGraphImpl(
        screenTransitions
      ).toScreenNameGraph();

      expect(
        Array.from(graph.entries()).map(([key, value]) => {
          return [key, Array.from(value.values())];
        })
      ).toEqual([
        ["Page1", ["Page2", "Page3"]],
        ["Page2", ["Page3"]],
        ["Page3", ["Page1"]],
      ]);
    });
  });
});
