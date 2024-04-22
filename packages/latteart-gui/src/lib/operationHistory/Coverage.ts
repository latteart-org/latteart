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

import { type GraphView, type VideoFrame } from "latteart-client";

export interface InclusionTableItem {
  text: string;
  isInclude: boolean;
}

/**
 * Get coverage information.
 * @param screenHistory  Screen transition information.
 * @param inclusionTags  Included tag list.
 * @returns Coverage information.
 */
export function getCoverages(
  graphView: GraphView,
  inclusionTags: string[]
): {
  screenTitle: string;
  percentage: number;
  elements: {
    tagname: string;
    type: string;
    id: string;
    name: string;
    text: string;
    operated: boolean;
    imageFileUrl?: string;
    videoFrame?: VideoFrame;
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
  }[];
}[] {
  const testStepIdToImage = new Map(
    graphView.nodes.flatMap(({ testSteps }) =>
      testSteps.map(({ id, imageFileUrl, videoFrame }) => {
        return [id, { imageFileUrl: imageFileUrl ?? "", videoFrame }];
      })
    )
  );

  const screenIdToOperatedElements = graphView.nodes
    .map((node) => {
      return {
        screenId: node.screenId,
        elements: node.testSteps.flatMap((testStep) => {
          const { id, targetElementId } = testStep;
          const image = testStepIdToImage.get(id);
          const targetElement = graphView.store.elements.find(({ id }) => {
            return id === targetElementId;
          });

          if (!targetElement || !image) {
            return [];
          }

          const operatedElement = {
            id: targetElement.id,
            ...image
          };

          if (targetElement?.tagname.toLowerCase() !== "select") {
            return [operatedElement];
          }

          const input = testStep.input;
          const optionElement = graphView.store.elements.find(({ tagname, xpath, attributes }) => {
            if (tagname.toLowerCase() !== "option") {
              return false;
            }

            const optionXPath = xpath.toLowerCase();
            const selectXPath = targetElement.xpath.toLowerCase();
            if (!optionXPath.startsWith(`${selectXPath}/option`)) {
              return false;
            }

            return input === attributes["value"];
          });

          return optionElement
            ? [operatedElement, { ...image, id: optionElement.id }]
            : [operatedElement];
        })
      };
    })
    .reduce((acc, { screenId, elements }) => {
      if (!acc.has(screenId)) {
        acc.set(screenId, []);
      }

      for (const element of elements) {
        const foundItem = acc.get(screenId)?.find(({ id }) => id == element.id);

        if (foundItem) {
          foundItem.images.push({
            imageFileUrl: element.imageFileUrl,
            videoFrame: element.videoFrame
          });
          continue;
        }

        acc.get(screenId)?.push({
          id: element.id,
          images: [
            {
              imageFileUrl: element.imageFileUrl,
              videoFrame: element.videoFrame
            }
          ]
        });
      }

      return acc;
    }, new Map<string, { id: string; images: { imageFileUrl: string; videoFrame?: VideoFrame }[] }[]>());

  const inclusionSet = new Set(inclusionTags);

  const results = graphView.store.screens.map((screen) => {
    const elements = screen.elementIds
      .flatMap((elementId) => {
        const element = graphView.store.elements.find(({ id }) => id === elementId);

        if (!element || element.attributes["type"] === "hidden") {
          return [];
        }

        if (!inclusionSet.has(element.tagname)) {
          return [];
        }

        return [element];
      })
      .filter((element, index, array) => {
        return array.findIndex(({ id }) => id === element.id) === index;
      })
      .flatMap((element) => {
        const operatedElement = screenIdToOperatedElements
          .get(screen.id)
          ?.find(({ id }) => id === element.id);

        const image = operatedElement?.images.at(0);
        return [
          {
            imageFileUrl: image?.imageFileUrl ?? "",
            videoFrame: image?.videoFrame,
            tagname: element.tagname,
            type: element.attributes["type"] ?? "",
            id: element.attributes["id"] ?? "",
            name: element.attributes["name"] ?? "",
            text: element.text ? element.text : element.attributes["href"] ?? "",
            operated: operatedElement !== undefined,
            boundingRect: element.boundingRect,
            innerHeight: element.innerHeight,
            innerWidth: element.innerWidth,
            outerHeight: element.outerHeight,
            outerWidth: element.outerWidth
          }
        ];
      });

    const percent = (elements.filter((element) => element.operated).length / elements.length) * 100;

    return {
      screenTitle: screen.name,
      percentage: Number.isNaN(percent) ? 0 : Math.round(percent * 100) / 100,
      elements
    };
  });

  return results;
}
