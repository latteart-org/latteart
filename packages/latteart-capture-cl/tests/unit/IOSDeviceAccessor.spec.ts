import { IOSDeviceAccessor } from "@/device/IOSDeviceAccessor";

describe("IOSDeviceAccessorは", () => {
  describe("getDevicesが呼ばれたとき、接続中のデバイス情報を返す", () => {
    it("適切なlibimobiledeviceのコマンドを用いて取得する", async () => {
      const execCommand = jest
        .fn()
        .mockResolvedValueOnce("deviceName1\ndeviceName2\n")
        .mockResolvedValueOnce("modelNumber1\n" as any)
        .mockResolvedValueOnce("modelNumber2\n" as any)
        .mockResolvedValueOnce("osVersion1\n" as any)
        .mockResolvedValueOnce("osVersion2\n" as any);

      const service = new IOSDeviceAccessor(execCommand as any);
      const actual = await service.getDevices();

      expect(actual).toEqual([
        {
          id: "deviceName1",
          name: "modelNumber1",
          osVersion: "osVersion1",
          platform: "iOS",
        },
        {
          id: "deviceName2",
          name: "modelNumber2",
          osVersion: "osVersion2",
          platform: "iOS",
        },
      ]);
      expect(execCommand).toBeCalledWith("idevice_id -l");
      expect(execCommand).toBeCalledWith(
        "ideviceinfo -u deviceName1 -k ModelNumber"
      );
      expect(execCommand).toBeCalledWith(
        "ideviceinfo -u deviceName1 -k ProductVersion"
      );
      expect(execCommand).toBeCalledWith(
        "ideviceinfo -u deviceName2 -k ModelNumber"
      );
      expect(execCommand).toBeCalledWith(
        "ideviceinfo -u deviceName2 -k ProductVersion"
      );
    });

    describe("コマンド実行に失敗した場合は空配列を返す", () => {
      it("デバイス名取得の時点で失敗する場合", async () => {
        const execCommand = jest.fn().mockImplementation(() => {
          throw new Error();
        });

        const service = new IOSDeviceAccessor(execCommand);
        const actual = await service.getDevices();

        expect(actual).toEqual([]);
      });

      it("モデル番号とOSバージョンの取得で失敗する場合", async () => {
        const execCommand = jest
          .fn()
          .mockResolvedValueOnce("deviceName1\ndeviceName2\n")
          .mockRejectedValue(new Error());

        const service = new IOSDeviceAccessor(execCommand as any);
        const actual = await service.getDevices();

        expect(actual).toEqual([]);
      });
    });
  });

  describe("deviceIsConnectedが呼ばれたとき、指定デバイスが接続されているか否かを返す", () => {
    it("指定デバイスが接続されている場合はtrueを返す", async () => {
      const execCommand = jest
        .fn()
        .mockResolvedValueOnce("deviceName1\n")
        .mockResolvedValueOnce("modelNumber1\n" as any)
        .mockResolvedValueOnce("osVersion1\n" as any);

      const service = new IOSDeviceAccessor(execCommand as any);
      const actual = await service.deviceIsConnected("deviceName1");

      expect(actual).toEqual(true);
    });

    it("指定デバイスが接続されていない場合はfalseを返す", async () => {
      const execCommand = jest
        .fn()
        .mockResolvedValueOnce("deviceName2\n")
        .mockResolvedValueOnce("modelNumber2\n" as any)
        .mockResolvedValueOnce("osVersion2\n" as any);

      const service = new IOSDeviceAccessor(execCommand as any);
      const actual = await service.deviceIsConnected("deviceName1");

      expect(actual).toEqual(false);
    });

    it("コマンド実行に失敗した場合はfalseを返す", async () => {
      const execCommand = jest.fn().mockImplementation(() => {
        throw new Error();
      });

      const service = new IOSDeviceAccessor(execCommand);
      const actual = await service.deviceIsConnected("deviceName1");

      expect(actual).toEqual(false);
    });
  });
});
