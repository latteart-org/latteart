import Vuex from "vuex";
import { createLocalVue } from "@vue/test-utils";
import { testManagement } from "@/store/testManagement";

let store: any = null;
let localVue = null;

describe("testManagementストアのactionは", () => {
  beforeEach(() => {
    localVue = createLocalVue();
    localVue.use(Vuex);
  });

  describe("managedDataEqualsToが呼ばれたとき、渡された管理情報とstore内のテスト管理情報が一致しているか確認し、結果を返却する", () => {
    beforeEach(() => {
      store = new Vuex.Store({
        modules: {
          testManagement: {
            namespaced: true,
            actions: testManagement.actions,
            mutations: testManagement.mutations,
            getters: testManagement.getters,
            state: {
              testMatrices: ["dummyTestMatrix"],
              stories: ["dummyStory"],
              progressDatas: [],
              tempStory: null,
            },
          },
        },
      });
    });

    it("一致している場合はtrueを返す", async () => {
      expect(
        await store.dispatch("testManagement/managedDataEqualsTo", {
          testMatrices: ["dummyTestMatrix"],
          stories: ["dummyStory"],
        })
      ).toBeTruthy();
    });

    it("一致していない場合はfalseを返す", async () => {
      expect(
        await store.dispatch("testManagement/managedDataEqualsTo", {
          testMatrices: ["ng"],
          stories: ["dummyStory"],
        })
      ).toBeFalsy();

      expect(
        await store.dispatch("testManagement/managedDataEqualsTo", {
          testMatrices: ["dummyTestMatrix"],
          stories: ["ng"],
        })
      ).toBeFalsy();

      expect(
        await store.dispatch("testManagement/managedDataEqualsTo", {
          testMatrices: [],
          stories: ["dummyStory"],
        })
      ).toBeFalsy();

      expect(
        await store.dispatch("testManagement/managedDataEqualsTo", {
          testMatrices: ["dummyTestMatrix"],
          stories: [],
        })
      ).toBeFalsy();
    });
  });
});
