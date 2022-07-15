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

import { MutationTree } from "vuex";
import { TestManagementState } from ".";
import { Story, TestMatrix, Session } from "@/lib/testManagement/types";

const mutations: MutationTree<TestManagementState> = {
  /**
   * Set project id to the State.
   * @param state State.
   * @param payload.projectId Project id.
   */
  setProjectId(
    state,
    payload: {
      projectId: string;
    }
  ) {
    state.projectId = payload.projectId;
  },

  /**
   * Set a test management data to the State.
   * @param state State.
   * @param payload.stories Stories.
   * @param payload.testMatrices Test matrices.
   */
  setManagedData(
    state,
    payload: {
      stories?: Story[];
      testMatrices: TestMatrix[];
    }
  ) {
    if (payload.stories) {
      state.stories = payload.stories;
    }
    state.testMatrices = payload.testMatrices;
  },

  /**
   * Set a stories to the State.
   * @param state State.
   * @param payload.stories Stories.
   */
  setStoriesData(state, payload: { stories: Story[] }) {
    state.stories = JSON.parse(JSON.stringify(payload.stories));
  },

  /**
   * Add a story to the State.
   * @param state State.
   * @param payload.data Story.
   */
  addStory(state, payload: { data: Story }) {
    state.stories.push(payload.data);
  },

  /**
   * Replace the specified index story in the State.
   * @param state State.
   * @param payload.index Story index.
   * @param payload.data New story.
   */
  setStory(state, payload: { index: number; data: Story }) {
    state.stories[payload.index] = payload.data;
  },

  /**
   * Replace the specified index session in the State.
   * @param state State.
   * @param payload.storyIndex Story index.
   * @param payload.sessionIndex Session index.
   * @param payload.data New session.
   */
  setSession(
    state,
    payload: { storyIndex: number; sessionIndex: number; data: Session }
  ) {
    state.stories[payload.storyIndex].sessions.splice(
      payload.sessionIndex,
      1,
      payload.data
    );
  },

  /**
   * Replace the story in the State being edited.
   * @param state State.
   * @param payload.story New story.
   */
  setTempStory(state, payload: { story: Story }) {
    state.tempStory = JSON.parse(JSON.stringify(payload.story));
  },

  /**
   * Empty the story in the State being edited.
   * @param state State.
   */
  clearTempStory(state) {
    state.tempStory = null;
  },
};

export default mutations;
