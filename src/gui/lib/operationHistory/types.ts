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

import { Operation } from "./Operation";
import { Note } from "./Note";

/**
 * Operation history and Notes information.
 */
export interface OperationWithNotes {
  operation: Operation;
  intention: Note | null;
  bugs: Note[] | null;
  notices: Note[] | null;
}

export interface TestStep {
  operation: Operation | null;
  intention: Note | null;
  bugs: Note[] | null;
  notices: Note[] | null;
}

/**
 * Tag information.
 */
export interface ElementInfo {
  tagname: string;
  text?: string;
  xpath: string;
  value?: string;
  checked?: boolean;
  attributes: { [key: string]: any };
}

/**
 * Screen transition information.
 */
export interface ScreenTransition {
  source: {
    title: string;
    url: string;
    screenDef: string;
  };
  target: {
    title: string;
    url: string;
    screenDef: string;
  };
}

/**
 * Edge information.
 */
export interface Edge {
  source: {
    title: string;
    url: string;
    screenDef: string;
  };
  target: {
    title: string;
    url: string;
    screenDef: string;
  };
  operationHistory: OperationHistory;
}

/**
 * Screen definition.
 */
export interface ScreenDef {
  definition: string;
  alias: string;
}

/**
 * Window handle.
 */
export interface WindowHandle {
  text: string;
  value: string;
  available: boolean;
}

export interface RouterPushValueByName {
  name: string;
  params?: any;
}

export type OperationHistory = OperationWithNotes[];

export type MessageProvider = (message: string, args?: any) => string;

/**
 * Screen configuration information.
 */
export interface CoverageSource {
  title: string;
  url: string;
  screenElements: ElementInfo[];
}

/**
 * Input element infomations.
 */
export interface InputElementInfo {
  title: string;
  url: string;
  inputElements: ElementInfo[];
}

export interface ScreenDefinitionConditionGroup {
  isEnabled: boolean;
  screenName: string;
  conditions: Array<{
    isEnabled: boolean;
    definitionType: "url" | "title" | "keyword";
    matchType: "contains" | "equals" | "regex";
    word: string;
  }>;
}
