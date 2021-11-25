/**
 * Copyright 2021 NTT Corporation.
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

import { PageObject } from "./pageObject/PageObject";
import { TestSuite } from "./testSuite/TestSuite";
import { PageObjectFactory } from "./pageObject/PageObjectFactory";
import { TestSuiteFactory } from "./testSuite/TestSuiteFactory";
import { Operation } from "../../Operation";
import {
  SequencePathBuilder,
  SequencePath,
} from "./sequencePath/SequencePathBuilder";
import { Sequence } from "./sequencePath/Sequence";

export interface TestScriptModel {
  pageObjects: PageObject[];
  testSuites: TestSuite[];
}

export interface TestScriptModelGenerator {
  generate(
    sources: { initialUrl: string; history: Operation[] }[]
  ): TestScriptModel;
}

export class TestScriptModelGeneratorImpl implements TestScriptModelGenerator {
  constructor(
    private sequencePathBuilder: SequencePathBuilder,
    private pageObjectFactory: PageObjectFactory,
    private testSuiteFactory: TestSuiteFactory,
    private imageUrlResolver: (url: string) => string
  ) {}

  public generate(
    sources: { initialUrl: string; history: Operation[] }[]
  ): TestScriptModel {
    const initialUrlToHistories = Array.from(
      sources
        .reduce((acc, { initialUrl, history }) => {
          if (!acc.has(initialUrl)) {
            acc.set(initialUrl, []);
          }

          acc.get(initialUrl)?.push(history);

          return acc;
        }, new Map<string, Operation[][]>())
        .entries()
    );

    const initialUrlToSequencePaths = initialUrlToHistories.map(
      ([initialUrl, histories]) => {
        return {
          initialUrl,
          sequencePaths: this.sequencePathBuilder.build(histories),
        };
      }
    );

    const pageObjects = this.createPageObjects(
      initialUrlToSequencePaths.flatMap(({ sequencePaths }) => sequencePaths)
    );

    const testSuites = initialUrlToSequencePaths.map(
      ({ initialUrl, sequencePaths }, index) => {
        return this.testSuiteFactory.create(
          initialUrl,
          sequencePaths,
          pageObjects,
          `TestSuite${index + 1}`
        );
      }
    );

    return {
      pageObjects,
      testSuites,
    };
  }

  private createPageObjects(sequencePaths: SequencePath[]) {
    const pageNameToSequences = this.createPageNameToSequences(sequencePaths);

    return Array.from(pageNameToSequences.entries()).map(
      ([pageName, sequences]) => {
        return this.pageObjectFactory.createPageObject(
          pageName,
          sequences[0].url,
          this.imageUrlResolver(sequences[0].imageUrl),
          sequences
        );
      }
    );
  }

  private createPageNameToSequences(
    sequencePaths: SequencePath[]
  ): Map<string, Sequence[]> {
    return sequencePaths.flat().reduce((acc, sequence) => {
      if (!acc.has(sequence.className)) {
        acc.set(sequence.className, []);
      }

      acc.get(sequence.className)?.push(sequence);

      return acc;
    }, new Map<string, Sequence[]>());
  }
}
