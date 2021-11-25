import { createLocalVue } from "@vue/test-utils";
import Vuetify from "vuetify";
import * as GroupEditInfoService from "@/lib/testManagement/GroupEditInfo";
import { Group, ViewPoint } from "@/lib/testManagement/types";

const localVue = createLocalVue();
localVue.use(Vuetify);

describe("GroupEditListは", () => {
  let group: Group;
  let viewPoints: ViewPoint[];
  let spyLog: any;

  beforeEach(() => {
    group = {
      id: "g001",
      name: "group1",
      testTargets: [
        {
          id: "t001",
          name: "testTarget1",
          plans: [
            { viewPointId: "s001", value: 1 },
            { viewPointId: "s002", value: 2 },
          ],
        },
        {
          id: "t002",
          name: "testTarget2",
          plans: [
            { viewPointId: "s001", value: 3 },
            { viewPointId: "s002", value: 0 },
          ],
        },
        {
          id: "t003",
          name: "testTarget3",
          plans: [
            { viewPointId: "s001", value: 0 },
            { viewPointId: "s002", value: 4 },
          ],
        },
      ],
    };
    viewPoints = [
      { id: "s001", name: "story1" },
      { id: "s002", name: "story2" },
    ];

    spyLog = jest.spyOn(console, "error");
  });

  afterEach(() => {
    spyLog.mockReset();
    spyLog.mockRestore();
  });

  describe("getItemsでテーブルに表示するitemを取得する", () => {
    it("正常系", () => {
      expect(GroupEditInfoService.getItems(group)).toEqual([
        { name: "testTarget1", id: "t001", s001: 1, s002: 2 },
        { name: "testTarget2", id: "t002", s001: 3, s002: 0 },
        { name: "testTarget3", id: "t003", s001: 0, s002: 4 },
      ]);
    });
  });

  describe("addNewTestTargetで新規テスト対象を作成する", () => {
    it("正常系", () => {
      expect(
        GroupEditInfoService.addNewTestTarget(
          "testTarget4",
          viewPoints,
          group,
          "4"
        )
      ).toEqual({
        id: "g001",
        name: "group1",
        testTargets: [
          {
            name: "testTarget1",
            id: "t001",
            plans: [
              { viewPointId: "s001", value: 1 },
              { viewPointId: "s002", value: 2 },
            ],
          },
          {
            name: "testTarget2",
            id: "t002",
            plans: [
              { viewPointId: "s001", value: 3 },
              { viewPointId: "s002", value: 0 },
            ],
          },
          {
            name: "testTarget3",
            id: "t003",
            plans: [
              { viewPointId: "s001", value: 0 },
              { viewPointId: "s002", value: 4 },
            ],
          },
          {
            name: "testTarget4",
            id: "tmp-t004",
            plans: [
              { viewPointId: "s001", value: 0 },
              { viewPointId: "s002", value: 0 },
            ],
          },
        ],
      });
    });
  });

  describe("deleteTestTargetでテスト対象を削除する", () => {
    it("正常系", () => {
      expect(GroupEditInfoService.deleteTestTarget("t002", group)).toEqual({
        id: "g001",
        name: "group1",
        testTargets: [
          {
            name: "testTarget1",
            id: "t001",
            plans: [
              { viewPointId: "s001", value: 1 },
              { viewPointId: "s002", value: 2 },
            ],
          },
          {
            name: "testTarget3",
            id: "t003",
            plans: [
              { viewPointId: "s001", value: 0 },
              { viewPointId: "s002", value: 4 },
            ],
          },
        ],
      });
    });
  });

  describe("updatePlanでplan数を変更する", () => {
    it("正常系", () => {
      expect(
        GroupEditInfoService.updatePlan("g001_t002_s002", 10, group)
      ).toEqual({
        id: "g001",
        name: "group1",
        testTargets: [
          {
            name: "testTarget1",
            id: "t001",
            plans: [
              { viewPointId: "s001", value: 1 },
              { viewPointId: "s002", value: 2 },
            ],
          },
          {
            name: "testTarget2",
            id: "t002",
            plans: [
              { viewPointId: "s001", value: 3 },
              { viewPointId: "s002", value: 10 },
            ],
          },
          {
            name: "testTarget3",
            id: "t003",
            plans: [
              { viewPointId: "s001", value: 0 },
              { viewPointId: "s002", value: 4 },
            ],
          },
        ],
      });
    });
  });

  describe("renameTestTargetでテスト対象の名前を変更する", () => {
    it("正常系", () => {
      expect(
        GroupEditInfoService.renameTestTarget("newTestName", "t002", group)
      ).toEqual({
        id: "g001",
        name: "group1",
        testTargets: [
          {
            name: "testTarget1",
            id: "t001",
            plans: [
              { viewPointId: "s001", value: 1 },
              { viewPointId: "s002", value: 2 },
            ],
          },
          {
            name: "newTestName",
            id: "t002",
            plans: [
              { viewPointId: "s001", value: 3 },
              { viewPointId: "s002", value: 0 },
            ],
          },
          {
            name: "testTarget3",
            id: "t003",
            plans: [
              { viewPointId: "s001", value: 0 },
              { viewPointId: "s002", value: 4 },
            ],
          },
        ],
      });
    });
  });

  describe("changeTestTargetOrderでテスト対象の並び替えを行う", () => {
    it("対象のテスト対象を、一つ前のテスト対象を入れ替える", () => {
      expect(
        GroupEditInfoService.changeTestTargetOrder("t002", "up", group)
      ).toEqual({
        id: "g001",
        name: "group1",
        testTargets: [
          {
            name: "testTarget2",
            id: "t002",
            plans: [
              { viewPointId: "s001", value: 3 },
              { viewPointId: "s002", value: 0 },
            ],
          },
          {
            name: "testTarget1",
            id: "t001",
            plans: [
              { viewPointId: "s001", value: 1 },
              { viewPointId: "s002", value: 2 },
            ],
          },
          {
            name: "testTarget3",
            id: "t003",
            plans: [
              { viewPointId: "s001", value: 0 },
              { viewPointId: "s002", value: 4 },
            ],
          },
        ],
      });
    });
    it("対象のテスト対象を、一つ後ろのテスト対象を入れ替える", () => {
      expect(
        GroupEditInfoService.changeTestTargetOrder("t002", "down", group)
      ).toEqual({
        id: "g001",
        name: "group1",
        testTargets: [
          {
            name: "testTarget1",
            id: "t001",
            plans: [
              { viewPointId: "s001", value: 1 },
              { viewPointId: "s002", value: 2 },
            ],
          },
          {
            name: "testTarget3",
            id: "t003",
            plans: [
              { viewPointId: "s001", value: 0 },
              { viewPointId: "s002", value: 4 },
            ],
          },
          {
            name: "testTarget2",
            id: "t002",
            plans: [
              { viewPointId: "s001", value: 3 },
              { viewPointId: "s002", value: 0 },
            ],
          },
        ],
      });
    });
    it("【異常系】先頭のテスト対象を、一つ前のテスト対象を入れ替える", () => {
      expect(
        GroupEditInfoService.changeTestTargetOrder("t001", "up", group)
      ).toEqual(group);
      expect(console.error).toBeCalled();
    });
    it("【異常系】無効なorderTypeを入力する", () => {
      expect(
        GroupEditInfoService.changeTestTargetOrder("t002", "aaa", group)
      ).toEqual(group);
      expect(console.error).toBeCalled();
    });
  });

  describe("checkDisabledButtonでテスト対象入れ替え可否を取得する", () => {
    it("一つ前のテスト対象を入れ替えられる", () => {
      expect(
        GroupEditInfoService.checkDisabledButton("t002", "up", group)
      ).toEqual(false);
    });
    it("一つ前のテスト対象を入れ替えられない", () => {
      expect(
        GroupEditInfoService.checkDisabledButton("t001", "up", group)
      ).toEqual(true);
    });
    it("一つ後のテスト対象を入れ替えられる", () => {
      expect(
        GroupEditInfoService.checkDisabledButton("t002", "down", group)
      ).toEqual(false);
    });
    it("一つ後のテスト対象を入れ替えられない", () => {
      expect(
        GroupEditInfoService.checkDisabledButton("t003", "down", group)
      ).toEqual(true);
    });
    it("【異常系】無効なorderTypeを入力する", () => {
      expect(
        GroupEditInfoService.checkDisabledButton("t002", "aaa", group)
      ).toEqual(true);
      expect(console.error).toBeCalled();
    });
  });
});
