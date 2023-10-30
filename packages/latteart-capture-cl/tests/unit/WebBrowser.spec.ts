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
        waitUntilFrameUnlock: jest.fn(),
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
});
