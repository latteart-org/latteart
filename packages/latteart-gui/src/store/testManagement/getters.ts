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

import { GetterTree } from "vuex";
import { TestManagementState } from ".";
import { RootState } from "..";
import { Story, Session } from "@/lib/testManagement/types";

const getters: GetterTree<TestManagementState, RootState> = {
  /**
   * Get test matrices from the State.
   * @param state State.
   * @returns Test matrices.
   */
  getTestMatrices: (state) => () => {
    return JSON.parse(JSON.stringify(state.testMatrices));
  },

  /**
   * Get stories from the State.
   * @param state State.
   * @returns Stories.
   */
  getStories: (state) => () => {
    return JSON.parse(JSON.stringify(state.stories));
  },

  /**
   * Collect reviewable sessions from a story.
   * @param state State.
   * @returns Session.
   */
  collectReviewableSessions: (state, getters) => (storyId: string) => {
    const story: Story | undefined = getters.findStory(storyId);

    if (!story) {
      return [];
    }

    return story.sessions.filter((session) => {
      if (!session.testResultFiles) {
        return false;
      }
      if (session.testResultFiles.length === 0) {
        return false;
      }
      return true;
    });
  },

  /**
   * Find a session by story id and session id.
   * @param state State.
   * @returns Session.
   */
  findSession:
    (state) =>
    (storyId: string, sessionId: string): Session | undefined => {
      return state.stories
        .find((story) => story.id === storyId)
        ?.sessions.find((session) => session.id === sessionId);
    },

  /**
   * Get the story being edited from the State.
   * @param state State.
   * @returns The story being edited from the State.
   */
  getTempStory: (state) => () => {
    return JSON.parse(JSON.stringify(state.tempStory));
  },

  /**
   * Searches the State for story that matches the specified story ID and returns the first story found.
   * Returns undefined if not found.
   * @param state State.
   * @returns Found story.
   */
  findStory: (state) => (storyId: string) => {
    const found = state.stories.find((chater: Story) => {
      return chater.id === storyId;
    });
    return found === undefined ? undefined : JSON.parse(JSON.stringify(found));
  },

  findGroup: (state) => (testMatrixId: string, groupId: string) => {
    return state.testMatrices
      .find((testMatrix) => testMatrix.id === testMatrixId)
      ?.groups.find((group) => group.id === groupId);
  },

  /**
   * Searches the State for story that matches the specified test result ID,
   * viewPoint ID, and test matrix ID and returns the first story found.
   * Returns undefined if not found.
   * @param state State.
   * @returns Found story.
   */
  findStoryByTestTargetAndViewPointId:
    (state) =>
    (testTargetId: string, viewPointId: string, testMatrixId: string) => {
      const found = state.stories.find((story: Story) => {
        return (
          story.testMatrixId === testMatrixId &&
          story.testTargetId === testTargetId &&
          story.viewPointId === viewPointId
        );
      });
      return found === undefined
        ? undefined
        : JSON.parse(JSON.stringify(found));
    },

  /**
   * Searches the State for test matrix that matches the specified test matrix ID and returns the first test matrix found.
   * Returns undefined if not found.
   * @param state State.
   * @returns Found test matrix.
   */
  findTestMatrix: (state) => (testMatrixId: string) => {
    return state.testMatrices.find((testMatrix) => {
      return testMatrix.id === testMatrixId;
    });
  },

  /**
   * Whether there is at least one session holding test result in the State's test management data or not.
   * @param state State.
   * @returns 'true': There is, 'false': There is not.
   */
  anySessionHasHistory: (state) => () => {
    return (
      state.stories.findIndex((story) => {
        return (
          story.sessions.findIndex((session) => {
            return session.testResultFiles?.length ?? 0 > 0;
          }) !== -1
        );
      }) !== -1
    );
  },
};

export default getters;
