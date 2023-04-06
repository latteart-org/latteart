import { MermaidScreenTransitionDiagram } from "@/domain/testScriptGeneration/docGenerator/screenTransitionDiagram/MermaidScreenTransitionDiagram";
import {
  ScreenTransition,
  ScreenTransitionGraph,
} from "@/domain/testScriptGeneration/model";

describe("MermaidScreenTransitionDiagram", () => {
  const allScreenTransitions: ScreenTransition[] = [
    { sourceScreenName: "Page1", destScreenName: "Page2" },
    { sourceScreenName: "Page1", destScreenName: "Page3", trigger: "Trigger" },
    { sourceScreenName: "Page2", destScreenName: "Page3" },
    { sourceScreenName: "Page3", destScreenName: "Page1" },
  ];

  const strongScreenTransitions: ScreenTransition[] = [
    { sourceScreenName: "Page1", destScreenName: "Page2" },
    { sourceScreenName: "Page1", destScreenName: "Page3", trigger: "Trigger" },
    { sourceScreenName: "Page3", destScreenName: "Page1" },
  ];

  describe("#toString", () => {
    it("Mermaid形式の文字列を構築して返す", () => {
      const graph: ScreenTransitionGraph = {
        toScreenNameGraph: jest.fn(),
        collectScreenTransitions: jest
          .fn()
          .mockReturnValue(allScreenTransitions),
      };

      const diagram = new MermaidScreenTransitionDiagram(graph);

      expect(diagram.toString()).toEqual(`\
graph TD;
  Page1 --> Page2;
  Page1 --> Page3;
  Page2 --> Page3;
  Page3 --> Page1;`);
    });

    it("強調指定がある場合はその部分のみ強調したMermaid形式の文字列を構築して返す", () => {
      const graph: ScreenTransitionGraph = {
        toScreenNameGraph: jest.fn(),
        collectScreenTransitions: jest
          .fn()
          .mockReturnValue(allScreenTransitions),
      };

      const strong: ScreenTransitionGraph = {
        toScreenNameGraph: jest.fn(),
        collectScreenTransitions: jest
          .fn()
          .mockReturnValue(strongScreenTransitions),
      };

      const diagram = new MermaidScreenTransitionDiagram(graph, {
        strong,
      });

      expect(diagram.toString()).toEqual(`\
graph TD;
  Page1 ==> Page2;
  Page1 ==> |Trigger|Page3;
  Page2 --> Page3;
  Page3 ==> Page1;`);
    });
  });

  describe("#strong", () => {
    it("指定した画面遷移の部分のみ強調する", () => {
      const graph: ScreenTransitionGraph = {
        toScreenNameGraph: jest.fn(),
        collectScreenTransitions: jest
          .fn()
          .mockReturnValue(allScreenTransitions),
      };

      const diagram = new MermaidScreenTransitionDiagram(graph);

      expect(diagram.toString()).toEqual(`\
graph TD;
  Page1 --> Page2;
  Page1 --> Page3;
  Page2 --> Page3;
  Page3 --> Page1;`);

      const strong: ScreenTransitionGraph = {
        toScreenNameGraph: jest.fn(),
        collectScreenTransitions: jest
          .fn()
          .mockReturnValue(strongScreenTransitions),
      };

      diagram.strong(strong);

      expect(diagram.toString()).toEqual(`\
graph TD;
  Page1 ==> Page2;
  Page1 ==> |Trigger|Page3;
  Page2 --> Page3;
  Page3 ==> Page1;`);
    });
  });
});
