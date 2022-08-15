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

import {
  OperationWithNotes,
  CoverageSource,
  ScreenTransition,
  InputElementInfo,
  AutofillConditionGroup,
  AutofillSetting,
} from "@/lib/operationHistory/types";
import { Module } from "vuex";
import { RootState } from "..";
import getters from "./getters";
import mutations from "./mutations";
import actions from "./actions";
import {
  ScreenDefinition,
  Coverage,
  ImageCompression,
} from "@/lib/common/settings/Settings";
import { ScreenDefType } from "@/lib/common/enum/SettingsEnum";
import ScreenHistory from "@/lib/operationHistory/ScreenHistory";
import InputValueTable from "@/lib/operationHistory/InputValueTable";

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
  };

  /**
   * Config.
   */
  config: {
    /**
     * Screen definition settings.
     */
    screenDefinition: ScreenDefinition;

    /**
     * Autofill condition settings.
     */
    autofillSetting: AutofillSetting;

    /**
     * Screen element coverage settings.
     */
    coverage: Coverage;

    /**
     * Screenshot image compression settings.
     */
    imageCompression: ImageCompression;
  };

  /**
   * Test step ids.
   */
  testStepIds: string[];

  /**
   * Operation with notes history.
   */
  history: OperationWithNotes[];

  /**
   * Screen history.
   */
  screenHistory: ScreenHistory;

  /**
   * Intentions unassigned to any operation.
   */
  unassignedIntentions: {
    sequence: number;
    note: string;
    noteDetails?: string;
  }[];

  /**
   * Selectable tags as exclusion elements for screen element coverage.
   */
  displayInclusionList: string[];

  /**
   * Default selectable tags as exclusion elements for screen element coverage.
   */
  defaultTagList: string[];

  /**
   * Element informations for calculating screen element coverage.
   */
  coverageSources: CoverageSource[];

  /**
   * Element informations for calculating screen element coverage.
   */
  inputElementInfos: InputElementInfo[];

  /**
   * Sequence diagram.
   */
  sequenceDiagramGraph: Element | null;

  /**
   * Window handle to screen transition diagram.
   */
  windowHandleToScreenTransitionDiagramGraph: {
    [windowHandle: string]: Element;
  };

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
   * Whether screen history is updating or not.
   */
  screenHistoryIsUpdating: boolean;

  /**
   * Selected window handle.
   */
  selectedWindowHandle: string;

  /**
   * Sequence number of selected operation.
   */
  selectedOperationSequence: number;

  /**
   * Selected note.
   */
  selectedOperationNote: { sequence: number | null; index: number | null };

  /**
   * Screen definition of selected screen.
   */
  selectedScreenDef: string;

  /**
   * Selected screen transition.
   */
  selectedScreenTransition: ScreenTransition | null;

  /**
   * Displayed operations.
   */
  displayedOperations: number[];

  /**
   * Note information being edited.
   */
  tmpNoteInfoForEdit: {
    noteType: string;
    sequence: number;
    index: number;
  } | null;

  autofillSelectDialog: AutofillConditionGroup[] | null;

  /**
   * The function to open the dialog for editing a note.
   */
  openNoteEditDialog: (
    noteType: string,
    sequence: number,
    index: number
  ) => void;

  /**
   * The function to open the note deletion confirmation dialog.
   */
  openNoteDeleteConfirmDialog: (
    noteType: string,
    title: string,
    sequence: number,
    index: number
  ) => void;

  /**
   * The function to delete a note.
   */
  deleteNote: (noteType: string, sequence: number, index: number) => void;

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
  },
  config: {
    screenDefinition: {
      screenDefType: ScreenDefType.Title,
      conditionGroups: [],
    },
    autofillSetting: {
      autoHopupRegistrationDialog: true,
      autoHopupSelectionDialog: true,
      conditionGroups: [],
    },
    coverage: {
      include: {
        tags: [],
      },
    },
    imageCompression: {
      isEnabled: false,
      isDeleteSrcImage: false,
    },
  },
  testStepIds: [],
  history: [],
  screenHistory: new ScreenHistory(),
  unassignedIntentions: [],
  displayInclusionList: [],
  defaultTagList: [],
  coverageSources: [],
  inputElementInfos: [],
  sequenceDiagramGraph: null,
  windowHandleToScreenTransitionDiagramGraph: {},
  elementCoverages: [],
  inputValueTable: new InputValueTable(),
  canUpdateModels: false,
  screenHistoryIsUpdating: false,
  selectedWindowHandle: "",
  selectedOperationSequence: 0,
  selectedOperationNote: { sequence: null, index: null },
  selectedScreenDef: "",
  selectedScreenTransition: null,
  displayedOperations: [],
  tmpNoteInfoForEdit: null,
  autofillSelectDialog: null,
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
