import InputValueTable, {
  ScreenTransition,
} from "@/lib/operationHistory/InputValueTable";

describe("InputValueTable", () => {
  describe("#rows", () => {
    it("入力値テーブルの行情報を構築する", () => {
      const screenTransitions: ScreenTransition[] = [
        {
          sourceScreen: { id: "", name: "" },
          destScreen: { id: "", name: "" },
          trigger: {
            sequence: 2,
            type: "",
            target: { xpath: "xpath2", text: "" },
            input: "",
            pageUrl: "",
            pageTitle: "",
          },
          inputElements: [
            {
              xpath: "xpath1",
              tagname: "",
              text: "",
              attributes: { id: "id1", name: "name1", type: "type1" },
              defaultValue: "defaultValue",
              inputs: [],
            },
            {
              xpath: "xpath2",
              tagname: "",
              text: "",
              attributes: { id: "id2", name: "name2", type: "type2" },
              defaultValue: "",
              inputs: [{ sequence: 2, value: "inputValue" }],
            },
          ],
          notes: [],
          testPurposes: [],
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
  });
});
