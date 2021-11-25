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

import { PageObject, PageObjectImpl } from "./PageObject";
import { MethodFilter } from "./method/MethodFilter";
import { PageObjectMethodFactory } from "./method/PageObjectMethodFactory";
import { Sequence } from "../sequencePath/Sequence";

export class PageObjectFactory {
  private methodFilters: MethodFilter[] = [];

  constructor(
    private methodFactory: PageObjectMethodFactory,
    ...methodFilters: MethodFilter[]
  ) {
    this.methodFilters = methodFilters;
  }

  public createPageObject(
    id: string,
    url: string,
    imageUrl: string,
    sequences: Sequence[]
  ): PageObject {
    const methods = sequences.map((sequence) =>
      this.methodFactory.create(sequence)
    );

    return new PageObjectImpl(
      {
        id,
        url,
        methods,
        imageUrl,
      },
      ...this.methodFilters
    );
  }
}
