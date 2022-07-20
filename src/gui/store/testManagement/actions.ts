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
  Issue,
  Plan,
} from "@/lib/testManagement/types";
import StoryDataConverter from "@/lib/testManagement/StoryDataConverter";
import { ManagedSession } from "@/lib/testManagement/TestManagementData";
import TestManagementBuilder from "@/lib/testManagement/TestManagementBuilder";
import { UpdateTestMatrixAction } from "@/lib/testManagement/actions/UpdateTestMatrixAction";
import { CHARTER_STATUS } from "@/lib/testManagement/Enum";
import { WriteDataFileAction } from "@/lib/testManagement/actions/WriteDataFileAction";
import { ReadProjectDataAction } from "@/lib/testManagement/actions/ReadProjectDataAction";
import { ExportAction } from "@/lib/testManagement/actions/ExportAction";
import { ImportAction } from "@/lib/testManagement/actions/ImportAction";
import { TimestampImpl, Timestamp } from "@/lib/common/Timestamp";
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
import { CollectProgressDatasAction } from "@/lib/testManagement/actions/CollectProgressDatasAction";
import { ProjectFileRepository } from "@/lib/eventDispatcher/repositoryService/ProjectFileRepository";

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

    await context.dispatch("readDataFile");
  },

  /**
   * Output a snapshot.
   * @param context Action context.
   * @returns URL of the output snapshot.
   */
  async writeSnapshot(context): Promise<string> {
    const result = await new WriteSnapshotAction(
      context.rootState.repositoryContainer
    ).writeSnapshot(context.state.projectId);

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
  async getTestResults(context): Promise<
    {
      name: string;
      id: string;
    }[]
  > {
    const result = await new GetTestResultListAction(
      context.rootState.repositoryContainer
    ).getTestResults();

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    console.log(result.data);

    return result.data;
  },

  /**
   * Load test management data and update the State.
   * @param context Action context.
   */
  async readDataFile(context) {
    if (Vue.prototype.$snapshot) {
      return;
    }
    await new ReadProjectDataAction(
      {
        setProjectId: (data: { projectId: string }): void => {
          context.commit("setProjectId", {
            projectId: data.projectId,
          });
        },
        setManagedData: (data: { testMatrices: TestMatrix[] }): void => {
          context.commit("setManagedData", {
            testMatrices: data.testMatrices,
          });
        },
        setStoriesData: (data: { stories: Story[] }): void => {
          context.commit("setStoriesData", { stories: data.stories });
        },
      },
      new StoryDataConverter(),
      context.rootState.repositoryContainer
    ).read();
  },

  /**
   * Save test management data in the repository and set the saved data in the State.
   * @param context Action context.
   * @param payload.testManagementData Test management data.
   */
  async writeDataFile(
    context,
    payload: {
      testMatrices: TestMatrix[];
      stories: Story[];
    }
  ): Promise<void> {
    const builder = new TestManagementBuilder();
    builder.testMatrices = payload.testMatrices;
    builder.stories = payload.stories;
    const testManagementData = builder.build();

    await new WriteDataFileAction(
      {
        setManagedData: (data: { testMatrices: TestMatrix[] }): void => {
          context.commit("setManagedData", {
            testMatrices: data.testMatrices,
          });
        },
        setStoriesData: (data: { stories: Story[] }): void => {
          context.commit("setStoriesData", { stories: data.stories });
        },
      },
      new StoryDataConverter(),
      context.rootState.repositoryContainer
    ).write(context.state.projectId, testManagementData, context.state.stories);
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
      context.rootState.repositoryContainer
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
      context.rootState.repositoryContainer
    );

    if (result.isFailure()) {
      throw result.error;
    }

    context.commit("updateTestMatrices", result.data);

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
      context.rootState.repositoryContainer
    );
    await context.dispatch("readDataFile");
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
      context.rootState.repositoryContainer
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
      context.rootState.repositoryContainer
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
      context.rootState.repositoryContainer
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
      payload,
      context.rootState.repositoryContainer
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
      payload,
      context.rootState.repositoryContainer
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
      payload,
      context.rootState.repositoryContainer
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
   * Save test management data.
   * @param context Action context.
   * @param payload.testMatrices Test matrices.
   * @param payload.stories Stories.
   */
  async saveManagedData(
    context,
    payload: { testMatrices: TestMatrix[]; stories: Story[] }
  ): Promise<void> {
    return context.dispatch("writeDataFile", {
      testMatrices: payload.testMatrices,
      stories: payload.stories,
    });
  },

  async addNewSession(
    context,
    payload: {
      storyId: string;
    }
  ) {
    const story = context.state.stories.find((story) => {
      return story.id === payload.storyId;
    });

    if (!story) {
      return;
    }

    const newStory: Story = {
      ...story,
      sessions: [
        ...story.sessions,
        {
          name: "",
          id: "",
          isDone: false,
          doneDate: "",
          testItem: "",
          testerName: "",
          memo: "",
          attachedFiles: [],
          testResultFiles: [],
          initialUrl: "",
          intentions: [],
          issues: [],
          testingTime: 0,
        },
      ],
    };

    await context.dispatch("saveStory", { story: newStory });
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
        issues?: Issue[];
        testingTime?: number;
      };
    }
  ): Promise<void> {
    const storyIndex = context.state.stories.findIndex((story) => {
      return story.id === payload.storyId;
    });

    if (storyIndex === -1) {
      return;
    }

    const story = context.state.stories[storyIndex];

    const sessionIndex = story.sessions.findIndex((session) => {
      return session.id === payload.sessionId;
    });

    if (sessionIndex === -1) {
      return;
    }

    const newSession: Partial<ManagedSession> = {
      isDone: payload.params.isDone,
      doneDate: payload.params.isDone
        ? new TimestampImpl().format("YYYYMMDDHHmmss")
        : undefined,
      testItem: payload.params.testItem,
      testerName: payload.params.testerName,
      memo: payload.params.memo,
      attachedFiles: payload.params.attachedFiles,
      testResultFiles: payload.params.testResultFiles,
      issues: payload.params.issues?.map((issue) => {
        return {
          type: "",
          value: "",
          details: "",
          status: issue.status,
          ticketId: issue.ticketId,
          source: issue.source,
        };
      }),
      testingTime: payload.params.testingTime,
    };

    const result = await new UpdateSessionAction(
      context.rootState.repositoryContainer
    ).updateSession(context.state.projectId, payload.sessionId, newSession);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    const updatedSession = result.data;

    const parsedSession = await new StoryDataConverter().convertToSession(
      {
        name: updatedSession.name,
        id: updatedSession.id,
        isDone: updatedSession.isDone,
        doneDate: updatedSession.doneDate,
        testItem: updatedSession.testItem,
        testerName: updatedSession.testerName,
        memo: updatedSession.memo,
        attachedFiles: updatedSession.attachedFiles,
        testResultFiles: payload.params.testResultFiles
          ? updatedSession.testResultFiles
          : undefined,
        issues: updatedSession.issues.map((issue, index) => {
          const oldIssue = story.sessions[sessionIndex].issues[index];
          return {
            type: "",
            value: oldIssue.value,
            details: oldIssue.details,
            status: issue.status,
            ticketId: issue.ticketId,
            source: issue.source,
          };
        }),
        testingTime: updatedSession.testingTime,
      },
      context.rootState.repositoryContainer,
      story.sessions[sessionIndex]
    );

    context.commit("setSession", {
      storyIndex,
      sessionIndex,
      data: parsedSession,
    });

    await context.dispatch("saveStory", {
      story: context.state.stories[storyIndex],
    });
  },

  async deleteSession(
    context,
    payload: {
      storyId: string;
      sessionId: string;
    }
  ) {
    const story = context.state.stories.find((story) => {
      return story.id === payload.storyId;
    });

    if (!story) {
      return;
    }

    const newStory: Story = {
      ...story,
      sessions: story.sessions.filter((session) => {
        return session.id !== payload.sessionId;
      }),
    };

    await context.dispatch("saveStory", { story: newStory });
  },

  async addNewStory(context): Promise<void> {
    const newStory: Story = {
      id: "",
      testMatrixId: "",
      testTargetId: "",
      viewPointId: "",
      status: CHARTER_STATUS.OUT_OF_SCOPE.id,
      sessions: [],
    };

    const newStories = [...context.state.stories, newStory];

    return context.dispatch("writeDataFile", {
      testMatrices: context.state.testMatrices,
      stories: newStories,
    });
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
    const story = context.state.stories.find((story) => {
      return story.id === payload.storyId;
    });

    if (!story) {
      return;
    }

    const newStory: Story = {
      ...story,
      status: payload.params.status ?? story.status,
      sessions: story.sessions,
    };

    await context.dispatch("saveStory", { story: newStory });
  },

  /**
   * Save story.
   * @param context Action context.
   * @param payload.story Story.
   */
  async saveStory(
    context,
    payload: {
      story: Story;
    }
  ): Promise<void> {
    const updatedStories = ((story: Story) => {
      const tmpStories: Story[] = JSON.parse(
        JSON.stringify(context.state.stories)
      );

      const index = context.state.stories.findIndex((c) => {
        return c.id === story.id;
      });
      if (index !== -1) {
        tmpStories[index] = story;
      } else {
        tmpStories.push(story);
      }

      return tmpStories;
    })(JSON.parse(JSON.stringify(payload.story)));

    return context.dispatch("writeDataFile", {
      testMatrices: context.state.testMatrices,
      stories: updatedStories,
    });
  },

  async collectProgressDatas(
    context,
    payload: {
      period?: { since: Timestamp; until: Timestamp };
    } = {}
  ) {
    const repositoryContainer = Vue.prototype.$dailyTestProgresses
      ? {
          projectRepository: new ProjectFileRepository(
            Vue.prototype.$dailyTestProgresses
          ),
        }
      : context.rootState.repositoryContainer;

    const result = await new CollectProgressDatasAction(
      repositoryContainer
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
      };
    }
  ) {
    const result = await new GenerateTestScriptsAction(
      context.rootState.repositoryContainer,
      payload.option
    ).generateFromProject(context.state.projectId);

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
      source: { projectFileUrl: string };
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

    const result = await new ImportAction(
      context.rootState.repositoryContainer
    ).importZip(payload.source, selectOption);

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

    const result = await new ExportAction(
      context.rootState.repositoryContainer
    ).exportZip(exportProjectId, selectOption);

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
