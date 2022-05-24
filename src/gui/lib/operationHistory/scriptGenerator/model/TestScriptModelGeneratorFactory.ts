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
import { PageObjectElementFactoryImpl } from "./pageObject/method/operation/PageObjectElementFactory";
import { LocatorGeneratorImpl } from "./pageObject/method/operation/LocatorGenerator";
import { PageObjectFactory } from "./pageObject/PageObjectFactory";
import { IncludedMethodFilter } from "./pageObject/method/IncludedMethodFilter";
import { TestSuiteFactory } from "./testSuite/TestSuiteFactory";
import { RepresentativeMethodSelector } from "./testSuite/RepresentativeMethodSelector";
import { GraphBasedScreenTransitionPathBuilder } from "./testSuite/screenTransitionPath/GraphBasedScreenTransitionPathBuilder";
import { UniqueMethodSelector } from "./testSuite/UniqueMethodSelector";
import { SequencePathBuilder } from "./sequencePath/SequencePathBuilder";
import { DuplicateElementOperationFilter } from "./pageObject/method/operation/DuplicateElementOperationFilter";
import { UnnecessaryOperationFilter } from "./pageObject/method/operation/UnnecessaryOperationFilter";
import { PageObjectMethod } from "./pageObject/method/PageObjectMethod";

export enum TestScriptModelGeneratorType {
  Simple,
  Optimize,
}

export class TestScriptModelGeneratorFactory {
  constructor(private imageUrlResolver: (url: string) => string) {}

  public create(type: TestScriptModelGeneratorType): TestScriptModelGenerator {
    const sequencePathBuilder = new SequencePathBuilder();

    return type === TestScriptModelGeneratorType.Optimize
      ? this.createOptimizeGenerator(sequencePathBuilder)
      : this.createSimpleGenerator(sequencePathBuilder);
  }

  private createOptimizeGenerator(sequencePathBuilder: SequencePathBuilder) {
    const operationFactory = new PageObjectOperationFactoryImpl(
      this.imageUrlResolver,
      new PageObjectElementFactoryImpl(new LocatorGeneratorImpl())
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
      testSuiteFactory,
      this.imageUrlResolver
    );
  }

  private createSimpleGenerator(sequencePathBuilder: SequencePathBuilder) {
    const operationFactory = new PageObjectOperationFactoryImpl(
      this.imageUrlResolver,
      new PageObjectElementFactoryImpl(new LocatorGeneratorImpl())
    );

    const pageObjectFactory = new PageObjectFactory(
      new PageObjectMethodFactoryImpl(operationFactory)
    );

    const testSuiteFactory = new TestSuiteFactory(new UniqueMethodSelector());

    return new TestScriptModelGeneratorImpl(
      sequencePathBuilder,
      pageObjectFactory,
      testSuiteFactory,
      this.imageUrlResolver
    );
  }
}
