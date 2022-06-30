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

import {
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import { Note } from "../../Note";
import { convertNote } from "@/lib/eventDispatcher/replyDataConverter";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

const ADD_NOTE_FAILED_MESSAGE_KEY = "error.operation_history.add_note_failed";

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
    const postNotesResult =
      await this.repositoryContainer.noteRepository.postNotes(testResultId, {
        type: "bug",
        value: bug.summary,
        details: bug.details,
        imageData: bug.imageData,
      });

    if (postNotesResult.isFailure()) {
      return new ActionFailure({ messageKey: ADD_NOTE_FAILED_MESSAGE_KEY });
    }

    const savedNote = postNotesResult.data;

    // Linking with testStep.
    const linkTestStepResult = await (async () => {
      const getTestStepResult =
        await this.repositoryContainer.testStepRepository.getTestSteps(
          testResultId,
          testStepId
        );

      if (getTestStepResult.isFailure()) {
        return getTestStepResult;
      }

      const { bugs: resultBugs } = getTestStepResult.data;

      const bugs = [...resultBugs, savedNote.id];

      return await this.repositoryContainer.testStepRepository.patchTestSteps(
        testResultId,
        testStepId,
        undefined,
        bugs
      );
    })();

    if (linkTestStepResult.isFailure()) {
      return new ActionFailure({ messageKey: ADD_NOTE_FAILED_MESSAGE_KEY });
    }

    const savedTestStep = linkTestStepResult.data;

    const serviceUrl = this.repositoryContainer.serviceUrl;
    const data = {
      bug: convertNote(savedNote, serviceUrl),
      index: savedTestStep.bugs.length - 1,
    };

    return new ActionSuccess(data);
  }
}
