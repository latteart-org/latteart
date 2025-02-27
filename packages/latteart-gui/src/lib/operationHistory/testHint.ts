/**
 * Copyright 2025 NTT Corporation.
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

import type { TestHint } from "./types";

/**
 * Select test hints that match specified condition.
 * @param testHints Source test hints.
 * @param condition matching condition.
 * @returns Selected test hints with match count.
 */
export function selectMatchedTestHints(
  testHints: TestHint[],
  condition: {
    comments: string[];
    elements: { tagname: string; type: string; text: string }[];
  }
): { testHints: TestHint[]; testHintMatchCounts: { id: string; matchCount: number }[] } {
  const tagTypeArray: string[] = [];
  const textArray: string[] = [];
  condition.elements.forEach((element) => {
    tagTypeArray.push(`${element.tagname.toLowerCase() ?? ""}_${element.type.toLowerCase() ?? ""}`);
    textArray.push(element.text);
  });

  const elementTagAndTypeSet = new Set(tagTypeArray);
  const elementTextSet = new Set(textArray);

  const matchResults = testHints.map((testHint, index) => {
    const matchCountByTags = matchHintByComments(testHint, {
      comments: condition.comments
    });

    const matchCountByElements = matchHintByElements(
      { operationElements: testHint.operationElements },
      {
        elementTagAndTypeSet,
        elementTextSet
      }
    );

    return { index, matchCount: matchCountByTags + matchCountByElements };
  });

  const data = matchResults
    .sort((a, b) => b.matchCount - a.matchCount)
    .map((c) => {
      return { ...testHints[c.index], matchCount: c.matchCount };
    })
    .filter((d) => d.matchCount !== 0)
    .reduce(
      (acc, item) => {
        const testHint = {
          id: item.id,
          value: item.value,
          testMatrixName: item.testMatrixName,
          groupName: item.groupName,
          testTargetName: item.testTargetName,
          viewPointName: item.viewPointName,
          customs: item.customs,
          commentWords: item.commentWords,
          operationElements: item.operationElements,
          issues: item.issues
        };
        acc.testHints.push(testHint);

        const testHintMatchCount = {
          id: item.id,
          matchCount: item.matchCount
        };
        acc.testHintMatchCounts.push(testHintMatchCount);

        return acc;
      },
      {
        testHints: new Array<TestHint>(),
        testHintMatchCounts: new Array<{ id: string; matchCount: number }>()
      }
    );

  return data;
}

function matchHintByComments(targetTestHint: TestHint, condition: { comments: string[] }) {
  if (condition.comments.length === 0) {
    return 0;
  }

  return condition.comments.reduce((acc, comment) => {
    if (comment === "") {
      return acc;
    }
    const c1 = targetTestHint.value.includes(comment) ? 1 : 0;
    const c2 = targetTestHint.commentWords.reduce((acc, cur) => {
      return cur === comment ? acc + 1 : acc;
    }, 0);
    acc = acc + c1 + c2;

    return acc;
  }, 0);
}

function matchHintByElements(
  targetTestHint: { operationElements: TestHint["operationElements"] },
  condition: { elementTagAndTypeSet: Set<string>; elementTextSet: Set<string> }
) {
  const { elementTagAndTypeSet, elementTextSet } = condition;

  if (elementTagAndTypeSet.size + elementTextSet.size === 0) {
    return 0;
  }

  return targetTestHint.operationElements.reduce((acc, targetElement) => {
    const targetElementTagAndType = `${targetElement.tagname.toLowerCase() ?? ""}_${
      targetElement.type.toLowerCase() ?? ""
    }`;
    if (elementTagAndTypeSet.has(targetElementTagAndType)) {
      acc++;
    }

    if (targetElement.text !== "" && elementTextSet.has(targetElement.text)) {
      acc++;
    }

    return acc;
  }, 0);
}
