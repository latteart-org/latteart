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

export class AddNoticeAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "noteRepository" | "testStepRepository" | "serviceUrl"
    >
  ) {}

  /**
   * Notice the test step with the specified sequence number and add information.
   * @param testResultId  Test result ID.
   * @param testStepId  Test step id of the target test step.
   * @param notice  Notice information to add.
   */
  public async addNotice(
    testResultId: string,
    testStepId: string,
    notice: {
      summary: string;
      details: string;
      tags: string[];
      imageData?: string;
    }
  ): Promise<ActionResult<{ notice: Note; index: number }>> {
    // New registration of note.
    const intention = undefined;
    const bug = undefined;

    const reply = await this.repositoryContainer.noteRepository.postNotes(
      testResultId,
      intention,
      bug,
      notice
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
      const { notices: replyNotices } = (
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

      const notices = [...replyNotices, savedNote.id];
      const noteId = undefined;

      return await this.repositoryContainer.testStepRepository.patchTestSteps(
        testResultId,
        testStepId,
        noteId,
        bug,
        notices
      );
    })();

    const savedTestStep = linkTestStep.data as {
      notices: string[];
    };

    const serviceUrl = this.repositoryContainer.serviceUrl;
    const data = {
      notice: convertNote(savedNote, serviceUrl),
      index: savedTestStep.notices.length - 1,
    };

    const error = reply.error ? { code: reply.error.code } : undefined;
    const result = {
      data,
      error: error,
    };

    return result;
  }
}
