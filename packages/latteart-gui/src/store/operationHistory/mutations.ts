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

import Vue from "vue";
import { MutationTree } from "vuex";
import { OperationHistoryState } from ".";
import { OperationHistoryItem } from "@/lib/captureControl/OperationHistoryItem";
import {
  OperationWithNotes,
  OperationHistory,
  ScreenImage,
} from "@/lib/operationHistory/types";
import { NoteForGUI } from "@/lib/operationHistory/NoteForGUI";
import InputValueTable from "@/lib/operationHistory/InputValueTable";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { VideoFrame } from "latteart-client";

const mutations: MutationTree<OperationHistoryState> = {
  /**
   * Reset operation with note history.
   * @param state State.
   * @param payload.historyItems Operation with note history.
   */
  resetHistory(state, payload: { historyItems: OperationHistoryItem[] }) {
    state.history = payload.historyItems
      .filter((item) => {
        return item.operation !== null;
      })
      .map((item) => {
        return item as OperationWithNotes;
      });
  },

  addTestStepId(state, payload: { testStepId: string }) {
    state.testStepIds.push(payload.testStepId);
  },

  clearTestStepIds(state) {
    state.testStepIds.splice(0, state.testStepIds.length);
  },

  /**
   * Add item to operation with note history in the State.
   * @param state State.
   * @param payload.entry Operation with note.
   */
  addHistory(state, payload: { entry: OperationWithNotes }) {
    // If there is specified element, override the operation.
    // If there is not, add a operation with note.
    const targetIndex = state.history.findIndex((item) => {
      return item.operation.sequence === payload.entry.operation.sequence;
    });
    if (targetIndex === -1) {
      state.history.push(payload.entry);
      state.history.sort(
        (a, b) =>
          parseInt(a.operation.timestamp, 10) -
          parseInt(b.operation.timestamp, 10)
      );
      state.history = [
        ...state.history.map((item, index) => {
          return {
            ...item,
            operation: OperationForGUI.createFromOtherOperation({
              other: item.operation,
              overrideParams: { sequence: index + 1 },
            }),
          };
        }),
      ];
      return;
    }
    state.history[targetIndex].operation = payload.entry.operation;
  },

  /**
   * Empty operation with note history in the State.
   * @param state State.
   */
  clearHistory(state) {
    Vue.set(state, "history", []);
  },

  /**
   * Clear sequence diagram graphs.
   * @param state State.
   */
  clearSequenceDiagramGraphs(state) {
    Vue.set(state, "sequenceDiagramGraphs", []);

    if (
      state.sequenceDiagramGraphs.length === 0 &&
      !state.screenTransitionDiagramGraph &&
      state.elementCoverages.length === 0
    ) {
      state.canUpdateModels = false;
    }
  },

  /**
   * Clear screen transition diagram graphs.
   * @param state State.
   */
  clearScreenTransitionDiagramGraph(state) {
    Vue.set(state, "screenTransitionDiagramGraph", null);

    if (
      state.sequenceDiagramGraphs.length === 0 &&
      !state.screenTransitionDiagramGraph &&
      state.elementCoverages.length === 0
    ) {
      state.canUpdateModels = false;
    }
  },

  /**
   * Clear element coverages.
   * @param state State.
   */
  clearElementCoverages(state) {
    Vue.set(state, "elementCoverages", []);

    if (
      state.sequenceDiagramGraphs.length === 0 &&
      !state.screenTransitionDiagramGraph &&
      state.elementCoverages.length === 0
    ) {
      state.canUpdateModels = false;
    }
  },

  /**
   * Set a test purpose to operation with note history in the State.
   * @param state State.
   * @param payload.intention Test intention.
   */
  setTestPurpose(state, payload: { intention: NoteForGUI }) {
    const targetIndex = state.history.findIndex((item) => {
      return item.operation.sequence === payload.intention.sequence;
    });

    if (targetIndex === -1) {
      return;
    }

    state.history[targetIndex].intention = payload.intention;
  },

  /**
   * Delete a test purpose from operation with note history in the State.
   * @param state State.
   * @param payload.sequence Sequence number of the test intention.
   */
  deleteTestPurpose(state, payload: { sequence: number }) {
    const targetIndex = state.history.findIndex((item) => {
      return item.operation.sequence === payload.sequence;
    });
    if (targetIndex !== -1) {
      state.history[targetIndex].intention = null;
    }
  },

  /**
   * Set a notice to operation with note history in the State.
   * @param state State.
   * @param payload.notice Notice.
   * @param payload.index Index for notices related to the same operation.
   */
  setNotice(state, payload: { notice: NoteForGUI; index: number }) {
    const history = state.history as OperationHistory;
    const targetIndex = history.findIndex((item) => {
      return item.operation.sequence === payload.notice.sequence;
    });
    if (targetIndex === -1) {
      return;
    }

    if (!history[targetIndex].notices) {
      history[targetIndex].notices = [];
    }

    if (history[targetIndex].notices!.length > payload.index) {
      // update
      history[targetIndex].notices![payload.index] = payload.notice;
    } else {
      // add
      history[targetIndex].notices!.push(payload.notice);
    }
  },

  /**
   * Delete a notice from operation with note history in the State.
   * @param state State.
   * @param payload.sequence Sequence number of the notice.
   * @param payload.index Index for notices related to the same operation.
   */
  deleteNotice(state, payload: { sequence: number; index: number }) {
    const targetIndex = state.history.findIndex((item) => {
      return item.operation.sequence === payload.sequence;
    });
    if (targetIndex !== -1) {
      const targetNotices = state.history[targetIndex].notices;
      if (!targetNotices) {
        return;
      }

      state.history[targetIndex].notices = targetNotices.filter(
        (notice: NoteForGUI, index: number) => {
          if (payload.index === index) {
            return false;
          }
          return true;
        }
      );
    }
  },

  /**
   * Set a sequence diagrams to the State.
   * @param state State.
   * @param payload.graph Sequence diagram.
   */
  setSequenceDiagramGraphs(
    state,
    payload: {
      graphs: {
        sequence: number;
        testPurpose?: { value: string; details?: string };
        element?: Element;
      }[];
    }
  ) {
    state.sequenceDiagramGraphs = [...payload.graphs];
  },

  /**
   * Set a screen transition diagram and corresponded window handle to the State.
   * @param state State.
   * @param payload.graph Screen transition diagram.
   * @param payload.windowHandle Window handle.
   */
  setScreenTransitionDiagramGraph(state, payload: { graph: Element }) {
    state.screenTransitionDiagramGraph = payload.graph;
  },

  /**
   * Set screen element coverages to the State.
   * @param state State.
   * @param payload.coverages Screen element coverages.
   */
  setElementCoverages(
    state,
    payload: {
      coverages: Array<{
        screenTitle: string;
        percentage: number;
        elements: Array<{
          sequence: number | null;
          tagname: string;
          type: string;
          id: string;
          name: string;
          text: string;
          operated: boolean;
          imageFileUrl?: string;
          videoFrame?: VideoFrame;
        }>;
      }>;
    }
  ) {
    state.elementCoverages.splice(
      0,
      state.elementCoverages.length,
      ...payload.coverages
    );
  },

  /**
   * Set whether models that visualizes operation history can be updated or not to the State.
   * @param state State.
   * @param payload.canUpdateModels Whether models that visualizes operation history can be updated or not.
   */
  setCanUpdateModels(state, payload: { canUpdateModels: boolean }) {
    state.canUpdateModels = payload.canUpdateModels;
  },

  /**
   * Select an operation.
   * @param state State.
   * @param payload.sequence Sequence number of the operation.
   * @param payload.doScroll Scroll to the corresponding sequence in the history table.
   */
  selectOperation(state, payload: { sequence: number; doScroll: boolean }) {
    state.selectedOperationInfo = {
      sequence: payload.sequence,
      doScroll: payload.doScroll,
    };
  },

  /**
   * Select a note.
   * @param state State.
   * @param payload.selectedOperationNote Note information.
   */
  selectOperationNote(
    state,
    payload: {
      selectedOperationNote: {
        sequence: number | null;
        index: number | null;
      };
    }
  ) {
    state.selectedOperationNote = payload.selectedOperationNote;
  },

  /**
   * Set displayed screenshot media.
   * @param state  State.
   * @param payload Image file url.
   */
  setScreenImage(state, payload: { screenImage: ScreenImage }) {
    state.screenImage = payload.screenImage;
  },

  /**
   * Clear displayed media.
   * @param state State.
   */
  clearScreenImage(state) {
    state.screenImage = null;
  },

  /**
   * Set note information being edited to the State.
   * @param state State.
   * @param payload.tmpNoteInfoForEdit Note information being edited to the State.
   */
  setTmpNoteInfoForEdit(
    state,
    payload: {
      tmpNoteInfoForEdit: {
        noteType: string;
        sequence: number;
        index: number;
      } | null;
    }
  ) {
    state.tmpNoteInfoForEdit = payload.tmpNoteInfoForEdit;
  },

  /**
   * Set the function to open the dialog for editing a note to the State.
   * @param state State.
   * @param payload.openNoteEditDialog The function to open the dialog for editing a note.
   */
  setOpenNoteEditDialogFunction(
    state,
    payload: {
      openNoteEditDialog: (
        noteType: string,
        sequence: number,
        index?: number
      ) => void;
    }
  ) {
    state.openNoteEditDialog = payload.openNoteEditDialog;
  },

  /**
   * Set the function to open a dialog to confirm the deletion of the note.
   * @param state State.
   * @param payload.openNoteEditDialog The function to open the note deletion confirmation dialog.
   */
  setOpenNoteDeleteConfirmDialogFunction(
    state,
    payload: {
      openNoteDeleteConfirmDialog: (
        noteType: string,
        title: string,
        sequence: number,
        index?: number
      ) => void;
    }
  ) {
    state.openNoteDeleteConfirmDialog = payload.openNoteDeleteConfirmDialog;
  },

  /**
   * Set the function to delete a note to the State.
   * @param state State.
   * @param payload.deleteNote The function to delete a note.
   */
  setDeleteNoteFunction(
    state,
    payload: {
      deleteNote: (noteType: string, sequence: number, index?: number) => void;
    }
  ) {
    state.deleteNote = payload.deleteNote;
  },

  /**
   * Set whether test result view model is updating or not to the State.
   * @param state State.
   * @param payload.isTestResultViewModelUpdating Whether test result view model is updating or not.
   */
  setTestResultViewModelUpdating(
    state,
    payload: { isTestResultViewModelUpdating: boolean }
  ) {
    state.isTestResultViewModelUpdating = payload.isTestResultViewModelUpdating;
  },

  /**
   * Set the function to open the menu for note to the State.
   * @param state State.
   * @param payload.menu The function to open the menu for note.
   */
  setOpenNoteMenu(
    state,
    payload: {
      menu: (
        note: {
          id: number;
          sequence: number;
          index: number;
          type: string;
        },
        eventInfo: {
          clientX: number;
          clientY: number;
        }
      ) => void;
    }
  ) {
    state.openNoteMenu = payload.menu;
  },

  /**
   * Set input value table to the State.
   * @param state State.
   * @param payload.inputValueTable Input value table.
   */
  setInputValueTable(state, payload: { inputValueTable: InputValueTable }) {
    state.inputValueTable = payload.inputValueTable;
  },

  /**
   * Empty input value table in the State.
   * @param state State.
   */
  clearInputValueTable(state) {
    state.inputValueTable = new InputValueTable();
  },

  /**
   * Set test result information to the State.
   * @param state State.
   * @param payload.id Test result ID.
   * @param payload.name Test result name.
   */
  setTestResultInfo(
    state,
    payload: {
      repositoryUrl: string;
      id: string;
      name: string;
      parentTestResultId: string;
    }
  ) {
    state.testResultInfo = {
      repositoryUrl: payload.repositoryUrl,
      id: payload.id,
      name: payload.name,
      parentTestResultId: payload.parentTestResultId,
    };
  },

  /**
   * Set storing test result information.
   * @param state State.
   * @param payload Test result information.
   */
  setStoringTestResultInfos(
    state,
    payload: {
      testResultInfos: { id: string; name: string }[];
    }
  ) {
    state.storingTestResultInfos = [...payload.testResultInfos];
  },

  removeStoringTestResultInfos(
    state,
    payload: {
      testResultInfos: { id: string; name: string }[];
    }
  ) {
    for (const testResultInfo of payload.testResultInfos) {
      const index = state.storingTestResultInfos.findIndex(
        (storingTestResultInfo) => {
          return storingTestResultInfo.id === testResultInfo.id;
        }
      );
      if (index > -1) {
        state.storingTestResultInfos.splice(index, 1);
      }
    }
  },

  clearStoringTestResultInfos(state) {
    Vue.set(state, "storingTestResultInfos", []);
  },

  /**
   * Set test result name to the State.
   * @param state State.
   * @param payload.name Test result name.
   */
  setTestResultName(state, payload: { name: string }) {
    state.testResultInfo.name = payload.name;
  },

  setCheckedOperations(
    state,
    payload: {
      checkedOperations: { index: number; operation: OperationForGUI }[];
    }
  ) {
    state.checkedOperations = payload.checkedOperations;
  },

  clearCheckedOperations(state) {
    Vue.set(state, "checkedOperations", []);
  },

  setCheckedTestResults(state, payload: { checkedTestResults: string[] }) {
    state.checkedTestResults = payload.checkedTestResults;
  },

  clearCheckedTestResults(state) {
    Vue.set(state, "checkedTestResults", []);
  },

  /**
   * Set window handles to the State.
   * @param state State.
   * @param payload.windows Window handle and title.
   */
  setWindows(
    state,
    payload: { windows: { windowHandle: string; title: string }[] }
  ) {
    state.windows = payload.windows.map((window, index) => {
      const text = `window${index + 1}:${window.title}`;

      return {
        text,
        value: window.windowHandle,
        title: window.title,
      };
    });
  },

  /**
   * Add window handles and title to the State.
   * @param state State.
   * @param payload.windowHandle Window handle.
   * @param payload.title Title.
   */
  addWindow(state, payload: { windowHandle: string; title: string }) {
    const text = `window${state.windows.length + 1}:${payload.title}`;

    state.windows.push({
      text,
      value: payload.windowHandle,
      title: payload.title,
    });
  },

  /**
   * Update window title to the State.
   * @param state State.
   * @param payload.windowHandle Window handle.
   * @param payload.title Title.
   */
  updateWindowTitle(state, payload: { windowHandle: string; title: string }) {
    const windowIndex = state.windows.findIndex(
      ({ value }) => value === payload.windowHandle
    );

    if (state.windows[windowIndex].title !== payload.title) {
      const indexOfFirst = state.windows[windowIndex].text.indexOf(":");
      const strHead = state.windows[windowIndex].text.slice(0, indexOfFirst);
      const text = `${strHead}:${payload.title}`;

      state.windows.splice(windowIndex, 1, {
        text,
        value: payload.windowHandle,
        title: payload.title,
      });
    }
  },

  /**
   * Clear window handles in the State.
   * @param state State.
   */
  clearWindows(state) {
    Vue.set(state, "windows", []);
  },

  /**
   * Set whether Picture-In-Picture window is displayed or not.
   * @param state State.
   * @param payload.isDisplayed Whether Picture-In-Picture window is displayed or not.
   */
  setPictureInPictureWindowDisplayed(state, payload: { isDisplayed: boolean }) {
    state.isPictureInPictureWindowDisplayed = payload.isDisplayed;
  },

  /**
   * Set test result list page options.
   * @param state State.
   * @param payload.search Search text.
   * @param payload.page Page number.
   * @param payload.itemsPerPage Number of items per page.
   * @param payload.sortBy Sort target.
   * @param payload.sortDesc Sort order.
   */
  setTestResultListOption(
    state,
    payload: {
      search: string;
      page: number;
      itemsPerPage: number;
      sortBy: string;
      sortDesc: boolean;
    }
  ) {
    state.testResultListOption = payload;
  },
};

export default mutations;
