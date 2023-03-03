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

import {
  TestScriptModelGenerator,
  TestScriptModelGeneratorImpl,
} from "./TestScriptModelGenerator";
import { PageObjectMethodFactoryImpl } from "./pageObject/method/PageObjectMethodFactory";
import { PageObjectOperationFactoryImpl } from "./pageObject/method/operation/PageObjectOperationFactory";
import {
  IncludedMethodFilter,
  PageObjectFactory,
  PageObjectMethod,
  PageObjectElementFactoryImpl,
  DuplicateElementOperationFilter,
} from "./pageObject";
import {
  TestSuiteFactory,
  RepresentativeMethodSelector,
  GraphBasedScreenTransitionPathBuilder,
  UniqueMethodSelector,
} from "./testSuite";
import { SequencePathBuilder } from "./sequencePath";
import { UnnecessaryOperationFilter } from "./pageObject/method/operation/UnnecessaryOperationFilter";
import { TestScriptGenerationOption } from "../types";

export enum TestScriptModelGeneratorType {
  Simple,
  Optimized,
}

export class TestScriptModelGeneratorFactory {
  constructor(
    private option: Pick<TestScriptGenerationOption, "buttonDefinitions">
  ) {}

  public create(type: TestScriptModelGeneratorType): TestScriptModelGenerator {
    const sequencePathBuilder = new SequencePathBuilder();

    return type === TestScriptModelGeneratorType.Optimized
      ? this.createOptimizeGenerator(sequencePathBuilder)
      : this.createSimpleGenerator(sequencePathBuilder);
  }

  private createOptimizeGenerator(sequencePathBuilder: SequencePathBuilder) {
    const operationFactory = new PageObjectOperationFactoryImpl(
      new PageObjectElementFactoryImpl(this.option)
    );

    const operationFilters = [
      new UnnecessaryOperationFilter(),
      new DuplicateElementOperationFilter(),
    ];

    const pageObjectFactoryOption = {
      methodFilters: [new IncludedMethodFilter()],
      methodComparator: (
        method1: PageObjectMethod,
        method2: PageObjectMethod
      ) => {
        return method2.operations.length - method1.operations.length;
      },
    };

    const pageObjectFactory = new PageObjectFactory(
      new PageObjectMethodFactoryImpl(operationFactory, ...operationFilters),
      pageObjectFactoryOption
    );

    const testSuiteFactory = new TestSuiteFactory(
      new RepresentativeMethodSelector(),
      new GraphBasedScreenTransitionPathBuilder()
    );

    return new TestScriptModelGeneratorImpl(
      sequencePathBuilder,
      pageObjectFactory,
      testSuiteFactory
    );
  }

  private createSimpleGenerator(sequencePathBuilder: SequencePathBuilder) {
    const operationFactory = new PageObjectOperationFactoryImpl(
      new PageObjectElementFactoryImpl(this.option)
    );

    const pageObjectFactory = new PageObjectFactory(
      new PageObjectMethodFactoryImpl(operationFactory)
    );

    const testSuiteFactory = new TestSuiteFactory(new UniqueMethodSelector());

    return new TestScriptModelGeneratorImpl(
      sequencePathBuilder,
      pageObjectFactory,
      testSuiteFactory
    );
  }
}
