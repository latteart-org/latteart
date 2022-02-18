import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import {
  operationHistory,
  OperationHistoryState,
} from "@/store/operationHistory";
import { ScreenDefType } from "@/lib/common/enum/SettingsEnum";
import ScreenHistory from "@/lib/operationHistory/ScreenHistory";
import InputValueTable from "@/lib/operationHistory/InputValueTable";

describe("operationHistoryストアのmutationsは", () => {
  let localVue;

  let store: any;
  let state: OperationHistoryState;

  beforeEach(() => {
    localVue = createLocalVue();
    localVue.use(Vuex);
  });

  beforeEach(() => {
    state = {
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
      openNoteEditDialog: () => {
        /* 何もしない */
      },
      deleteNote: () => {
        /* 何もしない */
      },
      openNoteMenu: () => {
        /* 何もしない */
      },
    };
    store = new Vuex.Store({
      modules: {
        operationHistory: {
          namespaced: true,
          actions: operationHistory.actions,
          // mutations: operationHistory.mutations,
          // getters: operationHistory.getters,
          state,
        },
      },
    });
  });

  it("addScreenDefが呼ばれたとき、指定の画面定義を追加する", () => {
    // state.config.screenDefinition.screenDefList = [];
    // expect(state.config.screenDefinition.screenDefList).toEqual([]);
    // store.commit('operationHistory/addScreenDef', { screenDef: { definition: 'definition0', alias: 'alias0' } });
    // expect(state.config.screenDefinition.screenDefList).toEqual([
    //   { definition: 'definition0', alias: 'alias0' },
    // ]);
    // store.commit('operationHistory/addScreenDef', { screenDef: { definition: 'definition1', alias: 'alias1' } });
    // expect(state.config.screenDefinition.screenDefList).toEqual([
    //   { definition: 'definition1', alias: 'alias1' },
    //   { definition: 'definition0', alias: 'alias0' },
    // ]);
  });

  // it('deleteScreenDefが呼ばれたとき、指定の通番の画面定義を削除する', () => {

  //   state.config.screenDefinition.screenDefList = [
  //     { definition: 'definition0', alias: 'alias0' },
  //     { definition: 'definition1', alias: 'alias1' },
  //     { definition: 'definition2', alias: 'alias2' },
  //   ];

  //   expect(state.config.screenDefinition.screenDefList).toEqual([
  //     { definition: 'definition0', alias: 'alias0' },
  //     { definition: 'definition1', alias: 'alias1' },
  //     { definition: 'definition2', alias: 'alias2' },
  //   ]);

  //   store.commit('operationHistory/deleteScreenDef', { index: 1 });

  //   expect(state.config.screenDefinition.screenDefList).toEqual([
  //     { definition: 'definition0', alias: 'alias0' },
  //     { definition: 'definition2', alias: 'alias2' },
  //   ]);

  //   store.commit('operationHistory/deleteScreenDef', { index: 0 });

  //   expect(state.config.screenDefinition.screenDefList).toEqual([
  //     { definition: 'definition2', alias: 'alias2' },
  //   ]);

  //   store.commit('operationHistory/deleteScreenDef', { index: 0 });

  //   expect(state.config.screenDefinition.screenDefList).toEqual([]);
  // });

  // it('changeScreenDefOrderが呼ばれたとき、画面定義の指定の通番の内容を入れ替える', () => {

  //   state.config.screenDefinition.screenDefList = [
  //     { definition: 'definition0', alias: 'alias0' },
  //     { definition: 'definition1', alias: 'alias1' },
  //     { definition: 'definition2', alias: 'alias2' },
  //   ];

  //   expect(state.config.screenDefinition.screenDefList).toEqual([
  //     { definition: 'definition0', alias: 'alias0' },
  //     { definition: 'definition1', alias: 'alias1' },
  //     { definition: 'definition2', alias: 'alias2' },
  //   ]);

  //   store.commit('operationHistory/changeScreenDefOrder', { from: 0, to: 1 });

  //   expect(state.config.screenDefinition.screenDefList).toEqual([
  //     { definition: 'definition1', alias: 'alias1' },
  //     { definition: 'definition0', alias: 'alias0' },
  //     { definition: 'definition2', alias: 'alias2' },
  //   ]);

  //   store.commit('operationHistory/changeScreenDefOrder', { from: 2, to: 0 });

  //   expect(state.config.screenDefinition.screenDefList).toEqual([
  //     { definition: 'definition2', alias: 'alias2' },
  //     { definition: 'definition0', alias: 'alias0' },
  //     { definition: 'definition1', alias: 'alias1' },
  //   ]);
  // });
});
