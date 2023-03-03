import { JSRadioButtonAccessorCodeGenerator } from "@/domain/testScriptGeneration/codeGenerator/js/pageObject/JSRadioButtonAccessorCodeGenerator";

describe("JSRadioButtonAccessorCodeGenerator", () => {
  describe("generateRadioButtonString", () => {
    it("radioボタンの識別子とnameのセットからradioボタン選択用のコードを生成できる", () => {
      const generator = new JSRadioButtonAccessorCodeGenerator(
        new Map().set("id", new Set(["value1", "value2"]))
      );
      const str = generator.generateRadioButtonString("id", "name");
      expect(str).toBe(`\
static get id() {
  return {
    value1: 'value1',
    value2: 'value2'
  }
}

set_id(value) {
  $("//input[@name='name' and @value='" + value + "']").click();
}`);
    });
  });
});
