import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import { captureControl } from "@/store/captureControl";
import {
  PlatformName,
  Browser,
  ScreenDefType,
} from "@/lib/common/enum/SettingsEnum";

let store: any = null;
let localVue = null;

describe("captureControlストアのgettersは", () => {
  beforeEach(() => {
    localVue = createLocalVue();
    localVue.use(Vuex);
  });

  it("hasMobileDeviceSelectedが呼ばれたとき、カレントのプラットフォームがモバイルかどうかを返す", () => {
    store = new Vuex.Store({
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

    store.state.captureControl.config.platformName = PlatformName.PC;
    expect(store.getters["captureControl/hasMobileDeviceSelected"]()).toEqual(
      false
    );

    store.state.captureControl.config.platformName = PlatformName.iOS;
    expect(store.getters["captureControl/hasMobileDeviceSelected"]()).toEqual(
      true
    );

    store.state.captureControl.config.platformName = PlatformName.Android;
    expect(store.getters["captureControl/hasMobileDeviceSelected"]()).toEqual(
      true
    );
  });
});
