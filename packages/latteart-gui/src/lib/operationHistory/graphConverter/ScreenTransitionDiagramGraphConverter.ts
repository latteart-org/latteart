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
  onClickEdge: (imageFileUrl: string, inputValueTable: InputValueTable) => void;
  onClickScreenRect: (
    imageFileUrl: string,
    inputValueTable: InputValueTable
  ) => void;
}

export type FlowChartGraphExtenderSource = {
  edges: Edge[];
  screens: {
    id: string;
    name: string;
    imageFileUrl: string;
    details: ScreenTransition[];
  }[];
};

type Edge = {
  sourceScreenId: string;
  destScreenId: string;
  trigger?: {
    type: string;
    target?: { xpath: string; text: string };
    sequence: number;
    imageFileUrl: string;
  };
  details: ScreenTransition[];
};

type GraphSource = {
  screens: {
    id: string;
    name: string;
    imageFileUrl: string;
    details: ScreenTransition[];
  }[];
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
): Promise<{ graph: MermaidGraph }> {
  const graphModel = extractGraphSources(view);

  const screens = graphModel.screens;
  const edges = graphModel.edges;
  const screenTexts = graphModel.screens.map(({ id, name }) => {
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
    ? createFlowChartGraphExtender({ edges, screens })
    : {
        extendGraph: () => {
          /* nothing */
        },
        clearEvent: () => {
          /* nothing */
        },
      };

  console.debug(graphText);

  return { graph: { graphText, graphExtender } };
}

function extractGraphSources(view: GraphView): GraphSource {
  const testStepIdToSequenceAndImageFileUrl = new Map(
    view.nodes
      .flatMap(({ testSteps }) =>
        testSteps.map(({ id, imageFileUrl }) => {
          return { id, imageFileUrl };
        })
      )
      .map((idAndImageFileUrl, index) => [
        idAndImageFileUrl.id,
        {
          sequence: index + 1,
          imageFileUrl: idAndImageFileUrl?.imageFileUrl ?? "",
        },
      ])
  );

  const screens = view.nodes
    .map(({ screenId, testSteps }) => {
      const sequenceAndImageFileUrl = testStepIdToSequenceAndImageFileUrl.get(
        testSteps.at(0)?.id ?? ""
      );
      const sequence = sequenceAndImageFileUrl?.sequence ?? 0;
      const imageFileUrl = sequenceAndImageFileUrl?.imageFileUrl ?? "";
      return { screenId, sequence, imageFileUrl };
    })
    .filter(
      ({ screenId: id1 }, index, array) =>
        array.findIndex(({ screenId: id2 }) => id2 === id1) === index
    )
    .flatMap(({ screenId, sequence, imageFileUrl }) => {
      const screen = view.store.screens.find(({ id }) => screenId === id);
      if (!screen) {
        return [];
      }
      const { id, name } = screen;
      return [{ id, name, sequence, imageFileUrl }];
    });

  const edgeDetails = view.nodes.flatMap((node, index, array) => {
    if (!node.windowId || !node.screenId) {
      return [];
    }

    const nextNode = array.at(index + 1);

    if (nextNode?.windowId && node.windowId !== nextNode.windowId) {
      return [];
    }

    const sourceScreen = screens.find(({ id }) => id === node.screenId);

    if (!sourceScreen) {
      return [];
    }

    const destScreen = screens.find(({ id }) => id === nextNode?.screenId);

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
          sequence:
            testStepIdToSequenceAndImageFileUrl.get(lastTestStep.id)
              ?.sequence ?? 0,
          imageFileUrl:
            testStepIdToSequenceAndImageFileUrl.get(lastTestStep.id)
              ?.imageFileUrl ?? "",
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
          const sequenceAndImageFileUrl =
            testStepIdToSequenceAndImageFileUrl.get(id);
          if (sequenceAndImageFileUrl === undefined || input === undefined) {
            return [];
          }

          return { ...sequenceAndImageFileUrl, value: input };
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

        const sequenceAndImageFileUrl = testStepIdToSequenceAndImageFileUrl.get(
          testStep.id
        ) ?? { sequence: 0, imageFileUrl: "" };

        return [
          {
            ...note,
            ...sequenceAndImageFileUrl,
            imageFileUrl,
            tags: note.tags ?? [],
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
        edge.destScreenId === detail.destScreen?.id &&
        edge.trigger?.type === detail.trigger?.type &&
        edge.trigger?.target?.xpath === detail.trigger?.target?.xpath
      );
    });

    if (foundEdge) {
      foundEdge.details.push(detail);
      return acc;
    } else if (detail.destScreen) {
      acc.push({
        sourceScreenId: detail.sourceScreen.id,
        destScreenId: detail.destScreen.id,
        trigger: detail.trigger,
        details: [detail],
      });
    }

    return acc;
  }, []);

  return {
    screens: screens.map((screen) => {
      const details = edgeDetails.filter(
        ({ sourceScreen }) => sourceScreen.id === screen.id
      );
      return { ...screen, details };
    }),
    edges,
  };
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
