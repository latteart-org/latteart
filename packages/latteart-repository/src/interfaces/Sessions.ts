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

/**
 * Registered session data.
 */
export type PostSessionResponse = Session;

/**
 * Updated session data.
 */
export type PatchSessionResponse = Session;

/**
 * Session ids.
 */
export type ListSessionResponse = string[];

/**
 * Session data for update.
 */
export interface PatchSessionDto {
  attachedFiles?: {
    name: string;
    fileUrl?: string;
    fileData?: string;
  }[];
  doneDate?: string;
  isDone?: boolean;
  issues?: {
    details: string;
    source: {
      index: number;
      type: string;
    };
    status: string;
    ticketId: string;
    type: string;
    value: string;
    imageFilePath?: string;
  }[];
  memo?: string;
  name?: string;
  testItem?: string;
  testResultFiles?: {
    name: string;
    id: string;
  }[];
  testerName?: string;
  testingTime?: number;
}

/**
 * Session.
 */
export type Session = {
  index: number;
  id: string;
  attachedFiles: {
    name: string;
    fileUrl: string;
  }[];
  doneDate: string;
  isDone: boolean;
  issues: {
    details: string;
    source: {
      index: number;
      type: string;
    };
    status: string;
    ticketId: string;
    type: string;
    value: string;
    imageFilePath?: string;
  }[];
  memo: string;
  name: string;
  testItem: string;
  testResultFiles: {
    name: string;
    id: string;
  }[];
  testerName: string;
  testingTime: number;
};
