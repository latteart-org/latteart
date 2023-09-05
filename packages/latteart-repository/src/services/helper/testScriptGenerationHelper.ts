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
  createWDIOLocatorFormatter,
  ScreenElementLocatorGenerator,
} from "@/domain/elementLocator";
import ScreenDefFactory, {
  ScreenDefinitionConfig,
} from "@/domain/ScreenDefFactory";
import {
  TestScriptSourceElement,
  TestScriptSourceOperation,
} from "@/domain/testScriptGeneration";
import { ElementInfo, TestScriptOption } from "@/domain/types";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { TestStepEntity } from "@/entities/TestStepEntity";

export type TestResultForTestScriptGeneration = {
  initialUrl: string;
  coverageSources: {
    url: string;
    title: string;
    screenElements: ElementInfo[];
  }[];
  operations: {
    input: string;
    type: string;
    elementInfo: ElementInfo | null;
    url: string;
    title: string;
    keywordTexts: (string | { tagname: string; value: string })[];
    imageFilePath: string;
  }[];
};

export function createScreenDefinitionConfig(
  testScriptOption: TestScriptOption
): ScreenDefinitionConfig {
  return {
    screenDefType: testScriptOption.view.node.unit,
    conditionGroups: testScriptOption.view.node.definitions.map(
      (definition) => {
        return {
          isEnabled: true,
          screenName: definition.name,
          conditions: definition.conditions.map((condition) => {
            return {
              isEnabled: true,
              definitionType: condition.target,
              matchType: condition.method,
              word: condition.value,
            };
          }),
        };
      }
    ),
  };
}

export function convertEntityToTestResult(
  testResultEntity: TestResultEntity
): TestResultForTestScriptGeneration {
  const coverageSources =
    testResultEntity.coverageSources?.map((sourceEntity) => {
      const screenElements = JSON.parse(
        sourceEntity.screenElements
      ) as ElementInfo[];

      const url = sourceEntity.url;
      const title = sourceEntity.title;

      return { url, title, screenElements };
    }) ?? [];
  const operations =
    testResultEntity.testSteps
      ?.sort((first, second) => first.timestamp - second.timestamp)
      .map((testStepEntity) => convertEntityToOperation(testStepEntity)) ?? [];

  return {
    initialUrl: testResultEntity.initialUrl,
    coverageSources,
    operations,
  };
}

export function createTestScriptSourceOperations(
  testResult: Pick<
    TestResultForTestScriptGeneration,
    "coverageSources" | "operations"
  >,
  screenDefFactory: ScreenDefFactory,
  option: TestScriptOption
): TestScriptSourceOperation[] {
  const screenDefToElements = groupElementsByScreenDef(
    testResult.coverageSources.map((coverageSource) => {
      const keywordSet = coverageSource.screenElements.reduce(
        (set, element) => {
          set.add(element.text ?? "");
          return set;
        },
        new Set<string>()
      );
      const { title, url } = coverageSource;
      const screenDef = screenDefFactory.create({ title, url, keywordSet });

      return { ...coverageSource, screenDef };
    })
  );
  const testScriptSourceOperationFactory =
    createTestScriptSourceOperationFactory(screenDefToElements, option);

  return testResult.operations
    .filter(({ type }) => !["start_capturing", "open_window"].includes(type))
    .map((operation) => {
      const keywordSet = new Set(
        operation.keywordTexts.map((keywordText) => {
          return typeof keywordText === "string"
            ? keywordText
            : keywordText.value;
        }) ?? []
      );
      const { title, url } = operation;
      const screenDef = screenDefFactory.create({ title, url, keywordSet });

      return testScriptSourceOperationFactory.create({
        ...operation,
        screenDef,
      });
    });
}

function convertEntityToOperation(testStepEntity: TestStepEntity) {
  const keywordTexts = JSON.parse(testStepEntity.keywordTexts) as (
    | string
    | { tagname: string; value: string }
  )[];

  const elementInfo = (() => {
    const element = JSON.parse(testStepEntity.operationElement) as ElementInfo;

    if (element == null || Object.keys(element).length === 0) {
      return null;
    }

    return element;
  })();

  return {
    input: testStepEntity.operationInput,
    type: testStepEntity.operationType,
    elementInfo,
    url: testStepEntity.pageUrl,
    title: testStepEntity.pageTitle,
    keywordTexts,
    imageFilePath: testStepEntity.screenshot?.fileUrl ?? "",
  };
}

function createTestScriptSourceOperationFactory(
  screenDefToElements: Map<string, ElementInfo[]>,
  option: Pick<TestScriptOption, "useMultiLocator">
) {
  const screenDefToLocatorGenerator = new Map<
    string,
    ScreenElementLocatorGenerator
  >();

  return {
    create(
      operation: Omit<TestScriptSourceOperation, "elementInfo"> & {
        elementInfo: Omit<TestScriptSourceElement, "locators"> | null;
      }
    ): TestScriptSourceOperation {
      const { screenDef, elementInfo } = operation;
      const locatorGenerator =
        screenDefToLocatorGenerator.get(screenDef) ??
        new ScreenElementLocatorGenerator(
          createWDIOLocatorFormatter(),
          screenDefToElements.get(screenDef) ?? [],
          option.useMultiLocator ?? false
        );

      screenDefToLocatorGenerator.set(screenDef, locatorGenerator);

      return {
        ...operation,
        elementInfo: elementInfo
          ? {
              ...elementInfo,
              text: elementInfo.text ?? "",
              locators: locatorGenerator?.generateFrom(elementInfo) ?? [],
            }
          : null,
      };
    },
  };
}

function groupElementsByScreenDef(
  screens: { screenDef: string; screenElements: ElementInfo[] }[]
) {
  const duplicateCheckMap = new Map<string, Set<string>>();

  return screens.reduce((acc, { screenDef, screenElements }) => {
    const elements = acc.get(screenDef) ?? [];

    const xpathSet = duplicateCheckMap.get(screenDef) ?? new Set<string>();
    screenElements.forEach((element) => {
      if (!xpathSet?.has(element.xpath)) {
        elements.push(element);
        xpathSet?.add(element.xpath);
      }
    });

    acc.set(screenDef, elements);

    return acc;
  }, new Map<string, ElementInfo[]>());
}
