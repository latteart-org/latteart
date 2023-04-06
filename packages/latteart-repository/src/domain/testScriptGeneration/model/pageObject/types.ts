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

import { PageObjectMethod } from "./method";

export type PageObject = {
  readonly id: string;
  readonly url: string;
  readonly methods: PageObjectMethod[];
  readonly imageUrl?: string;
  readonly methodComparator: MethodComparator | undefined;
  comment?: string;
  collectMethodInputVariations(): PageObjectMethodIdToInputVariations;
};

export type PageObjectMethodIdToInputVariations = Map<
  string,
  { [paramName: string]: string }[]
>;

export type MethodComparator = (
  method1: PageObjectMethod,
  method2: PageObjectMethod
) => number;
