import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";

import { captureControl } from "@/store/captureControl";
import { WindowHandle } from "@/lib/operationHistory/types";

describe("captureControlストアは", () => {
  describe("actionsのupdateWindowHandlesが呼ばれたとき、windowHandlesデータを保存する", () => {
    let store: any = null;
    let localVue = null;

    beforeEach(() => {
      (localVue = createLocalVue()),
        localVue.use(Vuex),
        (store = new Vuex.Store({
          modules: {
            captureControl: {
              namespaced: true,
              actions: captureControl.actions,
              mutations: captureControl.mutations,
              getters: captureControl.getters,
              state: {
                windowHandles: Array<WindowHandle>(),
              },
            },
          },
        }));
    });

    it("新規handleを追加", () => {
      store.dispatch("captureControl/updateWindowHandles", {
        availableWindowHandles: ["windowid_aaa", "windowid_bbb"],
      });
      expect(store.state.captureControl.windowHandles).toEqual([
        { text: "window1", value: "windowid_aaa", available: true },
        { text: "window2", value: "windowid_bbb", available: true },
      ]);

      const input2 = { availableWindowHandles: ["windowid_aaa"] };
      store.dispatch("captureControl/updateWindowHandles", input2);
      expect(store.state.captureControl.windowHandles).toEqual([
        { text: "window1", value: "windowid_aaa", available: true },
        { text: "window2", value: "windowid_bbb", available: false },
      ]);

      const input3 = {
        availableWindowHandles: ["windowid_aaa", "windowid_ccc"],
      };
      store.dispatch("captureControl/updateWindowHandles", input3);
      expect(store.state.captureControl.windowHandles).toEqual([
        { text: "window1", value: "windowid_aaa", available: true },
        { text: "window2", value: "windowid_bbb", available: false },
        { text: "window3", value: "windowid_ccc", available: true },
      ]);
    });
  });

  describe("resumeWindowHandlesが呼ばれたとき、windowHandlesデータを保存する", () => {
    let store: any = null;
    let localVue = null;

    beforeEach(() => {
      (localVue = createLocalVue()),
        localVue.use(Vuex),
        (store = new Vuex.Store({
          getters: {},
          mutations: {},
          modules: {
            captureControl: {
              namespaced: true,
              actions: captureControl.actions,
              mutations: captureControl.mutations,
              getters: captureControl.getters,
              state: {
                windowHandles: Array<WindowHandle>(),
              },
            },
          },
        }));
    });

    it("新規handleを追加", () => {
      store.dispatch("captureControl/resumeWindowHandles", {
        history: [
          {
            operation: {
              windowHandle: "windowid_aaa",
            },
            intention: null,
            bug: null,
            notice: null,
          },
          {
            operation: {
              windowHandle: "windowid_bbb",
            },
            intention: null,
            bug: null,
            notice: null,
          },
        ],
      });
      expect(store.state.captureControl.windowHandles).toEqual([
        { text: "window1", value: "windowid_aaa", available: false },
        { text: "window2", value: "windowid_bbb", available: false },
      ]);
    });
  });
});
