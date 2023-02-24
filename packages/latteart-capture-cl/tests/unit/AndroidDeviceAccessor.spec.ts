import { AndroidDeviceAccessor } from "@/device/AndroidDeviceAccessor";

describe("AndroidDeviceAccessorは", () => {
  describe("getDevicesが呼ばれたとき、接続中のデバイス情報を返す", () => {
    it("適切なadbのコマンドを用いて取得する", async () => {
      const execCommand = jest
        .fn()
        .mockResolvedValueOnce(
          "List of devices attached\ndeviceName1    device\ndeviceName2    device"
        )
        .mockResolvedValueOnce("modelNumber1" as any)
        .mockResolvedValueOnce("modelNumber2" as any)
        .mockResolvedValueOnce("osVersion1" as any)
        .mockResolvedValueOnce("osVersion2" as any);

      const service = new AndroidDeviceAccessor(execCommand as any);
      const actual = await service.getDevices();

      expect(actual).toEqual([
        {
          id: "deviceName1",
          name: "modelNumber1",
          osVersion: "osVersion1",
          platform: "Android",
        },
        {
          id: "deviceName2",
          name: "modelNumber2",
          osVersion: "osVersion2",
          platform: "Android",
        },
      ]);
      expect(execCommand).toBeCalledWith("adb devices");
      expect(execCommand).toBeCalledWith(
        "adb -s deviceName1 shell getprop ro.product.model"
      );
      expect(execCommand).toBeCalledWith(
        "adb -s deviceName1 shell getprop ro.build.version.release"
      );
      expect(execCommand).toBeCalledWith(
        "adb -s deviceName2 shell getprop ro.product.model"
      );
      expect(execCommand).toBeCalledWith(
        "adb -s deviceName2 shell getprop ro.build.version.release"
      );
    });

    describe("コマンド実行に失敗した場合は空配列を返す", () => {
      it("デバイス名取得の時点で失敗する場合", async () => {
        const execCommand = jest.fn().mockImplementation(() => {
          throw new Error();
        });

        const service = new AndroidDeviceAccessor(execCommand);
        const actual = await service.getDevices();

        expect(actual).toEqual([]);
      });

      it("モデル番号とOSバージョンの取得で失敗する場合", async () => {
        const execCommand = jest
          .fn()
          .mockResolvedValueOnce(
            "List of devices attached\ndeviceName1    device\ndeviceName2    device"
          )
          .mockRejectedValue(new Error());

        const service = new AndroidDeviceAccessor(execCommand as any);
        const actual = await service.getDevices();

        expect(actual).toEqual([]);
      });
    });
  });

  describe("deviceIsConnectedが呼ばれたとき、指定デバイスが接続されているか否かを返す", () => {
    it("指定デバイスが接続されている場合はtrueを返す", async () => {
      const execCommand = jest
        .fn()
        .mockResolvedValueOnce(
          "List of devices attached\ndeviceName1    device"
        )
        .mockResolvedValueOnce("modelNumber1" as any)
        .mockResolvedValueOnce("osVersion1" as any);

      const service = new AndroidDeviceAccessor(execCommand as any);
      const actual = await service.deviceIsConnected("deviceName1");

      expect(actual).toEqual(true);
    });

    it("指定デバイスが接続されていない場合はfalseを返す", async () => {
      const execCommand = jest
        .fn()
        .mockResolvedValueOnce(
          "List of devices attached\ndeviceName2    device"
        )
        .mockResolvedValueOnce("modelNumber2" as any)
        .mockResolvedValueOnce("osVersion2" as any);

      const service = new AndroidDeviceAccessor(execCommand as any);
      const actual = await service.deviceIsConnected("deviceName1");

      expect(actual).toEqual(false);
    });

    it("コマンド実行に失敗した場合はfalseを返す", async () => {
      const execCommand = jest.fn().mockImplementation(() => {
        throw new Error();
      });

      const service = new AndroidDeviceAccessor(execCommand);
      const actual = await service.deviceIsConnected("deviceName1");

      expect(actual).toEqual(false);
    });
  });
});
