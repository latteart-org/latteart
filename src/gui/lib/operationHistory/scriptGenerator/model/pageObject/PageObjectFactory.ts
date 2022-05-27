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

import { MethodComparator, PageObject, PageObjectImpl } from "./PageObject";
import { MethodFilter } from "./method/MethodFilter";
import { PageObjectMethodFactory } from "./method/PageObjectMethodFactory";
import { Sequence } from "../sequencePath/Sequence";

export class PageObjectFactory {
  private option: {
    methodFilters: MethodFilter[];
    methodComparator?: MethodComparator;
  };

  constructor(
    private methodFactory: PageObjectMethodFactory,
    option?: {
      methodFilters: MethodFilter[];
      methodComparator?: MethodComparator;
    }
  ) {
    if (!option) {
      this.option = {
        methodFilters: [],
      };
    } else {
      this.option = option;
    }
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
      this.option
    );
  }
}
