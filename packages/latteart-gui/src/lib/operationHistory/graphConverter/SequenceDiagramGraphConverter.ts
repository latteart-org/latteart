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
import SequenceDiagramGraphExtender from "../mermaidGraph/extender/SequenceDiagramGraphExtender";
import TextUtil from "./TextUtil";
import { SequenceView, SequenceViewNode } from "latteart-client";

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
  onRightClickNote: (
    note: NoteInfo,
    eventInfo: { clientX: number; clientY: number }
  ) => void;
  onRightClickLoopArea: (
    note: NoteInfo,
    eventInfo: { clientX: number; clientY: number }
  ) => void;
};

type SourceNode = {
  scenario: { sequence: number; text: string };
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
    details: string;
  }[];
  testPurposes: {
    sequence: number;
    type: string;
    details: string;
  }[];
  source: {
    screens: {
      id: string;
      name: string;
    }[];
    nodes: Omit<SequenceViewNode, "windowId">[];
    testStepIdToSequence: Map<string, number>;
  };
  view: SequenceView;
};

/**
 * Convert Sequence View model to Diagram Graph.
 * @param screenHistory  Screen transition history.
 * @param windows Window informations.
 * @param callback.onClickEdge  Callback function called when you click Edge.
 * @param callback.onClickScreenRect  Callback function called when Rect is clicked.
 * @param callback.onClickNote  Callback function called by clicking Note.
 * @param callback.onRightClickNote  Callback function called by right-clicking on Note.
 * @param callback.onRightClickLoopArea  Callback function called by right-clicking on LoopArea.
 * @returns Graph text and graph extension information.
 */
export async function convertToSequenceDiagramGraph(
  view: SequenceView,
  createSequenceDiagramGraphExtender?: (
    source: SequenceDiagramGraphExtenderSource
  ) => SequenceDiagramGraphExtender
): Promise<MermaidGraph> {
  const source = extractGraphSource(view);

  const graphText = buildGraphText(source);

  const notes = view.scenarios
    .flatMap(({ nodes }) => nodes)
    .flatMap(({ testSteps }) => testSteps)
    .flatMap((testStep) => {
      if (!testStep.notes) {
        return [];
      }

      return testStep.notes.map((note, index) => {
        return {
          sequence: source.testStepIdToSequence.get(testStep.id) ?? 0,
          index,
          type: note.tags.includes("bug") ? "bug" : "notice",
          details: note.details ?? "",
        };
      });
    });

  const testPurposes = view.scenarios.flatMap(({ testPurpose, nodes }) => {
    if (!testPurpose) {
      return [];
    }

    const firstTestStepId = nodes.at(0)?.testSteps.at(0)?.id ?? "";
    const firstSequence = source.testStepIdToSequence.get(firstTestStepId) ?? 0;

    return [
      {
        sequence: firstSequence,
        type: "intention",
        details: testPurpose.details ?? "",
      },
    ];
  });

  const edges = view.scenarios
    .flatMap(({ nodes }) => nodes)
    .map((node, index, nodes) => {
      const nextNode = nodes.at(index + 1);

      return {
        source: { title: "", url: "", screenDef: node.screenId },
        target: {
          title: "",
          url: "",
          screenDef: (nextNode ?? node).screenId,
        },
        sequences: node.testSteps.flatMap((testStep) => {
          const sequence = source.testStepIdToSequence.get(testStep.id);

          if (sequence === undefined) {
            return [];
          }

          return [sequence];
        }),
      };
    });

  const graphExtender = createSequenceDiagramGraphExtender
    ? createSequenceDiagramGraphExtender({
        edges,
        notes,
        testPurposes,
        source,
        view,
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

  return {
    graphText,
    graphExtender,
  };
}

function extractGraphSource(view: SequenceView) {
  const windowIdToName = new Map(
    view.windows.map(({ id, name }) => [id, name])
  );

  const testStepIdToSequence = new Map(
    view.scenarios
      .flatMap(({ nodes }) =>
        nodes.flatMap(({ testSteps }) => testSteps.map(({ id }) => id))
      )
      .map((id, index) => [id, index + 1])
  );

  const nodes = view.scenarios.flatMap((scenario) => {
    const testPurposeSequence = testStepIdToSequence.get(
      scenario.nodes.at(0)?.testSteps.at(0)?.id ?? ""
    );
    if (testPurposeSequence === undefined) {
      return [];
    }

    return scenario.nodes
      .reduce(
        (acc, node, index, nodes) => {
          const beforeNode = index > 0 ? nodes.at(index - 1) : undefined;

          if (beforeNode?.windowId !== node.windowId) {
            const windowName = windowIdToName.get(node.windowId);
            const sequence = testStepIdToSequence.get(
              node.testSteps.at(0)?.id ?? ""
            );

            if (windowName !== undefined && sequence !== undefined) {
              acc.push({
                window: { sequence, text: windowName },
                nodes: [],
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
      )
      .flatMap(({ window, nodes }) =>
        nodes.map(({ screenId, testSteps, disabled }) => {
          return {
            scenario: {
              sequence: testPurposeSequence,
              text: scenario.testPurpose?.value ?? "",
            },
            window,
            screenId,
            testSteps,
            disabled,
          };
        })
      );
  });

  return { screens: view.screens, nodes, testStepIdToSequence };
}

function buildGraphText(source: {
  screens: { id: string; name: string }[];
  nodes: SourceNode[];
  testStepIdToSequence: Map<string, number>;
}) {
  const scenarios = source.nodes.reduce((acc, node, index, nodes) => {
    const beforeNode = index > 0 ? nodes.at(index - 1) : undefined;
    const nextNode = nodes.at(index + 1);

    const screenTransitionTexts = buildScreenTransitionTexts(
      source.testStepIdToSequence,
      node,
      nextNode
    );

    const screenIndex = source.screens.findIndex(
      ({ id }) => id === node.screenId
    );
    const beforeScreenIndex = source.screens.findIndex(
      ({ id }) => id === beforeNode?.screenId
    );

    const contextTexts = (() => {
      const lines = [
        ...buildCommentTexts(node, source.testStepIdToSequence, "right"),
        ...screenTransitionTexts,
      ];

      return lines.length === 0
        ? [
            `Note ${
              screenIndex >= 1 && screenIndex >= beforeScreenIndex
                ? "left"
                : "right"
            } of ${node.screenId}: DUMMY_COMMENT;`,
          ]
        : lines;
    })();

    const nodeTexts = [
      `activate ${node.screenId};`,
      ...contextTexts,
      `deactivate ${node.screenId};`,
    ];

    const scenarioItemTexts = [
      ...(() => {
        if (
          node.scenario.text &&
          beforeNode?.scenario.text !== node.scenario.text
        ) {
          return [
            `alt (${node.scenario.sequence})${TextUtil.escapeSpecialCharacters(
              node.scenario.text
            )};`,
            `opt (${node.window.sequence})${node.window.text};`,
          ];
        }

        if (node.window.text && beforeNode?.window.text !== node.window.text) {
          return [`opt (${node.window.sequence})${node.window.text};`];
        }

        return [];
      })(),
      ...nodeTexts,
      ...(() => {
        if (
          node.scenario.text &&
          nextNode?.scenario.text !== node.scenario.text
        ) {
          return ["end;", "end;"];
        }

        if (node.window.text && nextNode?.window.text !== node.window.text) {
          return ["end;"];
        }

        return [];
      })(),
    ];

    return [...acc, ...scenarioItemTexts];
  }, new Array<string>());

  const screenTexts = source.screens.map(({ id, name }) => {
    const lineLength = 15;
    return `participant ${id} as ${TextUtil.escapeSpecialCharacters(
      TextUtil.lineBreak(
        TextUtil.ellipsis(TextUtil.toSingleLine(name), lineLength * 3),
        lineLength
      )
    )};`;
  });

  return ["sequenceDiagram;", ...screenTexts, ...scenarios, ""].join("\n");
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
            .map((tag) => `[${tag}]`)
            .join("")}`,
          16
        );
        const value = TextUtil.escapeSpecialCharacters(
          TextUtil.lineBreak(note.value, 16)
        );

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

  const isScenarioChanged = nextNode.scenario.text !== node.scenario.text;
  const isWindowChanged = nextNode.window.text !== node.window.text;
  const isDisabledChanged = node.disabled !== nextNode.disabled;

  if (isScenarioChanged || isWindowChanged || isDisabledChanged) {
    return [`${node.screenId} --x ${node.screenId}: ;`];
  }

  const lastTestStep = node.testSteps.at(-1);

  const sequence = testStepIdToSequence.get(lastTestStep?.id ?? "");
  const operationType = lastTestStep?.type;
  const targetElement = TextUtil.escapeSpecialCharacters(
    TextUtil.ellipsis(
      TextUtil.toSingleLine(lastTestStep?.element?.text ?? ""),
      20
    )
  );
  const screenTransitionTrigger = node.disabled
    ? "screen transition"
    : `(${sequence})${operationType}: ${targetElement}`;

  return [
    `${node.screenId} ->> ${nextNode.screenId}: ${screenTransitionTrigger};`,
  ];
}
