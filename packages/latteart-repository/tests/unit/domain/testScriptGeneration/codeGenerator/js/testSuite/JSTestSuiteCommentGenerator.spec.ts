import { JSTestSuiteCommentGenerator } from "@/domain/testScriptGeneration/codeGenerator/js/testSuite/JSTestSuiteCommentGenerator";
import { ScreenTransitionDiagram } from "@/domain/testScriptGeneration/docGenerator";

describe("JSTestSuiteCommentGenerator", () => {
  describe("#generateFrom", () => {
    it("渡されたテストスイート名と画面遷移図を元にドキュメントコメントを生成して返す", () => {
      const name = "testSuite1";
      const diagramText = "diagram";
      const diagram: ScreenTransitionDiagram = {
        toString: jest.fn().mockReturnValue(diagramText),
        strong: jest.fn(),
      };

      const comment = new JSTestSuiteCommentGenerator().generateFrom(
        name,
        diagram
      );

      expect(comment).toEqual(`\
@namespace ${name}
@mermaid
${diagramText}`);
    });
  });
});
