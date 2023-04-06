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

import { OperationForGUI } from "../operationHistory/OperationForGUI";
import { NoteForGUI } from "../operationHistory/NoteForGUI";
import { Operation } from "latteart-client";

export function convertTestStepOperation(
  testStepOperation: Operation,
  sequence?: number
): OperationForGUI {
  const operation = OperationForGUI.createOperation({
    input: testStepOperation.input,
    type: testStepOperation.type,
    elementInfo: testStepOperation.elementInfo,
    title: testStepOperation.title,
    url: testStepOperation.url,
    imageFilePath: testStepOperation.imageFileUrl,
    windowHandle: testStepOperation.windowHandle,
    timestamp: testStepOperation.timestamp,
    inputElements: testStepOperation.inputElements,
    keywordSet: new Set(
      testStepOperation.keywordTexts?.map((keywordText) => {
        return typeof keywordText === "string"
          ? keywordText
          : keywordText.value;
      }) ?? []
    ),
    sequence,
    isAutomatic: testStepOperation.isAutomatic,
  });

  return operation;
}

export function convertIntention(
  testStepIntention: {
    id: string;
    type: string;
    value: string;
    details: string;
    imageFileUrl: string;
    tags: string[];
  },
  sequence?: number
): NoteForGUI {
  const intention = new NoteForGUI({
    id: testStepIntention.id,
    sequence: sequence,
    value: testStepIntention.value,
    details: testStepIntention.details,
    tags: testStepIntention.tags,
  });

  return intention;
}

export function convertNote(
  item: {
    id: string;
    type: string;
    value: string;
    details: string;
    imageFileUrl?: string;
    tags?: string[];
  },
  sequence?: number
): NoteForGUI {
  const data = new NoteForGUI({
    id: item.id,
    value: item.value,
    details: item.details,
    tags: item.tags,
    imageFilePath: item.imageFileUrl,
    sequence,
  });

  return data;
}
