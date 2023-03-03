import { GraphBasedScreenTransitionPathBuilder } from "@/domain/testScriptGeneration/model";

describe("GraphBasedScreenTransitionPathBuilder", () => {
  describe("#build", () => {
    const builder = new GraphBasedScreenTransitionPathBuilder();

    describe("渡された画面遷移列群を元にグラフを構築し、最適化した画面遷移パスを抽出する", () => {
      it("渡された画面遷移列が1つ", () => {
        const histories = [["Page1", "Page2", "Page3", "Page1", "Page3"]];

        expect(builder.build(histories)).toEqual([
          ["Page1", "Page3", "Page1"],
          ["Page1", "Page2", "Page3"],
        ]);
      });

      describe("渡された画面遷移列が複数", () => {
        it("それぞれに同じ画面が登場しない", () => {
          const histories = [
            ["Page1", "Page2"],
            ["Page3", "Page4"],
          ];

          expect(builder.build(histories)).toEqual([
            ["Page1", "Page2"],
            ["Page3", "Page4"],
          ]);
        });

        it("スタートが異なるが同じ画面に遷移", () => {
          const histories = [
            ["Page1", "Page3"],
            ["Page2", "Page3"],
          ];

          expect(builder.build(histories)).toEqual([
            ["Page1", "Page3"],
            ["Page2", "Page3"],
          ]);
        });

        it("途中の画面からスタート", () => {
          const histories = [
            ["Page1", "Page2", "Page3"],
            ["Page2", "Page3"],
          ];

          expect(builder.build(histories)).toEqual([
            ["Page1", "Page2", "Page3"],
          ]);
        });

        it("1画面", () => {
          const histories = [["Page1"], ["Page2"]];

          expect(builder.build(histories)).toEqual([]);
        });
      });
    });
  });
});
