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

import { GetNoteResponse, GetTestPurposeResponse } from "./Notes";
import { Video } from "./Videos";

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
export type PatchSessionDto = {
  isDone?: boolean;
  testItem?: string;
  testerName?: string;
  memo?: string;
  attachedFiles?: {
    name: string;
    fileUrl?: string;
    fileData?: string;
  }[];
  testResultFiles?: TestResultFile[];
};

/**
 * Session.
 */
export type Session = {
  index: number;
  name: string;
  id: string;
  isDone: boolean;
  doneDate: string;
  testItem: string;
  testerName: string;
  memo: string;
  attachedFiles: { name: string; fileUrl: string }[];
  testResultFiles: TestResultFile[];
  testPurposes: GetTestPurposeResponse[];
  notes: GetNoteResponse[];
};

type TestResultFile = {
  name: string;
  id: string;
  initialUrl?: string;
  testingTime?: number;
};
