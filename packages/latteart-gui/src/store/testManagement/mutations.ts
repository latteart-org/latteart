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
  Session,
  Group,
  TestTarget,
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
   * @param payload.data New story.
   */
  setStory(state, payload: { data: Story }) {
    state.stories = state.stories.map((story) => {
      return story.id === payload.data.id ? payload.data : story;
    });
  },

  /**
   * Add a session to the State.
   * @param state State.
   * @param payload.storyId Story id.
   * @param payload.session New Session.
   */
  addSession(state, payload: { storyId: string; session: Session }) {
    state.stories = state.stories.map((story) => {
      return story.id !== payload.storyId
        ? story
        : {
            ...story,
            sessions: [...story.sessions, payload.session],
          };
    });
  },

  /**
   * Replace the session in the State.
   * @param state State.
   * @param payload.storyId Story id.
   * @param payload.session New session.
   */
  setSession(state, payload: { storyId: string; session: Session }) {
    state.stories = state.stories.map((story) => {
      if (story.id !== payload.storyId) {
        return story;
      }
      return {
        ...story,
        sessions: story.sessions.map((session) => {
          return session.id === payload.session.id ? payload.session : session;
        }),
      };
    });
  },

  /**
   * Delete a session to the State.
   * @param state State.
   * @param payload.storyId Story id.
   * @param payload.sessionId Session id.
   */
  deleteSession(state, payload: { storyId: string; sessionId: string }) {
    state.stories = state.stories.map((story) => {
      if (story.id !== payload.storyId) {
        return story;
      }
      return {
        ...story,
        sessions: story.sessions.filter(
          (session) => session.id !== payload.sessionId
        ),
      };
    });
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
   * Add a test matrix to the State.
   * @param state State.
   * @param payload.testMatrix New test matrix.
   */
  addTestMatrix(state, payload: { testMatrix: TestMatrix }) {
    state.testMatrices = [...state.testMatrices, payload.testMatrix];
  },

  /**
   * Replace the specified test matrix in the State.
   * @param state State.
   * @param payload.testMatrices Test matrices to update.
   */
  updateTestMatrices(state, payload: { testMatrices: TestMatrix[] }) {
    state.testMatrices = [
      ...state.testMatrices.filter((testMatrix) => {
        return !payload.testMatrices.find(
          (newTestMatrix) => newTestMatrix.id === testMatrix.id
        );
      }),
      ...payload.testMatrices,
    ].sort((t1, t2) => {
      return t1.index - t2.index;
    });
  },

  /**
   * Delete a test matrix to the State.
   * @param state State.
   * @param payload ID of test matrix to delete.
   */
  deleteTestMatrix(state, payload: { testMatrixId: string }) {
    state.testMatrices = state.testMatrices.filter(
      (testMatrix) => testMatrix.id !== payload.testMatrixId
    );
  },

  /**
   * Add a group to the State.
   * @param state State
   * @param payload New group.
   */
  addGroup(state, payload: { testMatrixId: string; group: Group }) {
    state.testMatrices = state.testMatrices.map((testMatrix) => {
      if (testMatrix.id !== payload.testMatrixId) {
        return testMatrix;
      }
      return {
        ...testMatrix,
        groups: [...testMatrix.groups, payload.group],
      };
    });
  },

  /**
   * Replace the specified group in the State.
   * @param state State.
   * @param payload Group to update.
   */
  updateGroups(state, payload: { testMatrixId: string; groups: Group[] }) {
    state.testMatrices = state.testMatrices.map((testMatrix) => {
      if (testMatrix.id !== payload.testMatrixId) {
        return testMatrix;
      }

      return {
        ...testMatrix,
        groups: [
          ...testMatrix.groups.filter((group) => {
            return !payload.groups.find((newGroup) => {
              return newGroup.id === group.id;
            });
          }),
          ...payload.groups,
        ].sort((g1, g2) => {
          return g1.index - g2.index;
        }),
      };
    });
  },

  /**
   * Add a test target to the State.
   * @param state State.
   * @param payload.testMatrixId ID of the project that has the test target to update.
   * @param payload.groupId ID of the group that has the test target to update.
   * @param payload.testTarget New test target.
   */
  addTestTarget(
    state,
    payload: { testMatrixId: string; groupId: string; testTarget: TestTarget }
  ) {
    state.testMatrices = state.testMatrices.map((testMatrix) => {
      if (testMatrix.id !== payload.testMatrixId) {
        return testMatrix;
      }
      testMatrix.groups = testMatrix.groups.map((group) => {
        if (group.id !== payload.groupId) {
          return group;
        }
        return {
          ...group,
          testTargets: [...group.testTargets, payload.testTarget],
        };
      });
      return testMatrix;
    });
  },

  /**
   * Replace the specified test targets in the State.
   * @param state State.
   * @param payload.testMatrixId ID of the project that has the test target to update.
   * @param payload.groupId ID of the group that has the test target to update.
   * @param payload.testTargets Test targets to update.
   */
  updateTestTargets(
    state,
    payload: {
      testMatrixId: string;
      groupId: string;
      testTargets: TestTarget[];
    }
  ) {
    state.testMatrices = state.testMatrices.map((testMatrix) => {
      if (testMatrix.id !== payload.testMatrixId) {
        return testMatrix;
      }
      testMatrix.groups = testMatrix.groups.map((group) => {
        if (group.id !== payload.groupId) {
          return group;
        }
        return {
          ...group,
          testTargets: [
            ...group.testTargets.filter((testTarget) => {
              return !payload.testTargets.find(
                (newTestTarget) => newTestTarget.id !== testTarget.id
              );
            }),
            ...payload.testTargets,
          ].sort((t1, t2) => t1.index - t2.index),
        };
      });
      return testMatrix;
    });
  },
};

export default mutations;
