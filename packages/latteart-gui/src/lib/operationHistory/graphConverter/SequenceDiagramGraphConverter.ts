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

import type MermaidGraph from "../mermaidGraph/MermaidGraph";
import SequenceDiagramGraphExtender from "../mermaidGraph/extender/SequenceDiagramGraphExtender";
import TextUtil from "./TextUtil";
import { type SequenceView, type SequenceViewNode } from "latteart-client";

type NoteInfo = {
  sequence: number;
  index?: number;
  type: string;
  details: string;
};

export type SequenceDiagramGraphCallback = {
  onClickActivationBox: (sequences: number[]) => void;
  onClickEdge: (sequences: number[]) => void;
  onClickScreenRect: (sequence: number) => void;
  onClickNote: (note: NoteInfo) => void;
  onRightClickNote: (note: NoteInfo, eventInfo: { clientX: number; clientY: number }) => void;
};

type SourceNode = {
  window: { sequence: number; text: string };
  screenId: string;
  testSteps: SequenceViewNode["testSteps"];
  disabled?: boolean;
};

export type SequenceDiagramGraphExtenderSource = {
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
  notes: {
    sequence: number;
    index: number;
    type: string;
    value: string;
    details: string;
  }[];
  screens: {
    id: string;
    name: string;
  }[];
  nodes: (Omit<SequenceViewNode, "windowId"> & {
    window: { sequence: number; text: string };
  })[];
  testStepIdToSequence: Map<string, number>;
};

/**
 * Convert Sequence View model to Diagram Graphs.
 * @returns Graph text and graph extension information for each test purpose.
 */
export async function convertToSequenceDiagramGraphs(
  view: SequenceView,
  createSequenceDiagramGraphExtender?: (
    source: SequenceDiagramGraphExtenderSource
  ) => SequenceDiagramGraphExtender
): Promise<
  {
    sequence: number;
    testPurpose?: { value: string; details?: string };
    graph?: MermaidGraph;
    disabledNodeIndexes: number[];
  }[]
> {
  const testStepIdToSequence = new Map(
    view.scenarios
      .flatMap(({ nodes }) => nodes.flatMap(({ testSteps }) => testSteps.map(({ id }) => id)))
      .map((id, index) => [id, index + 1])
  );
  const windowIdToName = new Map(view.windows.map(({ id, name }) => [id, name]));

  const graphBuilder = createGraphBuilder(
    windowIdToName,
    testStepIdToSequence,
    createSequenceDiagramGraphExtender
  );

  return view.scenarios.map((scenario) => {
    const nodeScreenIds = scenario.nodes.map(({ screenId }) => screenId);
    const screens = view.screens.filter(({ id }) => nodeScreenIds.includes(id));

    const { graph, disabledNodeIndexes } = graphBuilder.build(screens, scenario.nodes);

    const firstTestStepId = scenario.nodes.at(0)?.testSteps.at(0)?.id ?? "";
    const firstSequence = testStepIdToSequence.get(firstTestStepId) ?? 0;

    const testPurpose = scenario.testPurpose;

    return {
      sequence: firstSequence,
      testPurpose: testPurpose
        ? { value: testPurpose.value, details: testPurpose.details }
        : undefined,
      graph,
      disabledNodeIndexes
    };
  });
}

function createGraphBuilder(
  windowIdToName: Map<string, string>,
  testStepIdToSequence: Map<string, number>,
  createSequenceDiagramGraphExtender?: (
    source: SequenceDiagramGraphExtenderSource
  ) => SequenceDiagramGraphExtender
) {
  return {
    build(screens: { id: string; name: string }[], nodes: SequenceViewNode[]) {
      if (screens.length === 0) {
        return { disabledNodeIndexes: [] };
      }

      const sourceNodes = createSourceNodes(nodes, windowIdToName, testStepIdToSequence);

      const graphText = buildGraphText({
        screens,
        nodes: sourceNodes,
        testStepIdToSequence
      });

      const notes = sourceNodes
        .flatMap(({ testSteps }) => testSteps)
        .flatMap((testStep) => {
          if (!testStep.notes) {
            return [];
          }

          return testStep.notes.map((note, index) => {
            return {
              sequence: testStepIdToSequence.get(testStep.id) ?? 0,
              index,
              type: note.tags.includes("bug") ? "bug" : "notice",
              details: note.details ?? "",
              value: note.value
            };
          });
        });

      const edges = sourceNodes.map((node, index, array) => {
        const nextNode = array.at(index + 1);

        return {
          source: { title: "", url: "", screenDef: node.screenId },
          target: {
            title: "",
            url: "",
            screenDef: (nextNode ?? node).screenId
          },
          sequences: node.testSteps.flatMap((testStep) => {
            const sequence = testStepIdToSequence.get(testStep.id);

            if (sequence === undefined) {
              return [];
            }

            return [sequence];
          })
        };
      });

      const graphExtender = createSequenceDiagramGraphExtender
        ? createSequenceDiagramGraphExtender({
            edges,
            notes,
            screens,
            nodes: sourceNodes,
            testStepIdToSequence
          })
        : {
            extendGraph: () => {
              /* nothing */
            },
            clearEvent: () => {
              /* nothing */
            }
          };

      const disabledNodeIndexes = sourceNodes
        .map((node, index) => {
          return { index, disabled: node.disabled ?? false };
        })
        .filter(({ disabled }) => disabled)
        .map(({ index }) => index);

      console.debug(graphText);

      return { graph: { graphText, graphExtender }, disabledNodeIndexes };
    }
  };
}

function createSourceNodes(
  nodes: SequenceViewNode[],
  windowIdToName: Map<string, string>,
  testStepIdToSequence: Map<string, number>
) {
  const firstSequence = testStepIdToSequence.get(nodes.at(0)?.testSteps.at(0)?.id ?? "");
  if (firstSequence === undefined) {
    return [];
  }

  const nodeChunks = nodes
    .filter((node) => {
      return node.windowId && node.screenId;
    })
    .reduce(
      (acc, node, index, nodes) => {
        const beforeNode = index > 0 ? nodes.at(index - 1) : undefined;

        if (beforeNode?.windowId !== node.windowId) {
          const windowName = windowIdToName.get(node.windowId);
          const sequence = testStepIdToSequence.get(node.testSteps.at(0)?.id ?? "");

          if (windowName !== undefined && sequence !== undefined) {
            acc.push({
              window: { sequence, text: windowName },
              nodes: []
            });
          }
        }

        acc.at(-1)?.nodes.push(node);

        return acc;
      },
      new Array<{
        window: { sequence: number; text: string };
        nodes: Omit<SequenceViewNode, "windowId">[];
      }>()
    );

  return nodeChunks.flatMap(({ window, nodes }) =>
    nodes.map(({ screenId, testSteps, disabled }) => {
      return {
        window,
        screenId,
        testSteps,
        disabled
      };
    })
  );
}

function buildGraphText(source: {
  screens: { id: string; name: string }[];
  nodes: SourceNode[];
  testStepIdToSequence: Map<string, number>;
}) {
  const nodeTexts = source.nodes.reduce((acc, node, index, nodes) => {
    const beforeNode = index > 0 ? nodes.at(index - 1) : undefined;
    const nextNode = nodes.at(index + 1);

    const screenTransitionTexts = buildScreenTransitionTexts(
      source.testStepIdToSequence,
      node,
      nextNode
    );

    const screenIndex = source.screens.findIndex(({ id }) => id === node.screenId);
    const beforeScreenIndex = source.screens.findIndex(({ id }) => id === beforeNode?.screenId);

    const contextTexts = (() => {
      const lines = [
        ...buildCommentTexts(node, source.testStepIdToSequence, "right"),
        ...screenTransitionTexts
      ];

      return lines.length === 0
        ? [
            `Note ${
              screenIndex >= 1 && screenIndex >= beforeScreenIndex ? "left" : "right"
            } of ${node.screenId}: DUMMY_COMMENT;`
          ]
        : lines;
    })();

    const nodeTexts = [
      `activate ${node.screenId};`,
      ...contextTexts,
      `deactivate ${node.screenId};`
    ];

    const scenarioItemTexts = [
      ...(() => {
        const startWindowText = `opt (${node.window.sequence})${node.window.text};`;

        if (node.window.text && beforeNode?.window.text !== node.window.text) {
          return [startWindowText];
        }

        return [];
      })(),
      ...nodeTexts,
      ...(() => {
        const endWindowText = "end;";

        if (node.window.text && nextNode?.window.text !== node.window.text) {
          return [endWindowText];
        }

        return [];
      })()
    ];

    return [...acc, ...scenarioItemTexts];
  }, new Array<string>());

  const screenTexts = source.screens.map(({ id, name }) => {
    const lineLength = 15;
    return `participant ${id} as ${TextUtil.escapeSpecialCharacters(
      TextUtil.lineBreak(TextUtil.ellipsis(TextUtil.toSingleLine(name), lineLength * 3), lineLength)
    )};`;
  });

  return ["sequenceDiagram;", ...screenTexts, ...nodeTexts, ""].join("\n");
}

function buildCommentTexts(
  node: Pick<SequenceViewNode, "testSteps" | "screenId">,
  testStepIdToSequence: Map<string, number>,
  position: "left" | "right"
) {
  return node.testSteps.flatMap((testStep) => {
    const sequence = testStepIdToSequence.get(testStep.id);

    return (
      testStep.notes?.map((note, index) => {
        const tags = TextUtil.lineBreak(
          `(${sequence}-${index})${note.tags
            .map((tag) => `[${TextUtil.escapeSpecialCharacters(tag)}]`)
            .join("")}`,
          16
        );
        const value = TextUtil.escapeSpecialCharacters(TextUtil.lineBreak(note.value, 16));

        return `Note ${position} of ${node.screenId}: ${tags}<br/>-<br/>${value};`;
      }) ?? []
    );
  });
}

function buildScreenTransitionTexts(
  testStepIdToSequence: Map<string, number>,
  node: SourceNode,
  nextNode?: SourceNode
) {
  if (!nextNode) {
    return [];
  }

  const isWindowChanged = nextNode.window.text !== node.window.text;
  const isDisabledChanged = node.disabled !== nextNode.disabled;

  if (isWindowChanged || isDisabledChanged) {
    return [`${node.screenId} --x ${node.screenId}: ;`];
  }

  const lastTestStep = node.testSteps.at(-1);

  const sequence = testStepIdToSequence.get(lastTestStep?.id ?? "");
  const operationType = lastTestStep?.type;
  const targetElement = TextUtil.escapeSpecialCharacters(
    TextUtil.ellipsis(TextUtil.toSingleLine(lastTestStep?.element?.text ?? ""), 20)
  );
  const screenTransitionTrigger = node.disabled
    ? "screen transition"
    : `(${sequence})${operationType}: ${targetElement}`;

  return [`${node.screenId} ->> ${nextNode.screenId}: ${screenTransitionTrigger};`];
}
