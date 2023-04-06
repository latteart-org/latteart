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

import { PageObject, PageObjectMethod } from "../pageObject";
import { MethodSelector } from "./types";

export class UniqueMethodSelector implements MethodSelector {
  public selectMethods(
    pageObjects: PageObject[],
    screenDefs: string[]
  ): PageObjectMethod[] {
    const pageObjectIdToMethods = pageObjects.reduce((acc, pageObject) => {
      if (!acc.has(pageObject.id)) {
        acc.set(pageObject.id, []);
      }

      acc.get(pageObject.id)?.push(...pageObject.methods);

      return acc;
    }, new Map<string, PageObjectMethod[]>());

    const { methods } = screenDefs.reduce(
      (acc, screenDef, index, array) => {
        const fromMethods = acc.from.get(screenDef) ?? [];

        if (fromMethods.length === 0) {
          return acc;
        }

        const destScreenDef = array[index + 1] ?? screenDef;

        const selectedMethodIndex = fromMethods.findIndex((method) => {
          return method.returnPageObjectId === destScreenDef;
        });

        if (selectedMethodIndex === -1) {
          return acc;
        }

        acc.methods.push(fromMethods[selectedMethodIndex]);

        acc.from.set(
          screenDef,
          fromMethods.filter((_, index) => index !== selectedMethodIndex)
        );

        return acc;
      },
      { methods: new Array<PageObjectMethod>(), from: pageObjectIdToMethods }
    );

    return methods;
  }
}
