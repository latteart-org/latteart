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

import { TestStepRepository } from "@/lib/eventDispatcher/repositoryService/TestStepRepository";
import { NoteRepository } from "@/lib/eventDispatcher/repositoryService/NoteRepository";
import { TestStepOperation } from "../types";
import { ActionResult } from "@/lib/common/ActionResult";

export interface BugDeletable {
  readonly testStepRepository: TestStepRepository;
  readonly noteRepository: NoteRepository;
  readonly serviceUrl: string;
}

export class DeleteBugAction {
  constructor(private dispatcher: BugDeletable) {}

  /**
   * Remove the bug.
   * @param testResultId  The id of the test result associated with the bug to be deleted.
   * @param testStepId  Test step id of test results related to the target bug.
   * @param index  Bug index.
   */
  public async deleteBug(
    testResultId: string,
    testStepId: string,
    index: number
  ): Promise<ActionResult<{ testStepId: string; index: number }>> {
    // Get noteId.
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

    const noteId = bugs[index];

    // Delete note.
    const reply = await this.dispatcher.noteRepository.deleteNotes(
      testResultId,
      noteId
    );

    // Break the link.
    const filteredBugs = bugs.filter((_: unknown, i: number) => i !== index);
    await this.dispatcher.testStepRepository.patchTestSteps(
      testResultId,
      testStepId,
      undefined,
      filteredBugs
    );

    const data = { testStepId, index };
    const result = {
      data,
      error: reply.error ?? undefined,
    };

    return result;
  }
}
