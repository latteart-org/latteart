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

import { NoteRepository } from "@/lib/eventDispatcher/repositoryService/NoteRepository";
import { ActionResult } from "@/lib/common/ActionResult";
import { Note } from "../Note";
import { TestStepRepository } from "@/lib/eventDispatcher/repositoryService/TestStepRepository";
import { TestStepOperation } from "../types";

export interface BugEditable {
  readonly noteRepository: NoteRepository;
  readonly testStepRepository: TestStepRepository;
  readonly serviceUrl: string;
}

export class EditBugAction {
  constructor(private dispatcher: BugEditable) {}

  /**
   * Edit the bug.
   * @param testResultId  ID of the test result associated with the bug to be edited.
   * @param testStepId  Test step id of the test result associated with the target bug.
   * @param index  bug index.
   * @param bug  Contents to update the bug.
   * @returns Updated bug information.
   */
  public async editBug(
    testResultId: string,
    testStepId: string,
    index: number,
    bug: {
      summary: string;
      details: string;
    }
  ): Promise<ActionResult<{ bug: Note; index: number }>> {
    const { bugs } = (
      await this.dispatcher.testStepRepository.getTestSteps(
        testResultId,
        testStepId
      )
    ).data as {
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    };

    const noteId: string = bugs[index];

    // note update
    const reply = await this.dispatcher.noteRepository.putNotes(
      testResultId,
      noteId,
      undefined,
      bug
    );

    const savedNote = reply.data as {
      id: string;
      type: string;
      value: string;
      details: string;
      imageFileUrl?: string;
      tags?: string[];
    };

    const serviceUrl = this.dispatcher.serviceUrl;
    const data = {
      bug: new Note({
        value: savedNote.value,
        details: savedNote.details,
        imageFilePath: savedNote.imageFileUrl
          ? new URL(savedNote.imageFileUrl, serviceUrl).toString()
          : "",
        tags: savedNote.tags,
      }),
      index,
    };

    const error = reply.error ? { code: reply.error.code } : undefined;
    const result = {
      data,
      error,
    };

    return result;
  }
}
