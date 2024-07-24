/**
 * Copyright 2024 NTT Corporation.
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

type OperationElement = {
  tag: string;
  type: string;
  text: string;
};

export type Custom = {
  propId: string;
  value: string | string[];
};

export type ImportTestHints = GetTestHintResponse;

export type GetTestHintResponse = {
  props: TestHintProp[];
  data: TestHint[];
};

export type PostTestHintDto = Omit<TestHint, "id" | "createdAt">;

export type PutTestHintDto = Omit<TestHint, "id" | "createdAt">;

export type PostTestHintResponse = TestHint;

export type PutTestHintResponse = TestHint;

export type TestHint = {
  id: string;
  value: string;
  testMatrixName: string;
  groupName: string;
  testTargetName: string;
  viewPointName: string;
  customs: Custom[];
  commentWords: string[];
  createdAt: number;
  operationElements: OperationElement[];
};

export interface PutTestHintPropDto {
  title: string;
  id?: string;
  type: string;
  list?: { key: string; value: string }[];
}

export type PutTestHintPropResponse = TestHintProp[];

export type TestHintProp = {
  title: string;
  id: string;
  type: string;
  list?: { key: string; value: string }[];
};
