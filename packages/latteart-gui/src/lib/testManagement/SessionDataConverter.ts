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

import { Session } from "./types";

export default class SessionDataConverter {
  public convertToSession(
    target: Partial<Session>,
    serviceUrl: string
  ): Session {
    return {
      index: target.index ?? 0,
      name: target.id ?? "",
      id: target.id ?? "",
      isDone: target.isDone ?? false,
      doneDate: target.doneDate ?? "",
      testItem: target.testItem ?? "",
      testerName: target.testerName ?? "",
      memo: target.memo ?? "",
      attachedFiles: target.attachedFiles ?? [],
      testResultFiles: target.testResultFiles ?? [],
      initialUrl: target.initialUrl ?? "",
      testPurposes: target.testPurposes ?? [],
      notes: target.notes
        ? target.notes.map((note) => {
            const noteImageFileUrl = note.imageFileUrl
              ? new URL(note.imageFileUrl, serviceUrl).toString()
              : "";
            return {
              ...note,
              imageFileUrl: noteImageFileUrl,
            };
          })
        : [],
      testingTime: target.testingTime ?? 0,
    };
  }
}
