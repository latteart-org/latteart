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

import { Image, Operation } from "../types";

export type PageState = {
  title: string;
  url: string;
  elementTexts: { tagname: string; value: string }[];
  screenshot?: { read: () => Promise<Image> };
};

export type PageTestAction = {
  operation?: PageOperation;
  result?: PageState;
};

export type PageAssertionOption = {
  excludeItems?: (keyof PageState)[];
  excludeElements?: { tagname: string }[];
};

export type PageAssertionResult = {
  isOk: boolean;
  items: {
    title?: {
      isOk: boolean;
      actual?: PageState["title"];
      expected?: PageState["title"];
    };
    url?: {
      isOk: boolean;
      actual?: PageState["url"];
      expected?: PageState["url"];
    };
    elementTexts?: {
      isOk: boolean;
      actual?: PageState["elementTexts"];
      expected?: PageState["elementTexts"];
    };
    screenshot?: {
      isOk: boolean;
      actual?: PageState["screenshot"];
      expected?: PageState["screenshot"];
      diff?: Image;
    };
  };
  errors?: PageAssertionError[];
};

export type PageAssertionError = "invalid_screenshot";

export type PageOperation = Pick<
  Operation,
  "url" | "type" | "elementInfo" | "input"
>;
