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

import { MutationEntity } from "@/entities/MutationEntity";
export type ExportMutationData = {
  id: string;
  testResult: string;
  elementMutations: string;
  timestamp: number;
  screenshot: string;
  windowHandle: string;
  scrollPositionX: number;
  scrollPositionY: number;
  clientSizeWidth: number;
  clientSizeHeight: number;
  url: string;
  title: string;
};
export type ImportMutationData = {
  testResult: string;
  elementMutations: string;
  timestamp: number;
  screenshot: string;
  windowHandle: string;
  scrollPositionX: number;
  scrollPositionY: number;
  clientSizeWidth: number;
  clientSizeHeight: number;
  url: string;
  title: string;
};
export const convertMutationToExportData = (
  testResultId: string,
  mutation: MutationEntity
): ExportMutationData => {
  return {
    id: mutation.id,
    testResult: testResultId,
    elementMutations: mutation.elementMutations,
    timestamp: mutation.timestamp,
    screenshot: mutation.screenshot?.fileUrl ?? "",
    windowHandle: mutation.windowHandle,
    scrollPositionX: mutation.scrollPositionX,
    scrollPositionY: mutation.scrollPositionY,
    clientSizeWidth: mutation.clientSizeWidth,
    clientSizeHeight: mutation.clientSizeHeight,
    url: mutation.url,
    title: mutation.title,
  };
};

export const convertMutationToImportData = (
  data: ExportMutationData
): ImportMutationData => {
  return {
    testResult: data.testResult,
    elementMutations: data.elementMutations,
    timestamp: data.timestamp,
    screenshot: data.screenshot,
    windowHandle: data.windowHandle,
    scrollPositionX: data.scrollPositionX,
    scrollPositionY: data.scrollPositionY,
    clientSizeWidth: data.clientSizeWidth,
    clientSizeHeight: data.clientSizeHeight,
    url: data.url,
    title: data.title,
  };
};

export const deserializeMutations = (
  mutationDatas: string[],
  testResultId: string,
  idMap?: Map<string, string>
) => {
  return mutationDatas.map((mutation) => {
    const data = JSON.parse(mutation) as ExportMutationData[];
    if (data.length === 0) {
      return {
        testResultId: "",
        data: [],
      };
    }
    const newTestResultId = idMap
      ? idMap.get(data[0].testResult)
      : testResultId;
    if (!newTestResultId) {
      throw new Error(`newTestResultId not found. ${newTestResultId}`);
    }
    return {
      testResultId: newTestResultId,
      data: data.map((d) => {
        return convertMutationToImportData(d);
      }),
    };
  });
};
