import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Vuetify from "vuetify";
import VueRouter from "vue-router";
import ManageProgressView from "@/vue/pages/testManagement/manageProgressView/ManageProgressView.vue";
import moment from "moment";

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Vuetify);

describe("ManageProgressView.vueは", () => {
  let store: any;
  let router: any;

  const groups = [
    {
      id: "groupId1",
      name: "groupName1",
      testTargets: [
        {
          id: "testTargetId1",
          name: "testTargetName1",
          progress: {
            planNumber: 1,
            completedNumber: 1,
            incompletedNumber: 1,
          },
        },
        {
          id: "testTargetId2",
          name: "testTargetName2",
          progress: {
            planNumber: 1,
            completedNumber: 1,
            incompletedNumber: 1,
          },
        },
      ],
    },
    {
      id: "groupId2",
      name: "groupName2",
      testTargets: [
        {
          id: "testTargetId3",
          name: "testTargetName3",
          progress: {
            planNumber: 2,
            completedNumber: 2,
            incompletedNumber: 2,
          },
        },
        {
          id: "testTargetId4",
          name: "testTargetName4",
          progress: {
            planNumber: 2,
            completedNumber: 2,
            incompletedNumber: 2,
          },
        },
      ],
    },
  ];

  beforeEach(() => {
    const routes = [
      {
        path: "progress",
        name: "manageProgressView",
        component: ManageProgressView,
      },
    ];
    router = new VueRouter({
      routes,
    });

    store = new Vuex.Store({
      state: {
        testManagement: {
          testMatrices: [
            {
              id: "m000",
              name: "",
              groups: [
                {
                  id: "groupId1",
                  name: "groupName1",
                  testTargets: [
                    { id: "testTargetId1", name: "testTargetName1" },
                    { id: "testTargetId2", name: "testTargetName2" },
                  ],
                },
                {
                  id: "groupId2",
                  name: "groupName2",
                  testTargets: [
                    { id: "testTargetId3", name: "testTargetName3" },
                    { id: "testTargetId4", name: "testTargetName4" },
                  ],
                },
              ],
            },
          ],
        },
      },
      getters: {
        message: () => {
          return (message: string) => {
            return message;
          };
        },
        getLocale: jest.fn().mockReturnValue(jest.fn().mockReturnValue("ja")),
        "testManagement/collectProgressDatas": jest.fn().mockReturnValue(
          jest.fn().mockReturnValue([
            {
              testMatrixId: "m000",
              testMatrixProgressDatas: [
                {
                  date: moment("2019-07-24 23:59:59.999").unix().toString(),
                  groups,
                },
                {
                  date: moment("2019-07-25 10:00:00.000").unix().toString(),
                  groups,
                },
                {
                  date: moment("2019-07-26 23:59:59.999").unix().toString(),
                  groups,
                },
                {
                  date: moment("2019-07-27 00:00:00.000").unix().toString(),
                  groups,
                },
              ],
            },
          ])
        ),
      },
    });
  });

  it("groupsプロパティのgetterが呼ばれたとき、フィルタ用プルダウンリストに表示するためのグループ情報を返す", () => {
    const testMatrixId = "m000";
    const $route = { params: { testMatrixId } };
    const vm = shallowMount(ManageProgressView, {
      localVue,
      router,
      store,
      mocks: { $route },
    }).vm as any;

    expect(vm.groups).toEqual([
      {
        id: "all",
        name: "manage-progress.all",
      },
      {
        id: "groupId1",
        name: "groupName1",
      },
      {
        id: "groupId2",
        name: "groupName2",
      },
    ]);
  });

  describe("testTargetsプロパティのgetterが呼ばれたとき、フィルタ用プルダウンリストに表示するためのテスト対象情報を返す", () => {
    it("グループでフィルタされていない場合は全てのテスト対象情報を返す", () => {
      const testMatrixId = "m000";
      const $route = { params: { testMatrixId } };
      const vm = shallowMount(ManageProgressView, {
        localVue,
        router,
        store,
        mocks: { $route },
      }).vm as any;

      expect(vm.testTargets).toEqual([
        {
          id: "all",
          name: "manage-progress.all",
        },
        {
          id: "groupId1-testTargetId1",
          name: "testTargetName1",
        },
        {
          id: "groupId1-testTargetId2",
          name: "testTargetName2",
        },
        {
          id: "groupId2-testTargetId3",
          name: "testTargetName3",
        },
        {
          id: "groupId2-testTargetId4",
          name: "testTargetName4",
        },
      ]);
    });

    it("グループでフィルタされている場合は絞り込まれたグループ内から抽出されたテスト対象情報を返す", () => {
      const testMatrixId = "m000";
      const $route = { params: { testMatrixId } };
      const vm = shallowMount(ManageProgressView, {
        localVue,
        router,
        store,
        mocks: { $route },
      }).vm as any;

      vm.selectedGroupId = "groupId1";

      expect(vm.testTargets).toEqual([
        {
          id: "all",
          name: "manage-progress.all",
        },
        {
          id: "groupId1-testTargetId1",
          name: "testTargetName1",
        },
        {
          id: "groupId1-testTargetId2",
          name: "testTargetName2",
        },
      ]);
    });
  });

  describe("filteredProgressDatasプロパティのgetterが呼ばれたとき、storeから取得した進捗データに対してフィルタリングを実施して返す", () => {
    it("フィルタリングなし", () => {
      const testMatrixId = "m000";
      const $route = { params: { testMatrixId } };
      const vm = shallowMount(ManageProgressView, {
        localVue,
        router,
        store,
        mocks: { $route },
      }).vm as any;

      expect(vm.filteredProgressDatas).toEqual([
        {
          date: "2019-07-24",
          planNumber: 6,
          completedNumber: 6,
          incompletedNumber: 6,
        },
        {
          date: "2019-07-25",
          planNumber: 6,
          completedNumber: 6,
          incompletedNumber: 6,
        },
        {
          date: "2019-07-26",
          planNumber: 6,
          completedNumber: 6,
          incompletedNumber: 6,
        },
        {
          date: "2019-07-27",
          planNumber: 6,
          completedNumber: 6,
          incompletedNumber: 6,
        },
      ]);
    });

    it("日付でフィルタリング", () => {
      const testMatrixId = "m000";
      const $route = { params: { testMatrixId } };
      const vm = shallowMount(ManageProgressView, {
        localVue,
        router,
        store,
        mocks: { $route },
      }).vm as any;

      vm.startDate = "2019-07-25";
      vm.endDate = "2019-07-26";

      expect(vm.filteredProgressDatas).toEqual([
        {
          date: "2019-07-25",
          planNumber: 6,
          completedNumber: 6,
          incompletedNumber: 6,
        },
        {
          date: "2019-07-26",
          planNumber: 6,
          completedNumber: 6,
          incompletedNumber: 6,
        },
      ]);
    });

    it("グループでフィルタリング", () => {
      const testMatrixId = "m000";
      const $route = { params: { testMatrixId } };
      const vm = shallowMount(ManageProgressView, {
        localVue,
        router,
        store,
        mocks: { $route },
      }).vm as any;

      (vm.selectedGroupId = "groupId1"),
        expect(vm.filteredProgressDatas).toEqual([
          {
            date: "2019-07-24",
            planNumber: 2,
            completedNumber: 2,
            incompletedNumber: 2,
          },
          {
            date: "2019-07-25",
            planNumber: 2,
            completedNumber: 2,
            incompletedNumber: 2,
          },
          {
            date: "2019-07-26",
            planNumber: 2,
            completedNumber: 2,
            incompletedNumber: 2,
          },
          {
            date: "2019-07-27",
            planNumber: 2,
            completedNumber: 2,
            incompletedNumber: 2,
          },
        ]);
    });

    it("テスト対象でフィルタリング", () => {
      const testMatrixId = "m000";
      const $route = { params: { testMatrixId } };
      const vm = shallowMount(ManageProgressView, {
        localVue,
        router,
        store,
        mocks: { $route },
      }).vm as any;

      (vm.selectedTestTargetId = "groupId1-testTargetId1"),
        expect(vm.filteredProgressDatas).toEqual([
          {
            date: "2019-07-24",
            planNumber: 1,
            completedNumber: 1,
            incompletedNumber: 1,
          },
          {
            date: "2019-07-25",
            planNumber: 1,
            completedNumber: 1,
            incompletedNumber: 1,
          },
          {
            date: "2019-07-26",
            planNumber: 1,
            completedNumber: 1,
            incompletedNumber: 1,
          },
          {
            date: "2019-07-27",
            planNumber: 1,
            completedNumber: 1,
            incompletedNumber: 1,
          },
        ]);
    });

    it("日付とグループとテスト対象でフィルタリング", () => {
      const testMatrixId = "m000";
      const $route = { params: { testMatrixId } };
      const vm = shallowMount(ManageProgressView, {
        localVue,
        router,
        store,
        mocks: { $route },
      }).vm as any;

      vm.startDate = "2019-07-25";
      vm.endDate = "2019-07-26";
      (vm.selectedGroupId = "groupId1"),
        (vm.selectedTestTargetId = "groupId1-testTargetId1"),
        expect(vm.filteredProgressDatas).toEqual([
          {
            date: "2019-07-25",
            planNumber: 1,
            completedNumber: 1,
            incompletedNumber: 1,
          },
          {
            date: "2019-07-26",
            planNumber: 1,
            completedNumber: 1,
            incompletedNumber: 1,
          },
        ]);
    });
  });
});
