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
import { GraphView, VideoFrame } from "latteart-client";
import InputValueTable from "../InputValueTable";

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
    edges: Edge[];
  }[];
};

type TargetElement = {
  id: string;
  xpath: string;
  text: string;
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
  iframeIndex?: number;
};

export type Edge = {
  sourceScreen: { id: string; name: string };
  destScreen: { id: string; name: string };
  trigger?: {
    type: string;
    target?: TargetElement;
    image?: { imageFileUrl?: string; videoFrame?: VideoFrame };
  };
  details: EdgeDetails[];
};

type EdgeDetails = {
  pageUrl: string;
  pageTitle: string;
  inputElements: (TargetElement & {
    image?: { imageFileUrl?: string; videoFrame?: VideoFrame };
    inputs: { value: string }[];
    tagname: string;
    attributes: { [key: string]: string };
    defaultValue?: string;
  })[];
  notes: {
    sequence: number;
    id: string;
    tags: string[];
    value: string;
    details: string;
    timestamp: number;
    image?: { imageFileUrl?: string; videoFrame?: VideoFrame };
  }[];
  testPurposes: { id: string; value: string; details: string }[];
};

type GraphSource = {
  screens: {
    id: string;
    name: string;
    image?: { imageFileUrl?: string; videoFrame?: VideoFrame };
    edges: Edge[];
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
  const { screens, edges } = extractGraphSources(view);

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
  const testStepIdToSequence = new Map(
    view.nodes
      .flatMap(({ testSteps }) => testSteps.map(({ id }) => id))
      .map((testStepId, index) => [testStepId, { sequence: index + 1 }])
  );

  const filteredNodes = view.nodes.map((node) => {
    const filteredTestSteps = node.testSteps.filter(
      (testStep, index, array) => {
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
      }
    );

    return { ...node, testSteps: filteredTestSteps };
  });

  const screens = filteredNodes
    .filter(
      ({ screenId: id1 }, index, array) =>
        array.findIndex(({ screenId: id2 }) => id2 === id1) === index
    )
    .flatMap(({ screenId, testSteps }) => {
      const screen = view.store.screens.find(({ id }) => screenId === id);

      if (!screen) {
        return [];
      }

      const testStep = testSteps.find((testStep) => {
        return testStep.imageFileUrl || testStep.videoFrame;
      });
      const image = testStep
        ? {
            imageFileUrl: testStep.imageFileUrl,
            videoFrame: testStep.videoFrame,
          }
        : undefined;
      return [{ id: screenId, name: screen.name, image }];
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
                id: targetElement.id,
                xpath: targetElement.xpath,
                text: targetElement.text,
                iframeIndex: targetElement.iframeIndex,
              }
            : undefined,
          image:
            lastTestStep.imageFileUrl || lastTestStep.videoFrame
              ? {
                  imageFileUrl: lastTestStep.imageFileUrl,
                  videoFrame: lastTestStep.videoFrame,
                }
              : undefined,
          input: lastTestStep.input,
          iframeIndex: lastTestStep.iframeIndex,
        }
      : undefined;

    const inputElements = node.defaultValues.flatMap(({ elementId, value }) => {
      const element = view.store.elements.find(({ id }) => id === elementId);

      if (!element) {
        return [];
      }

      const targetElementTestSteps = node.testSteps.filter((testStep) => {
        return testStep.targetElementId === elementId;
      });

      const inputs = targetElementTestSteps.flatMap(({ input }) => {
        if (input === undefined) {
          return [];
        }

        return { value: input };
      });

      const testStep = targetElementTestSteps.at(0);
      const image =
        testStep?.imageFileUrl || testStep?.videoFrame
          ? {
              imageFileUrl: testStep.imageFileUrl,
              videoFrame: testStep.videoFrame,
            }
          : undefined;

      return [{ ...element, image, defaultValue: value, inputs }];
    });

    const notes = node.testSteps.flatMap((testStep, index) => {
      return testStep.noteIds.flatMap((noteId) => {
        const note = view.store.notes.find(({ id }) => id === noteId);

        if (!note) {
          return [];
        }

        const { id, value, details, tags = [], timestamp } = note;
        const image = {
          imageFileUrl: note.imageFileUrl ?? testStep.imageFileUrl,
          videoFrame: note.videoFrame ?? testStep.videoFrame,
        };
        const sequence = testStepIdToSequence.get(testStep.id)?.sequence ?? 0;

        return [{ sequence, id, value, details, tags, timestamp, image }];
      });
    });

    const testPurposes = view.store.testPurposes;

    const pageUrl = lastTestStep?.pageUrl ?? "";
    const pageTitle = lastTestStep?.pageTitle ?? "";

    return [
      {
        sourceScreen,
        destScreen,
        trigger,
        pageUrl,
        pageTitle,
        inputElements,
        notes,
        testPurposes,
      },
    ];
  });

  const edges = edgeDetails.reduce((acc: Edge[], detail) => {
    const foundEdge = acc.find((edge) => {
      return (
        edge.sourceScreen.id === detail.sourceScreen.id &&
        edge.destScreen.id === detail.destScreen?.id &&
        edge.trigger?.type === detail.trigger?.type &&
        edge.trigger?.target?.xpath === detail.trigger?.target?.xpath &&
        (edge.trigger?.target?.iframeIndex ?? "") ===
          (detail.trigger?.target?.iframeIndex ?? "")
      );
    });

    if (foundEdge) {
      foundEdge.details.push(detail);
      return acc;
    } else if (detail.destScreen) {
      acc.push({
        sourceScreen: detail.sourceScreen,
        destScreen: detail.destScreen,
        trigger: detail.trigger,
        details: [detail],
      });
    }

    return acc;
  }, []);

  return {
    screens: screens.map((screen) => {
      return {
        ...screen,
        edges: edges.filter(
          ({ sourceScreen }) => sourceScreen.id === screen.id
        ),
      };
    }),
    edges,
  };
}

function createGraphTextLines(edges: Edge[]) {
  return edges.map(({ sourceScreen, destScreen, trigger }) => {
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

    return `${sourceScreen.id} --> |"${screenTransitionTrigger}"|${destScreen.id};`;
  });
}
