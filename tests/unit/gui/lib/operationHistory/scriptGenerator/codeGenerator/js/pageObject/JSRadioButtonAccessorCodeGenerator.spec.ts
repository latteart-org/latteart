import { JSRadioButtonAccessorCodeGenerator } from "@/lib/operationHistory/scriptGenerator/codeGenerator/js/pageObject/JSRadioButtonAccessorCodeGenerator";

describe("JSRadioButtonAccessorCodeGenerator", () => {
  describe("generateRadioButtonString", () => {
    it("radioボタンの識別子とnameのセットからradioボタン選択用のコードを生成できる", () => {
      const generator = new JSRadioButtonAccessorCodeGenerator(
        new Map().set("radio", new Set(["value1", "value2"]))
      );
      const str = generator.generateRadioButtonString("radio");
      expect(str).toBe(`\
static get radio() {
  return {
    value1: 'value1',
    value2: 'value2'
  }
}

set_radio(value) {
  $("//input[@name='radio' and @value='" + value + "']").click();
}`);
    });
  });
});
