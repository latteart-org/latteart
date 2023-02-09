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
import ScreenHistory from "@/lib/operationHistory/ScreenHistory";
import { OperationWithNotes, Edge } from "@/lib/operationHistory/types";
import TextUtil from "./TextUtil";
import FlowChartGraphExtender from "../mermaidGraph/extender/FlowChartGraphExtender";

export interface FlowChartGraphCallback {
  onClickEdge: (edge: Edge) => void;
  onClickScreenRect: (screenRectIndex: number) => void;
}

export type FlowChartGraphExtenderSource = {
  edges: Edge[];
  nameMap: Map<number, string>;
  appearedScreens: ScreenHistory["body"];
};

/**
 * Class that performs conversion related to screen transition diagram display of Mermaid.
 */
export default class ScreenTransitionDiagramGraphConverter {
  /**
   * Convert screen transition information to Mermaid screen transition diagram drawing text.
   * @param screenHistory  Screen transition information.
   * @param selectedWindowHandle  Selected windowHandle.
   * @param callback.onClickEdge  Callback function when clicking Edge.
   * @param callback.onClickScreenRect  Callback function when ScreenRect is clicked.
   * @returns Textualized screen transition diagram information.
   */
  public static async convert(
    screenHistory: ScreenHistory,
    selectedWindowHandle: string,
    createFlowChartGraphExtender?: (
      source: FlowChartGraphExtenderSource
    ) => FlowChartGraphExtender
  ): Promise<MermaidGraph> {
    const newNameMap = new Map<number, string>();
    const edges: Edge[] = [];
    let nameMap = new Map<number, string>();

    const appearedScreens = screenHistory.appearedScreens.filter((screen) => {
      return (
        screen.operationHistory.filter((operationWithNotes) => {
          return (
            operationWithNotes.operation.windowHandle === selectedWindowHandle
          );
        }).length > 0
      );
    });

    // Text of the screen definition part in the mermaid graph.
    const screenDefinitionText = appearedScreens.reduce(
      (acc, currentScreen, currentIndex) => {
        const screenDef =
          ScreenTransitionDiagramGraphConverter.displayScreenDefOptimal(
            currentIndex,
            newNameMap,
            currentScreen.screenDef,
            30
          );

        return `${acc}${currentIndex}["${screenDef}"];`;
      },
      ""
    );

    const graphTextSource = screenHistory.body.map((currentScreen) => {
      return {
        operationHistory: currentScreen.operationHistory,
        screenDef: currentScreen.screenDef,
        title: currentScreen.title,
        url: currentScreen.url,
      };
    });

    // Build mermaid graph text.
    const graphTextLines: string[] = [];

    for (const [currentIndex, currentScreen] of graphTextSource.entries()) {
      // Exclude if there is no operation of the target windowHandle.
      const existsScreenDef = currentScreen.operationHistory.find(
        (operationWithNotes: OperationWithNotes) => {
          return (
            operationWithNotes.operation.windowHandle === selectedWindowHandle
          );
        }
      );
      if (!existsScreenDef) {
        continue;
      }

      // Collect the text part of each step in an array.
      const currentScreenId = appearedScreens.findIndex((screen) => {
        return screen.screenDef === currentScreen.screenDef;
      });

      if (graphTextLines.length === 0) {
        graphTextLines.push(`${currentScreenId}`);
        continue;
      }

      const preScreen = graphTextSource[currentIndex - 1];
      const preScreenId = appearedScreens.findIndex((screen) => {
        return screen.screenDef === preScreen.screenDef;
      });
      if (preScreenId === -1) {
        continue;
      }

      const lastOperation =
        preScreen.operationHistory[preScreen.operationHistory.length - 1]
          .operation;
      // Skip own screen transition by switching tabs.
      if (lastOperation.type === "switch_window") {
        continue;
      }

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          const lastOperationElementValue =
            lastOperation.elementInfo === null
              ? ""
              : TextUtil.ellipsis(
                  TextUtil.toSingleLine(lastOperation.textValue),
                  20
                );
          const transitionText = `${
            lastOperation.type
          }: ${TextUtil.escapeSpecialCharacters(lastOperationElementValue)}`;

          // Delete duplicate transitions
          // (transition source and transition destination are the same and transition trigger is the same).
          const stepText = `${preScreenId} --> |"${transitionText}"|${currentScreenId}`;
          if (graphTextLines.indexOf(stepText) === -1) {
            graphTextLines.push(stepText);
            edges.push({
              source: {
                title: preScreen.title,
                url: preScreen.url,
                screenDef: preScreen.screenDef,
              },
              target: {
                title: currentScreen.title,
                url: currentScreen.url,
                screenDef: currentScreen.screenDef,
              },
              operationHistory: preScreen.operationHistory,
            });
          }
          nameMap = newNameMap;

          resolve();
        }, 1);
      });
    }

    const graphText = graphTextLines.reduce((acc, currentStepText) => {
      // Convert to text.
      return `${acc}${currentStepText};`;
    }, `graph TD;${screenDefinitionText}`);

    const graphExtender = createFlowChartGraphExtender
      ? createFlowChartGraphExtender({
          edges,
          appearedScreens,
          nameMap,
        })
      : {
          extendGraph: () => {
            /* nothing */
          },
          clearEvent: () => {
            /* nothing */
          },
        };

    return {
      graphText,
      graphExtender,
    };
  }

  private static displayScreenDefOptimal(
    index: number,
    map: Map<number, string>,
    screenDef: string,
    lineLength: number
  ): string {
    map.set(index, screenDef);
    let name = screenDef;
    if (screenDef.length > lineLength) {
      name = name.substring(0, lineLength - 3) + "...";
    }
    name = name
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
    return name;
  }
}
