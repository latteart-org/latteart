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

import { ElementInfo, VideoFrame } from "latteart-client";
import { Edge } from "./graphConverter/ScreenTransitionDiagramGraphConverter";

export type InputValueTableHeaderColumn = {
  index: number;
  sourceScreenDef: string;
  targetScreenDef: string;
  trigger: { elementText: string; eventType: string };
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

export type InputValueTableRow = {
  elementId: string;
  elementName: string;
  elementType: string;
  elementImage?: {
    image: { imageFileUrl?: string; videoFrame?: VideoFrame };
    elementInfo: Pick<
      ElementInfo,
      | "boundingRect"
      | "innerHeight"
      | "innerWidth"
      | "outerHeight"
      | "outerWidth"
    >;
  };
  inputs: { value: string; isDefaultValue: boolean }[];
};

/**
 * Class that handles input value table.
 */
export default class InputValueTable {
  constructor(private edges: Edge[] = []) {}

  /**
   * Get column size.
   */
  public get columnSize(): number {
    return this.edges.flatMap((edge) => edge.details).length;
  }

  /**
   * Get column header.
   */
  public get headerColumns(): InputValueTableHeaderColumn[] {
    return this.edges
      .flatMap((edge) =>
        edge.details.map((screenTransition) => {
          return {
            sourceScreenDef: edge.sourceScreen.name,
            targetScreenDef: edge.destScreen.name,
            trigger: {
              elementText: edge.trigger?.target?.text ?? "",
              eventType: edge.trigger?.type ?? "",
            },
            notes: screenTransition.notes,
            testPurposes: screenTransition.testPurposes,
          };
        })
      )
      .map((screenTransition, index) => {
        return { index, ...screenTransition };
      });
  }

  /**
   * Get all lines.
   */
  public get rows(): InputValueTableRow[] {
    const edgeDetails = this.edges.flatMap((edge) => edge.details);

    const inputElements = edgeDetails
      .flatMap(({ inputElements }) => inputElements)
      .filter((e1, index, array) => {
        return array.findIndex((e2) => e2.id === e1.id) === index;
      });

    return inputElements.map((element) => {
      const attributes = element.attributes;

      const inputs = this.edges
        .flatMap(({ details }) => details)
        .map((screenTransition) => {
          const inputElement = screenTransition.inputElements.find(
            ({ id }) => id === element.id
          );
          const input = inputElement?.inputs.at(-1);

          if (input === undefined) {
            return {
              value: inputElement?.defaultValue ?? "",
              isDefaultValue: true,
            };
          }

          return {
            value: input.value,
            isDefaultValue: false,
          };
        });

      return {
        elementId: attributes["id"] ?? "",
        elementName: attributes["name"] ?? "",
        elementType: attributes["type"] ?? "",
        elementImage: element.image
          ? {
              image: element.image,
              elementInfo: {
                boundingRect: element.boundingRect,
                innerHeight: element.innerHeight,
                innerWidth: element.innerWidth,
                outerHeight: element.outerHeight,
                outerWidth: element.outerWidth,
              },
            }
          : undefined,
        inputs,
      };
    });
  }

  /**
   * Get screen transition.
   * @returns Screen transitions.
   */
  public getScreenTransitions(): (Pick<Edge, "trigger"> &
    Pick<Edge["details"][0], "inputElements" | "pageTitle" | "pageUrl">)[] {
    return this.edges.flatMap((edge) => {
      return edge.details;
    });
  }
}
