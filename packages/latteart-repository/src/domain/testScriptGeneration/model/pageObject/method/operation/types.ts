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

import { IdentifierGenerator } from "@/domain/testScriptGeneration/IdentifierGenerator";
import {
  TestScriptSourceElement,
  TestScriptSourceOperation,
} from "@/domain/testScriptGeneration/types";

export type PageObjectOperationFactory = {
  createFrom(
    operation: TestScriptSourceOperation,
    destinationUrl: string,
    identifierGenerator: IdentifierGenerator
  ): PageObjectOperation;
};

export type PageObjectElementFactory = {
  createFrom(
    element: TestScriptSourceElement | null,
    imageUrl: string,
    identifierGenerator: IdentifierGenerator
  ): PageObjectElement;
};

/**
 * Element type
 */
export type ElementType =
  | "RadioButton"
  | "CheckBox"
  | "SelectBox"
  | "Button"
  | "Other";

/**
 * Operation type
 */
export type OperationType =
  | "click"
  | "change"
  | "switch_window"
  | "accept_alert"
  | "dismiss_alert"
  | "browser_back"
  | "browser_forward"
  | "skipped_operations"
  | "other";

/**
 * Page object element
 */
export type PageObjectElement = {
  readonly identifier: string;
  readonly type: ElementType;
  readonly locator: string;
  readonly value?: string;
  readonly name?: string;
  readonly imageUrl?: string;
};

/**
 * Page object operation
 */
export type PageObjectOperation = {
  readonly target: PageObjectElement;
  readonly type: OperationType;
  readonly input: string;
};

export type OperationFilter = {
  filter(operations: PageObjectOperation[]): PageObjectOperation[];
};
