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
  ProgressData,
  AttachedFile,
  TestResultFile,
  Issue,
  TestTarget,
  Plan,
} from "@/lib/testManagement/types";
import StoryDataConverter from "@/lib/testManagement/StoryDataConverter";
import {
  TestManagementData,
  ManagedSession,
} from "@/lib/testManagement/TestManagementData";
import TestManagementBuilder from "@/lib/testManagement/TestManagementBuilder";
import { UpdateTestMatrixAction } from "@/lib/testManagement/actions/UpdateTestMatrixAction";
import { CHARTER_STATUS } from "@/lib/testManagement/Enum";
import { WriteDataFileAction } from "@/lib/testManagement/actions/WriteDataFileAction";
import { CalculateProgressDatasAction } from "@/lib/testManagement/actions/CalculateProgressDatasAction";
import { ReadProjectDataAction } from "@/lib/testManagement/actions/ReadProjectDataAction";
import { ExportAction } from "@/lib/testManagement/actions/ExportAction";
import { ImportAction } from "@/lib/testManagement/actions/ImportAction";
import { TimestampImpl, Timestamp } from "@/lib/common/Timestamp";
import { GetTestResultListAction } from "@/lib/operationHistory/actions/testResult/GetTestResultListAction";
import { UpdateSessionAction } from "@/lib/testManagement/actions/UpdateSessionAction";
import { WriteSnapshotAction } from "@/lib/testManagement/actions/WriteSnapshotAction";
import { GenerateTestScriptsAction } from "@/lib/operationHistory/actions/GenerateTestScriptsAction";

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
      progressDatas: payload.snapshot.progressDatas,
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
        setProgressDatas: (data: { progressDatas: ProgressData[] }): void => {
          context.commit("setProgressDatas", {
            progressDatas: data.progressDatas,
          });
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
    payload: { testManagementData: TestManagementData }
  ): Promise<void> {
    await new WriteDataFileAction(
      {
        setManagedData: (data: {
          testMatrices: TestMatrix[];
          progressDatas: ProgressData[];
        }): void => {
          context.commit("setManagedData", {
            testMatrices: data.testMatrices,
            progressDatas: data.progressDatas,
          });
        },
        setStoriesData: (data: { stories: Story[] }): void => {
          context.commit("setStoriesData", { stories: data.stories });
        },
      },
      new StoryDataConverter(),
      context.rootState.repositoryContainer
    ).write(
      context.state.projectId,
      payload.testManagementData,
      context.state.stories
    );
  },

  addNewTestMatrix(
    context,
    payload: {
      name: string;
      viewPoints: Array<{
        name: string;
        id: string | null;
      }>;
    }
  ): Promise<void> {
    const newTestMatrices = [
      ...context.state.testMatrices,
      {
        groups: [],
        id: "",
        name: payload.name,
        viewPoints: payload.viewPoints,
      },
    ];

    return context.dispatch("saveManagedData", {
      testMatrices: newTestMatrices,
      stories: context.state.stories,
    });
  },

  async updateTestMatrix(
    context,
    payload: {
      id: string;
      name: string;
      viewPoints: Array<{
        name: string;
        id: string | null;
        index: number;
        description: string;
      }>;
    }
  ): Promise<void> {
    await new UpdateTestMatrixAction({
      saveManagedData: async (data: {
        stories: Story[];
        testMatrices: TestMatrix[];
      }): Promise<TestMatrix[]> => {
        await context.dispatch("saveManagedData", {
          testMatrices: data.testMatrices,
          stories: data.stories,
        });
        return context.state.testMatrices;
      },
      addNewStory: async (): Promise<void> => {
        await context.dispatch("addNewStory");
      },
    }).updateTestMatrix(
      context.state.testMatrices,
      context.state.stories,
      payload
    );
    return;
  },

  async deleteTestMatrix(
    context,
    payload: { testMatrixId: string }
  ): Promise<void> {
    const newStory = context.state.stories.filter((story) => {
      return story.id.split("_")[0] !== payload.testMatrixId;
    });

    const newTestMatrices = context.state.testMatrices.filter((testMatrix) => {
      return testMatrix.id !== payload.testMatrixId;
    });

    return context.dispatch("saveManagedData", {
      testMatrices: newTestMatrices,
      stories: newStory,
    });
  },

  async addNewGroup(
    context,
    payload: {
      testMatrixId: string;
    }
  ): Promise<void> {
    const newTestMatrices = context.state.testMatrices.map((testMatrix) => {
      if (testMatrix.id !== payload.testMatrixId) {
        return testMatrix;
      }

      return {
        id: testMatrix.id,
        name: testMatrix.name,
        groups: [
          ...testMatrix.groups,
          {
            id: "",
            name: context.rootGetters.message("group-edit-list.name"),
            testTargets: [],
          },
        ],
        viewPoints: testMatrix.viewPoints,
      };
    });
    console.log(newTestMatrices);

    return await context.dispatch("saveManagedData", {
      testMatrices: newTestMatrices,
      stories: context.state.stories,
    });
  },

  updateGroup(
    context,
    payload: {
      testMatrixId: string;
      groupId: string;
      params: {
        name?: string;
        testTargets?: TestTarget[];
      };
    }
  ): Promise<void> {
    const newTestMatrices = context.state.testMatrices.map((testMatrix) => {
      if (testMatrix.id !== payload.testMatrixId) {
        return testMatrix;
      }

      return {
        id: testMatrix.id,
        name: testMatrix.name,
        groups: testMatrix.groups.map((group) => {
          if (group.id !== payload.groupId) {
            return group;
          }

          return {
            id: group.id,
            name: payload.params.name ?? group.name,
            testTargets: payload.params.testTargets ?? group.testTargets,
          };
        }),
        viewPoints: testMatrix.viewPoints,
      };
    });

    return context.dispatch("saveManagedData", {
      testMatrices: newTestMatrices,
      stories: context.state.stories,
    });
  },

  deleteGroup(
    context,
    payload: { testMatrixId: string; groupId: string }
  ): Promise<void> {
    const newStories = context.state.stories.filter((story) => {
      return story.id.split("_")[2] !== payload.groupId;
    });

    const newTestMatrices = context.state.testMatrices.map((testMatrix) => {
      if (testMatrix.id !== payload.testMatrixId) {
        return testMatrix;
      }

      return {
        id: testMatrix.id,
        name: testMatrix.name,
        groups: testMatrix.groups.filter((group) => {
          return group.id !== payload.groupId;
        }),
        viewPoints: testMatrix.viewPoints,
      };
    });

    return context.dispatch("saveManagedData", {
      testMatrices: newTestMatrices,
      stories: newStories,
    });
  },

  async addNewTestTarget(
    context,
    payload: {
      testMatrixId: string;
      groupId: string;
      testTargetName: string;
    }
  ): Promise<void> {
    const newTestMatrices = context.state.testMatrices.map((testMatrix) => {
      if (testMatrix.id !== payload.testMatrixId) {
        return testMatrix;
      }

      return {
        id: testMatrix.id,
        name: testMatrix.name,
        groups: testMatrix.groups.map((group) => {
          if (group.id !== payload.groupId) {
            return group;
          }

          return {
            id: group.id,
            name: group.name,
            testTargets: [
              ...group.testTargets,
              {
                id: "",
                name: payload.testTargetName,
                plans: testMatrix.viewPoints.map((viewPoint) => {
                  return {
                    viewPointId: viewPoint.id,
                    value: 0,
                  };
                }),
              },
            ],
          };
        }),
        viewPoints: testMatrix.viewPoints,
      };
    });

    await context.dispatch("saveManagedData", {
      testMatrices: newTestMatrices,
      stories: context.state.stories,
    });
  },

  updateTestTarget(
    context,
    payload: {
      testMatrixId: string;
      groupId: string;
      testTargetId: string;
      params: {
        name: string;
        plans: Plan[];
      };
    }
  ): Promise<void> {
    const newTestMatrices = context.state.testMatrices.map((testMatrix) => {
      if (testMatrix.id !== payload.testMatrixId) {
        return testMatrix;
      }

      return {
        id: testMatrix.id,
        name: testMatrix.name,
        groups: testMatrix.groups.map((group) => {
          if (group.id !== payload.groupId) {
            return group;
          }

          return {
            id: group.id,
            name: group.name,
            testTargets: group.testTargets.map((testTarget) => {
              if (testTarget.id !== payload.testTargetId) {
                return testTarget;
              }

              return {
                id: testTarget.id,
                name: payload.params.name ?? testTarget.name,
                plans: payload.params.plans ?? testTarget.plans,
              };
            }),
          };
        }),
        viewPoints: testMatrix.viewPoints,
      };
    });

    return context.dispatch("saveManagedData", {
      testMatrices: newTestMatrices,
      stories: context.state.stories,
    });
  },

  deleteTestTarget(
    context,
    payload: { testMatrixId: string; groupId: string; testTargetId: string }
  ): Promise<void> {
    const newTestMatrices = context.state.testMatrices.map((testMatrix) => {
      if (testMatrix.id !== payload.testMatrixId) {
        return testMatrix;
      }

      return {
        id: testMatrix.id,
        name: testMatrix.name,
        groups: testMatrix.groups.map((group) => {
          if (group.id !== payload.groupId) {
            return group;
          }

          return {
            id: group.id,
            name: group.name,
            testTargets: group.testTargets.filter((testTarget) => {
              return testTarget.id !== payload.testTargetId;
            }),
          };
        }),
        viewPoints: testMatrix.viewPoints,
      };
    });

    const newStories = context.state.stories.filter((story) => {
      return story.id.split("_")[3] !== payload.testTargetId;
    });

    return context.dispatch("saveManagedData", {
      testMatrices: newTestMatrices,
      stories: newStories,
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
    const builder = new TestManagementBuilder();
    builder.testMatrices = payload.testMatrices;
    builder.stories = payload.stories;
    builder.progressDatas = await context.dispatch("calculateProgressDatas", {
      testMatrices: payload.testMatrices,
      stories: payload.stories,
    });
    const testManagementData = builder.build();
    console.log(testManagementData);
    return await context.dispatch("writeDataFile", {
      testManagementData,
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

    const builder = new TestManagementBuilder();
    builder.testMatrices = context.state.testMatrices;
    builder.stories = newStories;
    builder.progressDatas = await context.dispatch("calculateProgressDatas", {
      testMatrices: context.state.testMatrices,
      stories: newStories,
    });
    const testManagementData = builder.build();

    return context.dispatch("writeDataFile", {
      testManagementData,
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

    const builder = new TestManagementBuilder();
    builder.testMatrices = context.state.testMatrices;
    builder.stories = updatedStories;
    builder.progressDatas = await context.dispatch("calculateProgressDatas", {
      testMatrices: context.state.testMatrices,
      stories: updatedStories,
    });
    const testManagementData = builder.build();

    return context.dispatch("writeDataFile", {
      testManagementData,
    });
  },

  /**
   * Calculate progress datas from test matrices and stories.
   * @param context Action context.
   * @param payload.testMatrices Test matrices.
   * @param payload.stories Stories.
   * @returns Calculated progress datas.
   */
  calculateProgressDatas(
    context,
    payload: {
      testMatrices: TestMatrix[];
      stories: Story[];
    }
  ) {
    const nowTimestamp: Timestamp = new TimestampImpl();

    return new CalculateProgressDatasAction().calculate(
      nowTimestamp,
      payload.testMatrices,
      payload.stories,
      context.state.progressDatas
    );
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
