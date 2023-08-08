/**
 * Copyright 2023 NTT Corporation.
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
  RepositoryAccessResult,
  createRepositoryAccessSuccess,
  RepositoryService,
} from "latteart-client";
import { Story, TestMatrix } from "@/lib/testManagement/types";
import {
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import SessionDataConverter from "../SessionDataConverter";

const READ_PROJECT_DATA_FAILED_MESSAGE_KEY =
  "error.test_management.read_project_data_failed";

export class ReadProjectAction {
  constructor(
    private repositoryService: Pick<
      RepositoryService,
      "projectRepository" | "testResultRepository" | "serviceUrl"
    >
  ) {}

  public async read(): Promise<
    ActionResult<{
      projectId: string;
      testMatrices: TestMatrix[];
      stories: Story[];
    }>
  > {
    const readProjectResult = await this.readProject();

    if (readProjectResult.isFailure()) {
      return new ActionFailure({
        messageKey: READ_PROJECT_DATA_FAILED_MESSAGE_KEY,
      });
    }

    return new ActionSuccess(readProjectResult.data);
  }

  /**
   * Read project data.
   * @returns Project data.
   */
  private async readProject(): Promise<
    RepositoryAccessResult<{
      projectId: string;
      testMatrices: TestMatrix[];
      stories: Story[];
    }>
  > {
    const getProjectsResult =
      await this.repositoryService.projectRepository.getProjects();

    if (getProjectsResult.isFailure()) {
      return getProjectsResult;
    }

    const projectIds = getProjectsResult.data.map(({ id }) => id);

    if (projectIds.length === 0) {
      const postProjectResult =
        await this.repositoryService.projectRepository.postProject();

      if (postProjectResult.isFailure()) {
        return postProjectResult;
      }

      projectIds.push(postProjectResult.data.id);
    }

    const targetProjectId = projectIds[projectIds.length - 1];

    const getProjectResult =
      await this.repositoryService.projectRepository.getProject(
        targetProjectId
      );

    if (getProjectResult.isFailure()) {
      return getProjectResult;
    }

    const convertedStories = getProjectResult.data.stories.map((story) => {
      return {
        ...story,
        sessions: story.sessions.map((session) => {
          return new SessionDataConverter().convertToSession(session);
        }),
      };
    });

    const data = {
      projectId: targetProjectId,
      testMatrices: getProjectResult.data.testMatrices,
      stories: convertedStories,
    };

    return createRepositoryAccessSuccess({
      data,
    });
  }
}
