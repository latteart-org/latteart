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
 * Note data for new registration.
 */
export interface CreateNoteDto {
  type: string;
  value: string;
  details: string;
  imageData?: string;
  tags?: string[];
}

/**
 * Note data for update.
 */
export interface UpdateNoteDto {
  type: string;
  value: string;
  details: string;
  tags?: string[];
}

/**
 * Registered note data.
 */
export type CreateNoteResponse = Note;

/**
 * Note data for the specified ID.
 */
export type GetNoteResponse = Note;

/**
 * Updated note data.
 */
export type UpdateNoteResponse = Note;

/**
 * Note date.
 */
interface Note {
  id: string;
  type: string;
  value: string;
  details: string;
  imageFileUrl: string;
  tags: string[];
}
