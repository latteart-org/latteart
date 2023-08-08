import { Edge } from "@/lib/operationHistory/graphConverter/ScreenTransitionDiagramGraphConverter";
import InputValueTable from "@/lib/operationHistory/InputValueTable";

describe("InputValueTable", () => {
  describe("#rows", () => {
    describe("指定の画面遷移群を元に入力値テーブルの行情報を構築する", () => {
      const edgeBase = {
        sourceScreen: { id: "", name: "" },
        destScreen: { id: "", name: "" },
        trigger: {
          type: "",
          target: { id: "", xpath: "", text: "" },
        },
        details: [],
      };

      const edgeDetailsBase = {
        pageUrl: "",
        pageTitle: "",
        inputElements: [],
        notes: [],
        testPurposes: [],
      };

      const inputElementBase = {
        tagname: "",
        text: "",
        xpath: "",
      };

      it("画面遷移していない場合", () => {
        const edges: Edge[] = [
          {
            ...edgeBase,
            details: [
              {
                ...edgeDetailsBase,
                inputElements: [
                  {
                    ...inputElementBase,
                    id: "element1",
                    attributes: { id: "id1", name: "name1", type: "type1" },
                    defaultValue: "defaultValue",
                    inputs: [],
                  },
                  {
                    ...inputElementBase,
                    id: "element2",
                    attributes: { id: "id2", name: "name2", type: "type2" },
                    defaultValue: "",
                    inputs: [{ value: "inputValue" }],
                  },
                ],
              },
            ],
          },
        ];

        const rows = new InputValueTable(edges).rows;

        expect(rows).toEqual([
          {
            elementId: "id1",
            elementName: "name1",
            elementType: "type1",
            inputs: [{ value: "defaultValue", isDefaultValue: true }],
          },
          {
            elementId: "id2",
            elementName: "name2",
            elementType: "type2",
            inputs: [{ value: "inputValue", isDefaultValue: false }],
          },
        ]);
      });

      describe("画面遷移している場合", () => {
        it("全ての画面遷移の入力要素数が同じ場合", () => {
          const edges: Edge[] = [
            {
              ...edgeBase,
              details: [
                {
                  ...edgeDetailsBase,
                  inputElements: [
                    {
                      ...inputElementBase,
                      id: "element1",
                      attributes: { id: "id1", name: "name1", type: "type1" },
                      defaultValue: "defaultValue",
                      inputs: [],
                    },
                    {
                      ...inputElementBase,
                      id: "element2",
                      attributes: { id: "id2", name: "name2", type: "type2" },
                      defaultValue: "",
                      inputs: [{ value: "inputValue" }],
                    },
                  ],
                },
                {
                  ...edgeDetailsBase,
                  inputElements: [
                    {
                      ...inputElementBase,
                      id: "element1",
                      attributes: { id: "id1", name: "name1", type: "type1" },
                      defaultValue: "defaultValue",
                      inputs: [],
                    },
                    {
                      ...inputElementBase,
                      id: "element2",
                      attributes: { id: "id2", name: "name2", type: "type2" },
                      defaultValue: "",
                      inputs: [{ value: "inputValue" }],
                    },
                  ],
                },
                {
                  ...edgeDetailsBase,
                  inputElements: [
                    {
                      ...inputElementBase,
                      id: "element1",
                      attributes: { id: "id1", name: "name1", type: "type1" },
                      defaultValue: "defaultValue",
                      inputs: [],
                    },
                    {
                      ...inputElementBase,
                      id: "element2",
                      attributes: { id: "id2", name: "name2", type: "type2" },
                      defaultValue: "",
                      inputs: [{ value: "inputValue" }],
                    },
                  ],
                },
              ],
            },
          ];

          const rows = new InputValueTable(edges).rows;

          expect(rows).toEqual([
            {
              elementId: "id1",
              elementName: "name1",
              elementType: "type1",
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
              inputs: [
                { value: "inputValue", isDefaultValue: false },
                { value: "inputValue", isDefaultValue: false },
                { value: "inputValue", isDefaultValue: false },
              ],
            },
          ]);
        });

        it("各画面遷移で入力要素数が異なる場合、入力が無いセルは空文字のデフォルト値とみなす", () => {
          const edges: Edge[] = [
            {
              ...edgeBase,
              details: [
                {
                  ...edgeDetailsBase,
                  inputElements: [],
                },
              ],
            },
            {
              ...edgeBase,
              details: [
                {
                  ...edgeDetailsBase,
                  inputElements: [
                    {
                      ...inputElementBase,
                      id: "element1",
                      attributes: { id: "id1", name: "name1", type: "type1" },
                      defaultValue: "defaultValue",
                      inputs: [],
                    },
                  ],
                },
              ],
            },
            {
              ...edgeBase,
              details: [
                {
                  ...edgeDetailsBase,
                  inputElements: [
                    {
                      ...inputElementBase,
                      id: "element2",
                      attributes: { id: "id2", name: "name2", type: "type2" },
                      defaultValue: "",
                      inputs: [{ value: "inputValue" }],
                    },
                  ],
                },
              ],
            },
          ];

          const rows = new InputValueTable(edges).rows;

          expect(rows).toEqual([
            {
              elementId: "id1",
              elementName: "name1",
              elementType: "type1",
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
