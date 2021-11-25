import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Vuetify from "vuetify";
import ConfigView from "@/vue/pages/captureControl/configView/ConfigView.vue";
import { captureControl } from "@/store/captureControl";

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Vuetify);

describe("ConfigView.vueは", () => {
  let mutations: any;
  let rootGetters: any;
  let actions: any;
  let getters: any;
  let store: any;

  beforeEach(() => {
    mutations = {
      setPlatformName: jest.fn(),
      setBrowser: jest.fn(),
      setDevice: jest.fn(),
      setWaitTimeForStartupReload: jest.fn(),
      setScreenDefType: jest.fn(),
      setIsRegex: jest.fn(),
    };
    rootGetters = {
      message: jest
        .fn()
        .mockReturnValue(jest.fn().mockReturnValue("dummyMessage")),
      getLocale: jest.fn().mockReturnValue(jest.fn().mockReturnValue("ja")),
      getSetting: jest.fn().mockReturnValue(jest.fn().mockReturnValue("")),
    };
    actions = {
      updateDevices: jest.fn(),
    };
    getters = captureControl.getters;
    store = new Vuex.Store({
      getters: rootGetters,
      modules: {
        captureControl: {
          namespaced: true,
          state: {
            config: {
              platformName: "platformName",
              browser: "browser",
              device: {
                deviceName: "device",
                modelNumber: "modelNumber",
                osVersion: "osVersion",
              },
              devices: [
                {
                  deviceName: "device",
                  modelNumber: "modelNumber",
                  osVersion: "osVersion",
                },
              ],
              platformVersion: "1.0.0",
              waitTimeForStartupReload: 1,
            },
          },
          mutations,
          actions,
          getters,
        },
        operationHistory: {
          namespaced: true,
          state: {
            config: {
              screenDefinition: {
                screenDefType: "url",
                isRegex: false,
                screenDefList: [
                  { definition: "aa1", alias: "aa2" },
                  { definition: "bb1", alias: "bb2" },
                  { definition: "cc1", alias: "cc2" },
                ],
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

  describe("browsersプロパティのgetterが呼ばれた時", () => {
    it('vuexのstore.state.captureControl.config.platformNameがAndroidの場合は"Chrome"だけを要素に持つ配列を返す', () => {
      const wrapper = shallowMount(ConfigView, { localVue, store }).vm as any;
      store.state.captureControl.config.platformName = "Android";
      const actual = wrapper.browsers;
      expect(actual).toEqual(["Chrome"]);
    });
    it('vuexのstore.state.captureControl.config.platformNameがAndroid以外の場合も"Chrome"だけを要素に持つ配列を返す', () => {
      const wrapper = shallowMount(ConfigView, { localVue, store }).vm as any;
      store.state.captureControl.config.platformName = "Windows";
      const actual = wrapper.browsers;
      expect(actual).toEqual(["Chrome"]);
    });
  });

  describe("connectDevicesメソッドが呼ばれた時", () => {
    it("プラットフォーム名を引数にストアのcaptureControl/updateDeviceアクションを呼ぶ", () => {
      store.dispatch = jest.fn();
      const wrapper = shallowMount(ConfigView, { localVue, store }).vm as any;
      wrapper.connectDevices();
      expect(store.dispatch).toBeCalledWith("captureControl/updateDevices", {
        platformName: "platformName",
      });
    });
  });

  describe("devicesプロパティのgetterが呼ばれた時", () => {
    it("ストアから取得したデバイス情報群を返す", () => {
      const wrapper = shallowMount(ConfigView, { localVue, store }).vm as any;
      wrapper.connectDevices();

      const devices = wrapper.devices;

      expect(devices).toEqual([
        {
          deviceName: "device",
          modelNumber: "modelNumber",
          osVersion: "osVersion",
        },
      ]);
    });
  });

  describe("selectedPlatformNameプロパティのgetterが呼ばれた時", () => {
    it("vuexのstore.state.captureControl.config.platformNameの値を返す", () => {
      const wrapper = shallowMount(ConfigView, { localVue, store }).vm as any;
      const actual = wrapper.selectedPlatformName;
      expect(actual).toEqual(store.state.captureControl.config.platformName);
    });
  });

  describe("selectedPlatformNameプロパティのsetterが呼ばれた時", () => {
    it("vuexのstore.stateと渡された値を引数にvuexのmutations.setPlatformNameを呼ぶ", () => {
      const wrapper = shallowMount(ConfigView, { localVue, store }).vm as any;
      const platformName = "hoge";
      wrapper.selectedPlatformName = platformName;
      const payload = { platformName };
      expect(mutations.setPlatformName).toHaveBeenCalledWith(
        store.state.captureControl,
        payload
      );
    });
  });

  describe("selectedBrowserプロパティのgetterが呼ばれた時", () => {
    it("vuexのstore.state.captureControl.config.browserの値を返す", () => {
      const wrapper = shallowMount(ConfigView, { localVue, store }).vm as any;
      const actual = wrapper.selectedBrowser;
      expect(actual).toEqual(store.state.captureControl.config.browser);
    });
  });

  describe("selectedBrowserプロパティのsetterが呼ばれた時", () => {
    it("vuexのstore.stateと渡された値を引数にvuexのmutations.setBrowserを呼ぶ", () => {
      const wrapper = shallowMount(ConfigView, { localVue, store }).vm as any;
      const browser = "hoge";
      wrapper.selectedBrowser = browser;
      const payload = { browser }; // vuexのmutationには複数引数を渡せないためオブジェクトにする
      expect(mutations.setBrowser).toHaveBeenCalledWith(
        store.state.captureControl,
        payload
      );
    });
  });

  describe("selectedDeviceプロパティのgetterが呼ばれた時", () => {
    it("vuexのstore.state.captureControl.config.deviceの値を返す", () => {
      const wrapper = shallowMount(ConfigView, { localVue, store }).vm as any;
      const actual = wrapper.selectedDevice;
      expect(actual).toEqual(store.state.captureControl.config.device);
    });
  });

  describe("selectedDeviceプロパティのsetterが呼ばれた時", () => {
    it("vuexのstore.stateと渡された値を引数にvuexのmutations.setDeviceを呼ぶ", () => {
      const wrapper = shallowMount(ConfigView, { localVue, store }).vm as any;
      const device = {
        deviceName: "hoge",
        modelNumber: "huga",
        osVersion: "piyo",
      };
      wrapper.selectedDevice = device;
      const payload = { device }; // vuexのmutationには複数引数を渡せないためオブジェクトにする
      expect(mutations.setDevice).toHaveBeenCalledWith(
        store.state.captureControl,
        payload
      );
    });
  });

  describe("isDisabledDeviceConfigプロパティのgetterが呼ばれた時", () => {
    it("platformNameがPCの場合はtrueを返す", () => {
      store.state.captureControl.config.platformName = "PC";
      const wrapper = shallowMount(ConfigView, { localVue, store }).vm as any;
      const actual = wrapper.isDisabledDeviceConfig;
      expect(actual).toBeTruthy();
    });
    it("platformNameがWindows以外の場合はfalseを返す", () => {
      store.state.captureControl.config.platformName = "Android";
      const wrapper = shallowMount(ConfigView, { localVue, store }).vm as any;
      const actual = wrapper.isDisabledDeviceConfig;
      expect(actual).toBeFalsy();
    });
  });

  describe("waitTimeForStartupReloadプロパティのgetterが呼ばれた時", () => {
    it("vuexのstore.state.captureControl.config.waitTimeForStartupReloadの値を返す", () => {
      const wrapper = shallowMount(ConfigView, { localVue, store }).vm as any;
      const actual = wrapper.waitTimeForStartupReload;
      expect(actual).toEqual(
        store.state.captureControl.config.waitTimeForStartupReload
      );
    });
  });

  describe("waitTimeForStartupReloadプロパティのsetterが呼ばれた時", () => {
    it("vuexのstore.stateと渡された値を引数にvuexのmutations.setWaitTimeForStartupReloadを呼ぶ", () => {
      const wrapper = shallowMount(ConfigView, { localVue, store }).vm as any;
      const waitTimeForStartupReload = 10;
      wrapper.waitTimeForStartupReload = waitTimeForStartupReload;
      const payload = { waitTimeForStartupReload }; // vuexのmutationには複数引数を渡せないためオブジェクトにする
      expect(mutations.setWaitTimeForStartupReload).toHaveBeenCalledWith(
        store.state.captureControl,
        payload
      );
    });
  });
});
