/**
 * Copyright 2023 NTT Corporation.
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
import InputValueTable, { ScreenTransition } from "../InputValueTable";

export interface FlowChartGraphCallback {
  onClickEdge: (sequence: number, inputValueTable: InputValueTable) => void;
  onClickScreenRect: (
    sequence: number,
    inputValueTable: InputValueTable
  ) => void;
}

export type FlowChartGraphExtenderSource = {
  edges: Edge[];
  source: {
    screens: { id: string; name: string; sequence: number }[];
    nodes: Omit<GraphViewNode, "windowId">[];
  };
};

type Edge = {
  sourceScreenId: string;
  destScreenId: string;
  trigger?: {
    type: string;
    target?: { xpath: string; text: string };
    sequence: number;
  };
  details: ScreenTransition[];
};

type GraphSource = {
  window: { id: string; name: string };
  screens: { id: string; name: string; sequence: number }[];
  edges: Edge[];
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
  const graphModels = extractGraphSources(view);

  const graphs = graphModels.map(({ window, screens, edges }) => {
    const screenTexts = screens.map(({ id, name }) => {
      const lineLength = 30;
      return `${id}["${TextUtil.escapeSpecialCharacters(
        TextUtil.ellipsis(TextUtil.toSingleLine(name), lineLength - 3)
      )}"];`;
    });
    const graphTextLines = createGraphTextLines(edges);
    const graphText = ["graph TD;", ...screenTexts, ...graphTextLines, ""].join(
      "\n"
    );

    const graphExtender = createFlowChartGraphExtender
      ? createFlowChartGraphExtender({
          edges,
          source: { screens, nodes: view.nodes },
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

function extractGraphSources(view: GraphView): GraphSource[] {
  const testStepIdToSequence = new Map(
    view.nodes
      .flatMap(({ testSteps }) => testSteps.map(({ id }) => id))
      .map((id, index) => [id, index + 1])
  );

  return view.store.windows.map((window) => {
    const screens = view.nodes
      .filter(({ windowId }) => windowId === window.id)
      .map(({ screenId, testSteps }) => {
        const sequence =
          testStepIdToSequence.get(testSteps.at(0)?.id ?? "") ?? 0;
        return { screenId, sequence };
      })
      .filter(
        ({ screenId: id1 }, index, array) =>
          array.findIndex(({ screenId: id2 }) => id2 === id1) === index
      )
      .flatMap(({ screenId, sequence }) => {
        const screen = view.store.screens.find(({ id }) => screenId === id);
        if (!screen) {
          return [];
        }
        const { id, name } = screen;
        return [{ id, name, sequence }];
      });

    const edgeDetails = view.nodes.flatMap((node, index, array) => {
      const nextNode = array.at(index + 1);
      if (node.windowId !== window.id || nextNode?.windowId !== window.id) {
        return [];
      }

      const sourceScreen = screens.find(({ id }) => id === node.screenId);
      const destScreen = screens.find(({ id }) => id === nextNode.screenId);

      if (!sourceScreen || !destScreen) {
        return [];
      }

      const lastTestStep = node.testSteps.at(-1);

      const targetElement = view.store.elements.find(
        ({ id }) => id === lastTestStep?.targetElementId
      );

      const trigger = lastTestStep
        ? {
            type: lastTestStep.type,
            target: targetElement
              ? { xpath: targetElement.xpath, text: targetElement.text }
              : undefined,
            sequence: testStepIdToSequence.get(lastTestStep.id) ?? 0,
            input: lastTestStep.input,
            pageUrl: lastTestStep.pageUrl,
            pageTitle: lastTestStep.pageTitle,
          }
        : undefined;

      const inputElements = node.defaultValues.flatMap(
        ({ elementId, value }) => {
          const element = view.store.elements.find(
            ({ id }) => id === elementId
          );

          if (!element) {
            return [];
          }

          const inputs = node.testSteps
            .filter(({ targetElementId }) => {
              return targetElementId === elementId;
            })
            .flatMap(({ id, input }) => {
              const sequence = testStepIdToSequence.get(id);
              if (sequence === undefined || input === undefined) {
                return [];
              }

              return { sequence, value: input };
            });

          return [{ ...element, defaultValue: value, inputs }];
        }
      );

      const notes = node.testSteps.flatMap((testStep) => {
        return testStep.noteIds.flatMap((noteId) => {
          const note = view.store.notes.find(({ id }) => id === noteId);
          if (!note) {
            return [];
          }
          const imageFileUrl = note.imageFileUrl ?? testStep.imageFileUrl ?? "";

          const sequence = testStepIdToSequence.get(testStep.id) ?? 0;

          return [
            {
              ...note,
              imageFileUrl,
              tags: note.tags ?? [],
              sequence,
            },
          ];
        });
      });

      const testPurposes = view.store.testPurposes;

      return [
        {
          sourceScreen,
          destScreen,
          trigger,
          inputElements,
          notes,
          testPurposes,
        },
      ];
    });

    const edges = edgeDetails.reduce((acc: Edge[], detail) => {
      const foundEdge = acc.find((edge) => {
        return (
          edge.sourceScreenId === detail.sourceScreen.id &&
          edge.destScreenId === detail.destScreen.id &&
          edge.trigger?.type === detail.trigger?.type &&
          edge.trigger?.target?.xpath === detail.trigger?.target?.xpath
        );
      });

      if (foundEdge) {
        foundEdge.details.push(detail);
      } else {
        acc.push({
          sourceScreenId: detail.sourceScreen.id,
          destScreenId: detail.destScreen.id,
          trigger: detail.trigger,
          details: [detail],
        });
      }

      return acc;
    }, []);

    return { window, screens, edges };
  });
}

function createGraphTextLines(edges: Edge[]) {
  return edges.map(({ sourceScreenId, destScreenId, trigger }) => {
    const screenTransitionTrigger = (() => {
      if (!trigger) {
        return "screen transition";
      }

      const operationType = trigger.type;
      const targetElement = TextUtil.escapeSpecialCharacters(
        TextUtil.ellipsis(TextUtil.toSingleLine(trigger.target?.text ?? ""), 20)
      );

      return `${operationType}: ${targetElement}`;
    })();

    return `${sourceScreenId} --> |"${screenTransitionTrigger}"|${destScreenId};`;
  });
}
