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
  ActionFailure,
  ActionResult,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import {
  RepositoryService,
  ManagedSessionForRepository,
  ManagedStoryForRepository,
} from "src/common";
import { Story } from "../types";
import SessionDataConverter from "../SessionDataConverter";
import { GetTestResultAction } from "@/lib/operationHistory/actions/testResult/GetTestResultAction";
import { convertManagedStory } from "@/lib/common/replyDataConverter";
import { TestResult } from "@/lib/operationHistory/types";

const READ_STORY_DATA_FAILED_MESSAGE_KEY =
  "error.test_management.read_story_data_failed";

export class ReadStoryDataAction {
  constructor(
    private repositoryService: Pick<
      RepositoryService,
      "storyRepository" | "testResultRepository" | "serviceUrl"
    >
  ) {}
  public async readStory(payload: {
    id: string;
  }): Promise<ActionResult<Story>> {
    const result = await this.repositoryService.storyRepository.getStory(
      payload.id
    );

    if (result.isFailure()) {
      return new ActionFailure({
        messageKey: READ_STORY_DATA_FAILED_MESSAGE_KEY,
      });
    }

    const { storyData } = convertManagedStory(result.data);
    const getSessionWithTestResult = await this.getSessionWithTestResult(
      storyData.sessions
    );

    const data = {
      ...storyData,
      sessions: getSessionWithTestResult,
    };

    return new ActionSuccess(data);
  }

  private async getSessionWithTestResult(
    sessions: ManagedSessionForRepository[]
  ) {
    const sessionsWithTestResult = await Promise.all(
      sessions.map(async (session) => {
        const testResultId =
          session.testResultFiles && session.testResultFiles.length > 0
            ? session.testResultFiles[0].id
            : undefined;
        const getTestResultResult = testResultId
          ? await this.getTestResult(testResultId)
          : undefined;
        return new SessionDataConverter().convertToSession({
          ...session,
          testResult: getTestResultResult,
        });
      })
    );
    return sessionsWithTestResult;
  }

  public async createStoryWithTestResult(
    stories: ManagedStoryForRepository[],
    testResultReader: (
      session: ManagedSessionForRepository
    ) => Promise<TestResult | undefined>
  ): Promise<ActionSuccess<Story[]>> {
    const converter = new SessionDataConverter();
    const data = await Promise.all(
      stories.map(async (story) => {
        const sessions = await Promise.all(
          story.sessions.map(async (session) => {
            const testResult = await testResultReader(session);
            return this.createSession(session, converter, testResult);
          })
        );

        return {
          ...story,
          sessions,
        };
      })
    );

    return new ActionSuccess(data);
  }

  private async createSession(
    managedSession: ManagedSessionForRepository,
    converter: SessionDataConverter,
    testResult?: TestResult
  ) {
    const { oldSession, newSession } = converter.getOldAndNewSession({
      session: managedSession,
    });

    const target = { ...newSession, testResult };
    return converter.convertToSession(target, oldSession);
  }

  public async createStoryWithoutTestResult(
    stories: ManagedStoryForRepository[]
  ): Promise<ActionSuccess<Story[]>> {
    const converter = new SessionDataConverter();
    const data = await Promise.all(
      stories.map(async (story) => {
        const sessions = await Promise.all(
          story.sessions.map((session) => {
            return this.createSession(session, converter);
          })
        );

        return {
          ...story,
          sessions,
        };
      })
    );

    return new ActionSuccess(data);
  }

  private async getTestResult(testResultId: string) {
    const getTestResultResult = await new GetTestResultAction(
      this.repositoryService
    ).getTestResult(testResultId);

    if (getTestResultResult.isFailure()) {
      return undefined;
    } else {
      return getTestResultResult.data;
    }
  }
}
