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
  const filteredTestSteps = testSteps.filter(({ operation }) => {
    return !["start_capturing", "open_window"].includes(operation.type);
  });

  const elementMapper = new ElementMapperFactory(idGenerator).create(
    coverageSources
  );

  const screenDefToScreen = createScreenDefToScreenMap(
    filteredTestSteps,
    elementMapper,
    idGenerator
  );

  const windows = collectWindows(filteredTestSteps);
  const screens = [...screenDefToScreen.values()];
  const elements = elementMapper.collectElements();
  const testPurposes = collectTestPurposes(testSteps);
  const notes = collectNotes(testSteps);

  const nodes = createNodes(testSteps, screenDefToScreen, elementMapper);

  return { nodes, store: { windows, screens, elements, testPurposes, notes } };
}

export type ElementMapper = {
  findElement: (
    pageUrl: string,
    pageTitle: string,
    xpath: string,
    iframeIndex?: number
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
            `${screenElement.pageUrl}_${screenElement.pageTitle}_${
              screenElement.xpath
            }_${screenElement.iframeIndex ?? ""}`,
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
      findElement: (
        pageUrl: string,
        pageTitle: string,
        xpath: string,
        iframeIndex?: number
      ) => {
        const element = keyToScreenElement.get(
          `${pageUrl}_${pageTitle}_${xpath}_${iframeIndex ?? ""}`
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
          iframeIndex: idx,
          boundingRect,
          innerHeight,
          innerWidth,
          outerHeight,
          outerWidth,
        } = element;

        return {
          id,
          pageUrl: url,
          pageTitle: title,
          xpath: elmXPath,
          tagname,
          text: text ?? "",
          attributes,
          iframeIndex: idx,
          boundingRect,
          innerHeight,
          innerWidth,
          outerHeight,
          outerWidth,
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
            iframeIndex,
            boundingRect,
            innerHeight,
            innerWidth,
            outerHeight,
            outerWidth,
          } = element;
          return {
            id: id,
            pageUrl: url,
            pageTitle: title,
            xpath,
            tagname,
            text: text ?? "",
            value,
            attributes,
            iframeIndex,
            boundingRect,
            innerHeight,
            innerWidth,
            outerHeight,
            outerWidth,
          };
        });
      },
    };
  }
}

function createScreenDefToScreenMap(
  testSteps: TestStepForGraphView[],
  elementMapper: ElementMapper,
  idGenerator: {
    generateScreenId: () => string;
    generateElementId: () => string;
  }
) {
  return new Map(
    testSteps
      .filter(({ screenDef }, index, array) => {
        return (
          array.findIndex((testStep) => testStep.screenDef === screenDef) ===
          index
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
}

function collectWindows(testSteps: TestStepForGraphView[]) {
  return testSteps
    .filter(({ operation }, index, array) => {
      return (
        array.findIndex(
          (testStep) =>
            testStep.operation.windowHandle === operation.windowHandle
        ) === index
      );
    })
    .map(({ operation }, index) => {
      return { id: operation.windowHandle, name: `window${index + 1}` };
    });
}

function collectNotes(testSteps: TestStepForGraphView[]) {
  return testSteps
    .flatMap(({ bugs, notices }) => {
      return [...bugs, ...notices].map((note) => {
        return { id: note.id };
      });
    })
    .filter((note, index, array) => {
      return array.findIndex(({ id }) => id === note.id) === index;
    });
}

function collectTestPurposes(testSteps: TestStepForGraphView[]) {
  return testSteps
    .flatMap(({ intention }) => {
      return intention ? [{ id: intention.id }] : [];
    })
    .filter((testPurpose, index, array) => {
      return array.findIndex(({ id }) => id === testPurpose.id) === index;
    });
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
          testStep.operation.elementInfo.xpath,
          testStep.operation.elementInfo?.iframeIndex
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

    const targetTestStep = testStepGroup.testSteps
      .filter(
        ({ operation }) =>
          !["open_window", "switch_window"].includes(operation.type)
      )
      .reverse()
      .find((testStep) => {
        return testStep.operation.inputElements.length > 0;
      });

    const nodeDefaultValues = targetTestStep
      ? collectDefaultValues(targetTestStep.operation, elementMapper)
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
    .reduce((acc: TestStepGroup[], testStep, index) => {
      const isScreenChanged =
        index > 0 ? testStep.operation.type === "screen_transition" : true;

      if (isScreenChanged) {
        const windowId = testStep.operation.windowHandle;
        const screenId = screenDefToScreen.get(testStep.screenDef)?.id ?? "";
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
        element.xpath,
        element.iframeIndex
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
