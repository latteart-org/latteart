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

import { TestStepOperation } from "../../types";
import { ActionResult } from "@/lib/common/ActionResult";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

export class DeleteIntentionAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "testStepRepository" | "noteRepository" | "serviceUrl"
    >
  ) {}

  /**
   * Delete the intention information of the specified sequence number.
   * @param testResultId  Test result ID.
   * @param testStepId  Test step id of the target test step.
   */
  public async deleteIntention(
    testResultId: string,
    testStepId: string
  ): Promise<ActionResult<string>> {
    const { intention: noteId } = (
      await this.repositoryContainer.testStepRepository.getTestSteps(
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

    const reply = await this.repositoryContainer.noteRepository.deleteNotes(
      testResultId,
      noteId as string
    );

    // Break the link.
    await (async () => {
      return this.repositoryContainer.testStepRepository.patchTestSteps(
        testResultId,
        testStepId,
        null
      );
    })();

    const error = reply.error
      ? { code: "registering-testresults-error" }
      : undefined;
    const result = {
      data: testStepId,
      error,
    };

    return result;
  }
}
