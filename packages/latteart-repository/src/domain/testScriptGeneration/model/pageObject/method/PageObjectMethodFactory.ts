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

import { PageObjectMethod, PageObjectMethodFactory } from "./types";
import { PageObjectMethodImpl } from "./PageObjectMethod";
import { PageObjectOperationFactory } from "./operation";
import { Sequence } from "../../sequencePath";
import { OperationFilter } from "./operation";
import { IdentifierGenerator } from "@/domain/testScriptGeneration/IdentifierGenerator";

export class PageObjectMethodFactoryImpl implements PageObjectMethodFactory {
  private operationFilters: OperationFilter[];
  private idCount = 0;

  constructor(
    private operationFactory: PageObjectOperationFactory,
    ...operationFilters: OperationFilter[]
  ) {
    this.operationFilters = operationFilters;
  }

  public create(
    sequence: Sequence,
    identifierGenerator: IdentifierGenerator
  ): PageObjectMethod {
    const operations = sequence.operations.map((operation) => {
      return this.operationFactory.createFrom(
        operation,
        sequence.destinationUrl,
        identifierGenerator
      );
    });

    return new PageObjectMethodImpl(
      {
        id: `method_${this.idCount++}`,
        pageObjectId: sequence.className,
        operations,
        returnPageObjectId: sequence.destination,
      },
      ...this.operationFilters
    );
  }
}
