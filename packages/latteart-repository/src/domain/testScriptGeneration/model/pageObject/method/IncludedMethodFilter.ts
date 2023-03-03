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

import { PageObjectMethod, MethodFilter } from "./types";

export class IncludedMethodFilter implements MethodFilter {
  public filter(methods: PageObjectMethod[]): PageObjectMethod[] {
    return Array.from(methods).filter((method, index, array) => {
      return array.findIndex((method2) => method2.includes(method)) === index;
    });
  }
}
