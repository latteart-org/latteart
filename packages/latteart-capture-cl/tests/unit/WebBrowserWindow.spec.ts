import WebBrowserWindow from "@/capturer/browser/window/WebBrowserWindow";
import { Operation } from "@/Operation";
import CaptureScript from "@/capturer/browser/window/CaptureScript";
import MarkedScreenShotTaker from "@/capturer/browser/window/MarkedScreenshotTaker";
import { CapturedData } from "@/capturer/browser/window/CapturedData";
import WebBrowser from "@/capturer/browser/WebBrowser";

describe("WebBrowserWindowは", () => {
  it("getScreenshotが呼ばれたとき、WebDriverクライアントを用いてスクリーンショットを取得する", async () => {
    const clientMock = {
      takeScreenshot: jest.fn().mockResolvedValue("screenshot"),
    };

    const window = new WebBrowserWindow(
      "firstUrl",
      clientMock as any,
      "windowHandle"
    );

    const actual = await window.getScreenshot();

    expect(actual).toEqual("screenshot");
  });

  describe("captureOperationsが呼ばれたとき", () => {
    const clientMock = {
      getCurrentPageText: jest.fn().mockResolvedValueOnce("pageSource"),
      alertIsVisible: jest.fn().mockResolvedValue(false),
      sendKeys: jest.fn().mockResolvedValue(undefined),
      execute: jest.fn().mockResolvedValueOnce(false),
    };
    const onGetOperation: (operation: Operation) => void = jest.fn();
    const window: WebBrowserWindow = new WebBrowserWindow(
      "firstUrl",
      clientMock as any,
      "windowHandle",
      {
        onGetOperation,
      }
    );
    const takeScreenshotWithMarkOfSpy = jest.spyOn(
      MarkedScreenShotTaker.prototype,
      "takeScreenshotWithMarkOf"
    );
    takeScreenshotWithMarkOfSpy.mockResolvedValue("imageData");

    let pullCapturedDatasSpy: any = null;
    let isReadyToCaptureSpy: any = null;
    beforeEach(() => {
      pullCapturedDatasSpy = jest.spyOn(
        CaptureScript.prototype,
        "pullCapturedDatas"
      );
      isReadyToCaptureSpy = jest.spyOn(
        CaptureScript.prototype,
        "isReadyToCapture"
      );
    });

    afterEach(() => {
      pullCapturedDatasSpy.mockRestore();
      isReadyToCaptureSpy.mockRestore();
    });

    it("Checkboxに紐づいたLabelをクリックすると、Checkboxのクリックは登録しない", async () => {
      pullCapturedDatasSpy.mockResolvedValueOnce([
        {
          operation: {
            input: "input",
            type: "click",
            elementInfo: {
              tagname: "label",
              text: "",
              xpath: "xpath",
              attributes: { for: "checkboxId" },
              boundingRect: { top: 0, left: 0, width: 0, height: 0 },
            },
            title: "title",
            url: "url",
          },
          elements: [
            {
              tagname: "label",
              text: "",
              xpath: "xpath",
              attributes: { for: "checkboxId" },
            },
          ],
          suspendedEvent: {
            reFireFromWebdriverType: "label",
            reFire: jest.fn(),
          },
        },
        {
          operation: {
            input: "input",
            type: "click",
            elementInfo: {
              tagname: "input",
              text: "checkbox",
              xpath: "xpath",
              attributes: { type: "checkbox", id: "checkboxId" },
              boundingRect: { top: 0, left: 0, width: 0, height: 0 },
            },
            title: "title",
            url: "url",
          },
          elements: [
            {
              tagname: "input",
              text: "checkbox",
              xpath: "xpath",
              attributes: { type: "checkbox" },
            },
          ],
          suspendedEvent: {
            reFireFromWebdriverType: "checkbox",
            reFire: jest.fn(),
          },
        },
      ]);

      isReadyToCaptureSpy.mockResolvedValue(true);

      (window as any).noticeCapturedOperations = jest.fn();

      await window.captureOperations();

      expect((window as any).noticeCapturedOperations).toBeCalledTimes(1);
    });

    it("input type='date'の場合、webdriverからキーボード入力(space)を行う", async () => {
      pullCapturedDatasSpy.mockResolvedValueOnce([
        {
          operation: {
            input: "input",
            type: "click",
            elementInfo: {
              tagname: "input",
              text: "date",
              xpath: "xpath",
              attributes: { type: "date" },
              boundingRect: { top: 0, left: 0, width: 0, height: 0 },
            },
            title: "title",
            url: "url",
          },
          elements: [
            {
              tagname: "input",
              text: "date",
              xpath: "xpath",
              attributes: { type: "date" },
            },
          ],
          suspendedEvent: {
            reFireFromWebdriverType: "inputDate",
            reFire: jest.fn(),
          },
        },
      ]);
      isReadyToCaptureSpy.mockResolvedValue(true);

      await window.captureOperations();

      expect(clientMock.sendKeys).toBeCalledTimes(1);
    });
  });
  describe("captureOperationsが呼ばれたとき、現在表示している画面に対する操作情報を取得する", () => {
    let capturedDatas1: CapturedData[];
    let capturedDatas2: CapturedData[];
    let expectedOperation: Operation;
    let pullCapturedDatasSpy: any;
    let takeScreenshotWithMarkOfSpy: any;
    let onGetOperation: (operation: Operation) => void;
    let clientMock: any;
    let window: WebBrowserWindow;

    // 取得対象の操作
    const validCapturedDatas = {
      operation: {
        input: "input",
        type: "click",
        elementInfo: {
          tagname: "tagname",
          text: "text",
          xpath: "xpath",
          checked: false,
          attributes: { type: "type" },
          boundingRect: { top: 0, left: 0, width: 100, height: 200 },
        },
        title: "title",
        url: "url",
      },
      elements: [
        {
          tagname: "tagname",
          text: "text",
          xpath: "xpath",
          checked: false,
          attributes: { type: "type" },
        },
      ],
      suspendedEvent: {
        reFireFromWebdriverType: "",
        reFire: jest.fn(),
      },
    };

    // 取得対象外の操作(type=click && tagname=SELECT)
    const invalidCapturedDatas = {
      operation: {
        input: "input",
        type: "click",
        elementInfo: {
          tagname: "SELECT",
          text: "text",
          xpath: "xpath",
          checked: false,
          attributes: { type: "type" },
          boundingRect: { top: 0, left: 0, width: 100, height: 200 },
        },
        title: "title",
        url: "url",
      },
      elements: [
        {
          tagname: "SELECT",
          text: "text",
          xpath: "xpath",
          checked: false,
          attributes: { type: "type" },
        },
      ],
      suspendedEvent: {
        reFireFromWebdriverType: "",
        reFire: jest.fn(),
      },
    };

    beforeEach(() => {
      capturedDatas1 = [validCapturedDatas, invalidCapturedDatas];

      capturedDatas2 = [
        // 取得対象外の操作(ラジオボタンのchangeイベント)
        {
          operation: {
            input: "input",
            type: "change",
            elementInfo: {
              tagname: "input",
              text: "text",
              xpath: "xpath",
              checked: false,
              attributes: { type: "radio" },
              boundingRect: { top: 0, left: 0, width: 100, height: 200 },
            },
            title: "title",
            url: "url",
          },
          elements: [
            {
              tagname: "input",
              text: "text",
              xpath: "xpath",
              checked: false,
              attributes: { type: "radio" },
            },
          ],
          suspendedEvent: {
            reFireFromWebdriverType: "",
            reFire: jest.fn(),
          },
        },
        // 取得対象外の操作(チェックボックスのchangeイベント)
        {
          operation: {
            input: "input",
            type: "change",
            elementInfo: {
              tagname: "input",
              text: "text",
              xpath: "xpath",
              checked: false,
              attributes: { type: "checkbox" },
              boundingRect: { top: 0, left: 0, width: 100, height: 200 },
            },
            title: "title",
            url: "url",
          },
          elements: [
            {
              tagname: "input",
              text: "text",
              xpath: "xpath",
              checked: false,
              attributes: { type: "checkbox" },
            },
          ],
          suspendedEvent: {
            reFireFromWebdriverType: "",
            reFire: jest.fn(),
          },
        },
      ];

      expectedOperation = new Operation({
        input: capturedDatas1[0].operation.input,
        type: capturedDatas1[0].operation.type,
        elementInfo: {
          tagname: capturedDatas1[0].operation.elementInfo.tagname,
          text: capturedDatas1[0].operation.elementInfo.text,
          xpath: capturedDatas1[0].operation.elementInfo.xpath,
          attributes: capturedDatas1[0].operation.elementInfo.attributes,
          checked: capturedDatas1[0].operation.elementInfo.checked,
        },
        title: "",
        url: "",
        imageData: "imageData",
        windowHandle: "windowHandle",
        timestamp: expect.any(String),
        screenElements: capturedDatas1[0].elements,
        pageSource: "pageSource",
      });

      pullCapturedDatasSpy = jest.spyOn(
        CaptureScript.prototype,
        "pullCapturedDatas"
      );
      pullCapturedDatasSpy
        .mockResolvedValueOnce(capturedDatas1)
        .mockResolvedValue(capturedDatas2);
      takeScreenshotWithMarkOfSpy = jest.spyOn(
        MarkedScreenShotTaker.prototype,
        "takeScreenshotWithMarkOf"
      );
      takeScreenshotWithMarkOfSpy.mockResolvedValue("imageData");

      clientMock = {
        getCurrentPageText: jest.fn().mockResolvedValueOnce("pageSource"),
        alertIsVisible: jest.fn().mockResolvedValue(true),
        sendKeys: jest.fn().mockResolvedValue(undefined),
      };

      onGetOperation = jest.fn();
      window = new WebBrowserWindow(
        "firstUrl",
        clientMock as any,
        "windowHandle",
        {
          onGetOperation,
        }
      );
    });

    afterEach(() => {
      pullCapturedDatasSpy.mockRestore();
      takeScreenshotWithMarkOfSpy.mockRestore();
    });

    it("取得対象の操作のみonGetOperationコールバックに渡す", async () => {
      const isReadyToCaptureSpy = jest.spyOn(
        CaptureScript.prototype,
        "isReadyToCapture"
      );

      isReadyToCaptureSpy.mockResolvedValue(true);

      await window.captureOperations(); // 1回目の取得(1操作だけ取得対象)

      expect(onGetOperation).toBeCalledWith(expectedOperation);
      expect(onGetOperation).toBeCalledTimes(1);
      expect(capturedDatas1[0].suspendedEvent.reFire).toBeCalledTimes(1);

      await window.captureOperations(); // 2回目の取得(すべて取得対象外)

      expect(onGetOperation).toBeCalledTimes(1);
      expect(capturedDatas1[0].suspendedEvent.reFire).toBeCalledTimes(1);

      isReadyToCaptureSpy.mockRestore();
    });

    it("capturedDatasに複数operationがある場合でも、alertIsValidがtrueの場合処理を終了する", async () => {
      pullCapturedDatasSpy.mockResolvedValueOnce([
        validCapturedDatas,
        validCapturedDatas,
      ]);
      const isReadyToCaptureSpy = jest.spyOn(
        CaptureScript.prototype,
        "isReadyToCapture"
      );

      isReadyToCaptureSpy.mockResolvedValue(true);

      await window.captureOperations();

      expect(onGetOperation).toBeCalledWith(expectedOperation);
      expect(onGetOperation).toBeCalledTimes(1);
      expect(capturedDatas1[0].suspendedEvent.reFire).toBeCalledTimes(1);
      expect(capturedDatas1[1].suspendedEvent.reFire).toBeCalledTimes(0);

      isReadyToCaptureSpy.mockRestore();
    });

    it("キャプチャ準備ができていない場合は準備する", async () => {
      const isReadyToCaptureSpy = jest.spyOn(
        CaptureScript.prototype,
        "isReadyToCapture"
      );
      isReadyToCaptureSpy.mockResolvedValue(false);
      const getReadyToCaptureSpy = jest.spyOn(
        CaptureScript.prototype,
        "getReadyToCapture"
      );
      getReadyToCaptureSpy.mockResolvedValue();

      await window.captureOperations();

      expect(onGetOperation).toBeCalledWith(expectedOperation);
      expect(onGetOperation).toBeCalledTimes(1);
      expect(getReadyToCaptureSpy).toBeCalledWith([WebBrowser.SHIELD_ID]);
      expect(capturedDatas1[0].suspendedEvent.reFire).toBeCalledTimes(1);

      isReadyToCaptureSpy.mockRestore();
      getReadyToCaptureSpy.mockRestore();
    });
  });

  describe("createCapturedOperationが呼ばれたとき、指定引数及び自身の管理するページ情報を元にOperationを生成して返す", () => {
    let window: WebBrowserWindow;

    beforeEach(() => {
      const clientMock = {
        takeScreenshot: jest.fn().mockResolvedValue("screenshot"),
      };
      window = new WebBrowserWindow(
        "firstUrl",
        clientMock as any,
        "windowHandle"
      );

      window.currentScreenSummary.title = "title";
      window.currentScreenSummary.url = "url";
      window.currentOperationSummary.screenshotBase64 = "screenshot";
    });

    it("引数で指定された項目はその値を使用して生成する", () => {
      const elementInfo = {
        tagname: "tagname",
        text: "text",
        xpath: "xpath",
        attributes: {
          value: "value",
        },
      };

      const actual = window.createCapturedOperation({
        type: "type",
        windowHandle: "targetWindowHandle",
        input: "input",
        elementInfo,
        screenElements: [elementInfo],
      });

      expect(actual).toMatchObject({
        type: "type",
        windowHandle: "targetWindowHandle",
        title: "title",
        url: "url",
        imageData: "screenshot",
        input: "input",
        elementInfo,
        screenElements: [elementInfo],
        pageSource: "",
        timestamp: expect.any(String),
      });
    });

    it("引数で指定されなかった項目はデフォルト値として生成する", () => {
      const actual = window.createCapturedOperation({
        type: "type",
        windowHandle: "targetWindowHandle",
      });

      expect(actual).toMatchObject({
        type: "type",
        windowHandle: "targetWindowHandle",
        title: "title",
        url: "url",
        imageData: "screenshot",
        input: "",
        elementInfo: null,
        screenElements: [],
        pageSource: "",
        timestamp: expect.any(String),
      });
    });
  });

  describe("captureScreenTransitionが呼ばれたとき", () => {
    const clientMock = {
      getDocumentReadyState: jest.fn().mockResolvedValueOnce("complete"),
      execute: jest.fn().mockResolvedValue(true),
      getCurrentUrl: jest.fn().mockResolvedValue("url"),
    };
    const option = {
      onGetOperation: jest.fn(),
      onGetScreenTransition: jest.fn(),
      onHistoryChanged: jest.fn(),
    };

    it("screenTransitionが発生する", async () => {
      const clientMock = {
        getDocumentReadyState: jest.fn().mockResolvedValueOnce("complete"),
        execute: jest.fn().mockResolvedValue(true),
        getCurrentUrl: jest.fn().mockResolvedValue("url"),
      };
      const option = {
        onGetOperation: jest.fn(),
        onGetScreenTransition: jest.fn(),
        onHistoryChanged: jest.fn(),
      };

      const window: WebBrowserWindow = new WebBrowserWindow(
        "firstUrl",
        clientMock as any,
        "windowHandle",
        option
      );
      (window as any).createScreenTransition = jest
        .fn()
        .mockResolvedValueOnce(true);

      await window.captureScreenTransition();

      expect((window as any).onHistoryChanged).toBeCalledTimes(1);
    });
    it("currentDocumentLoadingIsCompletedがfalse", async () => {
      const clientMock = {
        getDocumentReadyState: jest.fn().mockResolvedValueOnce(""),
        execute: jest.fn(),
      };
      const window: WebBrowserWindow = new WebBrowserWindow(
        "firstUrl",
        clientMock as any,
        "windowHandle"
      );

      await window.captureScreenTransition();

      expect(clientMock.getDocumentReadyState).toBeCalledTimes(1);
      expect(clientMock.execute).toBeCalledTimes(0);
    });
    it("currentUrlが空文字", async () => {
      const clientMock = {
        getDocumentReadyState: jest.fn().mockResolvedValueOnce("complete"),
        execute: jest.fn().mockResolvedValueOnce(false),
        getCurrentUrl: jest.fn().mockResolvedValueOnce(""),
      };
      const window: WebBrowserWindow = new WebBrowserWindow(
        "firstUrl",
        clientMock as any,
        "windowHandle"
      );

      await window.captureScreenTransition();

      expect(clientMock.getCurrentUrl).toBeCalledTimes(1);
    });
    it("currentScreenHasBeenObservedがfalse、且つurlIsChangedがfalse", async () => {
      const clientMock = {
        getDocumentReadyState: jest.fn().mockResolvedValueOnce("complete"),
        execute: jest.fn().mockResolvedValueOnce(true),
        getCurrentUrl: jest.fn().mockResolvedValueOnce(""),
      };
      const window: WebBrowserWindow = new WebBrowserWindow(
        "firstUrl",
        clientMock as any,
        "windowHandle",
        {
          onGetScreenTransition: jest.fn(),
        }
      );

      (window as any).createScreenTransition = jest.fn();
      await window.captureScreenTransition();

      expect(clientMock.getCurrentUrl).toBeCalledTimes(1);
      expect((window as any).createScreenTransition).toBeCalledTimes(0);
    });
  });
});
