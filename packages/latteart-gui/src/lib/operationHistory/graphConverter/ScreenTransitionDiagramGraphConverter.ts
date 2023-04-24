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
    screens: {
      id: string;
      name: string;
    }[];
    nodes: Omit<GraphViewNode, "windowId">[];
    testStepIdToSequence: Map<string, number>;
  };
};

type Edge = {
  sourceScreenId: string;
  destScreenId: string;
  trigger?: { type: string; targetElementId?: string; sequence: number };
  details: ScreenTransition[];
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
  const testStepIdToSequence = new Map(
    view.nodes
      .flatMap(({ testSteps }) => testSteps.map(({ id }) => id))
      .map((id, index) => [id, index + 1])
  );

  const graphs = view.store.windows.map((window) => {
    const screens = view.nodes
      .filter(({ windowId }) => windowId === window.id)
      .map(({ screenId }) => screenId)
      .filter((screenId, index, array) => array.indexOf(screenId) === index)
      .flatMap((screenId) => {
        const screen = view.store.screens.find(({ id }) => screenId === id);
        return screen ? [screen] : [];
      });
    const edges = extractEdges(view, window, screens, testStepIdToSequence);

    const screenTexts = screens.map(({ id, name }) => {
      const lineLength = 30;
      return `${id}["${TextUtil.escapeSpecialCharacters(
        TextUtil.ellipsis(TextUtil.toSingleLine(name), lineLength - 3)
      )}"];`;
    });
    const graphTextLines = createGraphTextLines(edges, view.store.elements);
    const graphText = ["graph TD;", ...screenTexts, ...graphTextLines, ""].join(
      "\n"
    );

    const graphExtender = createFlowChartGraphExtender
      ? createFlowChartGraphExtender({
          edges,
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

function extractEdges(
  view: GraphView,
  window: { id: string; name: string },
  screens: { id: string; name: string; elementIds: string[] }[],
  testStepIdToSequence: Map<string, number>
): Edge[] {
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

    const trigger = lastTestStep
      ? {
          type: lastTestStep.type,
          targetElementId: lastTestStep.targetElementId,
          sequence: testStepIdToSequence.get(lastTestStep.id) ?? 0,
          input: lastTestStep.input,
          pageUrl: lastTestStep.pageUrl,
          pageTitle: lastTestStep.pageTitle,
        }
      : undefined;

    const inputElements = node.defaultValues.flatMap(({ elementId, value }) => {
      const element = view.store.elements.find(({ id }) => id === elementId);

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
    });

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

  return edgeDetails.reduce((acc: Edge[], detail) => {
    const foundEdge = acc.find((edge) => {
      return (
        edge.sourceScreenId === detail.sourceScreen.id &&
        edge.destScreenId === detail.destScreen.id &&
        edge.trigger?.type === detail.trigger?.type &&
        edge.trigger?.targetElementId === detail.trigger?.targetElementId
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
}

function createGraphTextLines(
  edges: {
    sourceScreenId: string;
    destScreenId: string;
    trigger?: { type: string; targetElementId?: string };
  }[],
  elements: GraphView["store"]["elements"]
) {
  return edges.map(({ sourceScreenId, destScreenId, trigger }) => {
    const screenTransitionTrigger = (() => {
      if (!trigger) {
        return "screen transition";
      }

      const operationType = trigger.type;
      const triggerElement = elements.find(
        ({ id }) => id === trigger.targetElementId
      );
      const targetElement = TextUtil.escapeSpecialCharacters(
        TextUtil.ellipsis(TextUtil.toSingleLine(triggerElement?.text ?? ""), 20)
      );

      return `${operationType}: ${targetElement}`;
    })();

    return `${sourceScreenId} --> |"${screenTransitionTrigger}"|${destScreenId};`;
  });
}
