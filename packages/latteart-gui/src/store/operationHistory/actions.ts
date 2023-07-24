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
import { ActionTree } from "vuex";
import { OperationHistoryState } from ".";
import { RootState } from "..";
import { NoteEditInfo } from "@/lib/captureControl/types";
import {
  AutofillConditionGroup,
  AutoOperation,
  TestResultComparisonResult,
  TestResultSummary,
} from "@/lib/operationHistory/types";
import {
  SequenceDiagramGraphCallback,
  convertToSequenceDiagramGraphs,
  SequenceDiagramGraphExtenderSource,
} from "@/lib/operationHistory/graphConverter/SequenceDiagramGraphConverter";
import * as Coverage from "@/lib/operationHistory/Coverage";
import {
  convertToScreenTransitionDiagramGraph,
  FlowChartGraphCallback,
  FlowChartGraphExtenderSource,
} from "@/lib/operationHistory/graphConverter/ScreenTransitionDiagramGraphConverter";
import MermaidGraphConverter from "@/lib/operationHistory/graphConverter/MermaidGraphConverter";
import InputValueTable from "@/lib/operationHistory/InputValueTable";
import { LoadHistoryAction } from "@/lib/operationHistory/actions/LoadHistoryAction";
import { GenerateTestScriptsAction } from "@/lib/operationHistory/actions/GenerateTestScriptsAction";
import { ImportTestResultAction } from "@/lib/operationHistory/actions/testResult/ImportTestResultAction";
import { ExportTestResultAction } from "@/lib/operationHistory/actions/testResult/ExportTestResultAction";
import { DeleteTestResultAction } from "@/lib/operationHistory/actions/testResult/DeleteTestResultAction";
import { GetTestResultListAction } from "@/lib/operationHistory/actions/testResult/GetTestResultListAction";
import { ChangeTestResultAction } from "@/lib/operationHistory/actions/testResult/ChangeTestResultAction";
import { convertNote } from "@/lib/common/replyDataConverter";
import {
  ServiceSuccess,
  TestResultViewOption,
  SequenceView,
  GraphView,
} from "latteart-client";
import { extractWindowHandles } from "@/lib/common/windowHandle";
import { GetSessionIdsAction } from "@/lib/operationHistory/actions/testResult/GetSessionIdsAction";
import SequenceDiagramGraphExtender from "@/lib/operationHistory/mermaidGraph/extender/SequenceDiagramGraphExtender";
import FlowChartGraphExtender from "@/lib/operationHistory/mermaidGraph/extender/FlowChartGraphExtender";

const actions: ActionTree<OperationHistoryState, RootState> = {
  /**
   * Add a test purpose.
   * @param context Action context.
   * @param payload.noteEditInfo Test purpose information.
   */
  async addTestPurpose(context, payload: { noteEditInfo: NoteEditInfo }) {
    const sequence = payload.noteEditInfo.oldSequence;
    const testResult =
      context.rootState.repositoryService.createTestResultAccessor(
        context.state.testResultInfo.id
      );
    const testPurpose = {
      value: payload.noteEditInfo.note,
      details: payload.noteEditInfo.noteDetails ?? "",
    };
    const testStepId =
      sequence != null ? context.state.testStepIds[sequence - 1] : "";

    const result = await testResult.addTestPurposeToTestStep(
      testPurpose,
      testStepId
    );

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          `error.operation_history.${result.error.errorCode}`
        )
      );
    }

    context.commit("setTestPurpose", {
      intention: convertNote(result.data.note, sequence),
    });
    context.commit("setCanUpdateModels", { canUpdateModels: true });
  },

  /**
   * Edit a test purpose.
   * @param context Action context.
   * @param payload.noteEditInfo Test purpose information.
   */
  async editTestPurpose(context, payload: { noteEditInfo: NoteEditInfo }) {
    const fromTestStepId = payload.noteEditInfo.oldSequence
      ? context.state.testStepIds[payload.noteEditInfo.oldSequence - 1]
      : "";
    if (!fromTestStepId) {
      return;
    }
    const destTestStepId = payload.noteEditInfo.newSequence
      ? context.state.testStepIds[payload.noteEditInfo.newSequence - 1]
      : "";

    const result = await (async () => {
      const testResult =
        context.rootState.repositoryService.createTestResultAccessor(
          context.state.testResultInfo.id
        );

      const getTestStepResult = await testResult.getTestStep(fromTestStepId);
      if (getTestStepResult.isFailure()) {
        return getTestStepResult;
      }
      const testStep = getTestStepResult.data;

      const noteId = testStep.intention ?? "";

      const editTestPurposeResult = await testResult.editTestPurpose(noteId, {
        value: payload.noteEditInfo.note,
        details: payload.noteEditInfo.noteDetails ?? "",
      });
      if (editTestPurposeResult.isFailure()) {
        return editTestPurposeResult;
      }

      if (!destTestStepId) {
        return new ServiceSuccess({
          note: editTestPurposeResult.data,
          testStep,
        });
      }

      const removeTestPurposeResult =
        await testResult.removeTestPurposeFromTestStep(
          editTestPurposeResult.data.id,
          fromTestStepId
        );
      if (removeTestPurposeResult.isFailure()) {
        return removeTestPurposeResult;
      }
      return testResult.addTestPurposeToTestStep(
        editTestPurposeResult.data,
        destTestStepId
      );
    })();

    if (result.isFailure()) {
      const messageKey = `error.operation_history.${result.error.errorCode}`;
      throw new Error(context.rootGetters.message(messageKey));
    }

    if (payload.noteEditInfo.oldSequence !== undefined) {
      context.commit("deleteTestPurpose", {
        sequence: payload.noteEditInfo.oldSequence,
      });
    }
    const sequence = !destTestStepId
      ? payload.noteEditInfo.oldSequence
      : payload.noteEditInfo.newSequence;
    context.commit("setTestPurpose", {
      intention: convertNote(result.data.note, sequence),
    });
    context.commit("setCanUpdateModels", { canUpdateModels: true });
  },

  /**
   * Delete a test purpose.
   * @param context Action context.
   * @param payload.sequence Sequence number of the test purpose.
   */
  async deleteTestPurpose(context, payload: { sequence: number }) {
    const testResult =
      context.rootState.repositoryService.createTestResultAccessor(
        context.state.testResultInfo.id
      );
    const testStepId = context.state.testStepIds[payload.sequence - 1];

    const result = await (async () => {
      const getTestStepResult = await testResult.getTestStep(testStepId);
      if (getTestStepResult.isFailure()) {
        return getTestStepResult;
      }

      const { intention: noteId } = getTestStepResult.data;

      return testResult.removeTestPurposeFromTestStep(noteId ?? "", testStepId);
    })();

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          "error.operation_history.delete_test_purpose_failed"
        )
      );
    }

    context.commit("deleteTestPurpose", { sequence: payload.sequence });
    context.commit("setCanUpdateModels", { canUpdateModels: true });
  },

  async addNote(context, payload: { noteEditInfo: NoteEditInfo }) {
    const sequence =
      payload.noteEditInfo.oldSequence != null
        ? payload.noteEditInfo.oldSequence
        : (() => {
            const lastIndex = context.state.history.length - 1;
            return context.state.history[lastIndex]?.operation.sequence ?? 1;
          })();
    const testStepId = context.state.testStepIds[sequence - 1];

    const result = await (() => {
      const note = {
        value: payload.noteEditInfo.note,
        details: payload.noteEditInfo.noteDetails,
        tags: payload.noteEditInfo.tags,
      };
      const option = {
        screenshot: payload.noteEditInfo.shouldTakeScreenshot,
        compressScreenshot:
          payload.noteEditInfo.shouldTakeScreenshot &&
          context.rootState.projectSettings.config.imageCompression.format ===
            "webp",
      };

      const testResult =
        context.rootState.repositoryService.createTestResultAccessor(
          context.state.testResultInfo.id
        );

      return testResult.addNoteToTestStep(note, testStepId, option);
    })();

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          `error.operation_history.${result.error.errorCode}`
        )
      );
    }

    context.commit("setNotice", {
      notice: convertNote(result.data.note, sequence),
      index: result.data.testStep.notices.length - 1,
    });
    context.commit("setCanUpdateModels", { canUpdateModels: true });
  },

  async editNote(context, payload: { noteEditInfo: NoteEditInfo }) {
    const lastOperationSequence = (() => {
      const lastIndex = context.state.history.length - 1;
      return context.state.history[lastIndex]?.operation.sequence ?? 1;
    })();
    const fromTestStepId = payload.noteEditInfo.oldSequence
      ? context.state.testStepIds[payload.noteEditInfo.oldSequence - 1]
      : context.state.testStepIds[lastOperationSequence - 1];
    if (!fromTestStepId) {
      return;
    }
    const destTestStepId = payload.noteEditInfo.newSequence
      ? context.state.testStepIds[payload.noteEditInfo.newSequence - 1]
      : "";

    const result = await (async () => {
      const testResult =
        context.rootState.repositoryService.createTestResultAccessor(
          context.state.testResultInfo.id
        );

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
        tags: payload.noteEditInfo.tags,
      });
      if (editNoteResult.isFailure()) {
        return editNoteResult;
      }

      if (!destTestStepId) {
        return new ServiceSuccess({
          note: editNoteResult.data,
          testStep,
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
      throw new Error(context.rootGetters.message(messageKey));
    }

    if (payload.noteEditInfo.oldSequence !== undefined) {
      context.commit("deleteNotice", {
        sequence: payload.noteEditInfo.oldSequence,
        index: payload.noteEditInfo.oldIndex,
      });
    }
    const sequence = !destTestStepId
      ? payload.noteEditInfo.oldSequence
      : payload.noteEditInfo.newSequence;
    const index = !destTestStepId
      ? payload.noteEditInfo.oldIndex
      : result.data.testStep.notices.length - 1;
    context.commit("setNotice", {
      notice: convertNote(result.data.note, sequence),
      index,
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
    const testResult =
      context.rootState.repositoryService.createTestResultAccessor(
        context.state.testResultInfo.id
      );

    const testStepId = context.state.testStepIds[payload.sequence - 1];

    const result = await (async () => {
      const getTestStepResult = await testResult.getTestStep(testStepId);
      if (getTestStepResult.isFailure()) {
        const messageKey = `error.operation_history.${getTestStepResult.error.errorCode}`;
        throw new Error(context.rootGetters.message(messageKey));
      }

      const { notices } = getTestStepResult.data;
      const noteId = notices[payload.index];

      return testResult.removeNoteFromTestStep(noteId, testStepId);
    })();

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          "error.operation_history.delete_note_failed"
        )
      );
    }

    context.commit("deleteNotice", {
      sequence: payload.sequence,
      index: payload.index,
    });
    context.commit("setCanUpdateModels", { canUpdateModels: true });
  },

  async deleteCurrentTestResult(context) {
    const testResultId = context.state.testResultInfo.id;

    const result = await new DeleteTestResultAction(
      context.rootState.repositoryService
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
  async loadTestResult(context, payload: { testResultId: string }) {
    try {
      context.commit(
        "captureControl/setIsResuming",
        { isResuming: true },
        { root: true }
      );

      const result = await new LoadHistoryAction(
        context.rootState.repositoryService
      ).loadHistory(payload.testResultId);

      if (result.isFailure()) {
        throw new Error(
          context.rootGetters.message(
            result.error.messageKey,
            result.error.variables
          )
        );
      }

      await context.dispatch("clearTestResult");

      context.commit("clearDisplayedScreenshotUrl");

      result.data.testStepIds.forEach((testStepId) => {
        context.commit("addTestStepId", { testStepId });
      });

      context.commit("resetHistory", {
        historyItems: result.data.historyItems,
      });
      context.commit(
        "captureControl/setUrl",
        { url: result.data.url },
        { root: true }
      );
      context.commit("setTestResultInfo", {
        repositoryUrl: context.rootState.repositoryService.serviceUrl,
        id: result.data.testResultInfo.id,
        name: result.data.testResultInfo.name,
        parentTestResultId: result.data.testResultInfo.parentTestResultId ?? "",
      });
      context.commit(
        "operationHistory/setWindows",
        {
          windows: extractWindowHandles(context.state.history),
        },
        { root: true }
      );
      await context.dispatch(
        "captureControl/resetTimer",
        { millis: result.data.testingTime },
        { root: true }
      );

      await context.dispatch("updateModelsFromSequenceView", {
        testResultId: payload.testResultId,
      });
    } finally {
      context.commit(
        "captureControl/setIsResuming",
        { isResuming: false },
        { root: true }
      );
    }
  },

  /**
   * Load test result summaries.
   * @param context Action context.
   */
  async loadTestResultSummaries(
    context,
    payload: {
      testResultIds: string;
    }
  ) {
    const testResults = (
      (await context.dispatch("getTestResults")) as TestResultSummary[]
    ).filter(({ id }) => {
      return payload.testResultIds.includes(id);
    });

    context.commit("setStoringTestResultInfos", {
      testResultInfos: testResults.map(({ id, name }) => {
        return { id, name };
      }),
    });

    await context.dispatch("updateModelsFromGraphView", {
      testResultIds: payload.testResultIds,
    });
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
      context.rootState.repositoryService
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
    }
  ) {
    const result = await new ExportTestResultAction(
      context.rootState.repositoryService
    ).exportWithTestResult(payload.testResultId);

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
   * Clear test result in the State.
   * @param context Action context.
   */
  clearTestResult(context) {
    context.commit("clearHistory");
    context.commit("clearCheckedOperations");
    context.commit("clearWindows");
    context.commit("clearSequenceDiagramGraphs");
    context.commit("setTestResultInfo", {
      repositoryUrl: "",
      id: "",
      name: "",
      parentTestResultId: "",
    });
    context.commit("clearTestStepIds");
  },

  /**
   * Build a sequence diagram from passed informations.
   * @param context Action context.
   * @param payload.testResultId Test result id.
   * @param payload.viewOption View option.
   * @param payload.callback The callback when the sequence diagram has operated.
   */
  async buildSequenceDiagramGraph(
    context,
    payload: {
      sequenceView: SequenceView;
      callback: SequenceDiagramGraphCallback;
    }
  ) {
    const createSequenceDiagramGraphExtender = (
      args: SequenceDiagramGraphExtenderSource
    ) => {
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
          onClickNote: (index: number) =>
            payload.callback.onClickNote(args.notes[index]),
          onRightClickNote: (
            index: number,
            eventInfo: { clientX: number; clientY: number }
          ) => {
            payload.callback.onRightClickNote(args.notes[index], eventInfo);
          },
          onRightClickLoopArea: (
            index: number,
            eventInfo: { clientX: number; clientY: number }
          ) => {
            // on click 'Window' loop area.
          },
        },
        tooltipTextsOfNote: args.notes.map((noteInfo) => noteInfo.details),
        tooltipTextsOfLoopArea: [],
        nameMap: new Map(args.screens.map(({ name }, index) => [index, name])),
      });
    };

    const graphs = (
      await convertToSequenceDiagramGraphs(
        payload.sequenceView,
        createSequenceDiagramGraphExtender
      )
    ).map(({ sequence, testPurpose, graph, disabledNodeIndexes }) => {
      const svgElement = (() => {
        const element = document.createElement("div");
        element.innerHTML = new MermaidGraphConverter().toSVG(
          "sequenceDiagram",
          graph.graphText
        );
        return element.firstElementChild!;
      })();

      graph.graphExtender.extendGraph(svgElement, disabledNodeIndexes);

      return { sequence, testPurpose, element: svgElement };
    });

    context.commit("setSequenceDiagramGraphs", { graphs: graphs.flat() });
  },

  /**
   * Build a screen transition diagram from passed informations.
   * @param context Action context.
   * @param payload.graphView Graph view.
   * @param payload.callback The callback when the screen transition diagram has operated.
   */
  async buildScreenTransitionDiagramGraph(
    context,
    payload: {
      graphView: GraphView;
      callback: FlowChartGraphCallback;
    }
  ) {
    const createFlowChartGraphExtender = ({
      edges,
      screens,
    }: FlowChartGraphExtenderSource) => {
      return new FlowChartGraphExtender({
        callback: {
          onClickEdge: (index: number) => {
            const edge = edges.at(index);

            if (!edge) {
              return;
            }

            const inputValueTable = new InputValueTable(edge.details);
            const imageFileUrl = edge.trigger?.imageFileUrl ?? "";

            payload.callback.onClickEdge(imageFileUrl, inputValueTable);
          },
          onClickScreenRect: (index: number) => {
            const screenId = screens.at(index)?.id;

            if (!screenId) {
              return;
            }

            const inputValueTable = new InputValueTable(
              screens.find(({ id }) => id === screenId)?.details ?? []
            );
            const imageFileUrl = screens[index].imageFileUrl;

            payload.callback.onClickScreenRect(imageFileUrl, inputValueTable);
          },
        },
        nameMap: new Map(screens.map(({ name, id }) => [id, name])),
      });
    };

    const graph = (
      await convertToScreenTransitionDiagramGraph(
        payload.graphView,
        createFlowChartGraphExtender
      )
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

    context.commit("setScreenTransitionDiagramGraph", {
      graph: svgElement,
    });
  },

  /**
   * Build element coverages from passed informations.
   * @param context Action context.
   * @param payload.graphView Graph view.
   */
  async buildElementCoverages(
    context,
    payload: {
      graphView: GraphView;
    }
  ) {
    const inclusionTags =
      context.rootState.projectSettings.config.coverage?.include?.tags ?? [];

    const coverages = Coverage.getCoverages(payload.graphView, inclusionTags);

    context.commit("setElementCoverages", { coverages });
  },

  /**
   * Update models from sequence view.
   * @param context Action context.
   * @param payload.testResultId Test result id.
   */
  async updateModelsFromSequenceView(
    context,
    payload: { testResultId: string }
  ) {
    try {
      context.commit("setTestResultViewModelUpdating", {
        isTestResultViewModelUpdating: true,
      });
      context.commit("clearSequenceDiagramGraphs");

      const screenDefinitionConfig =
        context.rootState.projectSettings.config.screenDefinition;
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
                      value: condition.word,
                    };
                  }),
              };
            }),
        },
      };

      const selectOperation = (sequence: number) => {
        context.dispatch("selectOperation", { sequence });
      };

      const sequenceView = await (async () => {
        if (Vue.prototype.$sequenceView) {
          return Vue.prototype.$sequenceView as SequenceView;
        }

        const testResult =
          context.rootState.repositoryService.createTestResultAccessor(
            payload.testResultId
          );

        const generateSequenceViewResult =
          await testResult.generateSequenceView(viewOption);

        if (generateSequenceViewResult.isFailure()) {
          return;
        }

        return generateSequenceViewResult.data;
      })();

      if (!sequenceView) {
        throw new Error(
          context.rootGetters.message(
            "error.operation_history.generate_sequence_view_failed"
          )
        );
      }

      await context.dispatch("buildSequenceDiagramGraph", {
        sequenceView,
        callback: {
          onClickActivationBox: (sequences: number[]) => {
            const firstSequence = sequences.at(0);

            if (!firstSequence) {
              return;
            }

            selectOperation(firstSequence);
          },
          onClickEdge: (sequences: number[]) => {
            const lastSequence = sequences.at(-1);

            if (lastSequence === undefined) {
              return;
            }

            selectOperation(lastSequence);
          },
          onClickScreenRect: selectOperation,
          onClickNote: (note: {
            id: number;
            sequence: number;
            type: string;
          }) => {
            if (!!note && (note.type === "notice" || note.type === "bug")) {
              selectOperation(note.sequence);
            }
          },
          onRightClickNote: context.state.openNoteMenu,
          onRightClickLoopArea: context.state.openNoteMenu,
        },
      });
    } finally {
      context.commit("setTestResultViewModelUpdating", {
        isTestResultViewModelUpdating: false,
      });
    }
  },

  /**
   * Update models from graph view.
   * @param context Action context.
   * @param payload.testResultIds Test result ids.
   */
  async updateModelsFromGraphView(
    context,
    payload: {
      testResultIds: string[];
    }
  ) {
    try {
      context.commit("setTestResultViewModelUpdating", {
        isTestResultViewModelUpdating: true,
      });

      context.commit("clearScreenTransitionDiagramGraph");
      context.commit("clearElementCoverages");

      const screenDefinitionConfig =
        context.rootState.projectSettings.config.screenDefinition;
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
                      value: condition.word,
                    };
                  }),
              };
            }),
        },
      };

      const setScreenshotUrl = (imageFileUrl: string) => {
        context.dispatch("changeScreenshot", { imageFileUrl });
      };

      const graphView = await (async () => {
        if (Vue.prototype.$graphView) {
          return Vue.prototype.$graphView as GraphView;
        }

        const generateGraphViewResult =
          await context.rootState.repositoryService.testResultRepository.generateGraphView(
            payload.testResultIds,
            viewOption
          );

        if (generateGraphViewResult.isFailure()) {
          return;
        }

        return generateGraphViewResult.data;
      })();

      if (!graphView) {
        throw new Error(
          context.rootGetters.message(
            "error.operation_history.generate_graph_view_failed"
          )
        );
      }

      await context.dispatch("buildScreenTransitionDiagramGraph", {
        graphView,
        callback: {
          onClickEdge: (
            imageFileUrl: string,
            inputValueTable: InputValueTable
          ) => {
            setScreenshotUrl(imageFileUrl);
            context.commit("setInputValueTable", { inputValueTable });
          },
          onClickScreenRect: (
            imageFileUrl: string,
            inputValueTable: InputValueTable
          ) => {
            setScreenshotUrl(imageFileUrl);
            context.commit("setInputValueTable", { inputValueTable });
          },
        },
      });

      await context.dispatch("buildElementCoverages", { graphView });
    } finally {
      context.commit("setTestResultViewModelUpdating", {
        isTestResultViewModelUpdating: false,
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
        testScript: { isSimple: boolean; useMultiLocator: boolean };
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
    ).generateFromTestResult(
      context.state.testResultInfo.id,
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
   * Create an empty test result in the repository.
   * @param context Action context.
   * @param payload.initialUrl Initial URL.
   * @param payload.name Test result name.
   */
  async createTestResult(
    context,
    payload: { initialUrl: string; name: string; parentTestResultId?: string }
  ) {
    const initialUrl = payload.initialUrl ? payload.initialUrl : undefined;
    const name = payload.name ? payload.name : undefined;
    const parentTestResultId = payload.parentTestResultId
      ? payload.parentTestResultId
      : undefined;
    const result =
      await context.rootState.repositoryService.createEmptyTestResult({
        initialUrl,
        name,
        parentTestResultId,
      });

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          "error.operation_history.create_test_result_failed"
        )
      );
    }

    const testResultInfo = result.data;

    context.commit("setTestResultInfo", {
      repositoryUrl: context.rootState.repositoryService.serviceUrl,
      id: testResultInfo.id,
      name: testResultInfo.name,
      parentTestResultId: payload.parentTestResultId ?? "",
    });
  },

  /**
   * Get test results from the repository.
   * @param context Action context.
   * @returns Test results.
   */
  async getTestResults(context) {
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
      context.rootState.repositoryService
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

  async getScreenshots(context, payload: { testResultId: string }) {
    const result =
      await context.rootState.repositoryService.screenshotRepository.getScreenshots(
        payload.testResultId
      );

    if (result.isFailure()) {
      return "";
    }

    return result.data.url;
  },

  async updateAutofillConditionGroup(
    context,
    payload: { conditionGroup: Partial<AutofillConditionGroup>; index: number }
  ) {
    const autofillSetting = {
      ...context.rootState.projectSettings.config.autofillSetting,
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
              ...payload.conditionGroup,
            },
          ]
        : context.rootState.projectSettings.config.autofillSetting.conditionGroups.map(
            (group, index) => {
              return index !== payload.index
                ? group
                : { ...group, ...payload.conditionGroup };
            }
          );
    await context.dispatch(
      "writeConfig",
      {
        config: {
          autofillSetting,
        },
      },
      { root: true }
    );
  },

  async registerAutoOperation(
    context,
    payload: {
      settingName: string;
      settingDetails?: string;
      operations: AutoOperation[];
    }
  ) {
    const conditionGroup = {
      isEnabled: true,
      settingName: payload.settingName,
      details: payload.settingDetails,
      autoOperations: payload.operations,
    };
    const autoOperationSetting = {
      ...context.rootState.projectSettings.config.autoOperationSetting,
    };
    autoOperationSetting.conditionGroups.push(conditionGroup);

    await context.dispatch(
      "writeConfig",
      {
        config: {
          autoOperationSetting,
        },
      },
      { root: true }
    );
  },

  async getSessionIds(context) {
    if (!context.state.testResultInfo.id) {
      return;
    }

    const result = await new GetSessionIdsAction(
      context.rootState.repositoryService
    ).getSessionIds(context.state.testResultInfo.id);

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

  async compareTestResults(
    context,
    payload: {
      actualTestResultId: string;
      expectedTestResultId: string;
    }
  ): Promise<TestResultComparisonResult> {
    const config =
      context.rootState.projectSettings.config.testResultComparison;
    const repository =
      context.rootState.repositoryService.testResultComparisonRepository;

    const result = await repository.compareTestResults(
      payload.actualTestResultId,
      payload.expectedTestResultId,
      {
        excludeItems: config.excludeItems.isEnabled
          ? config.excludeItems.values
          : undefined,
        excludeElements: config.excludeElements.isEnabled
          ? config.excludeElements.values
          : undefined,
      }
    );

    if (result.isFailure()) {
      throw new Error(
        context.rootGetters.message(
          `error.operation_history.${result.error.code}`
        )
      );
    }

    return result.data;
  },

  selectOperation(context, payload: { sequence: number }) {
    context.commit("selectOperation", { sequence: payload.sequence });
    context.commit("clearDisplayedScreenshotUrl");
  },

  changeScreenshot(context, payload: { imageFileUrl: string }) {
    context.commit("selectOperation", { sequence: 0 });
    context.commit("setDisplayedScreenshotUrl", {
      imageFileUrl: `${context.rootState.repositoryService.serviceUrl}/${payload.imageFileUrl}`,
    });
  },
};

export default actions;
