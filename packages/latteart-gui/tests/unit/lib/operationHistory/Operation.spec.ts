import { OperationForGUI } from "@/lib/operationHistory/OperationForGUI";

describe("Operationは", () => {
  describe("inputValueが呼ばれたとき、入力値欄に表示する文字列を取得する", () => {
    let operation: OperationForGUI;

    beforeEach(() => {
      operation = new OperationForGUI(1, "", "", null, "", "", "", "", false);
    });

    it("elementInfoがnullの場合は空文字を返す", () => {
      operation.elementInfo = null;
      expect(operation.inputValue).toEqual("");
    });

    describe("チェックボックスの場合はチェックされているかどうかで判断する", () => {
      beforeEach(() => {
        operation.input = "value";
        operation.elementInfo = {
          tagname: "input",
          text: "",
          xpath: "",
          attributes: {
            type: "checkbox",
          },
        };
      });

      it("checkedが無い場合はoffを返す", () => {
        expect(operation.inputValue).toEqual("off");
      });

      it("checkedがtrueの場合はonを返す", () => {
        operation.elementInfo!.checked = true;
        expect(operation.inputValue).toEqual("on");
      });

      it("checkedがfalseの場合はoffを返す", () => {
        operation.elementInfo!.checked = false;
        expect(operation.inputValue).toEqual("off");
      });
    });

    it("チェックボックス以外の場合はinputの値を返す", () => {
      operation.input = "value";
      operation.elementInfo = {
        tagname: "input",
        text: "",
        xpath: "",
        attributes: {
          type: "text",
        },
      };
      expect(operation.inputValue).toEqual("value");
    });
  });
});
