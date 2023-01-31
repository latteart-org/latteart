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

import { TestManagementData } from "@/lib/testManagement/TestManagementData";
import { Story, TestMatrix } from "@/lib/testManagement/types";
import {
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import { RepositoryService } from "src/common";
import SessionDataConverter from "../SessionDataConverter";

export interface WriteDataFileMutationObserver {
  setManagedData(data: { testMatrices: TestMatrix[] }): void;
  setStoriesData(data: { stories: Story[] }): void;
}

const WRITE_DATA_FILE_FAILED_MESSAGE_KEY =
  "error.test_management.save_project_failed";

export class WriteDataFileAction {
  constructor(
    private observer: WriteDataFileMutationObserver,
    private repositoryService: Pick<
      RepositoryService,
      "testResultRepository" | "projectRepository"
    >
  ) {}

  public async write(
    projectId: string,
    testManagementData: TestManagementData,
    stories: Story[]
  ): Promise<ActionResult<void>> {
    const putProjectResult =
      await this.repositoryService.projectRepository.putProject(
        projectId,
        testManagementData
      );

    if (putProjectResult.isFailure()) {
      return new ActionFailure({
        messageKey: WRITE_DATA_FILE_FAILED_MESSAGE_KEY,
      });
    }

    const data = putProjectResult.data;
    this.observer.setManagedData({
      testMatrices: data.testMatrices,
    });

    const converter = new SessionDataConverter();

    const parsedStories: Story[] = await Promise.all(
      data.stories.map(async (story) => {
        const oldStory = stories.find((s) => {
          return s.id === story.id;
        });
        const sessions = await Promise.all(
          story.sessions.map((session) => {
            const { oldSession, newSession } = converter.getOldAndNewSession(
              {
                session,
              },
              oldStory?.sessions
            );
            return converter.convertToSession(newSession, oldSession);
          })
        );

        return {
          ...story,
          sessions,
        };
      })
    );

    this.observer.setStoriesData({ stories: parsedStories });

    return new ActionSuccess(undefined);
  }
}
