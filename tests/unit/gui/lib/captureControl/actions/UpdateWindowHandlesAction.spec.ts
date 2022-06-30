import { UpdateWindowHandlesAction } from "@/lib/captureControl/actions/UpdateWindowHandlesAction";

describe("UpdateWindowHandlesAction", () => {
  describe("#update", () => {
    it("閉じられたウィンドウに無効フラグを付け、新規ウィンドウを追加したウィンドウ情報群をオブザーバに渡す", () => {
      const observer = {
        setWindowHandles: jest.fn(),
      };

      const currentWindowHandles = [
        {
          text: "window1",
          value: "value1",
          available: true,
        },
        {
          text: "window2",
          value: "value2",
          available: true,
        },
      ];
      const newWindowHandleValues = ["value1", "value3"];

      new UpdateWindowHandlesAction(observer).update(
        currentWindowHandles,
        newWindowHandleValues
      );

      expect(observer.setWindowHandles).toBeCalledWith([
        {
          text: "window1",
          value: "value1",
          available: true,
        },
        {
          text: "window2",
          value: "value2",
          available: false,
        },
        {
          text: "window3",
          value: "value3",
          available: true,
        },
      ]);
    });
  });
});
