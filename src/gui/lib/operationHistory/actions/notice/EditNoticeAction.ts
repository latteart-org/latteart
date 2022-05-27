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
import { convertNoteWithoutId } from "@/lib/eventDispatcher/replyDataConverter";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

export class EditNoticeAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "noteRepository" | "testStepRepository" | "serviceUrl"
    >
  ) {}

  /**
   * Edit Notice.
   * @param testResultId  ID of the test result associated with the notice to be edited.
   * @param testStepId  Test step id of the test result associated with the target Notice.
   * @param index  Notice index
   * @param notice  Update contents of notice.
   * @returns Updated notice information.
   */
  public async editNotice(
    testResultId: string,
    testStepId: string,
    index: number,
    notice: {
      summary: string;
      details: string;
      tags: string[];
    }
  ): Promise<ActionResult<{ notice: Note; index: number }>> {
    const intention = undefined;
    const bug = undefined;

    const { notices } = (
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

    const noteId: string = notices[index];

    // Note update
    const reply = await this.repositoryContainer.noteRepository.putNotes(
      testResultId,
      noteId,
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

    const serviceUrl = this.repositoryContainer.serviceUrl;
    const data = {
      notice: convertNoteWithoutId(savedNote, serviceUrl),
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
