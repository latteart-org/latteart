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
          screenDef &&
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
      return windowHandle && array.indexOf(windowHandle) === index;
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

type TestStepGroup = {
  windowId: string;
  screenId: string;
  testSteps: (Omit<TestStepForGraphView, "operation"> & {
    operation: Omit<TestStepForGraphView["operation"], "elementInfo"> & {
      targetElementId?: string;
    };
  })[];
};

function createNodes(
  testSteps: TestStepForGraphView[],
  screenDefToScreen: Map<string, { id: string; name: string }>,
  elementMapper: ElementMapper
): GraphView["nodes"] {
  const testStepForNodes = testSteps.map((testStep) => {
    const targetElementId = testStep.operation.elementInfo
      ? elementMapper.findElement(
          testStep.operation.url,
          testStep.operation.title,
          testStep.operation.elementInfo.xpath
        )?.id
      : undefined;

    return {
      ...testStep,
      operation: { ...testStep.operation, targetElementId },
    };
  });

  const testStepGroups = groupTestSteps(testStepForNodes, screenDefToScreen);

  return testStepGroups.map((testStepGroup) => {
    const nodeTestSteps = testStepGroup.testSteps.map((testStep) => {
      const { targetElementId } = testStep.operation;

      return {
        id: testStep.id,
        type: testStep.operation.type,
        input: testStep.operation.input,
        targetElementId,
        noteIds: [...testStep.bugs, ...testStep.notices].map(({ id }) => id),
        testPurposeId: testStep.intention?.id,
        pageUrl: testStep.operation.url,
        pageTitle: testStep.operation.title,
      };
    });

    const lastTestStep = testStepGroup.testSteps.at(-1);
    const nodeDefaultValues = lastTestStep
      ? collectDefaultValues(lastTestStep.operation, elementMapper)
      : [];

    return {
      windowId: testStepGroup.windowId,
      screenId: testStepGroup.screenId,
      testSteps: nodeTestSteps,
      defaultValues: nodeDefaultValues,
    };
  });
}

function groupTestSteps(
  testStepForNodes: (Omit<TestStepForGraphView, "operation"> & {
    operation: TestStepForGraphView["operation"] & { targetElementId?: string };
  })[],
  screenDefToScreen: Map<string, { id: string; name: string }>
) {
  const triggerElementIds = extractTriggerElementIds(
    testStepForNodes,
    screenDefToScreen
  );

  return testStepForNodes.reduce(
    (acc: TestStepGroup[], testStep, index, array) => {
      const windowId = testStep.operation.windowHandle;
      const screenId = screenDefToScreen.get(testStep.screenDef)?.id ?? "";

      const prevOperation =
        index > 0 ? array.at(index - 1)?.operation : undefined;

      if (
        !prevOperation ||
        testStep.operation.type === "start_capturing" ||
        testStep.operation.type === "screen_transition" ||
        triggerElementIds.includes(prevOperation.targetElementId ?? "")
      ) {
        acc.push({ windowId, screenId, testSteps: [] });
      }

      acc.at(-1)?.testSteps.push(testStep);

      return acc;
    },
    []
  );
}

function extractTriggerElementIds(
  testStepForNodes: (Omit<TestStepForGraphView, "operation"> & {
    operation: TestStepForGraphView["operation"] & { targetElementId?: string };
  })[],
  screenDefToScreen: Map<string, { id: string; name: string }>
) {
  return testStepForNodes
    .reduce((acc: TestStepGroup[], testStep, index, array) => {
      const screenId = screenDefToScreen.get(testStep.screenDef)?.id ?? "";

      const windowId = testStep.operation.windowHandle;
      const isWindowChanged =
        index > 0
          ? windowId !== array.at(index - 1)?.operation.windowHandle
          : true;
      const isScreenChanged =
        index > 0
          ? screenId !==
            screenDefToScreen.get(array.at(index - 1)?.screenDef ?? "")?.id
          : true;

      if (isWindowChanged || isScreenChanged) {
        acc.push({ windowId, screenId, testSteps: [] });
      }

      acc.at(-1)?.testSteps.push(testStep);

      return acc;
    }, [])
    .filter((_, index, array) => {
      const nextGroup = array.at(index + 1);
      return nextGroup?.windowId && nextGroup.screenId;
    })
    .flatMap((testStepGroup) => {
      const lastTestStepElementId =
        testStepGroup.testSteps.at(-1)?.operation.targetElementId;

      return lastTestStepElementId ? [lastTestStepElementId] : [];
    })
    .filter((elementId, index, array) => {
      return array.indexOf(elementId) === index;
    });
}

function collectDefaultValues(
  operation: TestStepGroup["testSteps"][0]["operation"],
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
