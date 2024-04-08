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

import { WriteSnapshotAction } from "@/lib/testManagement/actions/WriteSnapshotAction";
import type {
  AttachedFile,
  Group,
  Plan,
  Session,
  Story,
  TestMatrix,
  TestResultFile,
  TestTarget
} from "@/lib/testManagement/types";
import { defineStore } from "pinia";
import { useRootStore } from "./root";
import type { TestResultSummary } from "@/lib/operationHistory/types";
import { GetTestResultListAction } from "@/lib/operationHistory/actions/testResult/GetTestResultListAction";
import { AddNewTestMatrixAction } from "@/lib/testManagement/actions/AddNewTestMatrixAction";
import { UpdateTestMatrixAction } from "@/lib/testManagement/actions/UpdateTestMatrixAction";
import { DeleteTestMatrixAction } from "@/lib/testManagement/actions/DeleteTestMatrixAction";
import { AddNewGroupAction } from "@/lib/testManagement/actions/AddNewGroupAction";
import { UpdateGroupAction } from "@/lib/testManagement/actions/UpdateGroupAction";
import { DeleteGroupAction } from "@/lib/testManagement/actions/DeleteGroupAction";
import { AddNewTestTargetAction } from "@/lib/testManagement/actions/AddNewTestTargetAction";
import { UpdateTestTargetsAction } from "@/lib/testManagement/actions/UpdateTestTargetsAction";
import { DeleteTestTargetAction } from "@/lib/testManagement/actions/DeleteTestTargetAction";
import { AddNewSessionAction } from "@/lib/testManagement/actions/AddNewSessionAction";
import { UpdateSessionAction } from "@/lib/testManagement/actions/UpdateSessionAction";
import { DeleteSessionAction } from "@/lib/testManagement/actions/DeleteSessionAction";
import { UpdateStoryAction } from "@/lib/testManagement/actions/UpdateStoryAction";
import { ReadStoryDataAction } from "@/lib/testManagement/actions/ReadStoryDataAction";
import type { Timestamp } from "@/lib/common/Timestamp";
import { GenerateTestScriptsAction } from "@/lib/operationHistory/actions/GenerateTestScriptsAction";
import { ImportProjectAction } from "@/lib/testManagement/actions/ImportProjectAction";
import { ExportProjectAction } from "@/lib/testManagement/actions/ExportProjectAction";

/**
 * State for test management.
 */
export type TestManagementState = {
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
};

export const useTestManagementStore = defineStore("testManagement", {
  state: (): TestManagementState => ({
    projectId: "",
    testMatrices: Array<TestMatrix>(),
    stories: Array<Story>(),
    tempStory: null,
    recentStories: [],
    recentReviewQuery: null,
    testMatrixFilter: { search: "", isCompletionFilterEnabled: false }
  }),
  getters: {
    /**
     * Get test matrices from the State.
     * @param state State.
     * @returns Test matrices.
     */
    getTestMatrices: (state) => (): TestMatrix[] => {
      return JSON.parse(JSON.stringify(state.testMatrices));
    },

    /**
     * Get stories from the State.
     * @param state State.
     * @returns Stories.
     */
    getStories: (state) => (): Story[] => {
      return JSON.parse(JSON.stringify(state.stories));
    },

    /**
     * Collect reviewable sessions from a story.
     * @param state State.
     * @returns Session.
     */
    collectReviewableSessions(): (storyId: string) => Session[] {
      return (storyId: string) => {
        const story: Story | undefined = this.findStory(storyId);

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
      };
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
    findStory(): (storyId: string) => Story | undefined {
      return (storyId: string) => {
        const found = this.stories.find((chater: Story) => {
          return chater.id === storyId;
        });
        return found === undefined ? undefined : JSON.parse(JSON.stringify(found));
      };
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
      (testTargetId: string, viewPointId: string, testMatrixId: string): Story => {
        const found = state.stories.find((story: Story) => {
          return (
            story.testMatrixId === testMatrixId &&
            story.testTargetId === testTargetId &&
            story.viewPointId === viewPointId
          );
        });
        return found === undefined ? undefined : JSON.parse(JSON.stringify(found));
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
    }
  },
  actions: {
    selectStories(query?: {
      testMatrixId?: string;
      groupId?: string;
      testTargetId?: string;
    }): (Story & {
      viewPointName: string;
      testTargetName: string;
      testMatrixName: string;
      groupName: string;
    })[] {
      const testMatrices = this.testMatrices.filter((testMatrix) => {
        return !query?.testMatrixId || query.testMatrixId === testMatrix.id;
      });

      const testTargets = testMatrices.flatMap((testMatrix) => {
        return testMatrix.groups
          .filter((group) => !query?.groupId || query.groupId === group.id)
          .flatMap((group) => {
            return group.testTargets
              .filter(
                (testTarget) =>
                  !query?.testTargetId || query.testTargetId === `${group.id}_${testTarget.id}`
              )
              .map((testTarget) => {
                return {
                  ...testTarget,
                  testMatrixId: testMatrix.id,
                  testMatrixName: testMatrix.name,
                  groupName: group.name,
                  viewPoints: testTarget.plans.map(({ viewPointId }) => {
                    return {
                      id: viewPointId,
                      name: testMatrix.viewPoints.find(({ id }) => id === viewPointId)?.name ?? ""
                    };
                  })
                };
              });
          });
      });

      return testTargets.flatMap((testTarget) => {
        const stories = testTarget.viewPoints
          .map((viewPoint) => {
            const story = this.findStoryByTestTargetAndViewPointId(
              testTarget.id,
              viewPoint.id,
              testTarget.testMatrixId
            );

            return {
              ...story,
              viewPointName: viewPoint.name,
              testTargetName: testTarget.name,
              testMatrixName: testTarget.testMatrixName,
              groupName: testTarget.groupName
            };
          })
          .filter((story) => story?.sessions);

        return stories;
      });
    },

    /**
     * Set project id to the State.
     * @param state State.
     * @param payload.projectId Project id.
     */
    setProjectId(payload: { projectId: string }) {
      this.projectId = payload.projectId;
    },

    /**
     * Set a test management data to the State.
     * @param state State.
     * @param payload.stories Stories.
     * @param payload.testMatrices Test matrices.
     */
    setManagedData(payload: { stories?: Story[]; testMatrices: TestMatrix[] }) {
      if (payload.stories) {
        this.stories = payload.stories;
      }
      this.testMatrices = payload.testMatrices;
    },

    /**
     * Add a story to the State.
     * @param state State.
     * @param payload.data Story.
     */
    addStory(payload: { data: Story }) {
      this.stories.push(payload.data);
    },

    /**
     * Replace the specified index story in the State.
     * @param state State.
     * @param payload.data New story.
     */
    setStory(payload: { data: Story }) {
      this.stories = this.stories.map((story) => {
        return story.id === payload.data.id ? payload.data : story;
      });
    },

    /**
     * Add a session to the State.
     * @param state State.
     * @param payload.storyId Story id.
     * @param payload.session New Session.
     */
    addSession(payload: { storyId: string; session: Session }) {
      this.stories = this.stories.map((story) => {
        return story.id !== payload.storyId
          ? story
          : {
              ...story,
              sessions: [...story.sessions, payload.session]
            };
      });
    },

    /**
     * Replace the session in the State.
     * @param state State.
     * @param payload.storyId Story id.
     * @param payload.session New session.
     */
    setSession(payload: { storyId: string; session: Session }) {
      this.stories = this.stories.map((story) => {
        if (story.id !== payload.storyId) {
          return story;
        }
        return {
          ...story,
          sessions: story.sessions.map((session) => {
            return session.id === payload.session.id ? payload.session : session;
          })
        };
      });
    },

    /**
     * Replace the story in the State being edited.
     * @param state State.
     * @param payload.story New story.
     */
    setTempStory(payload: { story: Story }) {
      this.tempStory = JSON.parse(JSON.stringify(payload.story));
    },

    /**
     * Empty the story in the State being edited.
     * @param state State.
     */
    clearTempStory() {
      this.tempStory = null;
    },

    /**
     * Add a test matrix to the State.
     * @param state State.
     * @param payload.testMatrix New test matrix.
     */
    addTestMatrix(payload: { testMatrix: TestMatrix }) {
      this.testMatrices = [...this.testMatrices, payload.testMatrix];
    },

    /**
     * Replace the specified test matrix in the State.
     * @param state State.
     * @param payload.testMatrices Test matrices to update.
     */
    updateTestMatrices(payload: { testMatrices: TestMatrix[] }) {
      this.testMatrices = [
        ...this.testMatrices.filter((testMatrix) => {
          return !payload.testMatrices.find((newTestMatrix) => newTestMatrix.id === testMatrix.id);
        }),
        ...payload.testMatrices
      ].sort((t1, t2) => {
        return t1.index - t2.index;
      });
    },

    /**
     * Add a group to the State.
     * @param state State
     * @param payload New group.
     */
    addGroup(payload: { testMatrixId: string; group: Group }) {
      this.testMatrices = this.testMatrices.map((testMatrix) => {
        if (testMatrix.id !== payload.testMatrixId) {
          return testMatrix;
        }
        return {
          ...testMatrix,
          groups: [...testMatrix.groups, payload.group]
        };
      });
    },

    /**
     * Replace the specified group in the State.
     * @param state State.
     * @param payload Group to update.
     */
    updateGroups(payload: { testMatrixId: string; groups: Group[] }) {
      this.testMatrices = this.testMatrices.map((testMatrix) => {
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
            ...payload.groups
          ].sort((g1, g2) => {
            return g1.index - g2.index;
          })
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
    addTestTarget(payload: { testMatrixId: string; groupId: string; testTarget: TestTarget }) {
      this.testMatrices = this.testMatrices.map((testMatrix) => {
        if (testMatrix.id !== payload.testMatrixId) {
          return testMatrix;
        }
        testMatrix.groups = testMatrix.groups.map((group) => {
          if (group.id !== payload.groupId) {
            return group;
          }
          return {
            ...group,
            testTargets: [...group.testTargets, payload.testTarget]
          };
        });
        return testMatrix;
      });
    },

    /**
     * Add story as recent story.
     * @param state State.
     * @param payload.story Story.
     */
    addRecentStory(payload: { story: Story }) {
      this.recentStories = [
        payload.story,
        ...this.recentStories.filter(({ id }) => id !== payload.story.id)
      ].filter((_, index) => index < 5);
    },

    /**
     * Set recent review query.
     * @param state State.
     * @param payload.query Query.
     */
    setRecentReviewQuery(payload: {
      query: { sessionIds: string[]; testResultIds: string[] } | null;
    }) {
      this.recentReviewQuery = payload.query;
    },

    /**
     * Set test matrix filter.
     * @param state State.
     * @param payload.search Tester name filter text.
     * @param payload.isCompletionFilterEnabled Flag to filter only stories with incompletes.
     */
    setTestMatrixFilter(payload: { search: string; isCompletionFilterEnabled: boolean }) {
      this.testMatrixFilter = payload;
    },

    /**
     * Load test management data and initialize.
     * @param context Action context.
     */
    async initialize() {
      const rootStore = useRootStore();
      const project = await rootStore.dataLoader?.loadProject();

      if (!project) {
        throw new Error();
      }

      this.setProjectId({ projectId: project.projectId });
      this.setManagedData({ stories: project.stories, testMatrices: project.testMatrices });
    },

    /**
     * Output a snapshot.
     * @param context Action context.
     * @returns URL of the output snapshot.
     */
    async writeSnapshot(): Promise<string> {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new WriteSnapshotAction(rootStore.repositoryService).writeSnapshot(
        this.projectId,
        {
          locale: rootStore.i18nProvider?.getLocale() ?? "ja"
        }
      );

      if (result.isFailure()) {
        throw new Error(rootStore.message(result.error.messageKey, result.error.variables ?? {}));
      }

      return result.data.url;
    },

    /**
     * Get test results from the repository.
     * @param context Action context.
     * @returns Test results.
     */
    async getTestResults(): Promise<TestResultSummary[]> {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new GetTestResultListAction(
        rootStore.repositoryService
      ).getTestResults();

      if (result.isFailure()) {
        throw new Error(rootStore.message(result.error.messageKey, result.error.variables ?? {}));
      }

      return result.data;
    },

    /**
     * Load project and update the State.
     * @param context Action context.
     */
    async readProject() {
      const rootStore = useRootStore();
      const project = await rootStore.dataLoader?.loadProject();

      if (!project) {
        throw new Error();
      }

      this.setProjectId({ projectId: project.projectId });
      this.setManagedData({ stories: project.stories, testMatrices: project.testMatrices });
    },

    /**
     * Create a test matrix and its associated view point.
     * @param context Action context.
     * @param payload.name The name of the test matrix to create.
     * @param payload.name View point to create.
     */
    async addNewTestMatrix(payload: {
      name: string;
      viewPoints: Array<{
        name: string;
        index: number;
        description: string;
      }>;
    }): Promise<void> {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new AddNewTestMatrixAction().addTestMatrix(
        {
          projectId: this.projectId,
          testMatrixName: payload.name,
          viewPoints: payload.viewPoints
        },
        rootStore.repositoryService
      );

      if (result.isFailure()) {
        throw result.error;
      }

      this.addTestMatrix({ testMatrix: result.data });
    },

    /**
     * Update test matrix.
     * @param context Action context.
     * @param payload.id Test matrix ID to be updated.
     * @param payload.id Test matrix name.
     * @param payload.viewPoints View points to update.
     * @returns
     */
    async updateTestMatrix(payload: {
      id: string;
      name: string;
      viewPoints: Array<{
        name: string;
        description: string;
        index: number;
        id: string | null;
      }>;
    }): Promise<void> {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const oldTestMatrix = this.testMatrices.find((testMatrix) => payload.id === testMatrix.id);
      if (!oldTestMatrix) {
        throw new Error();
      }

      const result = await new UpdateTestMatrixAction().updateTestMatrix(
        {
          projectId: this.projectId,
          newTestMatrix: {
            id: payload.id,
            name: payload.name
          },
          newViewPoints: payload.viewPoints,
          oldTestMatrix
        },
        rootStore.repositoryService
      );

      if (result.isFailure()) {
        throw result.error;
      }

      this.updateTestMatrices({ testMatrices: result.data });
    },

    /**
     * Delete test matrix.
     * @param context Action context.
     * @param payload.testMatrixId ID of test matrix to delete.
     */
    async deleteTestMatrix(payload: { testMatrixId: string }): Promise<void> {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      await new DeleteTestMatrixAction().deleteTestMatrix(
        {
          projectId: this.projectId,
          testMatrixId: payload.testMatrixId
        },
        rootStore.repositoryService
      );
      await this.readProject();
    },

    /**
     * Create a group.
     * @param context Action context.
     * @param payload.testMatrixId ID of the test matrix that has the group to create.
     * @param payload.groupName Name of group to create.
     */
    async addNewGroup(payload: { testMatrixId: string; groupName: string }): Promise<void> {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new AddNewGroupAction().addNewGroup(
        {
          testMatrixId: payload.testMatrixId,
          name: payload.groupName
        },
        rootStore.repositoryService
      );

      if (result.isFailure()) {
        throw result.error;
      }

      this.addGroup({
        testMatrixId: payload.testMatrixId,
        group: result.data
      });
    },

    /**
     * Update group.
     * @param context Action context.
     * @param payload.testMatrixId ID of the test matrix that has the group to update.
     * @param payload.groupId ID of group to update.
     * @param payload.name Group name.
     */
    async updateGroup(payload: {
      testMatrixId: string;
      groupId: string;
      name: string;
    }): Promise<void> {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new UpdateGroupAction().updateGroup(
        {
          testMatrixId: payload.testMatrixId,
          groupId: payload.groupId,
          name: payload.name
        },
        rootStore.repositoryService
      );

      if (result.isFailure()) {
        throw result.error;
      }

      this.updateTestMatrices({ testMatrices: [result.data] });
    },

    /**
     * Delete group.
     * @param context Action context.
     * @param payload.testMatrixId ID of the test matrix that has the test target to delete.
     * @param payload.groupId ID of group to delete.
     */
    async deleteGroup(payload: { testMatrixId: string; groupId: string }): Promise<void> {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new DeleteGroupAction().deleteGroup(
        {
          testMatrixId: payload.testMatrixId,
          groupId: payload.groupId
        },
        rootStore.repositoryService
      );

      if (result.isFailure()) {
        throw result.error;
      }

      this.updateTestMatrices({ testMatrices: [result.data] });
    },

    /**
     * Create a test target.
     * @param context Action context.
     * @param payload.testMatrixId ID of the test matrix that has the test target to create.
     * @param payload.groupId ID of the group that has the test target to create.
     * @param payload.testTargetName Test target name.
     */
    async addNewTestTarget(payload: {
      testMatrixId: string;
      groupId: string;
      testTargetName: string;
    }): Promise<void> {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new AddNewTestTargetAction().addNewTestTarget(
        { ...payload, projectId: this.projectId },
        rootStore.repositoryService
      );

      if (result.isFailure()) {
        throw result.error;
      }

      this.addTestTarget({
        testMatrixId: payload.testMatrixId,
        groupId: payload.groupId,
        testTarget: result.data
      });
    },

    /**
     * Update test targets.
     * @param context Action context.
     * @param payload.testMatrixId ID of the test matrix that has the test target to update.
     * @param payload.groupId ID of the group that has the test target to update.
     * @param payload.testTargets Test targets to update.
     */
    async updateTestTargets(payload: {
      testMatrixId: string;
      groupId: string;
      testTargets: {
        id: string;
        index?: number;
        name?: string;
        plans?: Plan[];
      }[];
    }): Promise<void> {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new UpdateTestTargetsAction().updateTestTargets(
        { ...payload, projectId: this.projectId },
        rootStore.repositoryService
      );

      if (result.isFailure()) {
        throw result.error;
      }

      this.updateGroups({
        testMatrixId: payload.testMatrixId,
        groups: [result.data]
      });
    },

    /**
     * Delete test target.
     * @param context Action context.
     * @param payload.testMatrixId ID of the test matrix that has the test target to delete.
     * @param payload.groupId ID of the group that has the test target to delete.
     * @param payload.testTargetId ID of test target to delete.
     */
    async deleteTestTarget(payload: {
      testMatrixId: string;
      groupId: string;
      testTargetId: string;
    }): Promise<void> {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new DeleteTestTargetAction().deleteTestTarget(
        { ...payload, projectId: this.projectId },
        rootStore.repositoryService
      );

      if (result.isFailure()) {
        throw result.error;
      }

      this.updateGroups({
        testMatrixId: payload.testMatrixId,
        groups: [result.data]
      });
    },

    async addNewSession(payload: { storyId: string }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new AddNewSessionAction().addNewSession(
        {
          projectId: this.projectId,
          storyId: payload.storyId
        },
        rootStore.repositoryService
      );

      if (result.isFailure()) {
        throw result.error;
      }

      this.addSession({
        storyId: payload.storyId,
        session: result.data
      });
    },

    /**
     * Save a session.
     * @param context Action context.
     * @param payload.session Session.
     */
    async updateSession(payload: {
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
    }): Promise<void> {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const story = this.stories.find((story) => {
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

      const result = await new UpdateSessionAction(rootStore.repositoryService).updateSession(
        this.projectId,
        payload.sessionId,
        payload.params
      );

      if (result.isFailure()) {
        throw new Error(rootStore.message(result.error.messageKey, result.error.variables ?? {}));
      }

      this.setSession({
        storyId: payload.storyId,
        session: result.data
      });
    },

    async deleteSession(payload: { storyId: string; sessionId: string }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new DeleteSessionAction().deleteSession(
        {
          projectId: this.projectId,
          sessionId: payload.sessionId
        },
        rootStore.repositoryService
      );

      if (result.isFailure()) {
        throw new Error(rootStore.message(result.error.messageKey, result.error.variables ?? {}));
      }

      this.stories = this.stories.map((story) => {
        if (story.id !== payload.storyId) {
          return story;
        }
        return {
          ...story,
          sessions: story.sessions.filter((session) => session.id !== payload.sessionId)
        };
      });
    },

    async updateStory(payload: {
      storyId: string;
      params: {
        status?: string;
      };
    }): Promise<void> {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new UpdateStoryAction().updateStory(
        {
          id: payload.storyId,
          status: payload.params.status
        },
        rootStore.repositoryService
      );

      if (result.isFailure()) {
        throw result.error;
      }

      this.setStory({
        data: result.data
      });
    },

    async readStory(payload: { storyId: string }): Promise<void> {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new ReadStoryDataAction(rootStore.repositoryService).readStory({
        id: payload.storyId
      });

      if (result.isFailure()) {
        throw result.error;
      }

      this.setStory({
        data: result.data
      });
    },

    async collectProgressDatas(
      payload: {
        period?: { since: Timestamp; until: Timestamp };
      } = {}
    ) {
      const rootStore = useRootStore();

      const progressDatas = await rootStore.dataLoader?.loadProgressDatas(this.projectId, payload);

      if (!progressDatas) {
        throw new Error();
      }

      return progressDatas;
    },

    /**
     * Cancel the saving of test management data.
     * @param context Action context.
     */
    cancelWritingDataFile() {
      // TODO: not implemented
    },

    /**
     * Whether test management data in the State equals to specified data or not.
     * @param context Action context.
     * @param payload.testMatrices Test matrices.
     * @param stories Stories.
     * @returns 'true': Equal, 'false': Not equal.
     */
    managedDataEqualsTo(payload: { testMatrices: TestMatrix[]; stories: Story[] }) {
      const a = JSON.stringify(payload);
      const b = JSON.stringify({
        testMatrices: this.testMatrices,
        stories: this.stories
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
    async generateAllSessionTestScripts(payload: {
      option: {
        testScript: { isSimple: boolean; useMultiLocator: boolean };
        testData: { useDataDriven: boolean; maxGeneration: number };
        buttonDefinitions: {
          tagname: string;
          attribute?: { name: string; value: string };
        }[];
      };
    }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new GenerateTestScriptsAction(
        rootStore.repositoryService,
        payload.option
      ).generateFromProject(this.projectId, rootStore.projectSettings.config.screenDefinition);

      if (result.isFailure()) {
        throw new Error(rootStore.message(result.error.messageKey, result.error.variables ?? {}));
      }

      return result.data;
    },
    /**
     * Import Data.
     * @param context Action context.
     * @param payload.source.testResultFileUrl Source import file url.
     * @param payload.option.selectedOptionProject Whether to import project management data.
     * @param payload.option.selectedOptionTestresult Whether to import project test result data.
     * @param payload.option.selectedOptionConfig Whether to import project config data.
     * @returns id ,name
     */
    async importData(payload: {
      source: { projectFile: { data: string; name: string } };
      option: {
        selectedOptionProject: boolean;
        selectedOptionTestresult: boolean;
        selectedOptionConfig: boolean;
      };
    }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const selectOption = {
        includeProject: payload.option.selectedOptionProject,
        includeTestResults: payload.option.selectedOptionTestresult,
        includeConfig: payload.option.selectedOptionConfig
      };

      const result = await new ImportProjectAction(rootStore.repositoryService).import(
        payload.source,
        selectOption
      );

      if (result.isFailure()) {
        throw new Error(rootStore.message(result.error.messageKey, result.error.variables ?? {}));
      }

      return result.data;
    },

    /**
     * Create export data.
     * @param context Action context.
     * @param payload option
     * @returns URL
     */
    async exportData(payload: {
      option: {
        selectedOptionProject: boolean;
        selectedOptionTestresult: boolean;
        selectedOptionConfig: boolean;
      };
    }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const exportProjectId = this.projectId;
      const selectOption = {
        includeProject: payload.option.selectedOptionProject,
        includeTestResults: payload.option.selectedOptionTestresult,
        includeConfig: payload.option.selectedOptionConfig
      };

      const result = await new ExportProjectAction(rootStore.repositoryService).export(
        exportProjectId,
        selectOption
      );

      if (result.isFailure()) {
        throw new Error(rootStore.message(result.error.messageKey, result.error.variables ?? {}));
      }

      return result.data;
    },

    async updateNotes(payload: {
      testResultId: string;
      noteId: string;
      value: string;
      details?: string;
      tags: string[];
    }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const testResult = rootStore.repositoryService.createTestResultAccessor(payload.testResultId);

      const result = await testResult.editNote(payload.noteId, {
        value: payload.value,
        details: payload.details ?? "",
        tags: payload.tags
      });
      if (result.isFailure()) {
        const messageKey = `error.operation_history.${result.error.errorCode}`;
        throw new Error(rootStore.message(messageKey));
      }
    }
  }
});
