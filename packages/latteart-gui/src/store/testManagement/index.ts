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

import { Module } from "vuex";
import { RootState } from "..";
import getters from "./getters";
import mutations from "./mutations";
import actions from "./actions";
import { TestMatrix, Story } from "@/lib/testManagement/types";

/**
 * State for test management.
 */
export interface TestManagementState {
  /**
   * Current project id.
   */
  projectId: string;

  /**
   * Test matrices.
   */
  testMatrices: TestMatrix[];

  /**
   * Stories.
   */
  stories: Story[];

  /**
   * Story being edited.
   */
  tempStory: Story | null;

  /**
   * Recent stories.
   */
  recentStories: Story[];

  /**
   * Recent review query.
   */
  recentReviewQuery: { sessionIds: string[]; testResultIds: string[] } | null;

  /**
   * Test matrix filter.
   */
  testMatrixFilter: { search: string; isCompletionFilterEnabled: boolean };
}

const state: TestManagementState = {
  projectId: "",
  testMatrices: Array<TestMatrix>(),
  stories: Array<Story>(),
  tempStory: null,
  recentStories: [],
  recentReviewQuery: null,
  testMatrixFilter: { search: "", isCompletionFilterEnabled: false },
};

export const testManagement: Module<TestManagementState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
