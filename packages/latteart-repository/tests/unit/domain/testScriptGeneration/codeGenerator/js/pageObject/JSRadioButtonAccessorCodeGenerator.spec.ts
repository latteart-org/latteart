import { JSRadioButtonAccessorCodeGenerator } from "@/domain/testScriptGeneration/codeGenerator/js/pageObject/JSRadioButtonAccessorCodeGenerator";

describe("JSRadioButtonAccessorCodeGenerator", () => {
  describe("generateRadioButtonString", () => {
    describe("radioボタンの識別子とnameのセットからradioボタン選択用のコードを生成できる", () => {
      it("multi-locator未使用", () => {
        const generator = new JSRadioButtonAccessorCodeGenerator(
          new Map().set("id", new Set(["value1", "value2"]))
        );
        const str = generator.generateRadioButtonString("id", "name", false);
        expect(str).toBe(`\
static get id() {
  return {
    value1: 'value1',
    value2: 'value2'
  }
}

async set_id(value) {
  await $("//input[@name='name' and @value='" + value + "']").click();
}`);
      });
    });
    it("multi-locator使用", () => {
      const generator = new JSRadioButtonAccessorCodeGenerator(
        new Map().set("id", new Set(["value1", "value2"]))
      );
      const str = generator.generateRadioButtonString("id", "name", true);
      expect(str).toBe(`\
static get id() {
  return {
    value1: 'value1',
    value2: 'value2'
  }
}

async set_id(value) {
  return await (await driver.findElementMulti({ xpath: "//input[@name='name' and @value='" + value + "']"})).click()
}`);
    });
  });
});
