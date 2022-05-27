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

import { Reply, ReplyImpl } from "@/lib/captureControl/Reply";
import { ManagedStory } from "@/lib/testManagement/TestManagementData";
import { ProgressData, Story, TestMatrix } from "@/lib/testManagement/types";
import { StoryConvertable } from "./WriteDataFileAction";
import { ActionResult } from "@/lib/common/ActionResult";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

interface ReadDataFileMutationObserver {
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
    const reply = await this.readProject();

    if (reply.error) {
      return { data: undefined, error: reply.error };
    }

    if (!reply.data) {
      return {};
    }

    const { projectId, testMatrices, stories, progressDatas } = reply.data;

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

    return {};
  }

  /**
   * Read project data.
   * @returns Project data.
   */
  private async readProject(): Promise<
    Reply<{
      projectId: string;
      testMatrices: TestMatrix[];
      progressDatas: ProgressData[];
      stories: ManagedStory[];
    }>
  > {
    const projects = (
      await this.repositoryContainer.projectRepository.getProjects()
    ).data as Array<{
      id: string;
      name: string;
    }>;

    const targetProjectId =
      projects.length === 0
        ? (
            (await this.repositoryContainer.projectRepository.postProject())
              .data as {
              id: string;
              name: string;
            }
          ).id
        : projects[projects.length - 1].id;

    const reply = await this.repositoryContainer.projectRepository.getProject(
      targetProjectId
    );

    const data = {
      ...reply.data,
      projectId: targetProjectId,
    } as {
      projectId: string;
      testMatrices: TestMatrix[];
      progressDatas: ProgressData[];
      stories: ManagedStory[];
    };

    return new ReplyImpl({ status: reply.status, data: data });
  }
}
