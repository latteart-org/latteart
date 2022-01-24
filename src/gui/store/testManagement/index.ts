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

import { Module } from "vuex";
import { RootState } from "..";
import getters from "./getters";
import mutations from "./mutations";
import actions from "./actions";
import { TestMatrix, Story, ProgressData } from "@/lib/testManagement/types";

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
   * Progress datas.
   */
  progressDatas: ProgressData[];

  /**
   * Story being edited.
   */
  tempStory: Story | null;
}

const state: TestManagementState = {
  projectId: "",
  testMatrices: Array<TestMatrix>(),
  stories: Array<Story>(),
  progressDatas: Array<ProgressData>(),
  tempStory: null,
};

export const testManagement: Module<TestManagementState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
