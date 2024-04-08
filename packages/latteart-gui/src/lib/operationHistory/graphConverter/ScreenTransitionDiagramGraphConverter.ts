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
import TextUtil from "./TextUtil";
import FlowChartGraphExtender from "../mermaidGraph/extender/FlowChartGraphExtender";
import { type GraphView, type VideoFrame } from "latteart-client";
import InputValueTable, { type ScreenTransition } from "../InputValueTable";

export type FlowChartGraphCallback = {
  onClickEdge: (edge: {
    image?: { imageFileUrl?: string; videoFrame?: VideoFrame };
    inputValueTable: InputValueTable;
  }) => void;
  onClickScreenRect: (rect: {
    image?: { imageFileUrl?: string; videoFrame?: VideoFrame };
    inputValueTable: InputValueTable;
  }) => void;
};

export type FlowChartGraphExtenderSource = {
  edges: Edge[];
  screens: {
    id: string;
    name: string;
    image?: { imageFileUrl?: string; videoFrame?: VideoFrame };
    details: ScreenTransition[];
  }[];
};

type Edge = {
  sourceScreenId: string;
  destScreenId: string;
  trigger?: {
    type: string;
    target?: {
      xpath: string;
      iframe?: {
        index: number;
        boundingRect?: {
          top: number;
          left: number;
          width: number;
          height: number;
        };
        innerHeight?: number;
        innerWidth?: number;
        outerHeight?: number;
        outerWidth?: number;
      };
      text: string;
    };
    sequence: number;
    image?: { imageFileUrl?: string; videoFrame?: VideoFrame };
  };
  details: ScreenTransition[];
};

type GraphSource = {
  screens: {
    id: string;
    name: string;
    image?: { imageFileUrl?: string; videoFrame?: VideoFrame };
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
  createFlowChartGraphExtender?: (source: FlowChartGraphExtenderSource) => FlowChartGraphExtender
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
  const graphText = ["graph TD;", ...screenTexts, ...graphTextLines, ""].join("\n");

  const graphExtender = createFlowChartGraphExtender
    ? createFlowChartGraphExtender({ edges, screens })
    : {
        extendGraph: () => {
          /* nothing */
        },
        clearEvent: () => {
          /* nothing */
        }
      };

  console.debug(graphText);

  return { graph: { graphText, graphExtender } };
}

function extractGraphSources(view: GraphView): GraphSource {
  let sequence = 0;
  let beforeTestResultId = "";
  const testStepIdToSequenceAndImage = new Map(
    view.nodes
      .flatMap(({ testSteps }) =>
        testSteps.map(({ id, imageFileUrl, videoFrame, testResultId }) => {
          const image = imageFileUrl || videoFrame ? { imageFileUrl, videoFrame } : undefined;
          return { id, image, testResultId };
        })
      )
      .map(({ id, image, testResultId }) => {
        if (testResultId !== beforeTestResultId) {
          beforeTestResultId = testResultId;
          sequence = 0;
        }
        ++sequence;
        return [id, { sequence, image }];
      })
  );

  const filteredNodes = view.nodes.map((node) => {
    const filteredTestSteps = node.testSteps.filter((testStep, index, array) => {
      if (testStep.type === "open_window") {
        return false;
      }

      if (
        testStep.type === "switch_window" &&
        index > 0 &&
        array.at(index - 1)?.type === "open_window"
      ) {
        return false;
      }

      return true;
    });

    return { ...node, testSteps: filteredTestSteps };
  });

  const screens = filteredNodes
    .map(({ screenId, testSteps }) => {
      const testStep = testSteps.find(({ imageFileUrl, videoFrame }) => imageFileUrl || videoFrame);
      const sequenceAndImage = testStepIdToSequenceAndImage.get(testStep?.id ?? "");
      const sequence = sequenceAndImage?.sequence ?? 0;
      const image = sequenceAndImage?.image;
      return { screenId, sequence, image };
    })
    .filter(
      ({ screenId: id1 }, index, array) =>
        array.findIndex(({ screenId: id2 }) => id2 === id1) === index
    )
    .flatMap(({ screenId, sequence, image }) => {
      const screen = view.store.screens.find(({ id }) => screenId === id);
      if (!screen) {
        return [];
      }
      const { id, name } = screen;
      return [{ id, name, sequence, image }];
    });

  const edgeDetails = filteredNodes.flatMap((node, index, array) => {
    if (!node.windowId || !node.screenId) {
      return [];
    }

    const nextNode = array.at(index + 1);

    if (nextNode?.windowId && node.testSteps.at(-1)?.type === "switch_window") {
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
            ? {
                xpath: targetElement.xpath,
                text: targetElement.text,
                iframe: targetElement.iframe
              }
            : undefined,
          sequence: testStepIdToSequenceAndImage.get(lastTestStep.id)?.sequence ?? 0,
          image: testStepIdToSequenceAndImage.get(lastTestStep.id)?.image,
          input: lastTestStep.input,
          pageUrl: lastTestStep.pageUrl,
          pageTitle: lastTestStep.pageTitle
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
          const sequenceAndImage = testStepIdToSequenceAndImage.get(id);

          if (sequenceAndImage === undefined || input === undefined) {
            return [];
          }

          return { image: sequenceAndImage.image, value: input };
        });

      return [
        {
          ...element,
          defaultValue: value,
          inputs
        }
      ];
    });

    const notes = node.testSteps.flatMap((testStep) => {
      return testStep.noteIds.flatMap((noteId) => {
        const note = view.store.notes.find(({ id }) => id === noteId);
        if (!note) {
          return [];
        }
        const sequenceAndImage = (() => {
          const sequenceAndImage = testStepIdToSequenceAndImage.get(testStep.id) ?? {
            sequence: 0,
            image: undefined
          };

          if (!note.imageFileUrl && !note.videoFrame) {
            return sequenceAndImage;
          }

          return {
            sequence: sequenceAndImage.sequence,
            image: {
              imageFileUrl: note.imageFileUrl,
              videoFrame: note.videoFrame
            }
          };
        })();

        return [
          {
            ...note,
            ...sequenceAndImage,
            tags: note.tags ?? [],
            testResultId: testStep.testResultId
          }
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
        testPurposes
      }
    ];
  });

  const edges = edgeDetails.reduce((acc: Edge[], detail) => {
    const foundEdge = acc.find((edge) => {
      const edgeIframeIndex =
        edge.trigger?.target?.iframe?.index !== undefined
          ? edge.trigger?.target?.iframe?.index
          : "";
      const detailIframeIndex =
        detail.trigger?.target?.iframe?.index !== undefined
          ? detail.trigger?.target?.iframe?.index
          : "";
      return (
        edge.sourceScreenId === detail.sourceScreen.id &&
        edge.destScreenId === detail.destScreen?.id &&
        edge.trigger?.type === detail.trigger?.type &&
        edge.trigger?.target?.xpath === detail.trigger?.target?.xpath &&
        edgeIframeIndex === detailIframeIndex
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
        details: [detail]
      });
    }

    return acc;
  }, []);

  return {
    screens: screens.map((screen) => {
      const details = edgeDetails.filter(({ sourceScreen }) => sourceScreen.id === screen.id);
      return { ...screen, details };
    }),
    edges
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
