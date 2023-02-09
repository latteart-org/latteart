import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuetify from "vuetify";
import HistorySummaryDiagram from "@/components/pages/operationHistory/organisms/HistorySummaryDiagram.vue";

const localVue = createLocalVue();
localVue.use(Vuetify);

describe("HistorySummaryDiagramコンポーネントは", () => {
  describe("シーケンス図と画面遷移図を表示する", () => {
    it('propで渡されるdiagramTypeが"sequence"の場合はシーケンス図のみを表示する。', () => {
      const wrapper = shallowMount(HistorySummaryDiagram, {
        localVue,
        propsData: {
          diagramType: "sequence",
        },
      });

      expect(wrapper.contains("sequence-diagram-stub")).toBeTruthy();
      expect(wrapper.contains("screen-transition-diagram-stub")).toBeFalsy();
    });

    it('propで渡されるdiagramTypeが"screenTransition"の場合は画面遷移図のみを表示する。', () => {
      const wrapper = shallowMount(HistorySummaryDiagram, {
        localVue,
        propsData: {
          diagramType: "screenTransition",
        },
      });

      expect(wrapper.contains("sequence-diagram-stub")).toBeFalsy();
      expect(wrapper.contains("screen-transition-diagram-stub")).toBeTruthy();
    });
  });
});
