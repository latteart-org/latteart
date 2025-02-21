/**
 * Copyright 2025 NTT Corporation.
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

import { ElementInfo } from "./Operation";

export type ScreenMutation = {
  elementMutations: ElementMutation[];
  title: string;
  url: string;
  timestamp: number;
  imageData: string;
  windowHandle: string;
  scrollPosition: { x: number; y: number };
  clientSize: { width: number; height: number };
};

export type ElementMutation =
  | ChildElementAddition
  | TextContentAddition
  | AttributeAddition
  | ChildElementRemoval
  | TextContentRemoval
  | AttributeRemoval
  | TextContentChange
  | AttributeChange;

export type ChildElementAddition = {
  type: "childElementAddition";
  targetElement: ElementInfo;
  addedChildElement: ElementInfo;
};

export type TextContentAddition = {
  type: "textContentAddition";
  targetElement: ElementInfo;
  addedTextContent: string;
};

export type ChildElementRemoval = {
  type: "childElementRemoval";
  targetElement: ElementInfo;
  removedChildElement: ElementInfo;
};

export type TextContentRemoval = {
  type: "textContentRemoval";
  targetElement: ElementInfo;
  removedTextContent: string;
};

export type TextContentChange = {
  type: "textContentChange";
  targetElement: ElementInfo;
  oldValue: string;
};

export type AttributeAddition = {
  type: "attributeAddition";
  targetElement: ElementInfo;
  attributeName: string;
  newValue: string;
};

export type AttributeRemoval = {
  type: "attributeRemoval";
  targetElement: ElementInfo;
  attributeName: string;
  oldValue: string;
};

export type AttributeChange = {
  type: "attributeChange";
  targetElement: ElementInfo;
  attributeName: string;
  newValue: string;
  oldValue: string;
};
