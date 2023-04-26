import WebBrowser from "@/capturer/browser/WebBrowser";
import { CaptureConfig } from "@/CaptureConfig";

describe("WebBrowserは", () => {
  describe("openが呼ばれるとブラウザを開き、監視を開始する", () => {
    let clientMock: any;
    let config: CaptureConfig;

    beforeEach(() => {
      clientMock = {
        setTimeouts: jest.fn(),
        open: jest.fn(),
        sleep: jest.fn(),
        refresh: jest.fn(),
        getCurrentWindowHandle: jest
          .fn()
          .mockResolvedValue("firstWindowHandle"),
      };

      config = new CaptureConfig();
    });

    it("設定のリロードまでの時間が0より大きい場合は指定時間(秒)待機し、リロードする", async () => {
      config.waitTimeForStartupReload = 1;

      const url = "firstUrl";
      const browser = new WebBrowser(clientMock, config);
      await browser.open(url);

      expect(clientMock.sleep).toBeCalledWith(
        config.waitTimeForStartupReload * 1000
      );
      expect(clientMock.refresh).toBeCalled();
      expect(clientMock.setTimeouts).not.toBeCalled();
      expect(clientMock.open).toBeCalledWith(url);
    });

    it("設定のリロードまでの時間が0の場合は待機もリロードもしない", async () => {
      config.waitTimeForStartupReload = 0;

      const url = "firstUrl";

      const browser = new WebBrowser(clientMock, config);
      await browser.open(url);

      expect(clientMock.sleep).not.toBeCalled();
      expect(clientMock.refresh).not.toBeCalled();
      expect(clientMock.setTimeouts).not.toBeCalled();
      expect(clientMock.open).toBeCalledWith(url);
    });
  });

  describe("updateStateが呼ばれたとき、現在有効なウィンドウ一覧を再検出する", () => {
    let clientMock: any;
    let config: CaptureConfig;

    beforeEach(() => {
      clientMock = {
        getAllWindowHandles: jest.fn(),
        getCurrentUrl: jest.fn().mockResolvedValue("http://127.0.0.1/dummy"),
        getTitle: jest.fn().mockResolvedValue("dummy"),
        takeScreenshot: jest.fn().mockResolvedValue("dummy"),
        switchTo: jest.fn().mockReturnValue({
          window: jest.fn().mockResolvedValue(undefined),
        }),
        execute: jest.fn(),
        switchWindowTo: jest.fn(),
        getCurrentPageText: jest.fn(),
      };
      config = new CaptureConfig();
    });

    afterEach(() => {
      // blockWindowSpy.mockRestore();
    });

    it("ウィンドウが増減した場合", async () => {
      clientMock.getAllWindowHandles = jest
        .fn()
        .mockResolvedValueOnce(["windowHandle1", "windowHandle2"]) // 増加
        .mockResolvedValueOnce(["windowHandle2"]); // 減少

      clientMock.execute = jest
        .fn()
        // 1回目のupdateState
        .mockResolvedValueOnce("windowHandle1") // createWindows内のgetBrowsingWindowHandle
        .mockResolvedValueOnce(undefined) // createWindows内のinitGurd
        .mockResolvedValueOnce(undefined) // createWindows内のinjectFunctionToDetectWindowSwitch(windowHandle1)
        .mockResolvedValueOnce(undefined) // createWindows内のwindow.focus(windowHandle1)
        .mockResolvedValueOnce(undefined) // createWindows内のinitGurd
        .mockResolvedValueOnce(undefined) // createWindows内のinjectFunctionToDetectWindowSwitch(windowHandle2)
        .mockResolvedValueOnce(undefined) // createWindows内のwindow.focus(windowHandle2)
        .mockResolvedValueOnce("windowHandle1") // updateState内のgetBrowsingWindowHandle
        .mockResolvedValueOnce(undefined) // updateState内のユーザ操作のアンブロック
        .mockResolvedValueOnce(undefined) // updateState内のinjectFunctionToDetectWindowSwitch
        // 2回目のupdateState
        .mockResolvedValueOnce("windowHandle2") // createWindows内のgetBrowsingWindowHandle
        .mockResolvedValueOnce("windowHandle2") // updateState内のgetBrowsingWindowHandle
        .mockResolvedValueOnce(undefined) // updateState内のユーザ操作のアンブロック
        .mockResolvedValueOnce(undefined); // updateState内のinjectFunctionToDetectWindowSwitch

      const browser = new WebBrowser(clientMock, config);

      expect(browser.countWindows()).toEqual(0);
      expect(browser.currentWindow).toBeUndefined();

      await browser.updateState(); // 増加

      expect(browser.countWindows()).toEqual(2);
      expect(browser.currentWindow?.windowHandle).toEqual("windowHandle1");

      await browser.updateState(); // 減少

      expect(browser.countWindows()).toEqual(1);
      expect(browser.currentWindow?.windowHandle).toEqual("windowHandle2");
    });
  });
});
