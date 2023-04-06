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

import { TestStep } from "../types";

/**
 * Sequence view.
 */
export type SequenceView = {
  windows: { id: string; name: string }[];
  screens: { id: string; name: string }[];
  scenarios: {
    testPurpose?: { id: string; value: string; details?: string };
    nodes: SequenceViewNode[];
  }[];
};

/**
 * Sequence view node.
 */
export type SequenceViewNode = {
  windowId: string;
  screenId: string;
  testSteps: {
    id: string;
    type: string;
    input?: string;
    element?: { xpath: string; tagname: string; text: string };
    notes?: { id: string; value: string; details?: string; tags: string[] }[];
  }[];
  disabled?: boolean;
};

export type TestStepForSequenceView = Pick<TestStep, "id"> & {
  screenDef: string;
  operation: Pick<TestStep["operation"], "input" | "type" | "windowHandle"> & {
    elementInfo: Pick<
      NonNullable<TestStep["operation"]["elementInfo"]>,
      "xpath" | "tagname" | "text" | "attributes"
    > | null;
  };
  intention: Pick<
    NonNullable<TestStep["intention"]>,
    "id" | "value" | "details"
  > | null;
  bugs: Pick<TestStep["bugs"][0], "id" | "value" | "details" | "tags">[];
  notices: Pick<TestStep["notices"][0], "id" | "value" | "details" | "tags">[];
};
