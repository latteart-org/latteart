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
          context.rootState.projectSettings.config.imageCompression.isEnabled,
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
  async loadHistory(context, payload: { testResultIds: string[] }) {
    context.commit(
      "captureControl/setIsResuming",
      { isResuming: true },
      { root: true }
    );

    const testResultIds = payload.testResultIds;

    const results = await Promise.all(
      testResultIds.map(async (testResultId) => {
        const result = await new LoadHistoryAction(
          context.rootState.repositoryService
        ).loadHistory(testResultId);
        if (result.isFailure()) {
          throw new Error(
            context.rootGetters.message(
              result.error.messageKey,
              result.error.variables
            )
          );
        }
        return result;
      })
    );

    await context.dispatch("resetHistory");

    results.forEach((result) => {
      result.data.testStepIds.forEach((testStepId) => {
        context.commit("addTestStepId", { testStepId });
      });
    });

    const coverageSources = results
      .map((result) => result.data.coverageSources)
      .flat();
    context.commit("resetAllCoverageSources", {
      coverageSources,
    });

    const currentTestResult = results[0].data;

    context.commit("resetHistory", {
      historyItems: currentTestResult.historyItems,
    });
    context.commit(
      "captureControl/setUrl",
      { url: currentTestResult.url },
      { root: true }
    );
    context.commit("setTestResultInfo", {
      repositoryUrl: context.rootState.repositoryService.serviceUrl,
      id: currentTestResult.testResultInfo.id,
      name: currentTestResult.testResultInfo.name,
      parentTestResultId:
        currentTestResult.testResultInfo.parentTestResultId ?? "",
    });
    context.commit("setStoringTestResultInfos", {
      testResultInfos: results.map((result) => {
        return {
          id: result.data.testResultInfo.id,
          name: result.data.testResultInfo.name,
          historyItems: result.data.historyItems,
        };
      }),
    });
    context.commit(
      "operationHistory/setWindows",
      {
        windowHandles: extractWindowHandles(context.state.history),
      },
      { root: true }
    );
    await context.dispatch("updateTestResultViewModel");

    context.dispatch(
      "captureControl/resetTimer",
      { millis: currentTestResult.testingTime },
      { root: true }
    );

    context.commit(
      "captureControl/setIsResuming",
      { isResuming: false },
      { root: true }
    );
  },

  /**
   * Change test result info.
   * @param context Action context.
   * @param payload.testResultId Test result id.
   */
  changeTestResultInfo(context, payload: { testResultId: string }) {
    const testResult = context.state.storingTestResultInfos.find(
      (testResult) => testResult.id === payload.testResultId
    );
    if (!testResult) {
      return;
    }
    console.log({ testResult });
    context.commit("setTestResultInfo", {
      repositoryUrl: context.rootState.repositoryService.serviceUrl,
      id: testResult.id,
      name: testResult.name,
      parentTestResultId: "",
    });
    context.commit("resetHistory", {
      historyItems: testResult.historyItems,
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
   * Empty history in the State.
   * @param context Action context.
   */
  resetHistory(context) {
    context.commit("clearHistory");
    context.commit("clearCheckedOperations");
    context.commit("clearWindows");
    context.commit("clearAllCoverageSources");
    context.commit("clearModels");
    context.commit("selectWindow", { windowHandle: "" });
    context.commit("clearInputValueTable");
    context.commit("setTestResultInfo", {
      repositoryUrl: "",
      id: "",
      name: "",
      parentTestResultId: "",
    });
    context.commit("setStoringTestResultInfos", { testResultInfos: [] });
    context.commit("clearTestStepIds");
  },

  /**
   * Build a sequence diagram from passed informations.
   * @param context Action context.
   * @param payload.view Sequence View model.
   * @param payload.callback The callback when the sequence diagram has operated.
   */
  async buildSequenceDiagramGraph(
    context,
    payload: {
      viewOption: TestResultViewOption;
      callback: SequenceDiagramGraphCallback;
    }
  ) {
    let sequenceViews: SequenceView[];
    if (Vue.prototype.$sequenceView) {
      sequenceViews = [Vue.prototype.$sequenceView];
    } else {
      const testResults = context.state.storingTestResultInfos.map(
        (testResultInfo) => {
          return context.rootState.repositoryService.createTestResultAccessor(
            testResultInfo.id
          );
        }
      );
      const results = await Promise.all(
        testResults.map(async (testResult) => {
          const result = await testResult.generateSequenceView(
            payload.viewOption
          );
          if (result.isFailure()) {
            throw new Error();
          }
          return {
            ...result.data,
            testResultId: (testResult as any).testResultId,
          };
        })
      );

      sequenceViews = results;
    }

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

    const graphs = await Promise.all(
      sequenceViews.map(async (sequenceView) => {
        return (
          await convertToSequenceDiagramGraphs(
            sequenceView,
            createSequenceDiagramGraphExtender
          )
        ).map(({ sequence, testPurpose, graph }) => {
          const svgElement = (() => {
            const element = document.createElement("div");
            element.innerHTML = new MermaidGraphConverter().toSVG(
              "sequenceDiagram",
              graph.graphText
            );
            return element.firstElementChild!;
          })();

          const disabledList = sequenceView.scenarios
            .flatMap(({ nodes }) => nodes)
            .map((node, index) => {
              return {
                index,
                disabled: node.disabled ?? false,
              };
            })
            .filter((item) => item.disabled);

          graph.graphExtender.extendGraph(svgElement, disabledList);

          return {
            testResultId: sequenceView.testResultId,
            sequence,
            testPurpose,
            element: svgElement,
          };
        });
      })
    );

    context.commit("setSequenceDiagramGraphs", { graphs: graphs.flat() });
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
      viewOption: TestResultViewOption;
      callback: FlowChartGraphCallback;
    }
  ) {
    const windowHandles = context.state.windows.map(({ value }) => value);

    let graphView: GraphView;
    if (Vue.prototype.$graphView) {
      graphView = Vue.prototype.$graphView;
    } else {
      const result =
        context.state.storingTestResultInfos.length > 1
          ? await context.rootState.repositoryService
              .createTestResultAccessor("")
              .mergeGraphView(
                context.state.storingTestResultInfos.map(
                  (testResultInfo) => testResultInfo.id
                ),
                payload.viewOption
              )
          : await context.rootState.repositoryService
              .createTestResultAccessor(context.state.testResultInfo.id)
              .generateGraphView(payload.viewOption);
      if (result.isFailure()) {
        return;
      }
      graphView = result.data;
    }

    const createFlowChartGraphExtender = ({
      edges,
      source,
    }: FlowChartGraphExtenderSource) => {
      return new FlowChartGraphExtender({
        callback: {
          onClickEdge: (index: number) => {
            const edge = edges.at(index);

            if (!edge) {
              return;
            }

            const inputValueTable = new InputValueTable(edge.details);
            const sequence = edge.trigger?.sequence ?? 0;

            payload.callback.onClickEdge(sequence, inputValueTable);
          },
          onClickScreenRect: (index: number) => {
            const inputValueTable = new InputValueTable(
              edges
                .filter(({ sourceScreenId }) => {
                  return sourceScreenId === source.screens.at(index)?.id;
                })
                .flatMap(({ details }) => details)
            );
            const sequence = source.screens[index].sequence;

            payload.callback.onClickScreenRect(sequence, inputValueTable);
          },
        },
        nameMap: new Map(
          source.screens.map(({ name }, index) => [index, name])
        ),
      });
    };

    const graph = (
      await convertToScreenTransitionDiagramGraph(
        graphView,
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
   * @param payload.screenHistory Screen history.
   * @param payload.inclusionTags Inclusion tags settings for screen element coverage.
   */
  async buildElementCoverages(
    context,
    payload: { viewOption: TestResultViewOption }
  ) {
    let graphView: GraphView;
    if (Vue.prototype.$graphView) {
      graphView = Vue.prototype.$graphView;
    } else {
      const result =
        context.state.storingTestResultInfos.length > 1
          ? await context.rootState.repositoryService
              .createTestResultAccessor("")
              .mergeGraphView(
                context.state.storingTestResultInfos.map(
                  (testResultInfo) => testResultInfo.id
                ),
                payload.viewOption
              )
          : await context.rootState.repositoryService
              .createTestResultAccessor(context.state.testResultInfo.id)
              .generateGraphView(payload.viewOption);
      if (result.isFailure()) {
        return;
      }
      graphView = result.data;
    }

    const inclusionTags =
      context.rootState.projectSettings.config.coverage?.include?.tags ?? [];

    const coverages = Coverage.getCoverages(graphView, inclusionTags);

    context.commit("setElementCoverages", { coverages });
  },

  /**
   * Update test result view model.
   * @param context Action context.
   */
  async updateTestResultViewModel(context) {
    try {
      context.commit("setTestResultViewModelUpdating", {
        isTestResultViewModelUpdating: true,
      });

      context.commit("clearModels");

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
        context.commit("selectOperation", { sequence });
      };

      await context.dispatch("buildSequenceDiagramGraph", {
        viewOption,
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

      await context.dispatch("buildScreenTransitionDiagramGraph", {
        viewOption,
        callback: {
          onClickEdge: (sequence: number, inputValueTable: InputValueTable) => {
            selectOperation(sequence);
            context.commit("setInputValueTable", { inputValueTable });
          },
          onClickScreenRect: (
            sequence: number,
            inputValueTable: InputValueTable
          ) => {
            selectOperation(sequence);
            context.commit("setInputValueTable", { inputValueTable });
          },
        },
      });

      await context.dispatch("buildElementCoverages", {
        viewOption,
      });
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
        testScript: { isSimple: boolean };
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
};

export default actions;
