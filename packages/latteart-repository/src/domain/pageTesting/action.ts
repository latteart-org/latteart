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

import { PageOperation, PageState, PageTestAction } from "./types";

export function createTestActions(
  ...operations: (PageOperation & PageState)[]
): PageTestAction[] {
  return operations.reduce((acc: PageTestAction[], current, index, array) => {
    const next = array.at(index + 1);
    const nextPageState = next
      ? {
          title: next.title,
          url: next.url,
          elementTexts: next.elementTexts,
          screenshot: next.screenshot,
        }
      : undefined;

    return [
      ...acc,
      {
        operation: {
          url: current.url,
          type: current.type,
          elementInfo: current.elementInfo,
          input: current.input,
        },
        result: nextPageState,
      },
    ];
  }, []);
}

export function isSameProcedure(
  actions1: PageTestAction[],
  actions2: PageTestAction[]
): boolean {
  if (actions1.length !== actions2.length) {
    return false;
  }

  return actions1.every((action1, index) => {
    const operation1 = action1.operation;
    const operation2 = actions2[index].operation;

    if (!operation1 || !operation2) {
      return !operation1 && !operation2;
    }

    if (operation1.url !== operation2.url) {
      return false;
    }

    if (operation1.type !== operation2.type) {
      return false;
    }

    if (operation1.elementInfo?.xpath !== operation2.elementInfo?.xpath) {
      return false;
    }

    if (operation1.input !== operation2.input) {
      return false;
    }

    return true;
  });
}
