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

import type { OperationHistoryItem } from "@/lib/captureControl/OperationHistoryItem";
import type { NoteEditInfo } from "@/lib/captureControl/types";
import InputValueTable from "@/lib/operationHistory/InputValueTable";
import type { NoteForGUI } from "@/lib/operationHistory/NoteForGUI";
import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";
import type {
  AutoOperation,
  AutofillConditionGroup,
  OperationHistory,
  OperationWithNotes,
  ScreenImage,
  TestResultComparisonResult,
  WindowInfo
} from "@/lib/operationHistory/types";
import { defineStore } from "pinia";
import { useRootStore } from "./root";
import { convertNote } from "@/lib/common/replyDataConverter";
import {
  ServiceSuccess,
  type ElementInfo,
  type GraphView,
  type SequenceView,
  type VideoFrame
} from "latteart-client";
import { DeleteTestResultAction } from "@/lib/operationHistory/actions/testResult/DeleteTestResultAction";
import { useCaptureControlStore } from "./captureControl";
import { ImportTestResultAction } from "@/lib/operationHistory/actions/testResult/ImportTestResultAction";
import { ExportTestResultAction } from "@/lib/operationHistory/actions/testResult/ExportTestResultAction";
import {
  convertToSequenceDiagramGraphs,
  type SequenceDiagramGraphCallback,
  type SequenceDiagramGraphExtenderSource
} from "@/lib/operationHistory/graphConverter/SequenceDiagramGraphConverter";
import SequenceDiagramGraphExtender from "@/lib/operationHistory/mermaidGraph/extender/SequenceDiagramGraphExtender";
import MermaidGraphConverter from "@/lib/operationHistory/graphConverter/MermaidGraphConverter";
import {
  convertToScreenTransitionDiagramGraph,
  type FlowChartGraphCallback,
  type FlowChartGraphExtenderSource
} from "@/lib/operationHistory/graphConverter/ScreenTransitionDiagramGraphConverter";
import FlowChartGraphExtender from "@/lib/operationHistory/mermaidGraph/extender/FlowChartGraphExtender";
import { GenerateTestScriptsAction } from "@/lib/operationHistory/actions/GenerateTestScriptsAction";
import { GetTestResultListAction } from "@/lib/operationHistory/actions/testResult/GetTestResultListAction";
import { ChangeTestResultAction } from "@/lib/operationHistory/actions/testResult/ChangeTestResultAction";
import { GetSessionIdsAction } from "@/lib/operationHistory/actions/testResult/GetSessionIdsAction";
import * as Coverage from "@/lib/operationHistory/Coverage";

/**
 * State for operation history.
 */
export type OperationHistoryState = {
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
   * Sequence info of selected operation.
   */
  selectedOperationInfo: { sequence: number; doScroll: boolean };

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
  testResultListOption: {
    search: string;
    page: number;
    itemsPerPage: number;
    sortBy: string;
    sortDesc: boolean;
  };

  /**
   * The function to open the dialog for editing a note.
   */
  openNoteEditDialog: (noteType: string, sequence: number, index?: number) => void;

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
      sequence: number;
      index?: number;
      type: string;
    },
    eventInfo: {
      clientX: number;
      clientY: number;
    }
  ) => void;
};

export const useOperationHistoryStore = defineStore("operationHistory", {
  state: (): OperationHistoryState => ({
    testResultInfo: {
      repositoryUrl: "",
      id: "",
      name: "",
      parentTestResultId: ""
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
    selectedOperationInfo: { sequence: 0, doScroll: false },
    selectedOperationNote: { sequence: null, index: null },
    displayedOperations: [],
    screenImage: null,
    tmpNoteInfoForEdit: null,
    checkedOperations: [],
    checkedTestResults: [],
    isPictureInPictureWindowDisplayed: false,
    testResultListOption: {
      search: "",
      page: 1,
      itemsPerPage: 10,
      sortBy: "creationTimestamp",
      sortDesc: false
    },
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
    }
  }),
  getters: {
    /**
     * Find an operation with notes from the history in the State by sequence number.
     * @param state State.
     * @returns Operation with notes.
     */
    findHistoryItem: (state) => (sequence: number) => {
      const operationWithNotes = state.history.find((item) => {
        return item.operation.sequence === sequence;
      });

      if (!operationWithNotes) {
        return operationWithNotes;
      }

      return {
        operation: operationWithNotes.operation,
        bugs: operationWithNotes.bugs,
        notices: operationWithNotes.notices,
        intention: operationWithNotes.intention
      };
    },

    /**
     * Get operations from the State.
     * @param state State.
     * @returns Operations.
     */
    getOperations: (state) => () => {
      return state.history
        .map((item) => {
          return item.operation;
        })
        .filter((operation) => {
          return operation != null;
        });
    },

    /**
     * Returns true if there is a keywordSet in the history.
     * @param state  State.
     */
    hasKeywordSet: (state) => {
      return state.history.some((h) => !!h.operation.keywordSet?.size);
    }
  },
  actions: {
    /**
     * Empty input value table in the State.
     * @param state State.
     */
    clearInputValueTable() {
      this.inputValueTable = new InputValueTable();
    },

    /**
     * Reset operation with note history.
     * @param state State.
     * @param payload.historyItems Operation with note history.
     */
    resetHistory(payload: { historyItems: OperationHistoryItem[] }) {
      this.history = payload.historyItems
        .filter((item) => {
          return item.operation !== null;
        })
        .map((item) => {
          return item as OperationWithNotes;
        });
    },

    /**
     * Add item to operation with note history in the State.
     * @param state State.
     * @param payload.entry Operation with note.
     */
    addHistory(payload: { entry: OperationWithNotes }) {
      // If there is specified element, override the operation.
      // If there is not, add a operation with note.
      const targetIndex = this.history.findIndex((item) => {
        return item.operation.sequence === payload.entry.operation.sequence;
      });
      if (targetIndex === -1) {
        this.history.push(payload.entry);
        this.history.sort(
          (a, b) => parseInt(a.operation.timestamp, 10) - parseInt(b.operation.timestamp, 10)
        );
        this.history = [
          ...this.history.map((item, index) => {
            return {
              ...item,
              operation: OperationForGUI.createFromOtherOperation({
                other: item.operation,
                overrideParams: { sequence: index + 1 }
              })
            };
          })
        ];
        return;
      }
      this.history[targetIndex].operation = payload.entry.operation;
    },

    /**
     * Clear sequence diagram graphs.
     * @param state State.
     */
    clearSequenceDiagramGraphs() {
      this.sequenceDiagramGraphs = [];

      if (
        this.sequenceDiagramGraphs.length === 0 &&
        !this.screenTransitionDiagramGraph &&
        this.elementCoverages.length === 0
      ) {
        this.canUpdateModels = false;
      }
    },

    /**
     * Clear screen transition diagram graphs.
     * @param state State.
     */
    clearScreenTransitionDiagramGraph() {
      this.screenTransitionDiagramGraph = null;

      if (
        this.sequenceDiagramGraphs.length === 0 &&
        !this.screenTransitionDiagramGraph &&
        this.elementCoverages.length === 0
      ) {
        this.canUpdateModels = false;
      }
    },

    /**
     * Clear element coverages.
     * @param state State.
     */
    clearElementCoverages() {
      this.elementCoverages = [];

      if (
        this.sequenceDiagramGraphs.length === 0 &&
        !this.screenTransitionDiagramGraph &&
        this.elementCoverages.length === 0
      ) {
        this.canUpdateModels = false;
      }
    },

    /**
     * Set a test purpose to operation with note history in the State.
     * @param state State.
     * @param payload.intention Test intention.
     */
    setTestPurpose(payload: { intention: NoteForGUI }) {
      const targetIndex = this.history.findIndex((item) => {
        return item.operation.sequence === payload.intention.sequence;
      });

      if (targetIndex === -1) {
        return;
      }

      this.history[targetIndex].intention = payload.intention;
    },

    /**
     * Delete a test purpose from test step in the State.
     * @param state State.
     * @param payload.sequence Sequence number of the test intention.
     */
    removeTestPurposeFromTestStep(payload: { sequence: number }) {
      const targetIndex = this.history.findIndex((item) => {
        return item.operation.sequence === payload.sequence;
      });
      if (targetIndex !== -1) {
        this.history[targetIndex].intention = null;
      }
    },

    /**
     * Set a notice to operation with note history in the State.
     * @param state State.
     * @param payload.notice Notice.
     * @param payload.index Index for notices related to the same operation.
     */
    setNotice(payload: { notice: NoteForGUI; index: number }) {
      const history: OperationHistory = this.history;
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
     * Delete a notice from test step in the State.
     * @param state State.
     * @param payload.sequence Sequence number of the notice.
     * @param payload.index Index for notices related to the same operation.
     */
    deleteNoticeFromTestStep(payload: { sequence: number; index: number }) {
      const targetIndex = this.history.findIndex((item) => {
        return item.operation.sequence === payload.sequence;
      });
      if (targetIndex !== -1) {
        const targetNotices = this.history[targetIndex].notices;
        if (!targetNotices) {
          return;
        }

        this.history[targetIndex].notices = targetNotices.filter(
          (notice: NoteForGUI, index: number) => {
            if (payload.index === index) {
              return false;
            }
            return true;
          }
        );
      }
    },

    removeStoringTestResultInfos(payload: { testResultInfos: { id: string; name: string }[] }) {
      for (const testResultInfo of payload.testResultInfos) {
        const index = this.storingTestResultInfos.findIndex((storingTestResultInfo) => {
          return storingTestResultInfo.id === testResultInfo.id;
        });
        if (index > -1) {
          this.storingTestResultInfos.splice(index, 1);
        }
      }
    },

    /**
     * Set window handles to the State.
     * @param state State.
     * @param payload.windows Window handle and title.
     */
    setWindows(payload: { windows: { windowHandle: string; title: string }[] }) {
      this.windows = payload.windows.map((window, index) => {
        const text = `window${index + 1}:${window.title}`;

        return {
          text,
          value: window.windowHandle,
          title: window.title
        };
      });
    },

    /**
     * Add window handles and title to the State.
     * @param state State.
     * @param payload.windowHandle Window handle.
     * @param payload.title Title.
     */
    addWindow(payload: { windowHandle: string; title: string }) {
      const text = `window${this.windows.length + 1}:${payload.title}`;

      this.windows.push({
        text,
        value: payload.windowHandle,
        title: payload.title
      });
    },

    /**
     * Update window title to the State.
     * @param state State.
     * @param payload.windowHandle Window handle.
     * @param payload.title Title.
     */
    updateWindowTitle(payload: { windowHandle: string; title: string }) {
      const windowIndex = this.windows.findIndex(({ value }) => value === payload.windowHandle);

      if (this.windows[windowIndex].title !== payload.title) {
        const indexOfFirst = this.windows[windowIndex].text.indexOf(":");
        const strHead = this.windows[windowIndex].text.slice(0, indexOfFirst);
        const text = `${strHead}:${payload.title}`;

        this.windows.splice(windowIndex, 1, {
          text,
          value: payload.windowHandle,
          title: payload.title
        });
      }
    },

    /**
     * Add a test purpose.
     * @param context Action context.
     * @param payload.noteEditInfo Test purpose information.
     */
    async addTestPurpose(payload: { noteEditInfo: NoteEditInfo }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const sequence = payload.noteEditInfo.oldSequence;
      const testResult = rootStore.repositoryService.createTestResultAccessor(
        this.testResultInfo.id
      );
      const testPurpose = {
        value: payload.noteEditInfo.note,
        details: payload.noteEditInfo.noteDetails ?? ""
      };
      const testStepId = sequence != null ? this.testStepIds[sequence - 1] : "";

      const result = await testResult.addTestPurposeToTestStep(testPurpose, testStepId);

      if (result.isFailure()) {
        throw new Error(rootStore.message(`error.operation_history.${result.error.errorCode}`));
      }

      this.setTestPurpose({
        intention: convertNote(result.data.note, sequence)
      });
      this.canUpdateModels = true;
    },

    /**
     * Edit a test purpose.
     * @param context Action context.
     * @param payload.noteEditInfo Test purpose information.
     */
    async editTestPurpose(payload: { noteEditInfo: NoteEditInfo }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const fromTestStepId = payload.noteEditInfo.oldSequence
        ? this.testStepIds[payload.noteEditInfo.oldSequence - 1]
        : "";
      if (!fromTestStepId) {
        return;
      }
      const destTestStepId = payload.noteEditInfo.newSequence
        ? this.testStepIds[payload.noteEditInfo.newSequence - 1]
        : "";

      const repositoryService = rootStore.repositoryService;

      const result = await (async () => {
        const testResult = repositoryService.createTestResultAccessor(this.testResultInfo.id);

        const getTestStepResult = await testResult.getTestStep(fromTestStepId);
        if (getTestStepResult.isFailure()) {
          return getTestStepResult;
        }
        const testStep = getTestStepResult.data;

        const noteId = testStep.intention ?? "";

        const editTestPurposeResult = await testResult.editTestPurpose(noteId, {
          value: payload.noteEditInfo.note,
          details: payload.noteEditInfo.noteDetails ?? ""
        });
        if (editTestPurposeResult.isFailure()) {
          return editTestPurposeResult;
        }

        if (!destTestStepId) {
          return new ServiceSuccess({
            note: editTestPurposeResult.data,
            testStep
          });
        }

        const removeTestPurposeResult = await testResult.removeTestPurposeFromTestStep(
          editTestPurposeResult.data.id,
          fromTestStepId
        );
        if (removeTestPurposeResult.isFailure()) {
          return removeTestPurposeResult;
        }
        return testResult.addTestPurposeToTestStep(editTestPurposeResult.data, destTestStepId);
      })();

      if (result.isFailure()) {
        const messageKey = `error.operation_history.${result.error.errorCode}`;
        throw new Error(rootStore.message(messageKey));
      }

      if (payload.noteEditInfo.oldSequence !== undefined) {
        this.removeTestPurposeFromTestStep({
          sequence: payload.noteEditInfo.oldSequence
        });
      }
      const sequence = !destTestStepId
        ? payload.noteEditInfo.oldSequence
        : payload.noteEditInfo.newSequence;
      this.setTestPurpose({
        intention: convertNote(result.data.note, sequence)
      });
      this.canUpdateModels = true;
    },

    /**
     * Delete a test purpose.
     * @param context Action context.
     * @param payload.sequence Sequence number of the test purpose.
     */
    async deleteTestPurpose(payload: { sequence: number }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const testResult = rootStore.repositoryService.createTestResultAccessor(
        this.testResultInfo.id
      );
      const testStepId = this.testStepIds[payload.sequence - 1];

      const result = await (async () => {
        const getTestStepResult = await testResult.getTestStep(testStepId);
        if (getTestStepResult.isFailure()) {
          return getTestStepResult;
        }

        const { intention: noteId } = getTestStepResult.data;

        return testResult.removeTestPurposeFromTestStep(noteId ?? "", testStepId);
      })();

      if (result.isFailure()) {
        throw new Error(rootStore.message("error.operation_history.delete_test_purpose_failed"));
      }

      this.removeTestPurposeFromTestStep({ sequence: payload.sequence });
      this.canUpdateModels = true;
    },

    async addNote(payload: { noteEditInfo: NoteEditInfo }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const sequence =
        payload.noteEditInfo.oldSequence != null
          ? payload.noteEditInfo.oldSequence
          : (() => {
              const lastIndex = this.history.length - 1;
              return this.history[lastIndex]?.operation.sequence ?? 1;
            })();
      const testStepId = this.testStepIds[sequence - 1];
      const timestamp = this.history[sequence - 1].operation.timestamp;

      const result = await (() => {
        const note = {
          value: payload.noteEditInfo.note,
          details: payload.noteEditInfo.noteDetails,
          tags: payload.noteEditInfo.tags,
          timestamp: Number(timestamp)
        };
        const option = {
          screenshot: payload.noteEditInfo.shouldTakeScreenshot,
          compressScreenshot:
            payload.noteEditInfo.shouldTakeScreenshot &&
            rootStore.projectSettings.config.captureMediaSetting.imageCompression.format === "webp"
        };

        const testResult = rootStore.repositoryService.createTestResultAccessor(
          this.testResultInfo.id
        );

        return testResult.addNoteToTestStep(note, testStepId, option);
      })();

      if (result.isFailure()) {
        throw new Error(rootStore.message(`error.operation_history.${result.error.errorCode}`));
      }

      this.setNotice({
        notice: convertNote(result.data.note, sequence),
        index: result.data.testStep.notices.length - 1
      });
      this.canUpdateModels = true;
    },

    async editNote(payload: { noteEditInfo: NoteEditInfo }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const lastOperationSequence = (() => {
        const lastIndex = this.history.length - 1;
        return this.history[lastIndex]?.operation.sequence ?? 1;
      })();
      const fromTestStepId = payload.noteEditInfo.oldSequence
        ? this.testStepIds[payload.noteEditInfo.oldSequence - 1]
        : this.testStepIds[lastOperationSequence - 1];
      if (!fromTestStepId) {
        return;
      }
      const destTestStepId = payload.noteEditInfo.newSequence
        ? this.testStepIds[payload.noteEditInfo.newSequence - 1]
        : "";

      const repositoryService = rootStore.repositoryService;

      const result = await (async () => {
        const testResult = repositoryService.createTestResultAccessor(this.testResultInfo.id);

        const getTestStepResult = await testResult.getTestStep(fromTestStepId);
        if (getTestStepResult.isFailure()) {
          return getTestStepResult;
        }
        const testStep = getTestStepResult.data;

        const noteId =
          payload.noteEditInfo.oldIndex != null
            ? testStep.notices[payload.noteEditInfo.oldIndex]
            : "";

        const editNoteResult = await testResult.editNote(noteId, {
          value: payload.noteEditInfo.note,
          details: payload.noteEditInfo.noteDetails ?? "",
          tags: payload.noteEditInfo.tags
        });
        if (editNoteResult.isFailure()) {
          return editNoteResult;
        }

        if (!destTestStepId) {
          return new ServiceSuccess({
            note: editNoteResult.data,
            testStep
          });
        }

        const removeNoteResult = await testResult.removeNoteFromTestStep(
          editNoteResult.data.id,
          fromTestStepId
        );
        if (removeNoteResult.isFailure()) {
          return removeNoteResult;
        }
        return testResult.addNoteToTestStep(editNoteResult.data, destTestStepId);
      })();

      if (result.isFailure()) {
        const messageKey = `error.operation_history.${result.error.errorCode}`;
        throw new Error(rootStore.message(messageKey));
      }

      if (payload.noteEditInfo.oldSequence !== undefined) {
        this.deleteNoticeFromTestStep({
          sequence: payload.noteEditInfo.oldSequence,
          index: payload.noteEditInfo.oldIndex ?? 0
        });
      }
      const sequence = !destTestStepId
        ? payload.noteEditInfo.oldSequence
        : payload.noteEditInfo.newSequence;
      const index = !destTestStepId
        ? payload.noteEditInfo.oldIndex
        : result.data.testStep.notices.length - 1;
      this.setNotice({
        notice: convertNote(result.data.note, sequence),
        index: index ?? 0
      });
      this.canUpdateModels = true;
    },

    /**
     * Delete a notice.
     * @param context Action context.
     * @param payload.sequence Sequence number of the notice.
     * @param payload.index Index for notices related to the same operation.
     */
    async deleteNotice(payload: { sequence: number; index: number }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const testResult = rootStore.repositoryService.createTestResultAccessor(
        this.testResultInfo.id
      );

      const testStepId = this.testStepIds[payload.sequence - 1];

      const result = await (async () => {
        const getTestStepResult = await testResult.getTestStep(testStepId);
        if (getTestStepResult.isFailure()) {
          const messageKey = `error.operation_history.${getTestStepResult.error.errorCode}`;
          throw new Error(rootStore.message(messageKey));
        }

        const { notices } = getTestStepResult.data;
        const noteId = notices[payload.index];

        return testResult.removeNoteFromTestStep(noteId, testStepId);
      })();

      if (result.isFailure()) {
        throw new Error(rootStore.message("error.operation_history.delete_note_failed"));
      }

      this.deleteNoticeFromTestStep({
        sequence: payload.sequence,
        index: payload.index
      });
      this.canUpdateModels = true;
    },

    /**
     * Delete test results.
     * @param context Action context.
     * @param payload.testResultIds Test result IDs.
     */
    async deleteTestResults(payload: { testResultIds: string[] }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new DeleteTestResultAction(
        rootStore.repositoryService
      ).deleteTestResults(payload.testResultIds);

      if (result.isFailure()) {
        throw new Error(rootStore.message(result.error.messageKey, result.error.variables ?? {}));
      }
    },

    async loadTestResultForSnapshot(payload: { testResultId: string }) {
      const rootStore = useRootStore();
      const testResult = await rootStore.dataLoader?.loadTestResult(payload.testResultId);

      if (!testResult) {
        throw new Error(`historyLog not found. ${payload.testResultId}`);
      }

      this.resetHistory({ historyItems: testResult.historyItems });

      await this.updateModelsFromSequenceView({
        testResultId: payload.testResultId
      });
    },

    /**
     * Load a test result from the repository and restore history in the State.
     * @param context Action context.
     * @param payload.testResultId Test result ID.
     */
    async loadTestResult(payload: { testResultId: string }) {
      const rootStore = useRootStore();
      const captureControlStore = useCaptureControlStore();

      try {
        captureControlStore.isResuming = true;

        const testResult = await rootStore.dataLoader?.loadTestResult(payload.testResultId);

        if (!testResult) {
          throw new Error();
        }

        this.clearTestResult();
        if (testResult.testResultInfo) {
          this.testResultInfo = testResult.testResultInfo;
        }
        if (testResult.testStepIds) {
          testResult.testStepIds.forEach((testStepId) => {
            this.testStepIds.push(testStepId);
          });
        }
        if (testResult.windows) {
          this.setWindows({ windows: testResult.windows });
        }
        if (testResult.url) {
          captureControlStore.url = testResult.url;
        }
        if (testResult.testingTime) {
          captureControlStore.resetTimer({ millis: testResult.testingTime });
        }

        this.resetHistory({ historyItems: testResult.historyItems });
      } finally {
        captureControlStore.isResuming = false;
      }
    },

    /**
     * Load test result summaries.
     * @param context Action context.
     */
    async loadTestResultSummaries(payload: { testResultIds: string[] }) {
      const testResults = (await this.getTestResults()).filter(({ id }) => {
        return payload.testResultIds.includes(id);
      });

      this.storingTestResultInfos = [
        ...testResults.map(({ id, name }) => {
          return { id, name };
        })
      ];

      await this.updateModelsFromGraphView({
        testResultIds: payload.testResultIds
      });
    },

    /**
     * Import Data.
     * @param context Action context.
     * @param payload.source.testResultFileUrl Source import file url.
     * @param payload.dest.testResultId Destination local test result id.
     * @return new test result ID.
     */
    async importData(payload: {
      source: { testResultFile: { data: string; name: string } };
      dest?: { testResultId?: string };
    }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new ImportTestResultAction(rootStore.repositoryService).import(
        payload.source,
        payload.dest
      );

      if (result.isFailure()) {
        throw new Error(rootStore.message(result.error.messageKey, result.error.variables ?? {}));
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
    async exportData(payload: { testResultId: string }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new ExportTestResultAction(
        rootStore.repositoryService
      ).exportWithTestResult(payload.testResultId);

      if (result.isFailure()) {
        throw new Error(rootStore.message(result.error.messageKey, result.error.variables ?? {}));
      }

      return result.data;
    },

    /**
     * Clear test result in the State.
     * @param context Action context.
     */
    clearTestResult() {
      this.history = [];
      this.checkedOperations = [];
      this.windows = [];
      this.clearSequenceDiagramGraphs();
      this.testResultInfo = {
        repositoryUrl: "",
        id: "",
        name: "",
        parentTestResultId: ""
      };
      this.testStepIds = [];
      this.screenImage = null;
    },

    /**
     * Build a sequence diagram from passed informations.
     * @param context Action context.
     * @param payload.testResultId Test result id.
     * @param payload.viewOption View option.
     * @param payload.callback The callback when the sequence diagram has operated.
     */
    async buildSequenceDiagramGraph(payload: {
      sequenceView: SequenceView;
      callback: SequenceDiagramGraphCallback;
    }) {
      const createSequenceDiagramGraphExtender = (args: SequenceDiagramGraphExtenderSource) => {
        return new SequenceDiagramGraphExtender({
          callback: {
            onClickActivationBox: (index: number) =>
              payload.callback.onClickActivationBox(args.edges[index].sequences),
            onClickEdge: (index: number) =>
              payload.callback.onClickEdge(args.edges[index].sequences),
            onClickScreenRect: (index: number) =>
              payload.callback.onClickScreenRect(
                args.testStepIdToSequence.get(
                  args.nodes
                    .find(({ screenId }) => screenId === args.screens[index].id)
                    ?.testSteps.at(0)?.id ?? ""
                ) ?? 0
              ),
            onClickNote: (index: number) => payload.callback.onClickNote(args.notes[index]),
            onRightClickNote: (index: number, eventInfo: { clientX: number; clientY: number }) => {
              payload.callback.onRightClickNote(args.notes[index], eventInfo);
            },
            onRightClickLoopArea: (
              index: number,
              eventInfo: { clientX: number; clientY: number }
            ) => {
              // on click 'Window' loop area.
            }
          },
          tooltipTextsOfNote: args.notes.map((noteInfo) => noteInfo.details),
          tooltipTextsOfLoopArea: [],
          nameMap: new Map(args.screens.map(({ name }, index) => [index, name]))
        });
      };

      const graphs = (
        await convertToSequenceDiagramGraphs(
          payload.sequenceView,
          createSequenceDiagramGraphExtender
        )
      ).map(({ sequence, testPurpose, graph, disabledNodeIndexes }) => {
        if (!graph) {
          return { sequence, testPurpose };
        }

        const svgElement = (() => {
          const element = document.createElement("div");
          element.innerHTML = new MermaidGraphConverter().toSVG("sequenceDiagram", graph.graphText);
          return element.firstElementChild!;
        })();

        graph.graphExtender.extendGraph(svgElement, disabledNodeIndexes);

        return { sequence, testPurpose, element: svgElement };
      });

      this.sequenceDiagramGraphs = [...graphs.flat()];
    },

    /**
     * Build a screen transition diagram from passed informations.
     * @param context Action context.
     * @param payload.graphView Graph view.
     * @param payload.callback The callback when the screen transition diagram has operated.
     */
    async buildScreenTransitionDiagramGraph(payload: {
      graphView: GraphView;
      callback: FlowChartGraphCallback;
    }) {
      const createFlowChartGraphExtender = ({ edges, screens }: FlowChartGraphExtenderSource) => {
        return new FlowChartGraphExtender({
          callback: {
            onClickEdge: (index: number) => {
              const edge = edges.at(index);

              if (!edge) {
                return;
              }

              const inputValueTable = new InputValueTable(edge.details);
              const image = edge.trigger?.image;

              payload.callback.onClickEdge({ image, inputValueTable });
            },
            onClickScreenRect: (index: number) => {
              const screenId = screens.at(index)?.id;

              if (!screenId) {
                return;
              }

              const inputValueTable = new InputValueTable(
                screens.find(({ id }) => id === screenId)?.details ?? []
              );
              const image = screens[index].image;

              payload.callback.onClickScreenRect({ image, inputValueTable });
            }
          },
          nameMap: new Map(screens.map(({ name, id }) => [id, name]))
        });
      };

      const graph = (
        await convertToScreenTransitionDiagramGraph(payload.graphView, createFlowChartGraphExtender)
      ).graph;

      const svgElement = (() => {
        const element = document.createElement("div");
        element.innerHTML = new MermaidGraphConverter().toSVG(
          "screenTransitionDiagram",
          graph.graphText
        );
        return element.firstElementChild!;
      })();
      graph.graphExtender.extendGraph(svgElement);

      this.screenTransitionDiagramGraph = svgElement;
    },

    /**
     * Build element coverages from passed informations.
     * @param context Action context.
     * @param payload.graphView Graph view.
     */
    async buildElementCoverages(payload: { graphView: GraphView }) {
      const rootStore = useRootStore();

      const inclusionTags = rootStore.projectSettings.config.coverage?.include?.tags ?? [];

      const coverages = Coverage.getCoverages(payload.graphView, inclusionTags);
      this.elementCoverages.splice(0, this.elementCoverages.length, ...coverages);
    },

    /**
     * Update models from sequence view.
     * @param context Action context.
     * @param payload.testResultId Test result id.
     */
    async updateModelsFromSequenceView(payload: { testResultId: string }) {
      try {
        const rootStore = useRootStore();

        this.isTestResultViewModelUpdating = true;
        this.clearSequenceDiagramGraphs();

        const screenDefinitionConfig = rootStore.projectSettings.config.screenDefinition;
        const viewOption = {
          node: {
            unit: screenDefinitionConfig.screenDefType,
            definitions: screenDefinitionConfig.conditionGroups
              .filter(({ isEnabled }) => isEnabled)
              .map((group) => {
                return {
                  name: group.screenName,
                  conditions: group.conditions
                    .filter(({ isEnabled }) => isEnabled)
                    .map((condition) => {
                      return {
                        target: condition.definitionType,
                        method: condition.matchType,
                        value: condition.word
                      };
                    })
                };
              })
          }
        };

        const sequenceView = await rootStore.dataLoader?.loadSequenceView(
          payload.testResultId,
          viewOption
        );

        if (!sequenceView) {
          throw new Error(
            rootStore.message("error.operation_history.generate_sequence_view_failed")
          );
        }

        await this.buildSequenceDiagramGraph({
          sequenceView,
          callback: {
            onClickActivationBox: (sequences: number[]) => {
              const firstSequence = sequences.at(0);

              if (!firstSequence) {
                return;
              }

              this.selectOperation({
                sequence: firstSequence,
                doScroll: true
              });
            },
            onClickEdge: (sequences: number[]) => {
              const lastSequence = sequences.at(-1);

              if (lastSequence === undefined) {
                return;
              }

              this.selectOperation({
                sequence: lastSequence,
                doScroll: true
              });
            },
            onClickScreenRect: (sequence: number) => {
              this.selectOperation({ sequence, doScroll: false });
            },
            onClickNote: (note: { sequence: number; type: string; details: string }) => {
              if (!!note && (note.type === "notice" || note.type === "bug")) {
                this.selectOperation({
                  sequence: note.sequence,
                  doScroll: true
                });
              }
            },
            onRightClickNote: this.openNoteMenu
          }
        });
      } finally {
        this.isTestResultViewModelUpdating = false;
      }
    },

    /**
     * Update models from graph view.
     * @param context Action context.
     * @param payload.testResultIds Test result ids.
     */
    async updateModelsFromGraphView(payload: { testResultIds: string[] }) {
      try {
        this.isTestResultViewModelUpdating = true;

        this.clearScreenTransitionDiagramGraph();
        this.clearElementCoverages();

        const rootStore = useRootStore();

        const screenDefinitionConfig = rootStore.projectSettings.config.screenDefinition;
        const viewOption = {
          node: {
            unit: screenDefinitionConfig.screenDefType,
            definitions: screenDefinitionConfig.conditionGroups
              .filter(({ isEnabled }) => isEnabled)
              .map((group) => {
                return {
                  name: group.screenName,
                  conditions: group.conditions
                    .filter(({ isEnabled }) => isEnabled)
                    .map((condition) => {
                      return {
                        target: condition.definitionType,
                        method: condition.matchType,
                        value: condition.word
                      };
                    })
                };
              })
          }
        };

        const graphView: GraphView | undefined = await rootStore.dataLoader?.loadGraphView(
          payload.testResultIds,
          viewOption
        );

        if (!graphView) {
          throw new Error(rootStore.message("error.operation_history.generate_graph_view_failed"));
        }

        await this.buildScreenTransitionDiagramGraph({
          graphView,
          callback: {
            onClickEdge: (edge: {
              image?: { imageFileUrl?: string; videoFrame?: VideoFrame };
              inputValueTable: InputValueTable;
            }) => {
              if (edge.image) {
                this.changeScreenImage({
                  image: edge.image
                });
              } else {
                this.screenImage = null;
              }

              this.inputValueTable = edge.inputValueTable;
            },
            onClickScreenRect: (rect: {
              image?: { imageFileUrl?: string; videoFrame?: VideoFrame };
              inputValueTable: InputValueTable;
            }) => {
              if (rect.image) {
                this.changeScreenImage({ image: rect.image });
              } else {
                this.screenImage = null;
              }

              this.inputValueTable = rect.inputValueTable;
            }
          }
        });

        this.inputValueTable = new InputValueTable();

        await this.buildElementCoverages({ graphView });
      } finally {
        this.isTestResultViewModelUpdating = false;
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
    async generateTestScripts(payload: {
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
      ).generateFromTestResult(
        this.testResultInfo.id,
        rootStore.projectSettings.config.screenDefinition
      );

      if (result.isFailure()) {
        throw new Error(rootStore.message(result.error.messageKey, result.error.variables ?? {}));
      }

      return result.data;
    },

    /**
     * Create an empty test result in the repository.
     * @param context Action context.
     * @param payload.initialUrl Initial URL.
     * @param payload.name Test result name.
     */
    async createTestResult(payload: {
      initialUrl: string;
      name: string;
      parentTestResultId?: string;
    }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const initialUrl = payload.initialUrl ? payload.initialUrl : undefined;
      const name = payload.name ? payload.name : undefined;
      const parentTestResultId = payload.parentTestResultId
        ? payload.parentTestResultId
        : undefined;

      const result = await rootStore.repositoryService.createEmptyTestResult({
        initialUrl,
        name,
        parentTestResultId
      });

      if (result.isFailure()) {
        throw new Error(rootStore.message("error.operation_history.create_test_result_failed"));
      }

      const testResultInfo = result.data;

      this.testResultInfo = {
        repositoryUrl: rootStore.repositoryService.serviceUrl,
        id: testResultInfo.id,
        name: testResultInfo.name,
        parentTestResultId: payload.parentTestResultId ?? ""
      };
      this.storingTestResultInfos = [{ id: testResultInfo.id, name: testResultInfo.name }];
    },

    /**
     * Get test results from the repository.
     * @param context Action context.
     * @returns Test results.
     */
    async getTestResults() {
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

    async changeCurrentTestResult(payload: { startTime?: number | null; initialUrl?: string }) {
      if (!this.testResultInfo.id) {
        return;
      }

      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const name = payload.startTime ? undefined : this.testResultInfo.name;
      const startTimeStamp = payload.startTime ?? undefined;
      const url = payload.initialUrl ?? undefined;

      const result = await new ChangeTestResultAction(rootStore.repositoryService).changeTestResult(
        this.testResultInfo.id,
        name,
        startTimeStamp,
        url
      );

      if (result.isFailure()) {
        throw new Error(rootStore.message(result.error.messageKey, result.error.variables ?? {}));
      }

      const changedName = result.data;
      this.testResultInfo.name = changedName;
    },

    /**
     * Change test result name.
     * @param context Action context.
     * @param payload.testResultId Test result Id.
     * @param payload.testResultName Test result name.
     */
    async changeTestResultName(payload: { testResultId: string; testResultName: string }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await new ChangeTestResultAction(rootStore.repositoryService).changeTestResult(
        payload.testResultId,
        payload.testResultName
      );

      if (result.isFailure()) {
        throw new Error(rootStore.message(result.error.messageKey, result.error.variables ?? {}));
      }

      if (this.testResultInfo.id === payload.testResultId) {
        this.testResultInfo.name = result.data;
      }
    },

    async getScreenshots(payload: { testResultId: string }) {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const result = await rootStore.repositoryService.screenshotRepository.getScreenshots(
        payload.testResultId
      );

      if (result.isFailure()) {
        return "";
      }

      return result.data.url;
    },

    async updateAutofillConditionGroup(payload: {
      conditionGroup: Partial<AutofillConditionGroup>;
      index: number;
    }) {
      const rootStore = useRootStore();

      const autofillSetting = {
        ...rootStore.projectSettings.config.autofillSetting
      };
      autofillSetting.conditionGroups =
        payload.index < 0
          ? [
              ...autofillSetting.conditionGroups,
              {
                isEnabled: true,
                settingName: "",
                url: "",
                title: "",
                inputValueConditions: [],
                ...payload.conditionGroup
              }
            ]
          : rootStore.projectSettings.config.autofillSetting.conditionGroups.map((group, index) => {
              return index !== payload.index ? group : { ...group, ...payload.conditionGroup };
            });
      await rootStore.writeConfig({
        config: {
          autofillSetting
        }
      });
    },

    async registerAutoOperation(payload: {
      settingName: string;
      settingDetails?: string;
      operations: AutoOperation[];
    }) {
      const rootStore = useRootStore();

      const conditionGroup = {
        isEnabled: true,
        settingName: payload.settingName,
        details: payload.settingDetails,
        autoOperations: payload.operations
      };
      const autoOperationSetting = {
        ...rootStore.projectSettings.config.autoOperationSetting
      };
      autoOperationSetting.conditionGroups.push(conditionGroup);

      await rootStore.writeConfig({
        config: {
          autoOperationSetting
        }
      });
    },

    async getSessionIds() {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      if (!this.testResultInfo.id) {
        return;
      }

      const result = await new GetSessionIdsAction(rootStore.repositoryService).getSessionIds(
        this.testResultInfo.id
      );

      if (result.isFailure()) {
        throw new Error(rootStore.message(result.error.messageKey, result.error.variables ?? {}));
      }

      return result.data;
    },

    async compareTestResults(payload: {
      actualTestResultId: string;
      expectedTestResultId: string;
    }): Promise<TestResultComparisonResult> {
      const rootStore = useRootStore();

      if (!rootStore.repositoryService) {
        throw new Error("repository service is not active.");
      }

      const config = rootStore.projectSettings.config.testResultComparison;
      const repository = rootStore.repositoryService.testResultComparisonRepository;

      const result = await repository.compareTestResults(
        payload.actualTestResultId,
        payload.expectedTestResultId,
        {
          excludeItems: config.excludeItems.isEnabled ? config.excludeItems.values : undefined,
          excludeElements: config.excludeElements.isEnabled
            ? config.excludeElements.values
            : undefined
        }
      );

      if (result.isFailure()) {
        throw new Error(rootStore.message(`error.operation_history.${result.error.code}`));
      }

      return result.data;
    },

    selectOperation(payload: { sequence: number; doScroll: boolean }) {
      this.selectedOperationInfo = {
        sequence: payload.sequence,
        doScroll: payload.doScroll
      };

      const selectedItem = (this.history ?? []).find(({ operation }) => {
        return operation.sequence === payload.sequence;
      });

      const selectedOperation = selectedItem?.operation ?? null;

      if (selectedOperation) {
        if (selectedOperation.imageFilePath || selectedOperation.videoFrame) {
          this.changeScreenImage({
            image: {
              imageFileUrl: selectedOperation.imageFilePath,
              videoFrame: selectedOperation.videoFrame
            },
            elementInfo: selectedOperation.elementInfo ?? undefined
          });
        } else {
          this.screenImage = null;
        }
      }
    },

    changeScreenImage(payload: {
      image: { imageFileUrl?: string; videoFrame?: VideoFrame };
      elementInfo?: Pick<
        ElementInfo,
        "boundingRect" | "innerHeight" | "innerWidth" | "outerHeight" | "outerWidth" | "iframe"
      >;
    }) {
      const { videoFrame, imageFileUrl } = payload.image;

      const background = videoFrame
        ? {
            image: { url: imageFileUrl ?? "" },
            video: { url: videoFrame.url, time: videoFrame.time }
          }
        : { image: { url: imageFileUrl ?? "" } };

      const overlay = ((element) => {
        if (!element) {
          return;
        }

        const { boundingRect, innerHeight = 0, outerHeight = 0, outerWidth = 0, iframe } = element;

        return {
          width: iframe ? iframe.outerWidth : outerWidth,
          height: iframe ? iframe.outerHeight : outerHeight,
          offset: {
            y: iframe ? iframe.outerHeight - iframe.innerHeight : outerHeight - innerHeight
          },
          markerRect: boundingRect
            ? {
                ...boundingRect,
                top: boundingRect.top + (iframe?.boundingRect.top ?? 0),
                left: boundingRect.left + (iframe?.boundingRect.left ?? 0)
              }
            : undefined
        };
      })(payload.elementInfo);

      const screenImage = { background, overlay };

      this.screenImage = screenImage;
    }
  }
});
