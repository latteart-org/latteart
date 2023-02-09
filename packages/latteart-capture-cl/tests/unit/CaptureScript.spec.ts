import CaptureScript from "@/capturer/browser/window/CaptureScript";
import { SeleniumWebDriverClient } from "@/webdriver/SeleniumWebDriverClient";

describe("CaptureScript", () => {
  describe("#pullCapturedDatas", () => {
    let executeSpy: any;

    beforeEach(() => {
      executeSpy = jest.spyOn(SeleniumWebDriverClient.prototype, "execute");
    });

    afterEach(() => {
      executeSpy.mockRestore();
    });

    it("コンテンツ内でスクリプトを実行した結果nullが返ってきた場合は空配列を返す", async () => {
      executeSpy.mockResolvedValue(null);

      const executor: any = { execute: executeSpy };

      const captureScript = new CaptureScript(executor);

      expect(await captureScript.pullCapturedDatas()).toEqual([]);
    });
  });
});
