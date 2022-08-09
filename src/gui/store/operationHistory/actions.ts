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

import { ActionTree } from "vuex";
import { OperationHistoryState } from ".";
import { RootState } from "..";
import Settings from "@/lib/common/settings/Settings";
import { NoteEditInfo } from "@/lib/captureControl/types";
import {
  WindowHandle,
  Edge,
  ScreenTransition,
  OperationWithNotes,
  ElementInfo,
} from "@/lib/operationHistory/types";
import SequenceDiagramGraphConverter, {
  SequenceDiagramGraphCallback,
} from "@/lib/operationHistory/graphConverter/SequenceDiagramGraphConverter";
import ScreenHistory from "@/lib/operationHistory/ScreenHistory";
import * as Coverage from "@/lib/operationHistory/Coverage";
import ScreenTransitionDiagramGraphConverter, {
  FlowChartGraphCallback,
} from "@/lib/operationHistory/graphConverter/ScreenTransitionDiagramGraphConverter";
import MermaidGraphConverter from "@/lib/operationHistory/graphConverter/MermaidGraphConverter";
import InputValueTable from "@/lib/operationHistory/InputValueTable";
import { CapturedOperation } from "@/lib/operationHistory/CapturedOperation";
import { ResumeAction } from "@/lib/operationHistory/actions/ResumeAction";
import { RecordIntentionAction } from "@/lib/operationHistory/actions/intention/RecordIntentionAction";
import { SaveIntentionAction } from "@/lib/operationHistory/actions/intention/SaveIntentionAction";
import { MoveIntentionAction } from "@/lib/operationHistory/actions/intention/MoveIntentionAction";
import { GenerateTestScriptsAction } from "@/lib/operationHistory/actions/GenerateTestScriptsAction";
import { Note } from "@/lib/operationHistory/Note";
import { ImportTestResultAction } from "@/lib/operationHistory/actions/testResult/ImportTestResultAction";
import { ExportTestResultAction } from "@/lib/operationHistory/actions/testResult/ExportTestResultAction";
import { DeleteTestResultAction } from "@/lib/operationHistory/actions/testResult/DeleteTestResultAction";
import { DeleteIntentionAction } from "@/lib/operationHistory/actions/intention/DeleteIntentionAction";
import { ReadSettingAction } from "@/lib/operationHistory/actions/setting/ReadSettingAction";
import { SaveSettingAction } from "@/lib/operationHistory/actions/setting/SaveSettingAction";
import { GetTestResultListAction } from "@/lib/operationHistory/actions/testResult/GetTestResultListAction";
import { CreateTestResultAction } from "@/lib/operationHistory/actions/testResult/CreateTestResultAction";
import { CompressNoteImageAction } from "@/lib/operationHistory/actions/image/CompressNoteImageAction";
import { CompressTestStepImageAction } from "@/lib/operationHistory/actions/image/CompressTestStepImageAction";
import { RegisterOperationAction } from "@/lib/operationHistory/actions/RegisterOperationAction";
import { AddBugAction } from "@/lib/operationHistory/actions/bug/AddBugAction";
import { EditBugAction } from "@/lib/operationHistory/actions/bug/EditBugAction";
import { MoveBugAction } from "@/lib/operationHistory/actions/bug/MoveBugAction";
import { DeleteBugAction } from "@/lib/operationHistory/actions/bug/DeleteBugAction";
import { DeleteNoticeAction } from "@/lib/operationHistory/actions/notice/DeleteNoticeAction";
import { AddNoticeAction } from "@/lib/operationHistory/actions/notice/AddNoticeAction";
import { EditNoticeAction } from "@/lib/operationHistory/actions/notice/EditNoticeAction";
import { MoveNoticeAction } from "@/lib/operationHistory/actions/notice/MoveNoticeAction";
import { ChangeTestResultAction } from "@/lib/operationHistory/actions/testResult/ChangeTestResultAction";
import { GetTestResultAction } from "@/lib/operationHistory/actions/testResult/GetTestResultAction";

const actions: ActionTree<OperationHistoryState, RootState> = {
  /**
   * Set settings to the State.
   * @param context Action context.
   * @param payload.settings Settings.
   */
  async setSettings(context, payload: { settings: Settings }) {
    const config = payload.settings.config;
    if (!config) {
      return;
    }
    context.commit("setDefaultTagList", {
      defaultTagList: payload.settings.defaultTagList,
    });
    context.commit("setDisplayInclusionList", { displayInclusionList: [] });
    await context.dispatch("writeSettings", {
      config: {
        screenDefinition: config.screenDefinition,
        coverage: config.coverage,
        imageCompression: config.imageCompression,
      },
    });
  },

  /**
   * Save settings in the repository.
   * @param context Action context.
   * @param payload.config Settings.
   */
  async writeSettings(
    context,
    payload: { config: Partial<OperationHistoryState["config"]> }
  ) {
    const settings: Settings = {
      captureSettings:
        context.rootState.settingsProvider.settings.captureSettings,
      config: {
        screenDefinition:
          payload.config.screenDefinition ??
          context.state.config.screenDefinition,
        coverage: payload.config.coverage ?? context.state.config.coverage,
        imageCompression:
          payload.config.imageCompression ??
          context.state.config.imageCompression,
      },
      debug: context.rootState.settingsProvider.settings.debug,
      defaultTagList:
        context.rootState.settingsProvider.settings.defaultTagList,
      locale: context.rootState.settingsProvider.settings.locale,
      mode: context.rootState.settingsProvider.settings.mode,
      viewPointsPreset:
        context.rootState.settingsProvider.settings.viewPointsPreset,
    };

    const result = await new SaveSettingAction(
      context.rootState.repositoryContainer
    ).saveSettings(settings);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    context.commit("setConfig", { config: result.data.config });
  },

  /**
   * Load settings from the repository and update the State.
   * If the settings are passed as an argument, use it.
   * @param context Action context.
   * @param payload.settings Settings.
   */
  async readSettings(context) {
    const result = await new ReadSettingAction(
      context.rootState.repositoryContainer
    ).readSettings();

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    context.commit("setSettings", { settings: result.data }, { root: true });
    context.dispatch("setSettings", { settings: result.data });
  },

  /**
   * Record a test intention.
   * @param context Action context.
   * @param payload.noteEditInfo Test intention information.
   */
  async saveIntention(context, payload: { noteEditInfo: NoteEditInfo }) {
    const recordIntentionAction = new RecordIntentionAction(
      {
        getTestStepId: (sequence) => {
          return context.state.testStepIds[sequence - 1];
        },
        setIntention: (intention) => {
          context.commit("setIntention", { intention });
          context.commit("setCanUpdateModels", { canUpdateModels: true });
        },
      },
      context.rootState.repositoryContainer
    );

    const moveIntentionAction = new MoveIntentionAction(
      {
        getTestStepId: (sequence) => {
          return context.state.testStepIds[sequence - 1];
        },
        moveIntention: (oldSequence, newIntention) => {
          context.commit("deleteIntention", { sequence: oldSequence });
          context.commit("setIntention", { intention: newIntention });
          context.commit("setCanUpdateModels", { canUpdateModels: true });
        },
      },
      context.rootState.repositoryContainer
    );

    const result = await new SaveIntentionAction({
      recordIntention: (note) => {
        return recordIntentionAction.record(context.state.history, note);
      },
      moveIntention: (fromSequence, destSequence) => {
        return moveIntentionAction.move(
          context.state.testResultInfo.id,
          fromSequence,
          destSequence
        );
      },
      setUnassignedIntention: async (unassignedIntention) => {
        context.commit("setUnassignedIntention", {
          unassignedIntention,
        });
      },
    }).save(
      context.state.testResultInfo.id,
      payload.noteEditInfo,
      context.state.history
    );

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }
  },

  /**
   * Delete a test intention.
   * @param context Action context.
   * @param payload.sequence Sequence number of the test intention.
   */
  async deleteIntention(context, payload: { sequence: number }) {
    const testStepId = context.state.testStepIds[payload.sequence - 1];

    const result = await new DeleteIntentionAction(
      context.rootState.repositoryContainer
    ).deleteIntention(context.state.testResultInfo.id, testStepId);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    if (result.data) {
      context.commit("deleteIntention", { sequence: payload.sequence });
      context.commit("setCanUpdateModels", { canUpdateModels: true });
    }
  },

  /**
   * Record a bug.
   * @param context Action context.
   * @param payload.noteEditInfo Bug information.
   */
  async saveBug(context, payload: { noteEditInfo: NoteEditInfo }) {
    const {
      oldSequence,
      oldIndex,
      newSequence,
      note,
      noteDetails,
      shouldTakeScreenshot,
    } = payload.noteEditInfo;

    await context.dispatch("recordBug", {
      summary: note,
      details: noteDetails,
      sequence:
        oldSequence !== null
          ? oldSequence
          : (() => {
              const lastIndex = context.state.history.length - 1;
              return context.state.history[lastIndex]?.operation.sequence ?? 1;
            })(),
      index: oldIndex !== null ? oldIndex : undefined,
      shouldTakeScreenshot,
    });

    if (oldSequence !== null && oldIndex !== null && newSequence !== null) {
      await context.dispatch("moveBug", {
        from: {
          sequence: oldSequence,
          index: oldIndex,
        },
        dest: {
          sequence: newSequence,
        },
      });
    }
  },

  /**
   * Save a bug in the repository.
   * @param context Action context.
   * @param payload.summary Summary of the bug.
   * @param payload.details Details of the bug.
   * @param payload.sequence Sequence number of the bug.
   * @param payload.index Index for bugs related to the same operation.
   * @param payload.shouldTakeScreenshot Whether to take a screenshot or not.
   */
  async recordBug(
    context,
    payload: {
      summary: string;
      details: string;
      sequence: number;
      index?: number;
      shouldTakeScreenshot: boolean;
    }
  ) {
    // Take a screenshot.
    const imageData: string | undefined = payload.shouldTakeScreenshot
      ? await context.dispatch("captureControl/takeScreenshot", null, {
          root: true,
        })
      : undefined;
    const repositoryContainer = context.rootState.repositoryContainer;

    const testStepId = context.state.testStepIds[payload.sequence - 1];

    const recordedNoteResult = await (async () => {
      // update
      if (payload.index !== undefined) {
        return new EditBugAction(repositoryContainer).editBug(
          context.state.testResultInfo.id,
          testStepId,
          payload.index,
          {
            summary: payload.summary,
            details: payload.details,
          }
        );
      }

      // add
      return new AddBugAction(repositoryContainer).addBug(
        context.state.testResultInfo.id,
        testStepId,
        {
          summary: payload.summary,
          details: payload.details,
          imageData,
        }
      );
    })();

    if (recordedNoteResult.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          recordedNoteResult.error.messageKey,
          recordedNoteResult.error.variables
        )
      );
    }

    const recordedNote = recordedNoteResult.data;

    context.commit("setBug", {
      bug: Note.createFromOtherNote({
        other: recordedNote.bug,
        overrideParams: {
          sequence: payload.sequence,
        },
      }),
      index: recordedNote.index,
    });
    context.commit("setCanUpdateModels", { canUpdateModels: true });

    if (context.state.config.imageCompression.isEnabled) {
      console.log("== bug ==");
      setTimeout(async () => {
        const result = await new CompressNoteImageAction(
          repositoryContainer
        ).compressNoteImage(
          context.state.testResultInfo.id,
          recordedNote.bug.id as string
        );

        if (result.isFailure()) {
          throw new Error(
            context.rootGetters.message(
              result.error.messageKey,
              result.error.variables
            )
          );
        }

        context.commit("replaceNoteImageFileUrl", {
          type: "bug",
          sequence: payload.sequence,
          index: recordedNote.index,
          imageFileUrl: `${repositoryContainer.serviceUrl}/${result.data.imageFileUrl}`,
        });
      }, 1);
    }
  },

  /**
   * Move a bug.
   * @param context Action context.
   * @param payload.from.sequence Sequence number of the source bug.
   * @param payload.from.index Index for source bugs related to the same operation.
   * @param payload.dest.sequence Sequence number of the destination bug.
   */
  async moveBug(
    context,
    payload: {
      from: {
        sequence: number;
        index: number;
      };
      dest: {
        sequence: number;
      };
    }
  ) {
    const result = await new MoveBugAction(
      context.rootState.repositoryContainer
    ).moveBug(
      context.state.testResultInfo.id,
      {
        testStepId: context.state.testStepIds[payload.from.sequence - 1],
        index: payload.from.index,
      },
      {
        testStepId: context.state.testStepIds[payload.dest.sequence - 1],
      }
    );

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    const movedNote = result.data;

    context.commit("deleteBug", payload.from);
    context.commit("setBug", {
      bug: Note.createFromOtherNote({
        other: movedNote.bug,
        overrideParams: { sequence: payload.dest.sequence },
      }),
      index: movedNote.index,
    });
    context.commit("setCanUpdateModels", { canUpdateModels: true });
  },

  /**
   * Delete a bug.
   * @param context Action context.
   * @param payload.sequence Sequence number of the bug.
   * @param payload.index Index for bugs related to the same operation.
   */
  async deleteBug(context, payload: { sequence: number; index: number }) {
    const testStepId = context.state.testStepIds[payload.sequence - 1];

    const result = await new DeleteBugAction(
      context.rootState.repositoryContainer
    ).deleteBug(context.state.testResultInfo.id, testStepId, payload.index);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    const { index } = result.data;

    context.commit("deleteBug", { sequence: payload.sequence, index });
    context.commit("setCanUpdateModels", { canUpdateModels: true });
  },

  /**
   * Record a notice.
   * @param context Action context.
   * @param payload.noteEditInfo Notice information.
   */
  async saveNotice(context, payload: { noteEditInfo: NoteEditInfo }) {
    const {
      oldSequence,
      oldIndex,
      newSequence,
      note,
      noteDetails,
      shouldTakeScreenshot,
      tags,
    } = payload.noteEditInfo;

    await context.dispatch("recordNotice", {
      summary: note,
      details: noteDetails,
      tags: tags,
      sequence:
        oldSequence !== null
          ? oldSequence
          : (() => {
              const lastIndex = context.state.history.length - 1;
              return context.state.history[lastIndex]?.operation.sequence ?? 1;
            })(),
      index: oldIndex !== null ? oldIndex : undefined,
      shouldTakeScreenshot,
    });

    if (
      oldSequence !== null &&
      oldIndex !== null &&
      newSequence !== null &&
      oldSequence !== newSequence
    ) {
      await context.dispatch("moveNotice", {
        from: {
          sequence: oldSequence,
          index: oldIndex,
        },
        dest: {
          sequence: newSequence,
        },
      });
    }
  },

  /**
   * Save a notice in the repository.
   * @param context Action context.
   * @param payload.summary Summary of the notice.
   * @param payload.details Details of the notice.
   * @param payload.sequence Sequence number of the notice.
   * @param payload.index Index for notices related to the same operation.
   * @param payload.shouldTakeScreenshot Whether to take a screenshot or not.
   */
  async recordNotice(
    context,
    payload: {
      summary: string;
      details: string;
      tags: string[];
      sequence: number;
      index?: number;
      shouldTakeScreenshot: boolean;
    }
  ) {
    // Take a screenshot.
    const imageData: string | undefined = payload.shouldTakeScreenshot
      ? await context.dispatch("captureControl/takeScreenshot", null, {
          root: true,
        })
      : undefined;
    const repositoryContainer = context.rootState.repositoryContainer;

    const testStepId = context.state.testStepIds[payload.sequence - 1];

    const recordedNoteResult = await (async () => {
      // update
      if (payload.index !== undefined) {
        return new EditNoticeAction(repositoryContainer).editNotice(
          context.state.testResultInfo.id,
          testStepId,
          payload.index,
          {
            summary: payload.summary,
            details: payload.details,
            tags: payload.tags,
          }
        );
      }

      // add
      return new AddNoticeAction(repositoryContainer).addNotice(
        context.state.testResultInfo.id,
        testStepId,
        {
          summary: payload.summary,
          details: payload.details,
          tags: payload.tags,
          imageData,
        }
      );
    })();

    if (recordedNoteResult.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          recordedNoteResult.error.messageKey,
          recordedNoteResult.error.variables
        )
      );
    }

    const recordedNote = recordedNoteResult.data;

    context.commit("setNotice", {
      notice: Note.createFromOtherNote({
        other: recordedNote.notice,
        overrideParams: { sequence: payload.sequence },
      }),
      index: recordedNote.index,
    });
    context.commit("setCanUpdateModels", { canUpdateModels: true });

    if (
      payload.shouldTakeScreenshot &&
      context.state.config.imageCompression.isEnabled
    ) {
      setTimeout(async () => {
        const result = await new CompressNoteImageAction(
          repositoryContainer
        ).compressNoteImage(
          context.state.testResultInfo.id,
          recordedNote.notice.id as string
        );

        if (result.isFailure()) {
          throw new Error(
            context.rootGetters.message(
              result.error.messageKey,
              result.error.variables
            )
          );
        }

        context.commit("replaceNoteImageFileUrl", {
          type: "notice",
          sequence: payload.sequence,
          index: recordedNote.index,
          imageFileUrl: `${repositoryContainer.serviceUrl}/${result.data.imageFileUrl}`,
        });
      }, 1);
    }
  },

  /**
   * Move a notice.
   * @param context Action context.
   * @param payload.from.sequence Sequence number of the source notice.
   * @param payload.from.index Index for source notices related to the same operation.
   * @param payload.dest.sequence Sequence number of the destination notice.
   */
  async moveNotice(
    context,
    payload: {
      from: {
        sequence: number;
        index: number;
      };
      dest: {
        sequence: number;
      };
    }
  ) {
    const result = await new MoveNoticeAction(
      context.rootState.repositoryContainer
    ).moveNotice(
      context.state.testResultInfo.id,
      {
        testStepId: context.state.testStepIds[payload.from.sequence - 1],
        index: payload.from.index,
      },
      {
        testStepId: context.state.testStepIds[payload.dest.sequence - 1],
      }
    );

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    const movedNote = result.data;

    context.commit("deleteNotice", payload.from);
    context.commit("setNotice", {
      notice: Note.createFromOtherNote({
        other: movedNote.notice,
        overrideParams: { sequence: payload.dest.sequence },
      }),
      index: movedNote.index,
    });
    context.commit("setCanUpdateModels", { canUpdateModels: true });
  },

  /**
   * Delete a notice.
   * @param context Action context.
   * @param payload.sequence Sequence number of the notice.
   * @param payload.index Index for notices related to the same operation.
   */
  async deleteNotice(context, payload: { sequence: number; index: number }) {
    const testStepId = context.state.testStepIds[payload.sequence - 1];

    const result = await new DeleteNoticeAction(
      context.rootState.repositoryContainer
    ).deleteNotice(context.state.testResultInfo.id, testStepId, payload.index);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    const { index } = result.data;

    context.commit("deleteNotice", { sequence: payload.sequence, index });
    context.commit("setCanUpdateModels", { canUpdateModels: true });
  },

  async deleteCurrentTestResult(context) {
    const testResultId = context.state.testResultInfo.id;

    const result = await new DeleteTestResultAction(
      context.rootState.repositoryContainer
    ).deleteTestResult(testResultId);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }
  },

  /**
   * Load a test result from the repository and restore history in the State.
   * @param context Action context.
   * @param payload.testResultId Test result ID.
   */
  async resume(context, payload: { testResultId: string }) {
    context.commit(
      "captureControl/setIsResuming",
      { isResuming: true },
      { root: true }
    );

    const result = await new ResumeAction(
      {
        clearTestStepIds: () => {
          context.commit("clearTestStepIds");
        },
        registerTestStepId: (testStepId: string) => {
          context.commit("addTestStepId", { testStepId });
          const sequence = context.state.testStepIds.indexOf(testStepId) + 1;
          return sequence;
        },
        setResumedData: async (data) => {
          context.commit("clearHistory");
          context.commit("clearModels");
          context.commit("clearInputValueTable");
          context.commit("selectWindow", { windowHandle: "" });

          context.commit("resetAllCoverageSources", {
            coverageSources: data.coverageSources,
          });
          context.commit("resetInputElementInfos", {
            inputElementInfos: data.inputElementInfos,
          });
          context.commit("resetHistory", {
            historyItems: data.historyItems,
          });
          context.commit(
            "captureControl/setUrl",
            { url: data.url },
            { root: true }
          );
          context.commit("setTestResultInfo", {
            repositoryUrl: context.rootState.repositoryContainer.serviceUrl,
            ...data.testResultInfo,
          });

          await context.dispatch(
            "captureControl/resumeWindowHandles",
            { history: context.state.history },
            { root: true }
          );

          await context.dispatch("updateScreenHistory");
        },
      },
      context.rootState.repositoryContainer
    ).resume(payload.testResultId);

    context.commit(
      "captureControl/setIsResuming",
      { isResuming: false },
      { root: true }
    );

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }
  },

  /**
   * Import Data.
   * @param context Action context.
   * @param payload.source.testResultFileUrl Source import file url.
   * @param payload.dest.testResultId Destination local test result id.
   * @return new test result ID.
   */
  async importData(
    context,
    payload: {
      source: { testResultFile: { data: string; name: string } };
      dest?: { testResultId?: string };
    }
  ) {
    const result = await new ImportTestResultAction(
      context.rootState.repositoryContainer
    ).import(payload.source, payload.dest);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    if (result.data) {
      return result.data;
    }
  },

  /**
   * Create export data.
   * @param context Action context.
   * @param payload testResultId,option
   * @return URL
   */
  async exportData(
    context,
    payload: {
      testResultId: string;
      shouldSaveTemporary?: boolean;
    }
  ) {
    const result = await new ExportTestResultAction(
      context.rootState.repositoryContainer
    ).exportWithTestResult(payload.testResultId, payload.shouldSaveTemporary);

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
   * Empty history in the State.
   * @param context Action context.
   */
  resetHistory(context) {
    context.commit("clearHistory");
    context.commit("captureControl/clearWindowHandles", null, { root: true });
    context.commit("clearUnassignedIntentions");
    context.commit("clearAllCoverageSources");
    context.commit("clearInputElementInfos");
    context.commit("setDisplayInclusionList", { displayInclusionList: [] });
    context.commit("clearModels");
    context.commit("selectWindow", { windowHandle: "" });
    context.commit("clearInputValueTable");
    context.commit("setTestResultInfo", {
      repositoryUrl: "",
      id: "",
      name: "",
    });
    context.commit("clearTestStepIds");
  },

  async saveUnassignedIntention(context, payload: { destSequence: number }) {
    const unassignedIntentionIndex =
      context.state.unassignedIntentions.findIndex((item) => {
        return item.sequence === payload.destSequence;
      });

    if (unassignedIntentionIndex !== -1) {
      const unassignedIntention =
        context.state.unassignedIntentions[unassignedIntentionIndex];

      await context.dispatch("saveIntention", {
        noteEditInfo: {
          note: unassignedIntention.note,
          noteDetails: unassignedIntention.noteDetails,
          shouldTakeScreenshot: false,
          oldSequence: unassignedIntention.sequence,
          tags: [],
        },
      });

      context.commit("removeUnassignedIntention", {
        index: unassignedIntentionIndex,
      });
    }
  },

  /**
   * Save a operation in the repository.
   * @param context Action context.
   * @param payload.operation Operation.
   */
  async registerOperation(context, payload: { operation: CapturedOperation }) {
    const repositoryContainer = context.rootState.repositoryContainer;
    const capturedOperation = payload.operation;
    if (context.rootGetters.getSetting("debug.saveItems.keywordSet")) {
      capturedOperation.keywordTexts = capturedOperation.pageSource.split("\n");
    }

    const result = await new RegisterOperationAction(
      repositoryContainer
    ).registerOperation(context.state.testResultInfo.id, capturedOperation);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    const { id, operation, coverageSource, inputElementInfo } = result.data;

    context.commit("addTestStepId", { testStepId: id });
    const sequence = context.state.testStepIds.indexOf(id) + 1;

    operation.sequence = sequence;
    operation.inputElements = inputElementInfo?.inputElements ?? [];

    context.commit("addHistory", {
      entry: { operation, intention: null, bugs: null, notices: null },
    });

    await context.dispatch("saveUnassignedIntention", {
      destSequence: operation.sequence,
    });

    context.commit("registerCoverageSource", { coverageSource });
    if (
      !!inputElementInfo &&
      !!inputElementInfo.inputElements &&
      inputElementInfo.inputElements.length !== 0
    ) {
      context.commit("registerInputElementInfo", { inputElementInfo });
    }

    context.commit("setCanUpdateModels", { canUpdateModels: true });

    if (
      context.state.config.imageCompression.isEnabled &&
      operation.imageFilePath
    ) {
      setTimeout(async () => {
        const testStepId = context.state.testStepIds[operation.sequence - 1];
        const result2 = await new CompressTestStepImageAction(
          repositoryContainer
        ).compressTestStepImage(context.state.testResultInfo.id, testStepId);

        if (result2.isFailure()) {
          throw new Error(
            context.rootGetters.message(
              result2.error.messageKey,
              result2.error.variables
            )
          );
        }

        if (result2.data) {
          context.commit("replaceTestStepsImageFileUrl", {
            sequence: operation.sequence,
            imageFileUrl: `${repositoryContainer.serviceUrl}/${result2.data.imageFileUrl}`,
          });
        }
      }, 1);
    }
  },

  /**
   * Build a sequence diagram from passed informations.
   * @param context Action context.
   * @param payload.screenHistory Screen history.
   * @param payload.windowHandles Window handles.
   * @param payload.callback The callback when the sequence diagram has operated.
   */
  async buildSequenceDiagramGraph(
    context,
    payload: {
      screenHistory: ScreenHistory;
      windowHandles: WindowHandle[];
      callback: SequenceDiagramGraphCallback;
    }
  ) {
    const graph = await SequenceDiagramGraphConverter.convert(
      payload.screenHistory,
      payload.windowHandles,
      payload.callback
    );

    const svgElement = (() => {
      const element = document.createElement("div");
      element.innerHTML = new MermaidGraphConverter().toSVG(
        "sequenceDiagram",
        graph.graphText
      );
      return element.firstElementChild!;
    })();
    graph.graphExtender.extendGraph(svgElement);

    context.commit("setSequenceDiagramGraph", { graph: svgElement });
  },

  /**
   * Build a screen transition diagram from passed informations.
   * @param context Action context.
   * @param payload.screenHistory Screen history.
   * @param payload.windowHandles Window handles.
   * @param payload.callback The callback when the screen transition diagram has operated.
   */
  async buildScreenTransitionDiagramGraph(
    context,
    payload: {
      screenHistory: ScreenHistory;
      windowHandles: string[];
      callback: FlowChartGraphCallback;
    }
  ) {
    const graphAndWindowHandles = await Promise.all(
      payload.windowHandles.map(async (windowHandle) => {
        return {
          graph: await ScreenTransitionDiagramGraphConverter.convert(
            payload.screenHistory,
            windowHandle,
            payload.callback
          ),
          windowHandle,
        };
      })
    );

    for (const { graph, windowHandle } of graphAndWindowHandles) {
      const svgElement = (() => {
        const element = document.createElement("div");
        element.innerHTML = new MermaidGraphConverter().toSVG(
          "screenTransitionDiagram",
          graph.graphText
        );
        return element.firstElementChild!;
      })();
      graph.graphExtender.extendGraph(svgElement);

      context.commit("setScreenTransitionDiagramGraph", {
        graph: svgElement,
        windowHandle,
      });
    }
  },

  /**
   * Build element coverages from passed informations.
   * @param context Action context.
   * @param payload.screenHistory Screen history.
   * @param payload.inclusionTags Inclusion tags settings for screen element coverage.
   */
  async buildElementCoverages(
    context,
    payload: {
      screenHistory: ScreenHistory;
      inclusionTags: string[];
    }
  ) {
    const coverages = await Coverage.getCoverages(
      payload.screenHistory,
      payload.inclusionTags
    );

    context.commit("setElementCoverages", { coverages });
  },

  /**
   * Update screen history.
   * @param context Action context.
   */
  async updateScreenHistory(context) {
    try {
      context.commit("setScreenHistoryIsUpdating", {
        screenHistoryIsUpdating: true,
      });

      const screenHistory = ScreenHistory.createFromOperationHistory(
        context.getters.getHistory(),
        context.state.coverageSources
      );

      context.commit("setScreenHistory", { screenHistory });

      context.commit("clearModels");

      const windowHandles = context.state.history
        .map((operationWithNotes) => {
          return operationWithNotes.operation.windowHandle;
        })
        .filter((windowHandle, index, array) => {
          return array.indexOf(windowHandle) === index;
        })
        .map((windowHandle, index) => {
          return {
            text: `window${index + 1}`,
            value: windowHandle,
            available: false,
          };
        });

      const selectScreenTransition = (
        screenTransition: ScreenTransition | null
      ) => {
        context.commit("selectScreenTransition", { screenTransition });

        const inputValueTable = new InputValueTable();
        const selectedScreenTransitions: Array<{
          intention: string;
          transitions: Array<{
            sourceScreenDef: string;
            targetScreenDef: string;
            history: OperationWithNotes[];
            screenElements: ElementInfo[];
            inputElements: ElementInfo[];
          }>;
        }> = context.getters.getSelectedScreenTransitions();

        for (const { intention, transitions } of selectedScreenTransitions) {
          inputValueTable.registerScreenTransitionToIntentions(
            intention,
            ...transitions
          );
        }

        context.commit("setInputValueTable", {
          inputValueTable,
        });
      };

      const selectOperation = (sequence: number) => {
        context.commit("selectOperation", { sequence });

        const operationWithNotes: OperationWithNotes | undefined =
          context.getters.findHistoryItem(sequence);
        if (!operationWithNotes) {
          return;
        }

        context.commit("selectScreen", {
          screenDef: operationWithNotes.operation.screenDef,
        });
      };

      const filterOperation = (displayedOperationSequences: number[]) => {
        context.commit("setDisplayedOperations", {
          sequences: displayedOperationSequences,
        });

        if (displayedOperationSequences.length > 0) {
          context.commit("selectOperation", {
            sequence:
              displayedOperationSequences[
                displayedOperationSequences.length - 1
              ],
          });
        }
      };

      await context.dispatch("buildSequenceDiagramGraph", {
        screenHistory: context.state.screenHistory,
        windowHandles,
        callback: {
          onClickEdge: (edge: Edge) => {
            filterOperation(
              edge.operationHistory.map((item) => {
                return item.operation.sequence;
              })
            );
          },
          onClickScreenRect: selectOperation,
          onClickNote: (note: {
            id: number;
            sequence: number;
            type: string;
          }) => {
            if (!!note && (note.type === "notice" || note.type === "bug")) {
              filterOperation([note.sequence]);
            }
          },
          onRightClickNote: context.state.openNoteMenu,
          onRightClickLoopArea: context.state.openNoteMenu,
        },
      });

      await context.dispatch("buildScreenTransitionDiagramGraph", {
        screenHistory: context.state.screenHistory,
        windowHandles: windowHandles.map((windowHandle) => windowHandle.value),
        callback: {
          onClickEdge: (edge: Edge) => {
            if (!edge.operationHistory[0]) {
              return;
            }

            selectOperation(edge.operationHistory[0].operation.sequence);

            selectScreenTransition({
              source: {
                title: edge.source.title,
                url: edge.source.url,
                screenDef: edge.source.screenDef,
              },
              target: {
                title: edge.target.title,
                url: edge.target.url,
                screenDef: edge.target.screenDef,
              },
            });
          },
          onClickScreenRect: (sequence: number) => {
            selectOperation(sequence);

            selectScreenTransition(null);
          },
        },
      });

      await context.dispatch("buildElementCoverages", {
        screenHistory: context.state.screenHistory,
        inclusionTags: context.state.config.coverage?.include?.tags ?? [],
      });

      await context.dispatch("updateDisplayExclusionList");
    } finally {
      context.commit("setScreenHistoryIsUpdating", {
        screenHistoryIsUpdating: false,
      });
    }
  },

  /**
   * Generate test scripts.
   * @param context Action context.
   * @param payload.testResultId Test result ID.
   * @param payload.projectId Project ID.
   * @param payload.initialUrl Initial page URL.
   * @param payload.sources Informations for generating test scripts.
   * @returns URL of generated test scripts and whether test scripts contain invalid operation.
   */
  async generateTestScripts(
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
    ).generateFromTestResult(context.state.testResultInfo.id);

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
   * Update selectable tags as exclusion elements for screen element coverage from current coverage sources.
   * @param context Action context.
   */
  async updateDisplayExclusionList(context) {
    const tagSet = new Set(
      context.state.coverageSources.flatMap(({ screenElements }) => {
        return screenElements.map(({ tagname }) => tagname.toUpperCase());
      })
    );

    context.commit("setDisplayInclusionList", {
      displayInclusionList: Array.from(tagSet.values()),
    });
  },

  /**
   * Create an empty test result in the repository.
   * @param context Action context.
   * @param payload.initialUrl Initial URL.
   * @param payload.name Test result name.
   */
  async createTestResult(
    context,
    payload: { initialUrl: string; name: string }
  ) {
    const initialUrl = payload.initialUrl ? payload.initialUrl : undefined;
    const name = payload.name ? payload.name : undefined;
    const result = await new CreateTestResultAction(
      context.rootState.repositoryContainer
    ).createTestResult(initialUrl, name);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    const testResultInfo = result.data;

    context.commit("setTestResultInfo", {
      repositoryUrl: context.rootState.repositoryContainer.serviceUrl,
      id: testResultInfo.id,
      name: testResultInfo.name,
    });
  },

  /**
   * Get test results from the repository.
   * @param context Action context.
   * @returns Test results.
   */
  async getTestResults(context) {
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

    return result.data;
  },

  async changeCurrentTestResult(
    context,
    payload: { startTime?: number | null; initialUrl?: string }
  ) {
    if (!context.state.testResultInfo.id) {
      return;
    }
    const name = payload.startTime
      ? undefined
      : context.state.testResultInfo.name;
    const startTimeStamp = payload.startTime ?? undefined;
    const url = payload.initialUrl ?? undefined;

    const result = await new ChangeTestResultAction(
      context.rootState.repositoryContainer
    ).changeTestResult(
      context.state.testResultInfo.id,
      name,
      startTimeStamp,
      url
    );

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    const changedName = result.data;
    context.commit("setTestResultName", { name: changedName });
  },

  async getTestResult(
    context,
    payload: { testResultId: string }
  ): Promise<{
    id: string;
    name: string;
    startTimeStamp: number;
    endTimeStamp: number;
    initialUrl: string;
  }> {
    const result = await new GetTestResultAction(
      context.rootState.repositoryContainer
    ).getTestResult(payload.testResultId);

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          result.error.messageKey,
          result.error.variables
        )
      );
    }

    console.log(result);

    return result.data;
  },

  async getScreenshots(context, payload: { testResultId: string }) {
    const result =
      await context.rootState.repositoryContainer.screenshotRepository.getScreenshots(
        payload.testResultId
      );

    if (result.isFailure()) {
      return "";
    }

    return result.data.url;
  },
};

export default actions;
