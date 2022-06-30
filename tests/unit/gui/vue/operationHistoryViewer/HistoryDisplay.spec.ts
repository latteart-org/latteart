import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuetify from "vuetify";
import HistoryDisplay from "@/vue/pages/operationHistory/organisms/HistoryDisplay.vue";
import Vuex from "vuex";
import store from "@/store";

const localVue = createLocalVue();
localVue.use(Vuetify);

describe("HistoryDisplayコンポーネントは", () => {
  let storeData: any;

  const messageProvider = () => {
    return (message: string) => {
      return message;
    };
  };

  let screenDefinitionConfig: any;

  beforeEach(() => {
    storeData = new Vuex.Store(store);

    screenDefinitionConfig = {
      screenDefType: "title",
      isRegex: false,
      screenDefList: [
        { definition: "aa1", alias: "aa2" },
        { definition: "bb1", alias: "bb2" },
        { definition: "cc1", alias: "cc2" },
      ],
    };
  });

  it("履歴概要を図で表示する", () => {
    const wrapper = shallowMount(HistoryDisplay, {
      localVue,
      store: storeData,
      propsData: {
        message: messageProvider,
        screenDefinitionConfig,
      },
    });

    expect(wrapper.contains("history-summary-diagram-stub")).toBeTruthy();
  });

  describe.skip("選択中の図表種別に応じて履歴詳細を表示する", () => {
    it('選択中の図表種別が"sequence"の場合は、操作一覧のみを表示する', () => {
      const wrapper = shallowMount(HistoryDisplay, {
        localVue,
        store: storeData,
        propsData: {
          message: messageProvider,
          screenDefinitionConfig,
        },
      });

      (wrapper.vm as any).diagramType = "sequence";

      expect(wrapper.contains("operation-list-stub")).toBeTruthy();
      expect(wrapper.contains("decision-table-stub")).toBeFalsy();
    });

    it('選択中の図表種別が"screenTransition"の場合は、デシジョンテーブルのみを表示する', () => {
      const wrapper = shallowMount(HistoryDisplay, {
        localVue,
        store: storeData,
        propsData: {
          message: messageProvider,
          screenDefinitionConfig,
        },
        stubs: {
          "operation-list": true,
          "decision-table": true,
        },
      });

      (wrapper.vm as any).diagramType = "screenTransition";

      expect(wrapper.contains("operation-list-stub")).toBeFalsy();
      expect(wrapper.contains("decision-table-stub")).toBeTruthy();
    });
  });
});
