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
  ManagedStory,
  TestManagementData,
} from "@/lib/testManagement/TestManagementData";
import { ProgressData, Story, TestMatrix } from "@/lib/testManagement/types";
import { ProjectRepository } from "@/lib/eventDispatcher/repositoryService/ProjectRepository";
import { ActionResult } from "@/lib/common/ActionResult";
import { TestResultRepository } from "@/lib/eventDispatcher/repositoryService/TestResultRepository";

interface WriteDataFileMutationObserver {
  setManagedData(data: {
    testMatrices: TestMatrix[];
    progressDatas: ProgressData[];
  }): void;
  setStoriesData(data: { stories: Story[] }): void;
}

export interface StoryConvertable {
  convertToStory(
    target: ManagedStory,
    dispatcher: ProjectUpdatable,
    oldStory?: Story
  ): Promise<Story>;
}

export interface ProjectUpdatable {
  readonly testResultRepository: TestResultRepository;
  readonly projectRepository: ProjectRepository;
}

export class WriteDataFileAction {
  constructor(
    private observer: WriteDataFileMutationObserver,
    private storyDataConverter: StoryConvertable,
    private dispatcher: ProjectUpdatable
  ) {}

  public async write(
    projectId: string,
    testManagementData: TestManagementData,
    stories: Story[]
  ): Promise<ActionResult<void>> {
    const reply = await this.dispatcher.projectRepository.putProject(
      projectId,
      testManagementData
    );

    if (!reply.data) {
      return {};
    }

    const data = reply.data;
    this.observer.setManagedData({
      testMatrices: data.testMatrices,
      progressDatas: data.progressDatas,
    });

    const parsedStories: Story[] = await Promise.all(
      data.stories.map((story) => {
        const oldStory = stories.find((s) => {
          return s.id === story.id;
        });

        return this.storyDataConverter.convertToStory(
          story as ManagedStory,
          this.dispatcher,
          oldStory
        );
      })
    );
    this.observer.setStoriesData({ stories: parsedStories });

    return {};
  }
}
