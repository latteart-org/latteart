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

export function extractTestHintResources(
  testSteps: {
    operation: {
      elementInfo: { tagname: string; attributes: { type?: string }; text?: string } | null;
      keywordSet?: Set<string>;
    };
    comments: { value: string }[];
    issues: string[];
  }[]
): {
  commentWords: string[];
  displayedWords: string[];
  elements: {
    tagname: string;
    type: string;
    text: string;
  }[];
  issues: string[];
} {
  const { commentWords, displayedWords, elements, issues } = testSteps.reduce(
    (acc, testStep) => {
      const commentWords = testStep.comments
        .flatMap(({ value }) => value.split(" "))
        .filter((word) => word !== "");
      acc.commentWords.push(...commentWords);

      const displayedWords = testStep.operation.keywordSet
        ? Array.from(testStep.operation.keywordSet)
            .flatMap((keyword) => keyword.split(" "))
            .filter((word) => word !== "")
        : [];
      acc.displayedWords.push(...displayedWords);

      const element = testStep.operation.elementInfo;
      if (element && element.tagname) {
        acc.elements.push({
          tagname: element.tagname,
          type: element.attributes.type ?? "",
          text: element.text ?? ""
        });
      }

      acc.issues.push(...testStep.issues);

      return acc;
    },
    {
      commentWords: new Array<string>(),
      displayedWords: new Array<string>(),
      elements: new Array<{ tagname: string; type: string; text: string }>(),
      issues: new Array<string>()
    }
  );

  return {
    commentWords: commentWords.filter((word, index, array) => array.indexOf(word) === index),
    displayedWords: displayedWords.filter((word, index, array) => array.indexOf(word) === index),
    elements: elements.filter((e1, index, array) => {
      return (
        array.findIndex((e2) => {
          return `${e2.tagname}_${e2.type}_${e2.text}` === `${e1.tagname}_${e1.type}_${e1.text}`;
        }) === index
      );
    }),
    issues: issues.filter((issue, index, array) => array.indexOf(issue) === index)
  };
}

export function buildCommentMatchingWords(
  testHintResources: {
    commentWords: string[];
    displayedWords: string[];
  },
  commentMatchingConfig: {
    target: "all" | "wordsOnPageOnly";
    extraWords: string[];
    excludedWords: string[];
  }
): string[] {
  const wordSet = new Set([
    ...testHintResources.displayedWords,
    ...commentMatchingConfig.extraWords
  ]);
  const baseCommentWords =
    commentMatchingConfig.target === "all"
      ? testHintResources.commentWords
      : [...testHintResources.commentWords.filter((word) => wordSet.has(word))];

  return baseCommentWords.filter((word) => {
    return !commentMatchingConfig.excludedWords.includes(word);
  });
}
