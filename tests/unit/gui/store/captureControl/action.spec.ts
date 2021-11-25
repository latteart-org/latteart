import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import { captureControl } from "@/store/captureControl";
import {
  PlatformName,
  Browser,
  ScreenDefType,
} from "@/lib/common/enum/SettingsEnum";
import ClientSideCaptureServiceDispatcher from "@/lib/eventDispatcher/ClientSideCaptureServiceDispatcher";

let store: any = null;
let localVue = null;

describe("captureControlストアのactionは", () => {
  beforeEach(() => {
    localVue = createLocalVue();
    localVue.use(Vuex);
  });

  describe("updateDevicesが呼ばれたとき、デバイス情報の再取得を行い、ストア内の状態を更新する", () => {
    beforeEach(() => {
      store = new Vuex.Store({
        state: {
          clientSideCaptureServiceDispatcher: new ClientSideCaptureServiceDispatcher(),
        } as any,
        modules: {
          captureControl: {
            namespaced: true,
            actions: captureControl.actions,
            mutations: captureControl.mutations,
            getters: captureControl.getters,
            state: {
              isCapturing: false,
              windowHandles: [],
              isMaximizeMode: true,
              config: {
                platformName: PlatformName.PC,
                browser: Browser.Chrome,
                devices: [],
                device: {
                  deviceName: "",
                  modelNumber: "",
                  osVersion: "",
                },
                platformVersion: "",
                waitTimeForStartupReload: 0,
                screenDefinition: {
                  screenDefType: ScreenDefType.Title,
                  isRegex: false,
                  screenDefList: [],
                },
                exclusionElements: {
                  tags: [],
                },
              },
            },
          },
        },
      });
    });

    it("1つ以上デバイス情報が取得できた場合は先頭のデバイス情報をカレントに設定する", async () => {
      const deviceInfo1 = {
        deviceName: "deviceName1",
        modelNumber: "modelNumber1",
        osVersion: "osVersion1",
      };
      const deviceInfo2 = {
        deviceName: "deviceName2",
        modelNumber: "modelNumber2",
        osVersion: "osVersion2",
      };

      const getDevicesSpy = jest.spyOn(
        ClientSideCaptureServiceDispatcher.prototype,
        "recognizeDevices"
      );
      getDevicesSpy.mockResolvedValue({
        succeeded: true,
        data: [deviceInfo1, deviceInfo2],
      } as any);

      await store.dispatch("captureControl/updateDevices", {
        platformName: "PC",
      });

      expect(getDevicesSpy).toBeCalledWith("PC");
      expect(store.state.captureControl.config.devices).toEqual([
        deviceInfo1,
        deviceInfo2,
      ]);
      expect(store.state.captureControl.config.device).toEqual(deviceInfo1);
    });

    it("デバイス情報が1つも取得できなかった場合は空のデバイス情報をカレントに設定する", async () => {
      const getDevicesSpy = jest.spyOn(
        ClientSideCaptureServiceDispatcher.prototype,
        "recognizeDevices"
      );
      getDevicesSpy.mockResolvedValue({
        succeeded: true,
        data: [],
      } as any);

      await store.dispatch("captureControl/updateDevices", {
        platformName: "PC",
      });

      expect(getDevicesSpy).toBeCalledWith("PC");
      expect(store.state.captureControl.config.devices).toEqual([]);
      expect(store.state.captureControl.config.device).toEqual({
        deviceName: "",
        modelNumber: "",
        osVersion: "",
      });
    });
  });
});
