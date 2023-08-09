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

import { GraphView } from "latteart-client";

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
    sequence?: number;
    imageFileUrl?: string;
    tagname: string;
    text: string;
    type: string;
    id: string;
    name: string;
    operated: boolean;
    iframeIndex?: number;
  }[];
}[] {
  const testStepIdToSequenceAndImageFileUrl = new Map(
    graphView.nodes
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

  const screenIdToOperatedElements = graphView.nodes
    .map((node) => {
      return {
        screenId: node.screenId,
        elements: node.testSteps.flatMap((testStep) => {
          const { id, targetElementId } = testStep;
          const sequenceAndImageFileUrl =
            testStepIdToSequenceAndImageFileUrl.get(id);
          const targetElement = graphView.store.elements.find(({ id }) => {
            return id === targetElementId;
          });

          if (!targetElement || sequenceAndImageFileUrl === undefined) {
            return [];
          }

          const operatedElement = {
            xpath: targetElement.xpath,
            iframeIndex: targetElement.iframeIndex,
            ...sequenceAndImageFileUrl,
          };

          if (targetElement?.tagname.toLowerCase() !== "select") {
            return [operatedElement];
          }

          const input = testStep.input;
          const optionElement = graphView.store.elements.find(
            ({ tagname, xpath, attributes }) => {
              if (tagname.toLowerCase() !== "option") {
                return false;
              }

              const optionXPath = xpath.toLowerCase();
              const selectXPath = targetElement.xpath.toLowerCase();
              if (!optionXPath.startsWith(`${selectXPath}/option`)) {
                return false;
              }

              return input === attributes["value"];
            }
          );

          return optionElement
            ? [
                operatedElement,
                {
                  ...sequenceAndImageFileUrl,
                  xpath: optionElement.xpath,
                  iframeIndex: optionElement.iframeIndex,
                },
              ]
            : [operatedElement];
        }),
      };
    })
    .reduce((acc, { screenId, elements }) => {
      if (!acc.has(screenId)) {
        acc.set(screenId, []);
      }

      for (const element of elements) {
        const foundItem = acc
          .get(screenId)
          ?.find(
            ({ xpath, iframeIndex }) =>
              getUniquePath(xpath, iframeIndex) ==
              getUniquePath(element.xpath, element.iframeIndex)
          );

        if (foundItem) {
          foundItem.sequenceAndImageFileUrl.push({
            sequence: element.sequence,
            imageFileUrl: element.imageFileUrl,
          });
          continue;
        }

        acc.get(screenId)?.push({
          xpath: element.xpath,
          iframeIndex: element.iframeIndex,
          sequenceAndImageFileUrl: [
            {
              sequence: element.sequence,
              imageFileUrl: element.imageFileUrl,
            },
          ],
        });
      }

      return acc;
    }, new Map<string, { xpath: string; iframeIndex?: number; sequenceAndImageFileUrl: { sequence: number; imageFileUrl: string }[] }[]>());

  const inclusionSet = new Set(inclusionTags);

  const results = graphView.store.screens.map((screen) => {
    const elements = screen.elementIds
      .flatMap((elementId) => {
        const element = graphView.store.elements.find(
          ({ id }) => id === elementId
        );

        if (!element || element.attributes["type"] === "hidden") {
          return [];
        }

        if (!inclusionSet.has(element.tagname)) {
          return [];
        }

        return [element];
      })
      .filter((element, index, array) => {
        return (
          array.findIndex(
            ({ xpath, iframeIndex }) =>
              getUniquePath(xpath, iframeIndex) ===
              getUniquePath(element.xpath, element.iframeIndex)
          ) === index
        );
      })
      .flatMap((element) => {
        const operatedElement = screenIdToOperatedElements
          .get(screen.id)
          ?.find(
            ({ xpath, iframeIndex }) =>
              getUniquePath(xpath, iframeIndex) ===
              getUniquePath(element.xpath, element.iframeIndex)
          );

        const seqAndUrl = operatedElement?.sequenceAndImageFileUrl.at(0);
        return [
          {
            sequence: seqAndUrl?.sequence,
            imageFileUrl: seqAndUrl?.imageFileUrl ?? "",
            tagname: element.tagname,
            type: element.attributes["type"] ?? "",
            id: element.attributes["id"] ?? "",
            name: element.attributes["name"] ?? "",
            text: element.text
              ? element.text
              : element.attributes["href"] ?? "",
            operated: operatedElement !== undefined,
            iframeIndex: element.iframeIndex,
          },
        ];
      });

    const percent =
      (elements.filter((element) => element.operated).length /
        elements.length) *
      100;

    return {
      screenTitle: screen.name,
      percentage: Number.isNaN(percent) ? 0 : Math.round(percent * 100) / 100,
      elements,
    };
  });

  return results;
}

const getUniquePath = (xpath: string, iframeIndex?: number) => {
  return `${xpath}_${iframeIndex ?? ""}`;
};
