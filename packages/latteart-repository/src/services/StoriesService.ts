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

import { StoryEntity } from "../entities/StoryEntity";
import {
  GetStoryResponse,
  PatchStoryDto,
  PatchStoryResponse,
} from "../interfaces/Stories";
import { storyEntityToResponse } from "./helper/entityToResponse";
import { getRepository } from "typeorm";

export class StoriesService {
  public async patchStory(
    storyId: string,
    requestBody: PatchStoryDto
  ): Promise<PatchStoryResponse> {
    const storyRepository = getRepository(StoryEntity);
    const story = await storyRepository.findOne(storyId);
    if (!story) {
      throw new Error(`Story not found. :${storyId}`);
    }

    if (!!requestBody.status && requestBody.status !== story.status) {
      story.status = requestBody.status;
      await storyRepository.save(story);
    }
    return await this.getStory(storyId);
  }

  public async getStory(id: string): Promise<GetStoryResponse> {
    const story = await getRepository(StoryEntity).findOne(id, {
      relations: [
        "sessions",
        "sessions.attachedFiles",
        "sessions.testResult",
        "sessions.testResult.testPurposes",
        "sessions.testResult.notes",
        "sessions.testResult.notes.testSteps",
        "sessions.testResult.notes.testSteps.screenshot",
        "sessions.testResult.notes.tags",
      ],
    });
    if (!story) {
      throw new Error(`Story not found. :${id}`);
    }
    return storyEntityToResponse(story);
  }
}
