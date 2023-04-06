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

import { PageAssertionError, PageState } from "@/domain/pageTesting";

/**
 * Test result ids and option for comparison.
 */
export type CompareTestResultsDto = {
  actualTestResultId: string;
  expectedTestResultId: string;
  option?: {
    excludeItems?: (keyof PageState)[];
    excludeElements?: { tagname: string }[];
  };
};

/**
 * Test result comparison result.
 */
export type CompareTestResultsResponse = {
  url: string;
  targetNames: { actual: string; expected: string };
  summary: {
    isOk: boolean;
    steps: {
      isOk: boolean;
      items: {
        title?: { isOk: boolean };
        url?: { isOk: boolean };
        elementTexts?: { isOk: boolean };
        screenshot?: { isOk: boolean };
      };
      errors?: PageAssertionError[];
    }[];
  };
};
