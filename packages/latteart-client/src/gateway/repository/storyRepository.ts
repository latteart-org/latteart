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

import { RESTClient } from "../../network/http/client";
import {
  RepositoryAccessResult,
  createRepositoryAccessSuccess,
  createConnectionRefusedFailure,
  createRepositoryAccessFailure,
} from "./result";
import { SessionForRepository, StoryForRepository } from "./types";

export type StoryRepository = {
  patchStory(
    id: string,
    body: {
      status?: string;
    }
  ): Promise<RepositoryAccessResult<StoryForRepository>>;

  getStory(id: string): Promise<RepositoryAccessResult<StoryForRepository>>;
};

export class StoryRepositoryImpl implements StoryRepository {
  constructor(private restClient: RESTClient) {}

  public async patchStory(
    id: string,
    body: {
      status?: string;
    }
  ): Promise<RepositoryAccessResult<StoryForRepository>> {
    try {
      const response = await this.restClient.httpPatch(
        `api/v1/stories/${id}`,
        body
      );

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      const data = response.data as StoryForRepository;

      return createRepositoryAccessSuccess({
        data: this.convertStory(data),
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  public async getStory(
    id: string
  ): Promise<RepositoryAccessResult<StoryForRepository>> {
    try {
      const response = await this.restClient.httpGet(`api/v1/stories/${id}`);

      if (response.status !== 200) {
        return createRepositoryAccessFailure(response);
      }

      const data = response.data as StoryForRepository;

      return createRepositoryAccessSuccess({
        data: this.convertStory(data),
      });
    } catch (error) {
      return createConnectionRefusedFailure();
    }
  }

  private convertStory(story: StoryForRepository) {
    return {
      ...story,
      sessions: story.sessions.map((session) => this.convertSession(session)),
    };
  }

  private convertSession(session: SessionForRepository) {
    return {
      ...session,
      testResultFiles: session.testResultFiles,
      testPurposes: session.testPurposes.map((testPurpose) => {
        return {
          ...testPurpose,
          notes: testPurpose.notes.map((note) => {
            return {
              ...note,
              imageFileUrl: note.imageFileUrl
                ? new URL(
                    note.imageFileUrl,
                    this.restClient.serverUrl
                  ).toString()
                : "",
              videoFrame: note.videoFrame
                ? {
                    ...note.videoFrame,
                    url: new URL(
                      note.videoFrame.url,
                      this.restClient.serverUrl
                    ).toString(),
                  }
                : undefined,
            };
          }),
        };
      }),
      notes: session.notes.map((note) => {
        return {
          ...note,
          imageFileUrl: note.imageFileUrl
            ? new URL(note.imageFileUrl, this.restClient.serverUrl).toString()
            : "",
          videoFrame: note.videoFrame
            ? {
                ...note.videoFrame,
                url: new URL(
                  note.videoFrame.url,
                  this.restClient.serverUrl
                ).toString(),
              }
            : undefined,
        };
      }),
    };
  }
}
