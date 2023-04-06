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

import Vue from "vue";
import { ActionTree } from "vuex";
import { TestManagementState } from ".";
import { RootState } from "..";
import {
  Story,
  TestMatrix,
  AttachedFile,
  TestResultFile,
  Plan,
} from "@/lib/testManagement/types";
import { UpdateTestMatrixAction } from "@/lib/testManagement/actions/UpdateTestMatrixAction";
import { ExportProjectAction } from "@/lib/testManagement/actions/ExportProjectAction";
import { ImportProjectAction } from "@/lib/testManagement/actions/ImportProjectAction";
import { GetTestResultListAction } from "@/lib/operationHistory/actions/testResult/GetTestResultListAction";
import { UpdateSessionAction } from "@/lib/testManagement/actions/UpdateSessionAction";
import { WriteSnapshotAction } from "@/lib/testManagement/actions/WriteSnapshotAction";
import { AddNewTestMatrixAction } from "@/lib/testManagement/actions/AddNewTestMatrixAction";
import { AddNewGroupAction } from "@/lib/testManagement/actions/AddNewGroupAction";
import { UpdateGroupAction } from "@/lib/testManagement/actions/UpdateGroupAction";
import { UpdateTestTargetsAction } from "@/lib/testManagement/actions/UpdateTestTargetsAction";
import { DeleteTestTargetAction } from "@/lib/testManagement/actions/DeleteTestTargetAction";
import { DeleteTestMatrixAction } from "@/lib/testManagement/actions/DeleteTestMatrixAction";
import { DeleteGroupAction } from "@/lib/testManagement/actions/DeleteGroupAction";
import { AddNewTestTargetAction } from "@/lib/testManagement/actions/AddNewTestTargetAction";
import { GenerateTestScriptsAction } from "@/lib/operationHistory/actions/GenerateTestScriptsAction";
import { TestResultSummary } from "@/lib/operationHistory/types";
import { CollectProgressDatasAction } from "@/lib/testManagement/actions/CollectProgressDatasAction";
import { UpdateStoryAction } from "@/lib/testManagement/actions/UpdateStoryAction";
import { AddNewSessionAction } from "@/lib/testManagement/actions/AddNewSessionAction";
import { DeleteSessionAction } from "@/lib/testManagement/actions/DeleteSessionAction";
import { Timestamp } from "@/lib/common/Timestamp";
import { ProjectFileRepository } from "../../lib/common/ProjectFileRepository";
import { ReadStoryDataAction } from "@/lib/testManagement/actions/ReadStoryDataAction";
import { ReadProjectAction } from "@/lib/testManagement/actions/ReadProjectAction";

const actions: ActionTree<TestManagementState, RootState> = {
  /**
   * Load test management data and initialize.
   * @param context Action context.
   */
  async initialize(context) {
    if (Vue.prototype.$snapshot) {
      await context.dispatch("readSnapshot", {
        snapshot: Vue.prototype.$snapshot,
      });

      return;
    }

    await context.dispatch("readProject");
  },

  /**
   * Output a snapshot.
   * @param context Action context.
   * @returns URL of the output snapshot.
   */
  async writeSnapshot(context): Promise<string> {
    const result = await new WriteSnapshotAction(
      context.rootState.repositoryService
    ).writeSnapshot(context.state.projectId, {
      locale: context.rootState.i18n?.locale ?? "ja",
    });

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    return result.data.url;
  },

  /**
   * Restore test management data from specified snapshot.
   * @param context Action context.
   * @param payload.snapshot Snapshot.
   */
  readSnapshot(context, payload: { snapshot: any }) {
    context.commit("setManagedData", {
      stories: payload.snapshot.stories,
      testMatrices: payload.snapshot.testMatrices,
    });
  },

  /**
   * Get test results from the repository.
   * @param context Action context.
   * @returns Test results.
   */
  async getTestResults(context): Promise<TestResultSummary[]> {
    const result = await new GetTestResultListAction(
      context.rootState.repositoryService
    ).getTestResults();

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    return result.data;
  },

  /**
   * Load project and update the State.
   * @param context Action context.
   */
  async readProject(context) {
    if (Vue.prototype.$snapshot) {
      return;
    }
    const repository = context.rootState.repositoryService;

    const result = await new ReadProjectAction(repository).read();

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    context.commit("setProjectId", { projectId: result.data.projectId });
    context.commit("setManagedData", {
      testMatrices: result.data.testMatrices,
    });

    context.commit("setStoriesData", { stories: result.data.stories });
  },

  /**
   * Create a test matrix and its associated view point.
   * @param context Action context.
   * @param payload.name The name of the test matrix to create.
   * @param payload.name View point to create.
   */
  async addNewTestMatrix(
    context,
    payload: {
      name: string;
      viewPoints: Array<{
        name: string;
        index: number;
        description: string;
      }>;
    }
  ): Promise<void> {
    const result = await new AddNewTestMatrixAction().addTestMatrix(
      {
        projectId: context.state.projectId,
        testMatrixName: payload.name,
        viewPoints: payload.viewPoints,
      },
      context.rootState.repositoryService
    );

    if (result.isFailure()) {
      throw result.error;
    }

    context.commit("addTestMatrix", { testMatrix: result.data });
  },

  /**
   * Update test matrix.
   * @param context Action context.
   * @param payload.id Test matrix ID to be updated.
   * @param payload.id Test matrix name.
   * @param payload.viewPoints View points to update.
   * @returns
   */
  async updateTestMatrix(
    context,
    payload: {
      id: string;
      name: string;
      viewPoints: Array<{
        name: string;
        description: string;
        index: number;
        id: string | null;
      }>;
    }
  ): Promise<void> {
    const oldTestMatrix = context.state.testMatrices.find(
      (testMatrix) => payload.id === testMatrix.id
    );
    if (!oldTestMatrix) {
      throw new Error();
    }

    const result = await new UpdateTestMatrixAction().updateTestMatrix(
      {
        projectId: context.state.projectId,
        newTestMatrix: {
          id: payload.id,
          name: payload.name,
        },
        newViewPoints: payload.viewPoints,
        oldTestMatrix,
      },
      context.rootState.repositoryService
    );

    if (result.isFailure()) {
      throw result.error;
    }

    context.commit("updateTestMatrices", { testMatrices: result.data });

    return;
  },

  /**
   * Delete test matrix.
   * @param context Action context.
   * @param payload.testMatrixId ID of test matrix to delete.
   */
  async deleteTestMatrix(
    context,
    payload: { testMatrixId: string }
  ): Promise<void> {
    await new DeleteTestMatrixAction().deleteTestMatrix(
      {
        projectId: context.state.projectId,
        testMatrixId: payload.testMatrixId,
      },
      context.rootState.repositoryService
    );
    await context.dispatch("readProject");
  },

  /**
   * Create a group.
   * @param context Action context.
   * @param payload.testMatrixId ID of the test matrix that has the group to create.
   */
  async addNewGroup(
    context,
    payload: {
      testMatrixId: string;
    }
  ): Promise<void> {
    const result = await new AddNewGroupAction().addNewGroup(
      {
        testMatrixId: payload.testMatrixId,
        name: context.rootGetters.message("group-edit-list.name"),
      },
      context.rootState.repositoryService
    );

    if (result.isFailure()) {
      throw result.error;
    }

    context.commit("addGroup", {
      testMatrixId: payload.testMatrixId,
      group: result.data,
    });
  },

  /**
   * Update group.
   * @param context Action context.
   * @param payload.testMatrixId ID of the test matrix that has the group to update.
   * @param payload.groupId ID of group to update.
   * @param payload.name Group name.
   */
  async updateGroup(
    context,
    payload: {
      testMatrixId: string;
      groupId: string;
      name: string;
    }
  ): Promise<void> {
    const result = await new UpdateGroupAction().updateGroup(
      {
        testMatrixId: payload.testMatrixId,
        groupId: payload.groupId,
        name: payload.name,
      },
      context.rootState.repositoryService
    );

    if (result.isFailure()) {
      throw result.error;
    }

    context.commit("updateTestMatrices", { testMatrices: [result.data] });
  },

  /**
   * Delete group.
   * @param context Action context.
   * @param payload.testMatrixId ID of the test matrix that has the test target to delete.
   * @param payload.groupId ID of group to delete.
   */
  async deleteGroup(
    context,
    payload: { testMatrixId: string; groupId: string }
  ): Promise<void> {
    const result = await new DeleteGroupAction().deleteGroup(
      {
        testMatrixId: payload.testMatrixId,
        groupId: payload.groupId,
      },
      context.rootState.repositoryService
    );

    if (result.isFailure()) {
      throw result.error;
    }

    context.commit("updateTestMatrices", { testMatrices: [result.data] });
  },

  /**
   * Create a test target.
   * @param context Action context.
   * @param payload.testMatrixId ID of the test matrix that has the test target to create.
   * @param payload.groupId ID of the group that has the test target to create.
   * @param payload.testTargetName Test target name.
   */
  async addNewTestTarget(
    context,
    payload: {
      testMatrixId: string;
      groupId: string;
      testTargetName: string;
    }
  ): Promise<void> {
    const result = await new AddNewTestTargetAction().addNewTestTarget(
      { ...payload, projectId: context.state.projectId },
      context.rootState.repositoryService
    );

    if (result.isFailure()) {
      throw result.error;
    }

    context.commit("addTestTarget", {
      testMatrixId: payload.testMatrixId,
      groupId: payload.groupId,
      testTarget: result.data,
    });
  },

  /**
   * Update test targets.
   * @param context Action context.
   * @param payload.testMatrixId ID of the test matrix that has the test target to update.
   * @param payload.groupId ID of the group that has the test target to update.
   * @param payload.testTargets Test targets to update.
   */
  async updateTestTargets(
    context,
    payload: {
      testMatrixId: string;
      groupId: string;
      testTargets: {
        id: string;
        index?: number;
        name?: string;
        plans?: Plan[];
      }[];
    }
  ): Promise<void> {
    const result = await new UpdateTestTargetsAction().updateTestTargets(
      { ...payload, projectId: context.state.projectId },
      context.rootState.repositoryService
    );

    if (result.isFailure()) {
      throw result.error;
    }

    context.commit("updateGroups", {
      testMatrixId: payload.testMatrixId,
      groups: [result.data],
    });
  },

  /**
   * Delete test target.
   * @param context Action context.
   * @param payload.testMatrixId ID of the test matrix that has the test target to delete.
   * @param payload.groupId ID of the group that has the test target to delete.
   * @param payload.testTargetId ID of test target to delete.
   */
  async deleteTestTarget(
    context,
    payload: { testMatrixId: string; groupId: string; testTargetId: string }
  ): Promise<void> {
    const result = await new DeleteTestTargetAction().deleteTestTarget(
      { ...payload, projectId: context.state.projectId },
      context.rootState.repositoryService
    );

    if (result.isFailure()) {
      throw result.error;
    }

    context.commit("updateGroups", {
      testMatrixId: payload.testMatrixId,
      groups: [result.data],
    });
  },

  async addNewSession(
    context,
    payload: {
      storyId: string;
    }
  ) {
    const result = await new AddNewSessionAction().addNewSession(
      {
        projectId: context.state.projectId,
        storyId: payload.storyId,
      },
      context.rootState.repositoryService
    );

    if (result.isFailure()) {
      throw result.error;
    }

    context.commit("addSession", {
      storyId: payload.storyId,
      session: result.data,
    });
  },

  /**
   * Save a session.
   * @param context Action context.
   * @param payload.session Session.
   */
  async updateSession(
    context,
    payload: {
      storyId: string;
      sessionId: string;
      params: {
        isDone?: boolean;
        testItem?: string;
        testerName?: string;
        memo?: string;
        attachedFiles?: AttachedFile[];
        testResultFiles?: TestResultFile[];
      };
    }
  ): Promise<void> {
    const story = context.state.stories.find((story) => {
      return story.id === payload.storyId;
    });

    if (!story) {
      return;
    }

    const session = story.sessions.find((session) => {
      return session.id === payload.sessionId;
    });

    if (!session) {
      return;
    }

    const result = await new UpdateSessionAction(
      context.rootState.repositoryService
    ).updateSession(context.state.projectId, payload.sessionId, payload.params);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    context.commit("setSession", {
      storyId: payload.storyId,
      session: result.data,
    });
  },

  async deleteSession(
    context,
    payload: {
      storyId: string;
      sessionId: string;
    }
  ) {
    const result = await new DeleteSessionAction().deleteSession(
      {
        projectId: context.state.projectId,
        sessionId: payload.sessionId,
      },
      context.rootState.repositoryService
    );

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    context.commit("deleteSession", payload);
  },

  async updateStory(
    context,
    payload: {
      storyId: string;
      params: {
        status?: string;
      };
    }
  ): Promise<void> {
    const result = await new UpdateStoryAction().updateStory(
      {
        id: payload.storyId,
        status: payload.params.status,
      },
      context.rootState.repositoryService
    );

    if (result.isFailure()) {
      throw result.error;
    }

    context.commit("setStory", {
      data: result.data,
    });
  },

  async readStory(
    context,
    payload: {
      storyId: string;
    }
  ): Promise<void> {
    const result = await new ReadStoryDataAction(
      context.rootState.repositoryService
    ).readStory({
      id: payload.storyId,
    });

    if (result.isFailure()) {
      throw result.error;
    }

    context.commit("setStory", {
      data: result.data,
    });
  },

  async collectProgressDatas(
    context,
    payload: {
      period?: { since: Timestamp; until: Timestamp };
    } = {}
  ) {
    const repositoryService = Vue.prototype.$dailyTestProgresses
      ? {
          projectRepository: new ProjectFileRepository(
            Vue.prototype.$dailyTestProgresses
          ),
        }
      : context.rootState.repositoryService;

    const result = await new CollectProgressDatasAction(
      repositoryService
    ).collect(context.state.projectId, payload);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    return result.data;
  },

  /**
   * Cancel the saving of test management data.
   * @param context Action context.
   */
  cancelWritingDataFile(context) {
    // TODO: not implemented
  },

  /**
   * Whether test management data in the State equals to specified data or not.
   * @param context Action context.
   * @param payload.testMatrices Test matrices.
   * @param stories Stories.
   * @returns 'true': Equal, 'false': Not equal.
   */
  managedDataEqualsTo(
    context,
    payload: {
      testMatrices: TestMatrix[];
      stories: Story[];
    }
  ) {
    const a = JSON.stringify(payload);
    const b = JSON.stringify({
      testMatrices: context.state.testMatrices,
      stories: context.state.stories,
    });
    return a === b;
  },

  /**
   * Generate test scripts of all sessions.
   * @param context Action context.
   * @param payload.option option for test script generation.
   * @param payload.sources Informations for generating test scripts.
   * @returns URL of generated test scripts and whether test scripts contain invalid operation.
   */
  async generateAllSessionTestScripts(
    context,
    payload: {
      option: {
        testScript: { isSimple: boolean };
        testData: { useDataDriven: boolean; maxGeneration: number };
        buttonDefinitions: {
          tagname: string;
          attribute?: { name: string; value: string };
        }[];
      };
    }
  ) {
    const result = await new GenerateTestScriptsAction(
      context.rootState.repositoryService,
      payload.option
    ).generateFromProject(
      context.state.projectId,
      context.rootState.projectSettings.config.screenDefinition
    );

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    return result.data;
  },
  /**
   * Import Data.
   * @param context Action context.
   * @param payload.source.testResultFileUrl Source import file url.
   * @param payload.option.selectedOptionProject Whether to import project management data.
   * @param payload.option.selectedOptionTestresult Whether to import project test result data.
   * @returns id ,name
   */
  async importData(
    context,
    payload: {
      source: { projectFile: { data: string; name: string } };
      option: {
        selectedOptionProject: boolean;
        selectedOptionTestresult: boolean;
      };
    }
  ) {
    const selectOption = {
      includeProject: payload.option.selectedOptionProject,
      includeTestResults: payload.option.selectedOptionTestresult,
    };

    const result = await new ImportProjectAction(
      context.rootState.repositoryService
    ).import(payload.source, selectOption);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    return result.data;
  },

  /**
   * Create export data.
   * @param context Action context.
   * @param payload option
   * @returns URL
   */
  async exportData(
    context,
    payload: {
      option: {
        selectedOptionProject: boolean;
        selectedOptionTestresult: boolean;
      };
    }
  ) {
    const exportProjectId = context.state.projectId;
    const selectOption = {
      includeProject: payload.option.selectedOptionProject,
      includeTestResults: payload.option.selectedOptionTestresult,
    };

    const result = await new ExportProjectAction(
      context.rootState.repositoryService
    ).export(exportProjectId, selectOption);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    return result.data;
  },
};

export default actions;
