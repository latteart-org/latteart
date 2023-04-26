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

import { ElementInfo } from "@/domain/types";
import { GraphView, TestStepForGraphView } from "./types";

export type IdGenerator = {
  generateScreenId: () => string;
  generateElementId: () => string;
};

export function generateGraphView(
  testSteps: TestStepForGraphView[],
  coverageSources: {
    screenDef: string;
    screenElements: (ElementInfo & { pageUrl: string; pageTitle: string })[];
  }[],
  idGenerator: {
    generateScreenId: () => string;
    generateElementId: () => string;
  }
): GraphView {
  const elementMapper = new ElementMapperFactory(idGenerator).create(
    coverageSources
  );

  const screenDefToScreen = new Map(
    testSteps
      .filter(({ screenDef }, index, testSteps) => {
        return (
          testSteps.findIndex(
            (testStep) => testStep.screenDef === screenDef
          ) === index
        );
      })
      .map(({ screenDef }) => {
        const elementIds = elementMapper
          .collectElements({ screenDef })
          .map(({ id }) => id);
        return [
          screenDef,
          { id: idGenerator.generateScreenId(), name: screenDef, elementIds },
        ];
      })
  );

  const elements = elementMapper.collectElements();

  const windows = testSteps
    .map(({ operation }) => operation.windowHandle)
    .filter((windowHandle, index, array) => {
      return array.indexOf(windowHandle) === index;
    })
    .map((windowHandle, index) => {
      return { id: windowHandle, name: `window${index + 1}` };
    });

  const notes = testSteps
    .flatMap(({ bugs, notices }) => {
      return [...bugs, ...notices].map((note) => {
        return { id: note.id };
      });
    })
    .filter((note, index, array) => {
      return array.findIndex(({ id }) => id === note.id) === index;
    });

  const testPurposes = testSteps
    .flatMap(({ intention }) => {
      return intention ? [{ id: intention.id }] : [];
    })
    .filter((testPurpose, index, array) => {
      return array.findIndex(({ id }) => id === testPurpose.id) === index;
    });

  const screens = [...screenDefToScreen.values()];

  const nodes = createNodes(testSteps, screenDefToScreen, elementMapper);

  return { nodes, store: { windows, screens, elements, testPurposes, notes } };
}

export type ElementMapper = {
  findElement: (
    pageUrl: string,
    pageTitle: string,
    xpath: string
  ) => GraphView["store"]["elements"][0] | undefined;
  collectElements: (filter?: {
    screenDef?: string;
  }) => GraphView["store"]["elements"];
};

export class ElementMapperFactory {
  constructor(private idGenerator: Pick<IdGenerator, "generateElementId">) {}

  create(
    coverageSources: {
      screenDef: string;
      screenElements: (ElementInfo & { pageUrl: string; pageTitle: string })[];
    }[]
  ): ElementMapper {
    const keyToScreenElement = new Map(
      coverageSources.flatMap(({ screenDef, screenElements }) => {
        return screenElements.map((screenElement) => {
          return [
            `${screenElement.pageUrl}_${screenElement.pageTitle}_${screenElement.xpath}`,
            {
              screenDef,
              element: {
                id: this.idGenerator.generateElementId(),
                ...screenElement,
              },
            },
          ];
        });
      })
    );

    return {
      findElement: (pageUrl: string, pageTitle: string, xpath: string) => {
        const element = keyToScreenElement.get(
          `${pageUrl}_${pageTitle}_${xpath}`
        )?.element;

        if (!element) {
          return undefined;
        }

        const {
          id,
          pageUrl: url,
          pageTitle: title,
          xpath: elmXPath,
          tagname,
          text,
          attributes,
        } = element;

        return {
          id,
          pageUrl: url,
          pageTitle: title,
          xpath: elmXPath,
          tagname,
          text: text ?? "",
          attributes,
        };
      },
      collectElements: (filter?: { screenDef?: string }) => {
        const screenElements = [...keyToScreenElement.values()].filter(
          (pageElement) => {
            if (
              filter?.screenDef &&
              pageElement.screenDef !== filter.screenDef
            ) {
              return false;
            }

            return true;
          }
        );

        return screenElements.map(({ element }) => {
          const {
            id,
            pageUrl: url,
            pageTitle: title,
            xpath,
            tagname,
            text,
            value,
            attributes,
          } = element;
          return {
            id,
            pageUrl: url,
            pageTitle: title,
            xpath,
            tagname,
            text: text ?? "",
            value,
            attributes,
          };
        });
      },
    };
  }
}

function createNodes(
  testSteps: TestStepForGraphView[],
  screenDefToScreen: Map<string, { id: string; name: string }>,
  elementMapper: ElementMapper
) {
  return testSteps.reduce((acc: GraphView["nodes"], testStep, index) => {
    const screenId = screenDefToScreen.get(testStep.screenDef)?.id;

    if (!screenId) {
      return acc;
    }

    const windowId = testStep.operation.windowHandle;
    const isWindowChanged =
      index > 0
        ? windowId !== testSteps.at(index - 1)?.operation.windowHandle
        : true;
    const isScreenChanged =
      index > 0
        ? screenId !==
          screenDefToScreen.get(testSteps.at(index - 1)?.screenDef ?? "")?.id
        : true;

    if (isWindowChanged || isScreenChanged) {
      acc.push({ windowId, screenId, testSteps: [], defaultValues: [] });
    }

    const { url, title, elementInfo } = testStep.operation;
    const targetElementId = elementInfo
      ? elementMapper.findElement(url, title, elementInfo.xpath)?.id
      : undefined;

    acc.at(-1)?.testSteps.push({
      id: testStep.id,
      type: testStep.operation.type,
      input: testStep.operation.input,
      targetElementId,
      noteIds: [...testStep.bugs, ...testStep.notices].map(({ id }) => id),
      testPurposeId: testStep.intention?.id,
      pageUrl: testStep.operation.url,
      pageTitle: testStep.operation.title,
    });

    const defaultValues = collectDefaultValues(
      testStep.operation,
      elementMapper
    );

    const prevValuesLength = acc.at(-1)?.defaultValues.length ?? 0;
    acc.at(-1)?.defaultValues.splice(0, prevValuesLength, ...defaultValues);

    return acc;
  }, []);
}

function collectDefaultValues(
  operation: TestStepForGraphView["operation"],
  elementMapper: ElementMapper
) {
  return operation.inputElements
    .flatMap((element) => {
      const elementId = elementMapper.findElement(
        operation.url,
        operation.title,
        element.xpath
      )?.id;

      if (!elementId) {
        return [];
      }

      const value = getDefaultValueOfElement(element);
      return { elementId, value };
    })
    .reverse()
    .filter(({ elementId: id1 }, index, array) => {
      return array.findIndex(({ elementId: id2 }) => id1 === id2) === index;
    })
    .reverse();
}

function getDefaultValueOfElement(
  element: TestStepForGraphView["operation"]["inputElements"][0]
) {
  if (element.tagname.toLowerCase() === "input") {
    if (
      element.attributes.type &&
      element.attributes.type.toLowerCase() === "checkbox"
    ) {
      return element.checked ? "on" : "off";
    }

    if (
      element.attributes.type &&
      element.attributes.type.toLowerCase() === "radio"
    ) {
      return element.checked ? "on" : "off";
    }
  }

  return element.value ?? "";
}
