import { createLocalVue } from "@vue/test-utils";
import Vuetify from "vuetify";
import ScreenHistory from "@/lib/operationHistory/ScreenHistory";
import { Operation } from "@/lib/operationHistory/Operation";
import * as Coverage from "@/lib/operationHistory/Coverage";
import { OperationWithNotes, ElementInfo } from "@/lib/operationHistory/types";

const localVue = createLocalVue();
localVue.use(Vuetify);

describe("Coverageは", () => {
  it("getTagUseTagsで使用したタグリストを返す", () => {
    expect(Coverage.getTagUseTags(screenHistory, ["TAG2", "HOGE"])).toEqual([
      { text: "HOGE", isInclude: true },
      { text: "OPTION", isInclude: false },
      { text: "SELECT", isInclude: false },
      { text: "TAG1", isInclude: false },
      { text: "TAG2", isInclude: true },
      { text: "TAG3", isInclude: false },
    ]);
  });

  describe("getCoverageでカバレッジ率を返す", () => {
    it("指定したカバレッジ計算に含めるタグのみを計上する", async () => {
      expect(await Coverage.getCoverages(screenHistory, ["tag2"])).toEqual([
        {
          elements: [
            {
              id: "id2",
              name: "name2",
              operated: true,
              sequence: 1,
              tagname: "tag2",
              text: "value2",
              type: "type2",
              xpath: "xpath2",
            },
          ],
          percentage: 100,
          screenTitle: "screenDef1",
        },
      ]);
    });

    describe("要素が重複している場合はまとめる(後勝ち)", () => {
      let historyBody: Array<{
        url: string;
        title: string;
        screenDef: string;
        operationHistory: OperationWithNotes[];
        screenElements: ElementInfo[];
        inputElements: ElementInfo[];
      }>;

      beforeEach(() => {
        historyBody = [
          {
            url: "url1",
            title: "title1",
            screenDef: "screenDef1",
            operationHistory: [],
            screenElements: [],
            inputElements: [],
          },
        ];
      });

      it("xpathが完全に一致している場合", async () => {
        const elementInfo1 = {
          tagname: "tag1",
          text: "value1",
          xpath: "foo/bar/baz",
          attributes: { type: "type1", id: "id1", name: "name1" },
        };
        const elementInfo2 = {
          tagname: "tag1",
          text: "value2",
          xpath: "foo/bar/baz",
          attributes: { type: "type1", id: "id1", name: "name1" },
        };
        const operation1 = Operation.createFromOtherOperation({
          other: createEmptyOperation(),
          overrideParams: { elementInfo: elementInfo1 },
        });
        const operation2 = Operation.createFromOtherOperation({
          other: createEmptyOperation(),
          overrideParams: { elementInfo: elementInfo2 },
        });

        historyBody[0].operationHistory = [
          { operation: operation1, intention: null, bugs: null, notices: null },
          { operation: operation2, intention: null, bugs: null, notices: null },
        ];
        historyBody[0].screenElements = [elementInfo1, elementInfo2];

        const history = new ScreenHistory(historyBody);

        expect(
          await Coverage.getCoverages(history, [
            "tag1",
            "tag2",
            "tag3",
            "select",
            "option",
          ])
        ).toEqual([
          {
            elements: [
              {
                id: "id1",
                name: "name1",
                operated: true,
                sequence: 1,
                tagname: "tag1",
                text: "value2",
                type: "type1",
                xpath: "foo/bar/baz",
              },
            ],
            percentage: 100,
            screenTitle: "screenDef1",
          },
        ]);
      });

      it("xpathに[1]が付与されている場合は付与されていない要素とまとめる", async () => {
        const elementInfo1 = {
          tagname: "tag1",
          text: "value1",
          xpath: "foo/bar[1]/baz[1]",
          attributes: { type: "type1", id: "id1", name: "name1" },
        };
        const elementInfo2 = {
          tagname: "tag1",
          text: "value2",
          xpath: "foo[1]/bar/baz[1]",
          attributes: { type: "type1", id: "id1", name: "name1" },
        };
        const operation1 = Operation.createFromOtherOperation({
          other: createEmptyOperation(),
          overrideParams: { elementInfo: elementInfo1 },
        });
        const operation2 = Operation.createFromOtherOperation({
          other: createEmptyOperation(),
          overrideParams: { elementInfo: elementInfo2 },
        });

        historyBody[0].operationHistory = [
          { operation: operation1, intention: null, bugs: null, notices: null },
          { operation: operation2, intention: null, bugs: null, notices: null },
        ];
        historyBody[0].screenElements = [elementInfo1, elementInfo2];

        const history = new ScreenHistory(historyBody);

        expect(
          await Coverage.getCoverages(history, [
            "tag1",
            "tag2",
            "tag3",
            "select",
            "option",
          ])
        ).toEqual([
          {
            elements: [
              {
                id: "id1",
                name: "name1",
                operated: true,
                sequence: 1,
                tagname: "tag1",
                text: "value2",
                type: "type1",
                xpath: "foo[1]/bar/baz[1]",
              },
            ],
            percentage: 100,
            screenTitle: "screenDef1",
          },
        ]);
      });
    });
  });
});

const createEmptyOperation = () => {
  return new Operation(1, "", "", null, "", "", "", "");
};

const screenHistory = new ScreenHistory([
  {
    url: "url1",
    title: "title1",
    screenDef: "screenDef1",
    operationHistory: [
      {
        operation: Operation.createFromOtherOperation({
          other: createEmptyOperation(),
          overrideParams: {
            elementInfo: {
              tagname: "tag1",
              text: "value1",
              xpath: "xpath1",
              attributes: { type: "type1", id: "id1", name: "name1" },
            },
          },
        }),
        intention: null,
        bugs: null,
        notices: null,
      },
      {
        operation: Operation.createFromOtherOperation({
          other: createEmptyOperation(),
          overrideParams: {
            elementInfo: {
              tagname: "tag2",
              text: "value2",
              xpath: "xpath2",
              attributes: { type: "type2", id: "id2", name: "name2" },
            },
          },
        }),
        intention: null,
        bugs: null,
        notices: null,
      },
      {
        operation: Operation.createFromOtherOperation({
          other: createEmptyOperation(),
          overrideParams: {
            elementInfo: {
              tagname: "select",
              text: "Option1\nOption2",
              xpath: "selectxpath1",
              attributes: { id: "selectid1", name: "selectname1" },
            },
            input: "Option1",
          },
        }),
        intention: null,
        bugs: null,
        notices: null,
      },
      {
        operation: Operation.createFromOtherOperation({
          other: createEmptyOperation(),
          overrideParams: {
            elementInfo: {
              tagname: "select",
              text: "Option1\nOption2",
              xpath: "selectxpath1",
              attributes: { id: "selectid1", name: "selectname1" },
            },
            input: "optionValue2",
          },
        }),
        intention: null,
        bugs: null,
        notices: null,
      },
    ],
    screenElements: [
      {
        tagname: "tag2",
        text: "value2",
        xpath: "xpath2",
        attributes: { type: "type2", id: "id2", name: "name2" },
      },
      {
        tagname: "tag3",
        text: "value3",
        xpath: "xpath3",
        attributes: { type: "type3", id: "id3", name: "name3" },
      },
      {
        tagname: "tag1",
        text: "value1",
        xpath: "xpath1",
        attributes: { type: "type1", id: "id1", name: "name1" },
      },
      {
        tagname: "tag3",
        text: "value3",
        xpath: "xpath3",
        attributes: { type: "type3", id: "id3", name: "name3" },
      },
      {
        tagname: "",
        text: "value4",
        xpath: "xpath4",
        attributes: { type: "type4", id: "id4", name: "name4" },
      },
      {
        tagname: "tag2",
        text: "value2",
        xpath: "xpath2",
        attributes: { type: "type2", id: "id2", name: "name2" },
      },
      {
        tagname: "select",
        text: "Option1\nOption2",
        xpath: "selectxpath1",
        attributes: { id: "selectid1", name: "selectname1" },
      },
      {
        tagname: "option",
        text: "Option1",
        xpath: "selectxpath1/option[1]",
        attributes: { id: "optionid1", name: "optionname1" },
      },
      {
        tagname: "option",
        text: "Option2",
        xpath: "selectxpath1/option[2]",
        attributes: {
          value: "optionValue2",
          id: "optionid2",
          name: "optionname2",
        },
      },
      {
        tagname: "select",
        text: "Option1\nOption2",
        xpath: "selectxpath1",
        attributes: { id: "selectid1", name: "selectname1" },
      },
      {
        tagname: "option",
        text: "Option1",
        xpath: "selectxpath1/option[1]",
        attributes: { id: "optionid1", name: "optionname1" },
      },
      {
        tagname: "option",
        text: "Option2",
        xpath: "selectxpath1/option[2]",
        attributes: {
          value: "optionValue2",
          id: "optionid2",
          name: "optionname2",
        },
      },
    ],
    inputElements: [],
  },
]);
