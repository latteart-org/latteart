/**
 * Copyright 2021 NTT Corporation.
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

import { Reply } from "@/lib/captureControl/Reply";
import { ManagedStory } from "@/lib/testManagement/TestManagementData";
import { ProgressData, Story, TestMatrix } from "@/lib/testManagement/types";
import { ProjectUpdatable, StoryConvertable } from "./WriteDataFileAction";

interface ReadDataFileMutationObserver {
  setManagedData(data: { testMatrices: TestMatrix[] }): void;
  setStoriesData(data: { stories: Story[] }): void;
  setProgressDatas(data: { progressDatas: ProgressData[] }): void;
}

export interface ProjectStoryConvertable {
  convertToStory(
    target: ManagedStory,
    dispatcher: ProjectFetchable
  ): Promise<Story>;
}

export interface ProjectFetchable extends ProjectUpdatable {
  readProject(): Promise<
    Reply<{
      testMatrices: TestMatrix[];
      progressDatas: ProgressData[];
      stories: ManagedStory[];
    }>
  >;
}

export class ReadProjectDataAction {
  constructor(
    private observer: ReadDataFileMutationObserver,
    private storyDataConverter: StoryConvertable,
    private dispatcher: ProjectFetchable
  ) {}

  public async read(): Promise<void> {
    const reply = await this.dispatcher.readProject();
    if (reply.error) {
      throw new Error(reply.error.code);
    }

    if (!reply.data) {
      return;
    }

    const { testMatrices, stories, progressDatas } = reply.data;

    this.observer.setManagedData({ testMatrices });

    this.observer.setStoriesData({
      stories: await Promise.all(
        stories.map((story) =>
          this.storyDataConverter.convertToStory(
            story,
            (this.dispatcher as unknown) as ProjectUpdatable
          )
        )
      ),
    });

    this.observer.setProgressDatas({ progressDatas });
  }
}
