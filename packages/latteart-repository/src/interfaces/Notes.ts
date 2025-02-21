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

import { Note } from "@/domain/types";
import { VideoFrame } from "./Videos";

/**
 * Note data for new registration.
 */
export type CreateNoteDto = UpdateNoteDto & {
  imageData?: string;
  timestamp?: number;
  videoId?: string;
  videoTime?: number;
};

/**
 * Note data for update.
 */
export type UpdateNoteDto = Pick<Note, "type" | "value" | "details"> & {
  tags?: string[];
};

/**
 * Registered note data.
 */
export type CreateNoteResponse = Omit<Note, "screenshot"> & {
  imageFileUrl: string;
  videoFrame?: VideoFrame;
  testResultId?: string;
};

/**
 * Note data for the specified ID.
 */
export type GetNoteResponse = CreateNoteResponse;

/**
 * Updated note data.
 */
export type UpdateNoteResponse = CreateNoteResponse;

/**
 * Test purposes.
 */
export type GetTestPurposeResponse = CreateNoteResponse & {
  notes: CreateNoteResponse[];
};

/**
 * Note data with timestamp.
 */
export type NoteWithTimeResponse = CreateNoteResponse & { timestamp: number };
