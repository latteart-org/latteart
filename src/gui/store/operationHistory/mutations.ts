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
import { MutationTree } from "vuex";
import { OperationHistoryState } from ".";
import { OperationHistoryItem } from "@/lib/captureControl/OperationHistoryItem";
import {
  OperationWithNotes,
  OperationHistory,
  CoverageSource,
  ScreenTransition,
  InputElementInfo,
  ScreenDefinitionConditionGroup,
} from "@/lib/operationHistory/types";
import { Note } from "@/lib/operationHistory/Note";

import {
  ScreenDefinition,
  Coverage,
  ImageCompression,
} from "@/lib/common/settings/Settings";
import { ScreenDefType } from "@/lib/common/enum/SettingsEnum";
import ScreenHistory from "@/lib/operationHistory/ScreenHistory";
import InputValueTable from "@/lib/operationHistory/InputValueTable";
import { Operation } from "@/lib/operationHistory/Operation";

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
            operation: Operation.createFromOtherOperation({
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
   * Empty models that visualizes operation history in the State.
   * @param state State.
   */
  clearModels(state) {
    Vue.set(state, "sequenceDiagramGraph", null);
    Vue.set(state, "windowHandleToScreenTransitionDiagramGraph", {});
    Vue.set(state, "elementCoverages", []);
    state.canUpdateModels = false;
  },

  /**
   * Set unassigned intentions to the State.
   * @param state State
   * @param payload.unassignedIntention target intention info
   */
  setUnassignedIntention(
    state,
    payload: {
      unassignedIntention: {
        sequence: number;
        note: string;
        noteDetails?: string;
      };
    }
  ) {
    const i = state.unassignedIntentions.findIndex((item) => {
      return item.sequence === payload.unassignedIntention.sequence;
    });
    if (i === -1) {
      state.unassignedIntentions.push(payload.unassignedIntention);
    } else {
      state.unassignedIntentions[i] = payload.unassignedIntention;
    }
  },

  /**
   * Remove unassigned intentions from the State.
   * @param state State
   * @param payload.index index of target unassigned intention
   */
  removeUnassignedIntention(state, payload: { index: number }) {
    state.unassignedIntentions.splice(payload.index);
  },

  /**
   * Empty unassigned intentions in the State.
   * @param state State
   */
  clearUnassignedIntentions(state) {
    Vue.set(state, "unassignedIntentions", []);
  },

  /**
   * Set a test intention to operation with note history in the State.
   * @param state State.
   * @param payload.intention Test intention.
   */
  setIntention(state, payload: { intention: Note }) {
    const targetIndex = state.history.findIndex((item) => {
      return item.operation.sequence === payload.intention.sequence;
    });

    if (targetIndex === -1) {
      return;
    }

    state.history[targetIndex].intention = payload.intention;
  },

  /**
   * Delete a test intention from operation with note history in the State.
   * @param state State.
   * @param payload.sequence Sequence number of the test intention.
   */
  deleteIntention(state, payload: { sequence: number }) {
    const targetIndex = state.history.findIndex((item) => {
      return item.operation.sequence === payload.sequence;
    });
    if (targetIndex !== -1) {
      state.history[targetIndex].intention = null;
    }
  },

  /**
   * Set a bug to operation with note history in the State.
   * @param state State.
   * @param payload.bug Bug.
   * @param payload.index Index for bugs related to the same operation.
   */
  setBug(state, payload: { bug: Note; index: number }) {
    const history = state.history as OperationHistory;
    const targetIndex = history.findIndex((item) => {
      return item.operation.sequence === payload.bug.sequence;
    });
    if (targetIndex === -1) {
      return;
    }

    if (!history[targetIndex].bugs) {
      history[targetIndex].bugs = [];
    }

    if (history[targetIndex].bugs!.length > payload.index) {
      // update
      history[targetIndex].bugs![payload.index] = payload.bug;
    } else {
      // add
      history[targetIndex].bugs!.push(payload.bug);
    }
  },

  /**
   * Delete a bug from operation with note history in the State.
   * @param state State.
   * @param payload.sequence Sequence number of the bug.
   * @param payload.index Index for bugs related to the same operation.
   */
  deleteBug(state, payload: { sequence: number; index: number }) {
    const targetIndex = state.history.findIndex((item) => {
      return item.operation.sequence === payload.sequence;
    });
    if (targetIndex !== -1) {
      const targetBugs = state.history[targetIndex].bugs;
      if (!targetBugs) {
        return;
      }

      state.history[targetIndex].bugs = targetBugs.filter(
        (bug: Note, index: number) => {
          if (payload.index === index) {
            return false;
          }
          return true;
        }
      );
    }
  },

  /**
   * Set a notice to operation with note history in the State.
   * @param state State.
   * @param payload.notice Notice.
   * @param payload.index Index for notices related to the same operation.
   */
  setNotice(state, payload: { notice: Note; index: number }) {
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
        (notice: Note, index: number) => {
          if (payload.index === index) {
            return false;
          }
          return true;
        }
      );
    }
  },

  setConfig(state, payload: { config: OperationHistoryState["config"] }) {
    Vue.set(state, "config", payload.config);
  },

  /**
   * Set default selectable tags as exclusion elements for screen element coverage to the State.
   * @param state State.
   * @param payload.defaultTagList Default selectable tags as exclusion elements for screen element coverage.
   */
  setDefaultTagList(state, payload: { defaultTagList: string[] }) {
    state.defaultTagList = payload.defaultTagList;
  },

  /**
   * Set selectable tags as exclusion elements for screen element coverage to the State.
   * @param state State.
   * @param payload.displayInclusionList Selectable tags as exclusion elements for screen element coverage.
   */
  setDisplayInclusionList(state, payload: { displayInclusionList: string[] }) {
    const displayInclusionTagList = payload.displayInclusionList
      .concat(state.config.coverage.include.tags)
      .concat(state.defaultTagList);
    state.displayInclusionList = Array.from(new Set(displayInclusionTagList));
  },

  /**
   * Revert selectable tags as exclusion elements for screen element coverage to default.
   * @param state State.
   */
  setDefaultDisplayExclusionList(state) {
    const displayExclusionTagList = state.defaultTagList.concat(
      state.config.coverage.include.tags
    );
    state.displayInclusionList = Array.from(new Set(displayExclusionTagList));
  },

  /**
   * Set element informations for calculating screen element coverage to the State.
   * @param state State.
   * @param payload.coverageSources Element informations for calculating screen element coverage.
   */
  resetAllCoverageSources(
    state,
    payload: { coverageSources: CoverageSource[] }
  ) {
    state.coverageSources.splice(
      0,
      state.coverageSources.length,
      ...payload.coverageSources
    );
  },

  /**
   * Empty element informations for calculating screen element coverage in the State.
   * @param state State.
   */
  clearAllCoverageSources(state) {
    Vue.set(state, "coverageSources", []);
  },

  /**
   * Add element informations for calculating screen element coverage to the State.
   * @param state State.
   * @param payload.coverageSource Element informations for calculating screen element coverage.
   */
  registerCoverageSource(state, payload: { coverageSource: CoverageSource }) {
    const foundItem = state.coverageSources.find((coverageSource) => {
      return (
        coverageSource.title === payload.coverageSource.title &&
        coverageSource.url === payload.coverageSource.url
      );
    });

    if (foundItem) {
      foundItem.screenElements.splice(
        0,
        foundItem.screenElements.length,
        ...payload.coverageSource.screenElements
      );
      return;
    }

    state.coverageSources.push(payload.coverageSource);
  },

  /**
   * Set Empty input element informations to the State.
   * @param state State.
   */
  clearInputElementInfos(state) {
    Vue.set(state, "inputElementInfos", []);
  },

  /**
   * Reset input element informations to the State.
   * @param payload.inputElementInfos input element informations.
   */
  resetInputElementInfos(
    state,
    payload: { inputElementInfos: InputElementInfo[] }
  ) {
    state.inputElementInfos.splice(
      0,
      state.inputElementInfos.length,
      ...payload.inputElementInfos
    );
  },

  /**
   * register a new input element information to the State.
   * @param state State.
   * @param payload.coverageSource Element informations for calculating screen element coverage.
   */
  registerInputElementInfo(
    state,
    payload: { inputElementInfo: InputElementInfo }
  ) {
    state.inputElementInfos.push(payload.inputElementInfo);
  },

  /**
   * Set a sequence diagram to the State.
   * @param state State.
   * @param payload.graph Sequence diagram.
   */
  setSequenceDiagramGraph(state, payload: { graph: Element }) {
    state.sequenceDiagramGraph = payload.graph;
  },

  /**
   * Set a screen transition diagram and corresponded window handle to the State.
   * @param state State.
   * @param payload.graph Screen transition diagram.
   * @param payload.windowHandle Window handle.
   */
  setScreenTransitionDiagramGraph(
    state,
    payload: { graph: Element; windowHandle: string }
  ) {
    Vue.set(
      state.windowHandleToScreenTransitionDiagramGraph,
      payload.windowHandle,
      payload.graph
    );
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
   * Set screen history to the State.
   * @param state State.
   * @param payload.screenHistory Screen history.
   */
  setScreenHistory(state, payload: { screenHistory: ScreenHistory }) {
    Vue.set(state, "screenHistory", payload.screenHistory);
  },

  /**
   * Select a window.
   * @param state State.
   * @param payload.windowHandle Window handle.
   */
  selectWindow(state, payload: { windowHandle: string }) {
    state.selectedWindowHandle = payload.windowHandle;
  },

  /**
   * Select an operation.
   * @param state State.
   * @param payload.sequence Sequence number of the operation.
   */
  selectOperation(state, payload: { sequence: number }) {
    state.selectedOperationSequence = payload.sequence;
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
   * Select a screen.
   * @param state State.
   * @param payload.screenDef Screen definition.
   */
  selectScreen(state, payload: { screenDef: string }) {
    state.selectedScreenDef = payload.screenDef;
  },

  /**
   * Select a screen transition.
   * @param state State.
   * @param payload.screenTransition Screen transition.
   */
  selectScreenTransition(
    state,
    payload: { screenTransition: ScreenTransition }
  ) {
    state.selectedScreenTransition = payload.screenTransition;
  },

  /**
   * Set displayed operations to the State.
   * @param state State.
   * @param payload.sequences Sequence numbers of displayed operations.
   */
  setDisplayedOperations(state, payload: { sequences: number[] }) {
    state.displayedOperations = payload.sequences;
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
        index: number
      ) => void;
    }
  ) {
    state.openNoteEditDialog = payload.openNoteEditDialog;
  },

  /**
   * Set the function to delete a note to the State.
   * @param state State.
   * @param payload.deleteNote The function to delete a note.
   */
  setDeleteNoteFunction(
    state,
    payload: {
      deleteNote: (noteType: string, sequence: number, index: number) => void;
    }
  ) {
    state.deleteNote = payload.deleteNote;
  },

  /**
   * Set whether screen history is updating or not to the State.
   * @param state State.
   * @param payload.screenHistoryIsUpdating Whether screen history is updating or not.
   */
  setScreenHistoryIsUpdating(
    state,
    payload: { screenHistoryIsUpdating: boolean }
  ) {
    state.screenHistoryIsUpdating = payload.screenHistoryIsUpdating;
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
    payload: { repositoryUrl: string; id: string; name: string }
  ) {
    state.testResultInfo = {
      repositoryUrl: payload.repositoryUrl,
      id: payload.id,
      name: payload.name,
    };
  },

  /**
   * Set test result name to the State.
   * @param state State.
   * @param payload.name Test result name.
   */
  setTestResultName(state, payload: { name: string }) {
    state.testResultInfo.name = payload.name;
  },

  /**
   * Replace imageFilePath.
   * @param state  State.
   * @param payload.sequence  Sequence number.
   * @param payload.imageFileUrl  File name to replace.
   */
  replaceTestStepsImageFileUrl(
    state,
    payload: { sequence: number; imageFileUrl: string }
  ) {
    state.history = state.history.map((operationWithNotes) => {
      if (operationWithNotes.operation.sequence === payload.sequence) {
        operationWithNotes.operation.imageFilePath = payload.imageFileUrl;
      }
      return operationWithNotes;
    });
  },

  /**
   * Replace imageFilePath.
   * @param state  State.
   * @param payload.type  Note type(bug or notice).
   * @param payload.sequence  Sequence number of the note.
   * @param payload.index  Index for notes related to the same operation.
   * @param payload.imageFileUrl  File name to replace.
   */
  replaceNoteImageFileUrl(
    state,
    payload: {
      type: string;
      sequence: number;
      index: number;
      imageFileUrl: string;
    }
  ) {
    state.history = state.history.map((operationWithNotes) => {
      if (operationWithNotes.operation.sequence === payload.sequence) {
        if (payload.type === "bug") {
          const targetBug = operationWithNotes?.bugs?.find(
            (bug, index) => payload.index === index
          );
          if (!targetBug) {
            throw new Error("The target bug does not exist in the store");
          }
          targetBug.imageFilePath = payload.imageFileUrl;
        }
        if (payload.type === "notice") {
          const targetNotice = operationWithNotes?.notices?.find(
            (bug, index) => payload.index === index
          );
          if (!targetNotice) {
            throw new Error("The target notice does not exist in the store");
          }
          targetNotice.imageFilePath = payload.imageFileUrl;
        }
      }
      return operationWithNotes;
    });
  },
};

export default mutations;
