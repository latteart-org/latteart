import Autofill, { InputValueSet } from "@/webdriver/autofill";

describe("Autofill", () => {
  const currentWindow: any = {
    sleep: jest.fn().mockResolvedValue(0),
    focus: jest.fn().mockResolvedValue(0),
  };

  describe("#execute", () => {
    it("selectboxに値を設定", async () => {
      const client: any = {};
      const inputValueSets: InputValueSet[] = [
        {
          locatorType: "id",
          locator: "locator",
          locatorMatchType: "equals",
          inputValue: "toSelect",
        },
      ];

      const webElementMock = {
        getTagName: () => "select",
      };
      const autofill = new Autofill(client, inputValueSets, currentWindow);
      (autofill["getWebElements"] as jest.Mock) = jest
        .fn()
        .mockResolvedValue([webElementMock]);
      (autofill.setValueToSelectbox as jest.Mock) = jest.fn();

      await autofill.execute();

      expect(autofill.setValueToSelectbox).toHaveBeenCalledWith(
        webElementMock,
        "toSelect"
      );
    });

    it("textareaに値を設定", async () => {
      const client: any = {};
      const inputValueSets: InputValueSet[] = [
        {
          locatorType: "id",
          locator: "locator",
          locatorMatchType: "equals",
          inputValue: "toTextArea",
        },
      ];

      const webElementMock = {
        getTagName: () => "textarea",
      };
      const autofill = new Autofill(client, inputValueSets, currentWindow);
      (autofill["getWebElements"] as jest.Mock) = jest
        .fn()
        .mockResolvedValue([webElementMock]);
      (autofill.setValueToText as jest.Mock) = jest.fn();

      await autofill.execute();

      expect(autofill.setValueToText).toHaveBeenCalledWith(
        webElementMock,
        "toTextArea"
      );
    });

    it("checkboxに値を設定", async () => {
      const client: any = {};
      const inputValueSets: InputValueSet[] = [
        {
          locatorType: "id",
          locator: "locator",
          locatorMatchType: "equals",
          inputValue: "on",
        },
      ];

      const webElementMock = {
        getTagName: () => "input",
        getAttribute: () => "checkbox",
      };
      const autofill = new Autofill(client, inputValueSets, currentWindow);
      (autofill["getWebElements"] as jest.Mock) = jest
        .fn()
        .mockResolvedValue([webElementMock]);
      (autofill.setValueToCheckbox as jest.Mock) = jest.fn();

      await autofill.execute();

      expect(autofill.setValueToCheckbox).toHaveBeenCalledWith(
        webElementMock,
        "on"
      );
    });

    it("radioに値を設定", async () => {
      const client: any = {};
      const inputValueSets: InputValueSet[] = [
        {
          locatorType: "id",
          locator: "locator",
          locatorMatchType: "equals",
          inputValue: "on",
        },
      ];

      const webElementMock = {
        getTagName: () => "input",
        getAttribute: () => "radio",
      };
      const autofill = new Autofill(client, inputValueSets, currentWindow);
      (autofill["getWebElements"] as jest.Mock) = jest
        .fn()
        .mockResolvedValue([webElementMock]);
      (autofill.setValueToRadiobutton as jest.Mock) = jest.fn();

      await autofill.execute();

      expect(autofill.setValueToRadiobutton).toHaveBeenCalledWith(
        webElementMock,
        "on"
      );
    });

    it("dateに値を設定", async () => {
      const client: any = {};
      const inputValueSets: InputValueSet[] = [
        {
          locatorType: "id",
          locator: "locator",
          locatorMatchType: "equals",
          inputValue: "002020-02-02",
        },
      ];

      const webElementMock = {
        getTagName: () => "input",
        getAttribute: () => "date",
      };
      const autofill = new Autofill(client, inputValueSets, currentWindow);
      (autofill["getWebElements"] as jest.Mock) = jest
        .fn()
        .mockResolvedValue([webElementMock]);
      (autofill.setValueToDate as jest.Mock) = jest.fn();

      await autofill.execute();

      expect(autofill.setValueToDate).toHaveBeenCalledWith(
        webElementMock,
        "002020-02-02"
      );
    });

    it("textに値を設定", async () => {
      const client: any = {};
      const inputValueSets: InputValueSet[] = [
        {
          locatorType: "id",
          locator: "locator",
          locatorMatchType: "equals",
          inputValue: "aaa",
        },
      ];

      const webElementMock = {
        getTagName: () => "input",
        getAttribute: () => "text",
      };
      const autofill = new Autofill(client, inputValueSets, currentWindow);
      (autofill["getWebElements"] as jest.Mock) = jest
        .fn()
        .mockResolvedValue([webElementMock]);
      (autofill.setValueToText as jest.Mock) = jest.fn();

      await autofill.execute();

      expect(autofill.setValueToText).toHaveBeenCalledWith(
        webElementMock,
        "aaa"
      );
    });
  });

  describe("#getWebElements", () => {
    it("一致する要素を取得", async () => {
      const webElementMock = [{ dummy: "dummy" }];
      const client: any = {
        getElementsByXpath: jest.fn().mockResolvedValue(webElementMock),
      };
      const inputValueSets: InputValueSet[] = [];

      const autofill = new Autofill(client, inputValueSets, currentWindow);
      const result = await (autofill as any).getWebElements(
        "xpath",
        "locator",
        "equals"
      );

      expect(client.getElementsByXpath).toHaveBeenCalledWith("locator");
      expect(result).toEqual(webElementMock);
    });
  });
});
