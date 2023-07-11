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

import {
  SequenceView,
  SequenceViewNode,
  TestStepForSequenceView,
} from "./types";

export function generateSequenceView(
  testResultId: string,
  testSteps: TestStepForSequenceView[]
): SequenceView {
  const filteredTestSteps = testSteps.filter(({ operation }) => {
    return !["start_capturing", "open_window"].includes(operation.type);
  });

  const screenDefToScreenId = createScreenDefToScreenMap(filteredTestSteps);

  const windows = collectWindows(filteredTestSteps);
  const screens = [...screenDefToScreenId.values()];

  const scenarios = createScenarios(testSteps, screenDefToScreenId);

  return { testResultId, windows, screens, scenarios };
}

function createScreenDefToScreenMap(testSteps: TestStepForSequenceView[]) {
  return new Map(
    testSteps
      .filter(({ screenDef }, index, array) => {
        return (
          array.findIndex((testStep) => testStep.screenDef === screenDef) ===
          index
        );
      })
      .map(({ screenDef }, index) => {
        return [screenDef, { id: `s${index}`, name: screenDef }];
      })
  );
}

function collectWindows(testSteps: TestStepForSequenceView[]) {
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

function createScenarios(
  testSteps: TestStepForSequenceView[],
  screenDefToScreenId: Map<
    string,
    {
      id: string;
      name: string;
    }
  >
) {
  return testSteps.reduce((acc: SequenceView["scenarios"], testStep) => {
    const lastScenario = acc.at(-1);
    const isNewTestPurpose =
      !lastScenario ||
      (testStep.intention !== null &&
        lastScenario.testPurpose?.id !== testStep.intention.id);
    if (isNewTestPurpose) {
      acc.push({
        testPurpose: testStep.intention
          ? { ...testStep.intention, id: testStep.intention.id ?? "" }
          : undefined,
        nodes: [],
      });
    }

    const screenId = screenDefToScreenId.get(testStep.screenDef)?.id ?? "";

    const lastNode = acc.at(-1)?.nodes.at(-1);
    const newNodes = createNodes(
      screenId,
      testStep.operation.windowHandle,
      testStep.operation.type,
      lastNode
    );

    acc.at(-1)?.nodes.push(...newNodes);

    acc
      .at(-1)
      ?.nodes.at(-1)
      ?.testSteps.push({
        id: testStep.id,
        type: testStep.operation.type,
        input: testStep.operation.input,
        element: testStep.operation.elementInfo
          ? {
              xpath: testStep.operation.elementInfo.xpath,
              tagname: testStep.operation.elementInfo.tagname,
              text: (({ elementInfo }) => {
                if (!elementInfo) {
                  return "";
                }
                if (elementInfo.text) {
                  return elementInfo.text;
                }
                return `${elementInfo.attributes.value ?? ""}`;
              })(testStep.operation),
            }
          : undefined,
        notes: [...(testStep.bugs ?? []), ...(testStep.notices ?? [])].map(
          (note) => {
            return { ...note, id: note.id ?? "" };
          }
        ),
      });

    return acc;
  }, []);
}

function createNodes(
  screenId: string,
  windowId: string,
  type: string,
  beforeNode?: SequenceViewNode
): SequenceViewNode[] {
  const newNode = { windowId, screenId, testSteps: [] };

  const lastOperationType = beforeNode?.testSteps.at(-1)?.type;
  const isScreenChanged = type === "screen_transition";
  const isWindowChanged =
    beforeNode === undefined || beforeNode.windowId !== windowId;

  if (type === "resume_capturing") {
    if (beforeNode?.disabled) {
      return [newNode];
    }

    return [{ ...newNode, testSteps: [], disabled: true }, newNode];
  } else {
    if (lastOperationType === "pause_capturing") {
      return [
        {
          windowId: beforeNode?.windowId ?? "",
          screenId: beforeNode?.screenId ?? "",
          testSteps: [],
          disabled: true,
        },
        { ...newNode, testSteps: [], disabled: true },
      ];
    }
  }

  if (beforeNode?.disabled && (isWindowChanged || isScreenChanged)) {
    return [{ ...newNode, disabled: true }];
  }

  if (isWindowChanged || isScreenChanged) {
    return [newNode];
  }

  return [];
}
