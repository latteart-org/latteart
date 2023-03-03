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

import { PageObject } from "../pageObject";
import { PageObjectMethod } from "../pageObject";
import { MethodSelector } from "./types";

export class RepresentativeMethodSelector implements MethodSelector {
  public selectMethods(
    pageObjects: PageObject[],
    screenDefs: string[]
  ): PageObjectMethod[] {
    const methods = screenDefs.flatMap((screenDef, index, array) => {
      const pageObject = pageObjects.find(
        (pageObject) => pageObject.id === screenDef
      );

      if (!pageObject) {
        return [];
      }

      const destScreenDef = array[index + 1] ?? screenDef;

      const selectedMethod = pageObject.methods.find((method) => {
        return method.returnPageObjectId === destScreenDef;
      });

      if (!selectedMethod) {
        return [];
      }

      return [selectedMethod];
    });

    if (methods.length === 0) {
      return [];
    }

    const lastMethod = methods[methods.length - 1];

    if (lastMethod.pageObjectId === lastMethod.returnPageObjectId) {
      return methods.slice(0, -1);
    }

    return methods;
  }
}
