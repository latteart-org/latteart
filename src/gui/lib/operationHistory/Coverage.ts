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

import ScreenHistory from "@/lib/operationHistory/ScreenHistory";
import { normalizeXPath } from "@/lib/common/util";
import { ElementInfo } from "src/common/types";

export interface InclusionTableItem {
  text: string;
  isInclude: boolean;
}

/**
 * Get a list of used tags.
 * @param screenHistory  Screen transition information.
 * @param inclusionTagList  Included tag list.
 * @returns List of tags used.
 */
export function getTagUseTags(
  screenHistory: ScreenHistory,
  inclusionTagList: string[]
): InclusionTableItem[] {
  // Inclusion settings set in config.json.
  const includeTagSet: Set<string> = new Set();
  for (const tag of inclusionTagList) {
    includeTagSet.add(tag);
  }

  // Set with all tags existing in the operation history added to the above set.
  const useTagSet: Set<string> = new Set(Array.from(includeTagSet));
  for (const screen of screenHistory.appearedScreens) {
    screen.screenElements.forEach((elementInfo: ElementInfo) => {
      if (elementInfo.tagname) {
        useTagSet.add(elementInfo.tagname.toUpperCase());
      }
    });
  }

  // Generate tableItems.
  const useTagItems: InclusionTableItem[] = [];
  for (const useTag of Array.from(useTagSet).sort()) {
    useTagItems.push({
      text: useTag,
      isInclude: includeTagSet.has(useTag),
    });
  }

  return useTagItems;
}

/**
 * Get coverage information.
 * @param screenHistory  Screen transition information.
 * @param inclusionTags  Included tag list.
 * @returns Coverage information.
 */
export async function getCoverages(
  screenHistory: ScreenHistory,
  inclusionTags: string[]
): Promise<
  Array<{
    screenTitle: string;
    percentage: number;
    elements: Array<{
      sequence: number | null;
      tagname: string;
      type: string;
      id: string;
      name: string;
      text: string;
      operated: boolean;
    }>;
  }>
> {
  const inclusionSet = new Set(inclusionTags);
  const result = [];
  for (const screen of screenHistory.appearedScreens) {
    const operatedElementsMap = new Map<
      string,
      {
        sequence: number;
        info: ElementInfo;
      }
    >();

    for (const current of screen.operationHistory) {
      if (current.operation.elementInfo === null) {
        continue;
      }

      await (async (currentElementInfo: ElementInfo): Promise<void> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            // Register the operated element (including inclusion tags)
            if (inclusionSet.has(currentElementInfo.tagname)) {
              operatedElementsMap.set(
                normalizeXPath(currentElementInfo.xpath),
                {
                  sequence: current.operation.sequence,
                  info: currentElementInfo,
                }
              );
            }

            // If the operated element is a select element, the selected option element is also registered.
            if (
              currentElementInfo.tagname.toLowerCase() === "select" &&
              (inclusionSet.has("option") || inclusionSet.has("OPTION"))
            ) {
              for (const screenElement of screen.screenElements) {
                const screenElmValue =
                  screenElement.attributes.value !== undefined
                    ? screenElement.attributes.value
                    : screenElement.text;
                const operatedOptionXPath =
                  currentElementInfo.xpath + "/option";

                if (
                  screenElement.xpath
                    .toLowerCase()
                    .indexOf(operatedOptionXPath.toLowerCase()) !== -1 &&
                  screenElmValue === current.operation.input
                ) {
                  operatedElementsMap.set(normalizeXPath(screenElement.xpath), {
                    sequence: current.operation.sequence,
                    info: screenElement,
                  });
                }
              }
            }

            resolve();
          }, 1);
        });
      })(current.operation.elementInfo);
    }

    // Register the elements found on the screen (including inclusion tags).
    const foundElementsMap = new Map(
      screen.screenElements
        .filter((screenElement) => inclusionSet.has(screenElement.tagname))
        .map((screenElement) => [
          normalizeXPath(screenElement.xpath),
          screenElement,
        ])
    );

    const elements: Array<{
      sequence: number | null;
      tagname: string;
      type: string;
      id: string;
      name: string;
      text: string;
      xpath: string;
      operated: boolean;
    }> = [];

    foundElementsMap.forEach((elementInfo: ElementInfo, foundElementXPath) => {
      let operatedElementWithSequence: {
        sequence: number;
        info: ElementInfo;
      } | null = null;

      for (const [key, value] of operatedElementsMap) {
        if (foundElementXPath === key) {
          operatedElementWithSequence = value;
          break;
        }
      }

      if (elementInfo.attributes.type !== "hidden") {
        elements.push({
          sequence:
            operatedElementWithSequence === null
              ? null
              : operatedElementWithSequence.sequence,
          tagname: elementInfo.tagname,
          type: elementInfo.attributes.type ? elementInfo.attributes.type : "",
          id: elementInfo.attributes.id ? elementInfo.attributes.id : "",
          name: elementInfo.attributes.name ? elementInfo.attributes.name : "",
          text: elementInfo.text
            ? elementInfo.text
            : elementInfo.attributes.href
            ? elementInfo.attributes.href
            : "",
          xpath: elementInfo.xpath,
          operated: operatedElementWithSequence !== null,
        });
      }
    });
    const percent =
      (elements.filter((element) => element.operated).length /
        elements.length) *
      100;
    result.push({
      screenTitle: screen.screenDef,
      percentage: Number.isNaN(percent) ? 0 : Math.round(percent * 100) / 100,
      elements,
    });
  }
  return result;
}
