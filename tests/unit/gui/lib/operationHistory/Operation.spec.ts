import { Operation } from "@/lib/operationHistory/Operation";

describe("Operationは", () => {
  describe("inputValueが呼ばれたとき、入力値欄に表示する文字列を取得する", () => {
    let operation: Operation;

    beforeEach(() => {
      operation = new Operation(1, "", "", null, "", "", "", "");
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

  describe("textValueが呼ばれたとき、要素の表示文字列を取得する", () => {
    let operation: Operation;

    beforeEach(() => {
      operation = new Operation(1, "", "", null, "", "", "", "");
    });

    it("elementInfoがnullの場合は空文字を返す", () => {
      operation.elementInfo = null;
      expect(operation.textValue).toEqual("");
    });

    it("elementInfo.textに値が入っている場合はその値を返す", () => {
      operation.elementInfo = {
        tagname: "input",
        text: "text",
        xpath: "",
        attributes: {
          value: "value",
        },
      };
      expect(operation.textValue).toEqual("text");
    });

    it("elementInfo.textに値が入っていない場合はelementInfo.attributes.valueの値を返す", () => {
      // textが空文字
      operation.elementInfo = {
        tagname: "input",
        text: "",
        xpath: "",
        attributes: {
          value: "value",
        },
      };
      expect(operation.textValue).toEqual("value");

      // textがundefined
      operation.elementInfo = {
        tagname: "input",
        xpath: "",
        attributes: {
          value: "value",
        },
      };
      expect(operation.textValue).toEqual("value");
    });

    it("elementInfo.text、elementInfo.attributes.valueのいずれも値が入っていない場合は空文字を返す", () => {
      operation.elementInfo = {
        tagname: "input",
        xpath: "",
        attributes: {},
      };
      expect(operation.textValue).toEqual("");
    });
  });
});
