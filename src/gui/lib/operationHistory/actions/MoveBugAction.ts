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

export interface BugMovable {
  readonly noteRepository: NoteRepository;
  readonly testStepRepository: TestStepRepository;
  readonly serviceUrl: string;
}

export class MoveBugAction {
  constructor(private dispatcher: BugMovable) {}

  /**
   * Update the position where the bug is associated.
   * @param testResultId  ID of the test result associated with the bug.
   * @param from  Location of test results related to the bug.
   * @param dest  The position of the test result where you want to link the bug.
   * @returns Updated bug information.
   */
  public async moveBug(
    testResultId: string,
    from: { testStepId: string; index: number },
    dest: { testStepId: string }
  ): Promise<ActionResult<{ bug: Note; index: number }>> {
    // Break the link of the move source.
    const { bugs: fromBugs } = (
      await this.dispatcher.testStepRepository.getTestSteps(
        testResultId,
        from.testStepId
      )
    ).data as {
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    };

    const filteredBugs = fromBugs.filter(
      (_: unknown, index: number) => index !== from.index
    );

    await (async () => {
      return this.dispatcher.testStepRepository.patchTestSteps(
        testResultId,
        from.testStepId,
        undefined,
        filteredBugs
      );
    })();

    // Link to the destination.
    const { bugs: destBugs } = (
      await this.dispatcher.testStepRepository.getTestSteps(
        testResultId,
        dest.testStepId
      )
    ).data as {
      id: string;
      operation: TestStepOperation;
      intention: string | null;
      bugs: string[];
      notices: string[];
    };

    const bugs = [...destBugs, fromBugs[from.index]];

    await this.dispatcher.testStepRepository.patchTestSteps(
      testResultId,
      dest.testStepId,
      undefined,
      bugs
    );

    const reply = await this.dispatcher.noteRepository.getNotes(
      testResultId,
      fromBugs[from.index]
    );

    const note = reply.data as {
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
        value: note.value,
        details: note.details,
        imageFilePath: note.imageFileUrl
          ? new URL(note.imageFileUrl, serviceUrl).toString()
          : "",
        tags: note.tags,
      }),
      index: destBugs.length,
    };

    const result = {
      data,
      error: reply.error ?? undefined,
    };

    return result;
  }
}
