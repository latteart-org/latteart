import { ScreenTransitionGraphBuilderImpl } from "@/domain/testScriptGeneration/model/testSuite/screenTransitionPath/ScreenTransitionGraphBuilder";

describe("ScreenTransitionGraphBuilderImpl", () => {
  describe("#build", () => {
    it("渡された画面遷移のパスから画面遷移グラフを構築して返す", () => {
      const screenDefs = ["Page1", "Page2", "Page3", "Page1", "Page3"];

      const graph = new ScreenTransitionGraphBuilderImpl().build(screenDefs);

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
