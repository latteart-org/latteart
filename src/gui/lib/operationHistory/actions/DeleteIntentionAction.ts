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

export interface IntentionDeletable {
  readonly testStepRepository: TestStepRepository;
  readonly noteRepository: NoteRepository;
  readonly serviceUrl: string;
}

export class DeleteIntentionAction {
  constructor(private dispatcher: IntentionDeletable) {}

  /**
   * Delete the intention information of the specified sequence number.
   * @param testResultId  Test result ID.
   * @param testStepId  Test step id of the target test step.
   */
  public async deleteIntention(
    testResultId: string,
    testStepId: string
  ): Promise<string> {
    const { intention: noteId } = (
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

    await this.dispatcher.noteRepository.deleteNotes(
      testResultId,
      noteId as string
    );

    // Break the link.
    await (async () => {
      return this.dispatcher.testStepRepository.patchTestSteps(
        testResultId,
        testStepId,
        null
      );
    })();

    return testStepId;
  }
}
