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
import {
  Story,
  TestMatrix,
  ProgressData,
  Session,
} from "@/lib/testManagement/types";

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
   * @param payload.progressDatas Progress datas.
   */
  setManagedData(
    state,
    payload: {
      stories?: Story[];
      testMatrices: TestMatrix[];
      progressDatas: ProgressData[];
    }
  ) {
    if (payload.stories) {
      state.stories = payload.stories;
    }
    state.testMatrices = payload.testMatrices;
    state.progressDatas = payload.progressDatas;
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

  /**
   * Set progress datas to the State.
   * @param state State.
   * @param payload.progressDatas New progress datas.
   */
  setProgressDatas(state, payload: { progressDatas: ProgressData[] }) {
    state.progressDatas = JSON.parse(JSON.stringify(payload.progressDatas));
  },

  /**
   * Add a progress data to the State.
   * @param state State.
   * @param payload.data Progress data.
   */
  addProgressData(state, payload: { data: ProgressData }) {
    (state.progressDatas as ProgressData[]).push(payload.data);
  },

  /**
   * Replace the specified index progress data in the State.
   * @param state State
   * @param payload.index Progress data index.
   * @param payload.data New progress data.
   */
  setProgressData(state, payload: { index: number; data: ProgressData }) {
    (state.progressDatas as ProgressData[])[payload.index] = payload.data;
  },
};

export default mutations;
