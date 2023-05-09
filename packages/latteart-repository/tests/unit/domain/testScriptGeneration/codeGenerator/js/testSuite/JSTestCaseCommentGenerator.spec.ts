import { ScreenTransitionDiagram } from "@/domain/testScriptGeneration/docGenerator";
import { JSTestCaseCommentGenerator } from "@/domain/testScriptGeneration/codeGenerator/js/testSuite/JSTestCaseCommentGenerator";

describe("JSTestCaseCommentGenerator", () => {
  describe("#generateFrom", () => {
    it("渡されたテストケース名と画面遷移図を元にドキュメントコメントを生成して返す", () => {
      const testCaseName = "testCase1";
      const testSuiteName = "testSuite1";
      const diagramText = "diagram";
      const diagram: ScreenTransitionDiagram = {
        toString: jest.fn().mockReturnValue(diagramText),
        strong: jest.fn(),
      };

      const comment = new JSTestCaseCommentGenerator().generateFrom(
        testCaseName,
        testSuiteName,
        diagram
      );

      expect(comment).toEqual(`\
@function ${testCaseName}
@memberof ${testSuiteName}
@mermaid
${diagramText}`);
    });
  });
});
