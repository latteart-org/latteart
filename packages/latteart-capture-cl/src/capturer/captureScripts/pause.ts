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

import { ExtendedDocument } from "./types";

export const pauseScripts = {
  pauseCapturing,
  resumeCapturing,
  capturingIsPaused,
};

function pauseCapturing() {
  const extendedDocument: ExtendedDocument = document;

  if (!extendedDocument) {
    return;
  }

  extendedDocument.__capturingIsPaused = true;
}

function resumeCapturing() {
  const extendedDocument: ExtendedDocument = document;

  if (!extendedDocument) {
    return;
  }

  extendedDocument.__capturingIsPaused = false;
}

function capturingIsPaused() {
  const extendedDocument: ExtendedDocument = document;

  if (extendedDocument && extendedDocument.__capturingIsPaused !== undefined) {
    return extendedDocument.__capturingIsPaused;
  }

  return false;
}
