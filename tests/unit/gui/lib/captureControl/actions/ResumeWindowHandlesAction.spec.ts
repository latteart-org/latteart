import { ResumeWindowHandlesAction } from "@/lib/captureControl/actions/ResumeWindowHandlesAction";

describe("ResumeWindowHandlesAction", () => {
  describe("#resume", () => {
    it("ウィンドウハンドル文字列を持つオブジェクト群からウィンドウ名を付与したウィンドウ情報を生成してオブザーバに渡す", async () => {
      const observer = {
        setWindowHandles: jest.fn(),
        setIsResuming: jest.fn(),
      };

      const windowInfos = [
        { windowHandle: "aaa" },
        { windowHandle: "bbb" },
        { windowHandle: "aaa" },
        { windowHandle: "ccc" },
      ];

      await new ResumeWindowHandlesAction(observer).resume(windowInfos);

      const expected = [
        {
          text: `window1`,
          value: "aaa",
          available: false,
        },
        {
          text: `window2`,
          value: "bbb",
          available: false,
        },
        {
          text: `window3`,
          value: "ccc",
          available: false,
        },
      ];

      expect(observer.setWindowHandles).toBeCalledWith(expected);
      expect(observer.setIsResuming).toBeCalledWith(false);
    });
  });
});
