/**
 * Copyright 2022 NTT Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import MermaidGraph from "../mermaidGraph/MermaidGraph";
import TextUtil from "./TextUtil";
import FlowChartGraphExtender from "../mermaidGraph/extender/FlowChartGraphExtender";
import { GraphView, GraphViewNode } from "latteart-client";
import InputValueTable from "../InputValueTable";

export interface FlowChartGraphCallback {
  onClickEdge: (sequence: number, inputValueTable: InputValueTable) => void;
  onClickScreenRect: (
    sequence: number,
    inputValueTable: InputValueTable
  ) => void;
}

export type FlowChartGraphExtenderSource = {
  edges: {
    source: {
      title: string;
      url: string;
      screenDef: string;
    };
    target: {
      title: string;
      url: string;
      screenDef: string;
    };
    sequences: number[];
  }[];
  source: {
    screens: {
      id: string;
      name: string;
    }[];
    nodes: Omit<GraphViewNode, "windowId">[];
    testStepIdToSequence: Map<string, number>;
  };
};

/**
 * Convert screen transition information to Mermaid screen transition diagram drawing text.
 * @returns Textualized screen transition diagram information.
 */
export async function convertToScreenTransitionDiagramGraph(
  view: GraphView,
  createFlowChartGraphExtender?: (
    source: FlowChartGraphExtenderSource
  ) => FlowChartGraphExtender
): Promise<{ window: { id: string; name: string }; graph: MermaidGraph }[]> {
  const graphs = view.store.windows.map((window) => {
    const edges = extractEdges(view, window);
    const graphTextLines = createGraphTextLines(edges, view.store.elements);

    const screens = view.nodes
      .filter(({ windowId }) => windowId === window.id)
      .map(({ screenId }) => screenId)
      .filter((screenId, index, array) => array.indexOf(screenId) === index)
      .flatMap((screenId) => {
        const screen = view.store.screens.find(({ id }) => screenId === id);
        return screen ? [screen] : [];
      });
    const screenTexts = screens.map(({ id, name }) => {
      const lineLength = 30;
      return `${id}["${TextUtil.escapeSpecialCharacters(
        TextUtil.ellipsis(TextUtil.toSingleLine(name), lineLength - 3)
      )}"];`;
    });

    const graphText = ["graph TD;", ...screenTexts, ...graphTextLines, ""].join(
      "\n"
    );

    const testStepIdToSequence = new Map(
      view.nodes
        .flatMap(({ testSteps }) => testSteps.map(({ id }) => id))
        .map((id, index) => [id, index + 1])
    );

    const graphExtender = createFlowChartGraphExtender
      ? createFlowChartGraphExtender({
          edges: edges.map(({ sourceNode, destNode }) => {
            return {
              source: { title: "", url: "", screenDef: sourceNode.screenId },
              target: { title: "", url: "", screenDef: destNode.screenId },
              sequences: sourceNode.testSteps.flatMap((testStep) => {
                const sequence = testStepIdToSequence.get(testStep.id);
                if (sequence === undefined) {
                  return [];
                }
                return [sequence];
              }),
            };
          }),
          source: { screens, nodes: view.nodes, testStepIdToSequence },
        })
      : {
          extendGraph: () => {
            /* nothing */
          },
          clearEvent: () => {
            /* nothing */
          },
        };

    console.debug(graphText);

    return { window, graph: { graphText, graphExtender } };
  });

  return graphs;
}

function extractEdges(view: GraphView, window: { id: string; name: string }) {
  return view.nodes.flatMap((node, index, array) => {
    const nextNode = array.at(index + 1);
    if (node.windowId !== window.id || nextNode?.windowId !== window.id) {
      return [];
    }

    return [{ sourceNode: node, destNode: nextNode }];
  });
}

function createGraphTextLines(
  edges: { sourceNode: GraphViewNode; destNode: GraphViewNode }[],
  elements: GraphView["store"]["elements"]
) {
  return edges.map(({ sourceNode, destNode }) => {
    const screenTransitionTrigger = (() => {
      const lastTestStep = sourceNode.testSteps.at(-1);

      if (!lastTestStep) {
        return "screen transition";
      }

      const operationType = lastTestStep.type;
      const lastTestStepElement = elements.find(
        ({ id }) => id === lastTestStep.targetElementId
      );
      const targetElement = TextUtil.escapeSpecialCharacters(
        TextUtil.ellipsis(
          TextUtil.toSingleLine(lastTestStepElement?.text ?? ""),
          20
        )
      );

      return `${operationType}: ${targetElement}`;
    })();

    return [
      `${sourceNode.screenId} --> |"${screenTransitionTrigger}"|${destNode.screenId};`,
    ];
  });
}
