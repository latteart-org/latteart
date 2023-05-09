import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import Vuetify from "vuetify";
import VueRouter from "vue-router";
import ManageQualityView from "@/components/pages/testManagement/manageQualityView/ManageQualityView.vue";

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Vuetify);

describe("ManageQualityView.vueは", () => {
  let store: any;
  let router: any;

  const viewPoints = [
    { id: "s000", name: "story0" },
    { id: "s001", name: "story1" },
    { id: "s002", name: "story2" },
  ];
  const plans = [
    { viewPointId: "s000", value: 1 },
    { viewPointId: "s001", value: 1 },
    { viewPointId: "s002", value: 1 },
  ];
  const groups = [
    {
      id: "g000",
      name: "group0",
      testTargets: [
        { id: "t000", name: "g0-testTarget0", plans },
        { id: "t001", name: "g0-testTarget1", plans },
        { id: "t002", name: "g0-testTarget2", plans },
      ],
    },
    {
      id: "g001",
      name: "group1",
      testTargets: [
        { id: "t003", name: "g1-testTarget3", plans },
        { id: "t004", name: "g1-testTarget4", plans },
        { id: "t005", name: "g1-testTarget5", plans },
      ],
    },
  ];
  const emptySession = {
    testItem: "",
    testerName: "",
    memo: "",
    attachedFiles: [],
    testResultFiles: [],
    initialUrl: "",
    testPurposes: [],
  };
  const stories = [
    {
      id: "storyId1",
      testMatrixId: "m000",
      testTargetId: "t000",
      viewPointId: "s000",
      sessions: [
        {
          ...emptySession,
          index: 0,
          name: "session00",
          id: "session00",
          isDone: true,
          doneDate: "20190101000004",
          notes: [
            {
              id: "note01",
              type: "notice",
              value: "",
              details: "",
              imageFileUrl: "",
              tags: ["reported"],
            },
          ],
        },
        {
          ...emptySession,
          index: 1,
          name: "session01",
          id: "session01",
          isDone: true,
          doneDate: "20190101000006",
          notes: [
            {
              id: "note01",
              type: "notice",
              value: "",
              details: "",
              imageFileUrl: "",
              tags: ["reported"],
            },
            {
              id: "note02",
              type: "notice",
              value: "",
              details: "",
              imageFileUrl: "",
              tags: ["reported"],
            },
          ],
        },
      ],
    },
    {
      id: "storyId2",
      testMatrixId: "m000",
      testTargetId: "t001",
      viewPointId: "s000",
      sessions: [
        {
          ...emptySession,
          index: 0,
          name: "session00",
          id: "session00",
          isDone: true,
          doneDate: "20190101000001",
          notes: [
            {
              id: "note01",
              type: "notice",
              value: "",
              details: "",
              imageFileUrl: "",
              tags: ["reported"],
            },
          ],
        },
      ],
    },
    {
      id: "storyId3",
      testMatrixId: "m000",
      testTargetId: "t001",
      viewPointId: "s001",
      sessions: [
        {
          ...emptySession,
          index: 0,
          name: "session00",
          id: "session00",
          isDone: true,
          doneDate: "20190101000005",
          notes: [
            {
              id: "note01",
              type: "notice",
              value: "",
              details: "",
              imageFileUrl: "",
              tags: ["reported"],
            },
          ],
        },
      ],
    },
    {
      id: "storyId4",
      testMatrixId: "m000",
      testTargetId: "t004",
      viewPointId: "s001",
      sessions: [
        {
          ...emptySession,
          name: "session00",
          id: "session00",
          isDone: true,
          doneDate: "20190101000002",
          notes: [
            {
              id: "note01",
              type: "notice",
              value: "",
              details: "",
              imageFileUrl: "",
              tags: ["reported"],
            },
          ],
        },
        {
          ...emptySession,
          name: "session00",
          id: "session00",
          isDone: true,
          doneDate: "20190101000003",
          notes: [
            {
              id: "note01",
              type: "notice",
              value: "",
              details: "",
              imageFileUrl: "",
              tags: ["unreported"],
            },
          ],
        },
        {
          ...emptySession,
          name: "session00",
          id: "session00",
          isDone: false,
          doneDate: "",
          notes: [
            {
              id: "note01",
              type: "notice",
              value: "",
              details: "",
              imageFileUrl: "",
              tags: ["reported"],
            },
          ],
        },
        {
          ...emptySession,
          name: "session00",
          id: "session00",
          isDone: false,
          doneDate: "",
          notes: [
            {
              id: "note01",
              type: "notice",
              value: "",
              details: "",
              imageFileUrl: "",
              tags: ["reported"],
            },
          ],
        },
      ],
    },
  ];

  beforeEach(() => {
    const routes = [
      {
        path: "progress",
        name: "manageQualityView",
        component: ManageQualityView,
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
              groups,
              viewPoints,
            },
          ],
        },
        stories,
      },
      getters: {
        message: () => {
          return (message: string) => {
            return message;
          };
        },
        getLocale: jest.fn().mockReturnValue(jest.fn().mockReturnValue("ja")),
        "testManagement/findStoryByTestTargetAndViewPointId": () => {
          return (
            testTargetId: string,
            viewPointId: string,
            testMatrixId: string
          ) => {
            return stories.find((story) => {
              return (
                story.testMatrixId === testMatrixId &&
                story.testTargetId === testTargetId &&
                story.viewPointId === viewPointId
              );
            });
          };
        },
      },
    });
  });

  describe("groupsプロパティのgetterが呼ばれたとき", () => {
    it("グループフィルタを掛けていない場合、全てのgroupが取得できること", async () => {
      const testMatrixId = "m000";
      const $route = { params: { testMatrixId } };
      const vm = (await shallowMount(ManageQualityView, {
        localVue,
        router,
        store,
        mocks: { $route },
      }).vm) as any;

      vm.$nextTick(() => {
        vm.selectedGroup = "all";
        vm.selectedTestTarget = "all";

        expect(vm.groups).toEqual([
          { id: "all", text: "manage-quality.all" },
          { id: "g000", text: "group0" },
          { id: "g001", text: "group1" },
        ]);
      });
    });
  });
  describe("testTargetsプロパティのgetterが呼ばれたとき", () => {
    it("グループフィルタを掛けていない場合、全てのtestTargetが取得できること", async () => {
      const testMatrixId = "m000";
      const $route = { params: { testMatrixId } };
      const vm = (await shallowMount(ManageQualityView, {
        localVue,
        router,
        store,
        mocks: { $route },
      }).vm) as any;

      vm.$nextTick(() => {
        vm.selectedGroup = "all";
        vm.selectedTestTarget = "all";

        expect(vm.testTargets).toEqual([
          { id: "all", text: "manage-quality.all" },
          { id: "g000_t000", text: "g0-testTarget0" },
          { id: "g000_t001", text: "g0-testTarget1" },
          { id: "g000_t002", text: "g0-testTarget2" },
          { id: "g001_t003", text: "g1-testTarget3" },
          { id: "g001_t004", text: "g1-testTarget4" },
          { id: "g001_t005", text: "g1-testTarget5" },
        ]);
      });
    });

    it("グループフィルタを掛けている場合、対象のgroupに紐づいているtestTargetのみが取得できること", async () => {
      const testMatrixId = "m000";
      const $route = { params: { testMatrixId } };
      const vm = (await shallowMount(ManageQualityView, {
        localVue,
        router,
        store,
        mocks: { $route },
      }).vm) as any;

      vm.$nextTick(() => {
        vm.selectedGroup = "g001";
        vm.selectedTestTarget = "all";

        expect(vm.testTargets).toEqual([
          { id: "all", text: "manage-quality.all" },
          { id: "g001_t003", text: "g1-testTarget3" },
          { id: "g001_t004", text: "g1-testTarget4" },
          { id: "g001_t005", text: "g1-testTarget5" },
        ]);
      });
    });
  });

  describe("headersプロパティのgetterが呼ばれたとき", () => {
    it("テスト観点数分カラムが表示されること", async () => {
      const testMatrixId = "m000";
      const $route = { params: { testMatrixId } };
      const vm = (await shallowMount(ManageQualityView, {
        localVue,
        router,
        store,
        mocks: { $route },
      }).vm) as any;

      vm.$nextTick(() => {
        vm.selectedGroup = "all";
        vm.selectedTestTarget = "all";

        const headers = vm.headers;
        expect(headers[0].text).toEqual("manage-quality.group");
        expect(headers[1].text).toEqual("manage-quality.test-target");
        expect(headers[2].text).toEqual("story0");
        expect(headers[3].text).toEqual("story1");
        expect(headers[4].text).toEqual("story2");
        expect(headers[5].text).toEqual("manage-quality.total");
      });
    });
  });
  describe("itemsプロパティのgetterが呼ばれたとき", () => {
    it("全件数が選択されている場合、全てのバグ起票件数が取得できること", async () => {
      const testMatrixId = "m000";
      const $route = { params: { testMatrixId } };
      const vm = (await shallowMount(ManageQualityView, {
        localVue,
        router,
        store,
        mocks: { $route },
      }).vm) as any;

      vm.$nextTick(() => {
        vm.displayMode = "displayModeTotal";
        vm.selectedGroup = "all";
        vm.selectedTestTarget = "all";

        const items = vm.items;
        expect(items[0]).toEqual({
          group: "group0",
          testTarget: "g0-testTarget0",
          s000: "3",
          TOTAL: "3",
        });

        expect(items[1]).toEqual({
          group: "group0",
          testTarget: "g0-testTarget1",
          s000: "1",
          s001: "1",
          TOTAL: "2",
        });

        expect(items[2]).toEqual({
          group: "group0",
          testTarget: "g0-testTarget2",
          TOTAL: "0",
        });

        expect(items[3]).toEqual({
          group: "group1",
          testTarget: "g1-testTarget3",
          TOTAL: "0",
        });

        expect(items[4]).toEqual({
          group: "group1",
          testTarget: "g1-testTarget4",
          s001: "1",
          TOTAL: "1",
        });

        expect(items[5]).toEqual({
          group: "group1",
          testTarget: "g1-testTarget5",
          TOTAL: "0",
        });

        expect(items[6]).toEqual({
          group: "manage-quality.total",
          testTarget: " ",
          s000: "4",
          s001: "2",
          TOTAL: "6",
        });
      });
    });
    it("1セッションあたりの件数が選択されている場合、バグ起票件数/完了済みセッション数の形式で取得できること", async () => {
      const testMatrixId = "m000";
      const $route = { params: { testMatrixId } };
      const vm = (await shallowMount(ManageQualityView, {
        localVue,
        router,
        store,
        mocks: { $route },
      }).vm) as any;

      vm.$nextTick(() => {
        vm.displayMode = "displayModeTimesPerSession";
        vm.selectedGroup = "all";
        vm.selectedTestTarget = "all";

        const items = vm.items;
        expect(items[0]).toEqual({
          group: "group0",
          testTarget: "g0-testTarget0",
          s000: "3/2",
          TOTAL: "3/2",
        });

        expect(items[1]).toEqual({
          group: "group0",
          testTarget: "g0-testTarget1",
          s000: "1/1",
          s001: "1/1",
          TOTAL: "2/2",
        });

        expect(items[2]).toEqual({
          group: "group0",
          testTarget: "g0-testTarget2",
          TOTAL: "0",
        });

        expect(items[3]).toEqual({
          group: "group1",
          testTarget: "g1-testTarget3",
          TOTAL: "0",
        });

        expect(items[4]).toEqual({
          group: "group1",
          testTarget: "g1-testTarget4",
          s001: "1/2",
          TOTAL: "1/2",
        });

        expect(items[5]).toEqual({
          group: "group1",
          testTarget: "g1-testTarget5",
          TOTAL: "0",
        });

        expect(items[6]).toEqual({
          group: "manage-quality.total",
          testTarget: " ",
          s000: "4/3",
          s001: "2/3",
          TOTAL: "6/6",
        });
      });
    });
    it("グループフィルタを掛けている場合、対象のグループのみの値が取得出来ること", async () => {
      const testMatrixId = "m000";
      const $route = { params: { testMatrixId } };
      const vm = (await shallowMount(ManageQualityView, {
        localVue,
        router,
        store,
        mocks: { $route },
      }).vm) as any;

      vm.$nextTick(() => {
        vm.displayMode = "displayModeTimesPerSession";
        vm.selectedGroup = "g000";
        vm.selectedTestTarget = "all";

        const items = vm.items;
        expect(items[0]).toEqual({
          group: "group0",
          testTarget: "g0-testTarget0",
          s000: "3/2",
          TOTAL: "3/2",
        });

        expect(items[1]).toEqual({
          group: "group0",
          testTarget: "g0-testTarget1",
          s000: "1/1",
          s001: "1/1",
          TOTAL: "2/2",
        });

        expect(items[2]).toEqual({
          group: "group0",
          testTarget: "g0-testTarget2",
          TOTAL: "0",
        });

        expect(items[3]).toEqual({
          group: "manage-quality.total",
          testTarget: " ",
          s000: "4/3",
          s001: "1/1",
          TOTAL: "5/4",
        });
      });
    });

    it("テスト対象フィルタをかけている場合、対象のテスト対象のみの値が取得できること", async () => {
      const testMatrixId = "m000";
      const $route = { params: { testMatrixId } };
      const vm = (await shallowMount(ManageQualityView, {
        localVue,
        router,
        store,
        mocks: { $route },
      }).vm) as any;

      vm.$nextTick(() => {
        vm.displayMode = "displayModeTimesPerSession";
        vm.selectedGroup = "all";
        vm.selectedTestTarget = "g001_t004";

        const items = vm.items;

        expect(items[0]).toEqual({
          group: "group1",
          testTarget: "g1-testTarget4",
          s001: "1/2",
          TOTAL: "1/2",
        });

        expect(items[1]).toEqual({
          group: "manage-quality.total",
          testTarget: " ",
          s001: "1/2",
          TOTAL: "1/2",
        });
      });
    });
    describe("qualityDatasプロパティのgetterが呼ばれたとき", () => {
      it("全件数が選択されている場合、全てのバグ起票件数が取得できること", async () => {
        const testMatrixId = "m000";
        const $route = { params: { testMatrixId } };
        const vm = (await shallowMount(ManageQualityView, {
          localVue,
          router,
          store,
          mocks: { $route },
        }).vm) as any;

        vm.$nextTick(() => {
          vm.displayMode = "displayModeTimesPerSession";
          vm.selectedGroup = "all";
          vm.selectedTestTarget = "all";

          const qualityDatas = vm.qualityDatas;

          expect(qualityDatas).toEqual({
            datasets: [
              {
                data: [
                  { x: 0, y: 0 },
                  { x: 1, y: 1 },
                  { x: 2, y: 1 },
                  { x: 3, y: 1 },
                  { x: 4, y: 2 },
                  { x: 5, y: 3 },
                  { x: 6, y: 5 },
                ],
                fill: false,
                label: "group0",
                lineTension: 0,
              },
              {
                data: [
                  { x: 0, y: 0 },
                  { x: 1, y: 0 },
                  { x: 2, y: 1 },
                  { x: 3, y: 1 },
                  { x: 4, y: 1 },
                  { x: 5, y: 1 },
                  { x: 6, y: 1 },
                ],
                fill: false,
                label: "group1",
                lineTension: 0,
              },
              {
                data: [
                  { x: 0, y: 0 },
                  { x: 1, y: 1 },
                  { x: 2, y: 2 },
                  { x: 3, y: 2 },
                  { x: 4, y: 3 },
                  { x: 5, y: 4 },
                  { x: 6, y: 6 },
                ],
                fill: false,
                label: "manage-quality.total",
                lineTension: 0,
              },
            ],
          });
        });
      });
    });
  });
});
