import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuetify from "vuetify";
import CoverageSetting from "@/vue/pages/operationHistory/organisms/configViewer/CoverageSetting.vue";
import Vuex from "vuex";
import mutations from "@/store/operationHistory/mutations";
const localVue = createLocalVue();
localVue.use(Vuetify);
localVue.use(Vuex);

describe("CoverageSettingコンポーネントは", () => {
  let store: any;

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        message: () => {
          return (message: string) => {
            return message;
          };
        },
      },
      modules: {
        operationHistory: {
          namespaced: true,
          mutations,
          state: {
            config: {
              screenDefinition: {
                screenDefType: "",
                isRegex: false,
                screenDefList: [],
              },
              coverage: {
                include: {
                  tags: [],
                },
              },
            },
            displayInclusionList: ["A"],
            defaultTagList: [],
          },
        },
      },
    });
  });

  describe("checkBoxListのgetterが呼ばれた時", () => {
    it("coverage計算に含めるタグ一覧をstringの配列で返す", () => {
      store.commit("operationHistory/setCoverage", {
        coverage: { include: { tags: ["DIV"] } },
      });

      const vm = shallowMount(CoverageSetting, { localVue, store }).vm as any;

      expect(vm.checkBoxList).toEqual(["DIV"]);
    });
  });

  describe("tagListのgetterが呼ばれた時", () => {
    it("表示タグ一覧をstringの配列を昇順で返す", () => {
      store.commit("operationHistory/setDisplayInclusionList", {
        displayInclusionList: ["SPAN", "A", "DIV"],
      });
      store.commit("operationHistory/setCoverage", {
        coverage: { include: { tags: ["DIV"] } },
      });

      const vm = shallowMount(CoverageSetting, {
        localVue,
        store,
        propsData: {
          opened: true,
        },
      }).vm as any;
      vm.changeOpened(true);
      expect(vm.tagList).toEqual(["DIV", "A", "SPAN"]);

      expect(vm.inclusionTagMap.get("A")).toEqual(false);
      expect(vm.inclusionTagMap.get("DIV")).toEqual(true);
    });
  });
});
