import InputValueTable, {
  ScreenTransition,
} from "@/lib/operationHistory/InputValueTable";

describe("InputValueTable", () => {
  describe("#rows", () => {
    describe("指定の画面遷移群を元に入力値テーブルの行情報を構築する", () => {
      const screenTransitionBase = {
        sourceScreen: { id: "", name: "" },
        destScreen: { id: "", name: "" },
        trigger: {
          sequence: 0,
          type: "",
          target: { xpath: "", text: "" },
          input: "",
          pageUrl: "",
          pageTitle: "",
        },
        notes: [],
        testPurposes: [],
      };

      const inputElementBase = {
        tagname: "",
        text: "",
      };

      it("画面遷移が1つの場合", () => {
        const screenTransitions: ScreenTransition[] = [
          {
            ...screenTransitionBase,
            inputElements: [
              {
                ...inputElementBase,
                xpath: "xpath1",
                attributes: { id: "id1", name: "name1", type: "type1" },
                defaultValue: "defaultValue",
                inputs: [],
              },
              {
                ...inputElementBase,
                xpath: "xpath2",
                attributes: { id: "id2", name: "name2", type: "type2" },
                defaultValue: "",
                inputs: [{ sequence: 2, value: "inputValue" }],
              },
            ],
          },
        ];

        const rows = new InputValueTable(screenTransitions).rows;

        expect(rows).toEqual([
          {
            elementId: "id1",
            elementName: "name1",
            elementType: "type1",
            sequence: 0,
            inputs: [{ value: "defaultValue", isDefaultValue: true }],
          },
          {
            elementId: "id2",
            elementName: "name2",
            elementType: "type2",
            sequence: 2,
            inputs: [{ value: "inputValue", isDefaultValue: false }],
          },
        ]);
      });

      describe("画面遷移の場合", () => {
        it("全ての画面遷移の入力要素数が同じ場合", () => {
          const screenTransitions: ScreenTransition[] = [
            {
              ...screenTransitionBase,
              inputElements: [
                {
                  ...inputElementBase,
                  xpath: "xpath1",
                  attributes: { id: "id1", name: "name1", type: "type1" },
                  defaultValue: "defaultValue",
                  inputs: [],
                },
                {
                  ...inputElementBase,
                  xpath: "xpath2",
                  attributes: { id: "id2", name: "name2", type: "type2" },
                  defaultValue: "",
                  inputs: [{ sequence: 2, value: "inputValue" }],
                },
              ],
            },
            {
              ...screenTransitionBase,
              inputElements: [
                {
                  ...inputElementBase,
                  xpath: "xpath1",
                  attributes: { id: "id1", name: "name1", type: "type1" },
                  defaultValue: "defaultValue",
                  inputs: [],
                },
                {
                  ...inputElementBase,
                  xpath: "xpath2",
                  attributes: { id: "id2", name: "name2", type: "type2" },
                  defaultValue: "",
                  inputs: [{ sequence: 2, value: "inputValue" }],
                },
              ],
            },
            {
              ...screenTransitionBase,
              inputElements: [
                {
                  ...inputElementBase,
                  xpath: "xpath1",
                  attributes: { id: "id1", name: "name1", type: "type1" },
                  defaultValue: "defaultValue",
                  inputs: [],
                },
                {
                  ...inputElementBase,
                  xpath: "xpath2",
                  attributes: { id: "id2", name: "name2", type: "type2" },
                  defaultValue: "",
                  inputs: [{ sequence: 2, value: "inputValue" }],
                },
              ],
            },
          ];

          const rows = new InputValueTable(screenTransitions).rows;

          expect(rows).toEqual([
            {
              elementId: "id1",
              elementName: "name1",
              elementType: "type1",
              sequence: 0,
              inputs: [
                { value: "defaultValue", isDefaultValue: true },
                { value: "defaultValue", isDefaultValue: true },
                { value: "defaultValue", isDefaultValue: true },
              ],
            },
            {
              elementId: "id2",
              elementName: "name2",
              elementType: "type2",
              sequence: 2,
              inputs: [
                { value: "inputValue", isDefaultValue: false },
                { value: "inputValue", isDefaultValue: false },
                { value: "inputValue", isDefaultValue: false },
              ],
            },
          ]);
        });

        it("各画面遷移で入力要素数が異なる場合、入力が無いセルは空文字のデフォルト値とみなす", () => {
          const screenTransitions: ScreenTransition[] = [
            {
              ...screenTransitionBase,
              inputElements: [],
            },
            {
              ...screenTransitionBase,
              inputElements: [
                {
                  ...inputElementBase,
                  xpath: "xpath1",
                  attributes: { id: "id1", name: "name1", type: "type1" },
                  defaultValue: "defaultValue",
                  inputs: [],
                },
              ],
            },
            {
              ...screenTransitionBase,
              inputElements: [
                {
                  ...inputElementBase,
                  xpath: "xpath2",
                  attributes: { id: "id2", name: "name2", type: "type2" },
                  defaultValue: "",
                  inputs: [{ sequence: 2, value: "inputValue" }],
                },
              ],
            },
          ];

          const rows = new InputValueTable(screenTransitions).rows;

          expect(rows).toEqual([
            {
              elementId: "id1",
              elementName: "name1",
              elementType: "type1",
              sequence: 0,
              inputs: [
                { value: "", isDefaultValue: true },
                { value: "defaultValue", isDefaultValue: true },
                { value: "", isDefaultValue: true },
              ],
            },
            {
              elementId: "id2",
              elementName: "name2",
              elementType: "type2",
              sequence: 2,
              inputs: [
                { value: "", isDefaultValue: true },
                { value: "", isDefaultValue: true },
                { value: "inputValue", isDefaultValue: false },
              ],
            },
          ]);
        });
      });
    });
  });
});
