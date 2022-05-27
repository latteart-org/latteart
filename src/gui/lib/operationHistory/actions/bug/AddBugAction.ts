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

import { ActionResult } from "@/lib/common/ActionResult";
import { Note } from "../../Note";
import { TestStepOperation } from "../../types";
import { convertNote } from "@/lib/eventDispatcher/replyDataConverter";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

export class AddBugAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "noteRepository" | "testStepRepository" | "serviceUrl"
    >
  ) {}

  /**
   * Add bug information to the test step with the specified sequence number.
   * @param testResultId  Test result ID.
   * @param testStepId  Test step id of the target test step.
   * @param bug  Bug information to add.
   * @returns Added bug information.
   */
  public async addBug(
    testResultId: string,
    testStepId: string,
    bug: {
      summary: string;
      details: string;
      imageData?: string;
    }
  ): Promise<ActionResult<{ bug: Note; index: number }>> {
    // New registration of note.
    const reply = await this.repositoryContainer.noteRepository.postNotes(
      testResultId,
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

    // Linking with testStep.
    const linkTestStep = await (async () => {
      const { bugs: replyBugs } = (
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

      const bugs = [...replyBugs, savedNote.id];

      return await this.repositoryContainer.testStepRepository.patchTestSteps(
        testResultId,
        testStepId,
        undefined,
        bugs
      );
    })();

    const savedTestStep = linkTestStep.data as {
      bugs: string[];
    };

    const serviceUrl = this.repositoryContainer.serviceUrl;
    const data = {
      bug: convertNote(savedNote, serviceUrl),
      index: savedTestStep.bugs.length - 1,
    };

    const error = reply.error ? { code: reply.error.code } : undefined;
    const result = {
      data,
      error,
    };

    return result;
  }
}
