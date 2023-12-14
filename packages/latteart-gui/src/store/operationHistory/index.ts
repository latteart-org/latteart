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

import {
  ScreenImage,
  OperationWithNotes,
  WindowInfo,
} from "@/lib/operationHistory/types";
import { Module } from "vuex";
import { RootState } from "..";
import getters from "./getters";
import mutations from "./mutations";
import actions from "./actions";
import InputValueTable from "@/lib/operationHistory/InputValueTable";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import { VideoFrame } from "latteart-client";

/**
 * State for operation history.
 */
export interface OperationHistoryState {
  /**
   * Test result.
   */
  testResultInfo: {
    /**
     * Repository URL.
     */
    repositoryUrl: string;

    /**
     * Test result ID.
     */
    id: string;

    /**
     * Test result name.
     */
    name: string;

    /**
     * Parent test result ID.
     */
    parentTestResultId: string;
  };

  /**
   * Retention of test result information
   */
  storingTestResultInfos: {
    id: string;
    name: string;
  }[];

  /**
   * Test step ids.
   */
  testStepIds: string[];

  /**
   * Operation with notes history.
   */
  history: OperationWithNotes[];

  /**
   * Window informations.
   */
  windows: WindowInfo[];

  /**
   * Sequence diagram.
   */
  sequenceDiagramGraphs: {
    sequence: number;
    testPurpose?: { value: string; details?: string };
    element?: Element;
  }[];

  /**
   * Window handle to screen transition diagram.
   */
  screenTransitionDiagramGraph: Element | null;

  /**
   * Screen element coverages.
   */
  elementCoverages: Array<{
    /**
     * Screen title.
     */
    screenTitle: string;

    /**
     * Percentage.
     */
    percentage: number;

    /**
     * Elements.
     */
    elements: Array<{
      /**
       * Sequence number of the operation.
       */
      sequence: number | null;

      /**
       * Tag name.
       */
      tagname: string;

      /**
       * Element type.
       */
      type: string;

      /**
       * ID.
       */
      id: string;

      /**
       * Name.
       */
      name: string;

      /**
       * Text.
       */
      text: string;

      /**
       * Whether the element is operated or not.
       */
      operated: boolean;

      /**
       * Screenshot URL.
       */
      imageFileUrl?: string;

      /**
       * Video frame.
       */
      videoFrame?: VideoFrame;

      /**
       * Bounding rect.
       */
      boundingRect?: {
        top: number;
        left: number;
        width: number;
        height: number;
      };

      /**
       * Inner height.
       */
      innerHeight?: number;

      /**
       * Inner width.
       */
      innerWidth?: number;

      /**
       * Outer height.
       */
      outerHeight?: number;

      /**
       * Outer width.
       */
      outerWidth?: number;
    }>;
  }>;

  /**
   * Input value table.
   */
  inputValueTable: InputValueTable;

  /**
   * Whether models that visualizes operation history can be updated or not.
   */
  canUpdateModels: boolean;

  /**
   * Whether test result view model is updating or not.
   */
  isTestResultViewModelUpdating: boolean;

  /**
   * Sequence number of selected operation.
   */
  selectedOperationSequence: { sequence: number; doScroll: boolean };

  /**
   * Selected note.
   */
  selectedOperationNote: { sequence: number | null; index: number | null };

  /**
   * Displayed operations.
   */
  displayedOperations: number[];

  /**
   * Screen image.
   */
  screenImage: ScreenImage | null;

  /**
   * Note information being edited.
   */
  tmpNoteInfoForEdit: {
    noteType: string;
    sequence: number;
    index: number;
  } | null;

  /**
   * Checked operations.
   */
  checkedOperations: { index: number; operation: OperationForGUI }[];

  /**
   * Checked test result ids.
   */
  checkedTestResults: string[];

  /**
   * Whether Picture-in-Picture window is displayed.
   */
  isPictureInPictureWindowDisplayed: boolean;

  /**
   * Test result list page options.
   */
  testResultListOption: { page: number; itemsPerPage: number };

  /**
   * The function to open the dialog for editing a note.
   */
  openNoteEditDialog: (
    noteType: string,
    sequence: number,
    index?: number
  ) => void;

  /**
   * The function to open the note deletion confirmation dialog.
   */
  openNoteDeleteConfirmDialog: (
    noteType: string,
    title: string,
    sequence: number,
    index?: number
  ) => void;

  /**
   * The function to delete a note.
   */
  deleteNote: (noteType: string, sequence: number, index?: number) => void;

  /**
   * The function to open the menu for note.
   */
  openNoteMenu: (
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

const state: OperationHistoryState = {
  testResultInfo: {
    repositoryUrl: "",
    id: "",
    name: "",
    parentTestResultId: "",
  },
  storingTestResultInfos: [],
  testStepIds: [],
  history: [],
  windows: [],
  sequenceDiagramGraphs: [],
  screenTransitionDiagramGraph: null,
  elementCoverages: [],
  inputValueTable: new InputValueTable(),
  canUpdateModels: false,
  isTestResultViewModelUpdating: false,
  selectedOperationSequence: { sequence: 0, doScroll: false },
  selectedOperationNote: { sequence: null, index: null },
  displayedOperations: [],
  screenImage: null,
  tmpNoteInfoForEdit: null,
  checkedOperations: [],
  checkedTestResults: [],
  isPictureInPictureWindowDisplayed: false,
  testResultListOption: { page: 1, itemsPerPage: 10 },
  openNoteEditDialog: () => {
    /* Do nothing. */
  },
  openNoteDeleteConfirmDialog: () => {
    /* Do noting. */
  },
  deleteNote: () => {
    /* Do nothing. */
  },
  openNoteMenu: () => {
    /* Do nothing. */
  },
};

export const operationHistory: Module<OperationHistoryState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
