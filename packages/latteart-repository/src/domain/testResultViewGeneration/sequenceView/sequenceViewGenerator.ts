/**
 * Copyright 2024 NTT Corporation.
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

import { SequenceView, TestStepForSequenceView } from "./types";

export function generateSequenceView(
  testResultId: string,
  testSteps: TestStepForSequenceView[]
): SequenceView {
  const filteredTestSteps = testSteps.filter(({ operation }) => {
    return !["start_capturing", "open_window"].includes(operation.type);
  });

  const screenDefToScreen = createScreenDefToScreenMap(filteredTestSteps);

  const windows = collectWindows(filteredTestSteps);
  const screens = [...screenDefToScreen.values()];

  const scenarios = createScenarios(testSteps, screenDefToScreen);

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
  screenDefToScreen: Map<string, { id: string; name: string }>
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

    const createNewNode = () => {
      return {
        windowId: testStep.operation.windowHandle,
        screenId: screenDefToScreen.get(testStep.screenDef)?.id ?? "",
        testSteps: [],
      };
    };

    const lastNode = acc.at(-1)?.nodes.at(-1);

    if (
      !lastNode ||
      ["resume_capturing", "start_capturing"].includes(testStep.operation.type)
    ) {
      acc.at(-1)?.nodes.push({ ...createNewNode() });
    }

    if (lastNode && testStep.operation.type === "screen_transition") {
      acc
        .at(-1)
        ?.nodes.push({ ...createNewNode(), disabled: lastNode.disabled });
    }

    acc.at(-1)?.nodes.at(-1)?.testSteps.push(convertTestStepForNode(testStep));

    if (testStep.operation.type === "pause_capturing") {
      acc.at(-1)?.nodes.push({ ...createNewNode(), disabled: true });
    }

    return acc;
  }, []);
}

function convertTestStepForNode(testStep: TestStepForSequenceView) {
  return {
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
  };
}
