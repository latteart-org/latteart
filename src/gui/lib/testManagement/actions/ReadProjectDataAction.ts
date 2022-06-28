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
  RepositoryAccessResult,
  RepositoryAccessSuccess,
} from "@/lib/captureControl/Reply";
import { ManagedStory } from "@/lib/testManagement/TestManagementData";
import { ProgressData, Story, TestMatrix } from "@/lib/testManagement/types";
import { StoryConvertable } from "./WriteDataFileAction";
import {
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

export interface ReadDataFileMutationObserver {
  setProjectId(data: { projectId: string }): void;
  setManagedData(data: { testMatrices: TestMatrix[] }): void;
  setStoriesData(data: { stories: Story[] }): void;
  setProgressDatas(data: { progressDatas: ProgressData[] }): void;
}

export interface ProjectStoryConvertable {
  convertToStory(
    target: ManagedStory,
    repositoryContainer: Pick<
      RepositoryContainer,
      "projectRepository" | "testResultRepository"
    >
  ): Promise<Story>;
}

const READ_PROJECT_DATA_FAILED_MESSAGE_KEY =
  "error.test_management.read_project_data_failed";

export class ReadProjectDataAction {
  constructor(
    private observer: ReadDataFileMutationObserver,
    private storyDataConverter: StoryConvertable,
    private repositoryContainer: Pick<
      RepositoryContainer,
      "projectRepository" | "testResultRepository"
    >
  ) {}

  public async read(): Promise<ActionResult<void>> {
    const readProjectResult = await this.readProject();

    if (readProjectResult.isFailure()) {
      return new ActionFailure({
        messageKey: READ_PROJECT_DATA_FAILED_MESSAGE_KEY,
      });
    }

    const { projectId, testMatrices, stories, progressDatas } =
      readProjectResult.data;

    this.observer.setProjectId({ projectId });

    this.observer.setManagedData({ testMatrices });

    this.observer.setStoriesData({
      stories: await Promise.all(
        stories.map((story) =>
          this.storyDataConverter.convertToStory(
            story,
            this.repositoryContainer as unknown as Pick<
              RepositoryContainer,
              "testResultRepository" | "projectRepository"
            >
          )
        )
      ),
    });

    this.observer.setProgressDatas({ progressDatas });

    return new ActionSuccess(undefined);
  }

  /**
   * Read project data.
   * @returns Project data.
   */
  private async readProject(): Promise<
    RepositoryAccessResult<{
      projectId: string;
      testMatrices: TestMatrix[];
      progressDatas: ProgressData[];
      stories: ManagedStory[];
    }>
  > {
    const getProjectsResult =
      await this.repositoryContainer.projectRepository.getProjects();

    if (getProjectsResult.isFailure()) {
      return getProjectsResult;
    }

    const projectIds = getProjectsResult.data.map(({ id }) => id);

    if (projectIds.length === 0) {
      const postProjectResult =
        await this.repositoryContainer.projectRepository.postProject();

      if (postProjectResult.isFailure()) {
        return postProjectResult;
      }

      projectIds.push(postProjectResult.data.id);
    }

    const targetProjectId = projectIds[projectIds.length - 1];

    const getProjectResult =
      await this.repositoryContainer.projectRepository.getProject(
        targetProjectId
      );

    if (getProjectResult.isFailure()) {
      return getProjectResult;
    }

    const data = {
      ...getProjectResult.data,
      projectId: targetProjectId,
    };

    return new RepositoryAccessSuccess({
      data: data,
    });
  }
}
