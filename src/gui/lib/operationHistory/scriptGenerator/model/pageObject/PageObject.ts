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

import { PageObjectMethod } from "./method/PageObjectMethod";
import { MethodFilter } from "./method/MethodFilter";
import { InputGroupCollector } from "../testSuite/InputGroupCollector";

export interface PageObject {
  readonly id: string;
  readonly url: string;
  readonly methods: PageObjectMethod[];
  readonly imageUrl?: string;
  comment?: string;
  collectMethodInputVariations(): PageObjectMethodIdToInputVariations;
}

export type PageObjectMethodIdToInputVariations = Map<
  string,
  { [paramName: string]: string }[]
>;

export class PageObjectImpl implements PageObject {
  private methodFilters: MethodFilter[];
  public comment?: string;

  constructor(
    private params: {
      id: string;
      url: string;
      methods: PageObjectMethod[];
      imageUrl?: string;
    },
    ...methodFilters: MethodFilter[]
  ) {
    this.methodFilters = methodFilters;
  }

  public get id(): string {
    return this.params.id;
  }

  public get url(): string {
    return this.params.url;
  }

  public get methods(): PageObjectMethod[] {
    return this.methodFilters.reduce((acc, methodFilter) => {
      return methodFilter.filter(acc);
    }, this.sortedMethods);
  }

  public get imageUrl(): string | undefined {
    return this.params.imageUrl;
  }

  public collectMethodInputVariations(): PageObjectMethodIdToInputVariations {
    const methodToInputGroups = new Map(
      this.sortedMethods.reduce((acc, method) => {
        const paramNameToValue = new InputGroupCollector().collectFrom(
          method.operations
        );

        const representativeMethodIndex = acc.findIndex(
          ([representativeMethod]) => {
            return representativeMethod.includes(method);
          }
        );

        if (representativeMethodIndex === -1) {
          acc.push([method, [paramNameToValue]]);
        } else {
          const map = new Map(Object.entries(paramNameToValue));
          const keys = Object.keys(acc[representativeMethodIndex][1][0]);

          const newVariation = Object.fromEntries(
            keys.map((paramName) => [paramName, map.get(paramName) ?? ""])
          );

          const sameVariationExists = acc[representativeMethodIndex][1].some(
            (other) => {
              const otherKeyValues = Object.entries(other)
                .map((other) => other.toString())
                .sort()
                .toString();

              const newKeyValues = Object.entries(newVariation)
                .map((newVariation) => newVariation.toString())
                .sort()
                .toString();

              return otherKeyValues === newKeyValues;
            }
          );

          if (!sameVariationExists) {
            acc[representativeMethodIndex][1].push(newVariation);
          }
        }

        return acc;
      }, new Array<[PageObjectMethod, { [paramName: string]: string }[]]>())
    );

    return new Map(
      [...methodToInputGroups.entries()].map(([method, datas]) => {
        return [method.id, datas];
      })
    );
  }

  private get sortedMethods(): PageObjectMethod[] {
    // Sort in order of size to detect inclusion efficiently.
    return this.params.methods.sort(
      (method1: PageObjectMethod, method2: PageObjectMethod) => {
        return method2.operations.length - method1.operations.length;
      }
    );
  }
}
