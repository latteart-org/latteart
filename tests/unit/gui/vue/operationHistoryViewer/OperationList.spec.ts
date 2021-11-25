import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuetify from "vuetify";
import SequenceDiagram from "@/vue/pages/operationHistory/organisms/OperationList.vue";
import { OperationHistory, ElementInfo } from "@/lib/operationHistory/types";
import { Operation } from "@/lib/operationHistory/Operation";
import { OperationWithNotes } from "@/lib/operationHistory/types";

const localVue = createLocalVue();
localVue.use(Vuetify);

describe("OperationListコンポーネントは", () => {
  const messageProvider = () => {
    return (message: string) => {
      return message;
    };
  };

  const operationHistory = [
    {
      operation: new Operation(
        1,
        "input1",
        "type1",
        null,
        "title1",
        "url1",
        "screenDef1",
        ""
      ),
      intention: null,
      bugs: null,
      notices: null,
    },
    {
      operation: new Operation(
        2,
        "input2",
        "type2",
        null,
        "title2",
        "url2",
        "screenDef2",
        ""
      ),
      intention: null,
      bugs: null,
      notices: null,
    },
    {
      operation: new Operation(
        3,
        "input3",
        "type3",
        null,
        "title3",
        "url3",
        "screenDef3",
        ""
      ),
      intention: null,
      bugs: null,
      notices: null,
    },
  ] as OperationHistory;

  it.skip("displayedOperationsが変わったらテーブルを1ページ目に戻す", () => {
    const wrapper = shallowMount(SequenceDiagram, {
      localVue,
      propsData: {
        message: messageProvider,
        history: operationHistory,
        displayedOperations: [1, 2, 3],
      },
    }).vm as any;

    wrapper.pagination.page = 2;

    expect(wrapper.pagination.page).toEqual(2);

    wrapper.displayedOperations = [3];

    expect(wrapper.pagination.page).toEqual(1);
  });

  it("フィルタリセットしたら上位コンポーネントにその旨を通知する", () => {
    const wrapper = shallowMount(SequenceDiagram, {
      localVue,
      propsData: {
        message: messageProvider,
        history: operationHistory,
        onResetFilter: jest.fn(),
      },
    }).vm as any;

    wrapper.resetFilter();

    expect(wrapper.onResetFilter).toHaveBeenCalled();
  });

  describe("検索ワードが入力されると、入力された検索ワードを含む操作のみにフィルタする", () => {
    const wrapper = shallowMount(SequenceDiagram, {
      localVue,
      propsData: {
        message: messageProvider,
      },
    }).vm as any;
    let testHistory: OperationHistory;
    let testHistoryItem1: OperationWithNotes;
    let testHistoryItem2: OperationWithNotes;

    beforeEach(() => {
      testHistoryItem1 = {
        operation: new Operation(1, "", "", null, "", "", "", ""),
        intention: null,
        bugs: null,
        notices: null,
      };

      testHistoryItem2 = {
        operation: new Operation(2, "", "", null, "", "", "", ""),
        intention: null,
        bugs: null,
        notices: null,
      };

      testHistory = [testHistoryItem1, testHistoryItem2];
    });

    describe("displayedOperationsが空の場合は操作履歴中のすべての操作群の中からフィルタする", () => {
      it("シーケンス番号を検索", () => {
        wrapper.search = "1";
        expect(wrapper.filterBySequence(testHistory)).toEqual([
          testHistoryItem1,
        ]);

        wrapper.search = "3";
        expect(wrapper.filterBySequence(testHistory)).toEqual([]);
      });

      it("タイトルを検索", () => {
        testHistoryItem1.operation.title = "a";
        testHistoryItem2.operation.title = "a";

        wrapper.search = "a";
        expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

        wrapper.search = "b";
        expect(wrapper.filterBySequence(testHistory)).toEqual([]);

        testHistoryItem1.operation.title = "ab";
        testHistoryItem2.operation.title = "ab";

        wrapper.search = "a";
        expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

        wrapper.search = "b";
        expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

        wrapper.search = "ab";
        expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

        wrapper.search = "abc";
        expect(wrapper.filterBySequence(testHistory)).toEqual([]);
      });

      describe("要素情報配下を検索", () => {
        let elementInfo1: ElementInfo;
        let elementInfo2: ElementInfo;

        beforeEach(() => {
          testHistoryItem1.operation.elementInfo = {
            tagname: "",
            text: "",
            xpath: "",
            attributes: {},
          };

          testHistoryItem2.operation.elementInfo = {
            tagname: "",
            text: "",
            xpath: "",
            attributes: {},
          };

          elementInfo1 = testHistoryItem1.operation.elementInfo!;
          elementInfo2 = testHistoryItem2.operation.elementInfo!;
        });

        it("要素タグを検索", () => {
          elementInfo1.tagname = "a";
          elementInfo2.tagname = "a";

          wrapper.search = "a";
          expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

          wrapper.search = "b";
          expect(wrapper.filterBySequence(testHistory)).toEqual([]);

          elementInfo1.tagname = "ab";
          elementInfo2.tagname = "ab";

          wrapper.search = "a";
          expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

          wrapper.search = "b";
          expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

          wrapper.search = "ab";
          expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

          wrapper.search = "abc";
          expect(wrapper.filterBySequence(testHistory)).toEqual([]);
        });

        it("要素名を検索", () => {
          elementInfo1.attributes.name = "a";
          elementInfo2.attributes.name = "a";

          wrapper.search = "a";
          expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

          wrapper.search = "b";
          expect(wrapper.filterBySequence(testHistory)).toEqual([]);

          elementInfo1.attributes.name = "ab";
          elementInfo2.attributes.name = "ab";

          wrapper.search = "a";
          expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

          wrapper.search = "b";
          expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

          wrapper.search = "ab";
          expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

          wrapper.search = "abc";
          expect(wrapper.filterBySequence(testHistory)).toEqual([]);
        });

        it("要素の値を検索", () => {
          elementInfo1.text = "a";
          elementInfo2.text = "a";

          wrapper.search = "a";
          expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

          wrapper.search = "b";
          expect(wrapper.filterBySequence(testHistory)).toEqual([]);

          elementInfo1.text = "ab";
          elementInfo2.text = "ab";

          wrapper.search = "a";
          expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

          wrapper.search = "b";
          expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

          wrapper.search = "ab";
          expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

          wrapper.search = "abc";
          expect(wrapper.filterBySequence(testHistory)).toEqual([]);
        });
      });

      it("イベント種別を検索", () => {
        testHistoryItem1.operation.type = "a";
        testHistoryItem2.operation.type = "a";

        wrapper.search = "a";
        expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

        wrapper.search = "b";
        expect(wrapper.filterBySequence(testHistory)).toEqual([]);

        testHistoryItem1.operation.type = "ab";
        testHistoryItem2.operation.type = "ab";

        wrapper.search = "a";
        expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

        wrapper.search = "b";
        expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

        wrapper.search = "ab";
        expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

        wrapper.search = "abc";
        expect(wrapper.filterBySequence(testHistory)).toEqual([]);
      });

      it("入力値を検索", () => {
        testHistoryItem1.operation.input = "a";
        testHistoryItem2.operation.input = "a";

        wrapper.search = "a";
        expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

        wrapper.search = "b";
        expect(wrapper.filterBySequence(testHistory)).toEqual([]);

        testHistoryItem1.operation.input = "ab";
        testHistoryItem2.operation.input = "ab";

        wrapper.search = "a";
        expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

        wrapper.search = "b";
        expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

        wrapper.search = "ab";
        expect(wrapper.filterBySequence(testHistory)).toEqual(testHistory);

        wrapper.search = "abc";
        expect(wrapper.filterBySequence(testHistory)).toEqual([]);
      });
    });

    describe("displayedOperationsが指定されている場合はdisplayedOperationsにマッチする操作群の中からフィルタする", () => {
      it("シーケンス番号を検索", () => {
        wrapper.displayedOperations = [1];

        wrapper.search = "1";
        expect(wrapper.filterBySequence(testHistory)).toEqual([
          testHistoryItem1,
        ]);

        wrapper.search = "3";
        expect(wrapper.filterBySequence(testHistory)).toEqual([]);

        wrapper.displayedOperations = [2];

        wrapper.search = "1";
        expect(wrapper.filterBySequence(testHistory)).toEqual([]);
      });

      it("タイトルを検索", () => {
        wrapper.displayedOperations = [1];

        testHistoryItem1.operation.title = "a";
        testHistoryItem2.operation.title = "a";

        wrapper.search = "a";
        expect(wrapper.filterBySequence(testHistory)).toEqual([
          testHistoryItem1,
        ]);

        wrapper.search = "b";
        expect(wrapper.filterBySequence(testHistory)).toEqual([]);

        testHistoryItem1.operation.title = "ab";
        testHistoryItem2.operation.title = "ab";

        wrapper.search = "a";
        expect(wrapper.filterBySequence(testHistory)).toEqual([
          testHistoryItem1,
        ]);

        wrapper.search = "b";
        expect(wrapper.filterBySequence(testHistory)).toEqual([
          testHistoryItem1,
        ]);

        wrapper.search = "ab";
        expect(wrapper.filterBySequence(testHistory)).toEqual([
          testHistoryItem1,
        ]);

        wrapper.search = "abc";
        expect(wrapper.filterBySequence(testHistory)).toEqual([]);
      });

      describe("要素情報配下を検索", () => {
        let elementInfo1: ElementInfo;
        let elementInfo2: ElementInfo;

        beforeEach(() => {
          testHistoryItem1.operation.elementInfo = {
            tagname: "",
            text: "",
            xpath: "",
            attributes: {},
          };

          testHistoryItem2.operation.elementInfo = {
            tagname: "",
            text: "",
            xpath: "",
            attributes: {},
          };

          elementInfo1 = testHistoryItem1.operation.elementInfo!;
          elementInfo2 = testHistoryItem2.operation.elementInfo!;
        });

        it("要素タグを検索", () => {
          wrapper.displayedOperations = [1];

          elementInfo1.tagname = "a";
          elementInfo2.tagname = "a";

          wrapper.search = "a";
          expect(wrapper.filterBySequence(testHistory)).toEqual([
            testHistoryItem1,
          ]);

          wrapper.search = "b";
          expect(wrapper.filterBySequence(testHistory)).toEqual([]);

          elementInfo1.tagname = "ab";
          elementInfo2.tagname = "ab";

          wrapper.search = "a";
          expect(wrapper.filterBySequence(testHistory)).toEqual([
            testHistoryItem1,
          ]);

          wrapper.search = "b";
          expect(wrapper.filterBySequence(testHistory)).toEqual([
            testHistoryItem1,
          ]);

          wrapper.search = "ab";
          expect(wrapper.filterBySequence(testHistory)).toEqual([
            testHistoryItem1,
          ]);

          wrapper.search = "abc";
          expect(wrapper.filterBySequence(testHistory)).toEqual([]);
        });

        it("要素名を検索", () => {
          wrapper.displayedOperations = [1];

          elementInfo1.attributes.name = "a";
          elementInfo2.attributes.name = "a";

          wrapper.search = "a";
          expect(wrapper.filterBySequence(testHistory)).toEqual([
            testHistoryItem1,
          ]);

          wrapper.search = "b";
          expect(wrapper.filterBySequence(testHistory)).toEqual([]);

          elementInfo1.attributes.name = "ab";
          elementInfo2.attributes.name = "ab";

          wrapper.search = "a";
          expect(wrapper.filterBySequence(testHistory)).toEqual([
            testHistoryItem1,
          ]);

          wrapper.search = "b";
          expect(wrapper.filterBySequence(testHistory)).toEqual([
            testHistoryItem1,
          ]);

          wrapper.search = "ab";
          expect(wrapper.filterBySequence(testHistory)).toEqual([
            testHistoryItem1,
          ]);

          wrapper.search = "abc";
          expect(wrapper.filterBySequence(testHistory)).toEqual([]);
        });

        it("要素の値を検索", () => {
          wrapper.displayedOperations = [1];

          elementInfo1.text = "a";
          elementInfo2.text = "a";

          wrapper.search = "a";
          expect(wrapper.filterBySequence(testHistory)).toEqual([
            testHistoryItem1,
          ]);

          wrapper.search = "b";
          expect(wrapper.filterBySequence(testHistory)).toEqual([]);

          elementInfo1.text = "ab";
          elementInfo2.text = "ab";

          wrapper.search = "a";
          expect(wrapper.filterBySequence(testHistory)).toEqual([
            testHistoryItem1,
          ]);

          wrapper.search = "b";
          expect(wrapper.filterBySequence(testHistory)).toEqual([
            testHistoryItem1,
          ]);

          wrapper.search = "ab";
          expect(wrapper.filterBySequence(testHistory)).toEqual([
            testHistoryItem1,
          ]);

          wrapper.search = "abc";
          expect(wrapper.filterBySequence(testHistory)).toEqual([]);
        });
      });

      it("イベント種別を検索", () => {
        wrapper.displayedOperations = [1];

        testHistoryItem1.operation.type = "a";
        testHistoryItem2.operation.type = "a";

        wrapper.search = "a";
        expect(wrapper.filterBySequence(testHistory)).toEqual([
          testHistoryItem1,
        ]);

        wrapper.search = "b";
        expect(wrapper.filterBySequence(testHistory)).toEqual([]);

        testHistoryItem1.operation.type = "ab";
        testHistoryItem2.operation.type = "ab";

        wrapper.search = "a";
        expect(wrapper.filterBySequence(testHistory)).toEqual([
          testHistoryItem1,
        ]);

        wrapper.search = "b";
        expect(wrapper.filterBySequence(testHistory)).toEqual([
          testHistoryItem1,
        ]);

        wrapper.search = "ab";
        expect(wrapper.filterBySequence(testHistory)).toEqual([
          testHistoryItem1,
        ]);

        wrapper.search = "abc";
        expect(wrapper.filterBySequence(testHistory)).toEqual([]);
      });

      it("入力値を検索", () => {
        wrapper.displayedOperations = [1];

        testHistoryItem1.operation.input = "a";
        testHistoryItem2.operation.input = "a";

        wrapper.search = "a";
        expect(wrapper.filterBySequence(testHistory)).toEqual([
          testHistoryItem1,
        ]);

        wrapper.search = "b";
        expect(wrapper.filterBySequence(testHistory)).toEqual([]);

        testHistoryItem1.operation.input = "ab";
        testHistoryItem2.operation.input = "ab";

        wrapper.search = "a";
        expect(wrapper.filterBySequence(testHistory)).toEqual([
          testHistoryItem1,
        ]);

        wrapper.search = "b";
        expect(wrapper.filterBySequence(testHistory)).toEqual([
          testHistoryItem1,
        ]);

        wrapper.search = "ab";
        expect(wrapper.filterBySequence(testHistory)).toEqual([
          testHistoryItem1,
        ]);

        wrapper.search = "abc";
        expect(wrapper.filterBySequence(testHistory)).toEqual([]);
      });
    });
  });
});
