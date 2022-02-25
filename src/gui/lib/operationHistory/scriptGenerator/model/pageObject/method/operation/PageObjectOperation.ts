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

export enum ElementType {
  RadioButton,
  CheckBox,
  SelectBox,
  Link,
  Other,
}

export type OperationType =
  | "click"
  | "change"
  | "switch_window"
  | "accept_alert"
  | "dismiss_alert"
  | "browser_back"
  | "browser_forward"
  | "other";

export interface PageObjectElement {
  readonly identifier: string;
  readonly type: ElementType;
  readonly locator: string;
  readonly value?: string;
  readonly name?: string;
  readonly imageUrl?: string;
}

export interface PageObjectOperation {
  readonly target: PageObjectElement;
  readonly type: OperationType;
  readonly input: string;
}

export function invalidOperationTypeExists(type: string): boolean {
  return [
    "accept_alert",
    "dismiss_alert",
    "browser_back",
    "browser_forward",
  ].includes(type);
}
