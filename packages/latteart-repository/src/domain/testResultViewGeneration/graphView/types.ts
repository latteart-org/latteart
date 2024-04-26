/**
 * Copyright 2023 NTT Corporation.
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

import { ElementInfo, TestStep } from "../../types";

/**
 * Graph view.
 */
export type GraphView = {
  nodes: GraphViewNode[];
  store: {
    windows: { id: string; name: string }[];
    screens: { id: string; name: string; elementIds: string[] }[];
    elements: {
      id: string;
      pageUrl: string;
      pageTitle: string;
      xpath: string;
      tagname: string;
      text: string;
      attributes: { [key: string]: string };
      iframe?: {
        index: number;
        boundingRect?: {
          top: number;
          left: number;
          width: number;
          height: number;
        };
        innerHeight?: number;
        innerWidth?: number;
        outerHeight?: number;
        outerWidth?: number;
      };
      boundingRect?: {
        top: number;
        left: number;
        width: number;
        height: number;
      };
      innerHeight?: number;
      innerWidth?: number;
      outerHeight?: number;
      outerWidth?: number;
    }[];
    testPurposes: { id: string }[];
    notes: { id: string }[];
    radioGroup: { name: string; xpath: string }[];
  };
};

/**
 * Graph view node.
 */
export type GraphViewNode = {
  windowId: string;
  screenId: string;
  testSteps: {
    id: string;
    type: string;
    input?: string;
    targetElementId?: string;
    noteIds: string[];
    testPurposeId?: string;
    pageUrl: string;
    pageTitle: string;
  }[];
  defaultValues: { elementId: string; value: string }[];
};

export type TestStepForGraphView = Pick<TestStep, "id"> & {
  screenDef: string;
  operation: Pick<
    TestStep["operation"],
    "input" | "type" | "windowHandle" | "url" | "title"
  > & {
    elementInfo: Pick<
      ElementInfo,
      "xpath" | "tagname" | "text" | "attributes" | "iframe" | "checked"
    > | null;
    inputElements: Pick<
      ElementInfo,
      | "xpath"
      | "tagname"
      | "text"
      | "attributes"
      | "checked"
      | "value"
      | "iframe"
    >[];
  };
  intention: Pick<
    NonNullable<TestStep["intention"]>,
    "id" | "value" | "details"
  > | null;
  bugs: Omit<TestStep["bugs"][0], "type">[];
  notices: Omit<TestStep["notices"][0], "type">[];
};
