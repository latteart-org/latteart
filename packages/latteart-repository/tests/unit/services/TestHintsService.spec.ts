import { TestHintsService } from "@/services/TestHintsService";
import {
  SqliteTestConnectionHelper,
  TestDataSource,
} from "../../helper/TestConnectionHelper";
import { SettingsUtility } from "@/gateways/settings/SettingsUtility";
import path from "path";
import { TestHintPropEntity } from "@/entities/TestHintPropEntity";
import { TestHintEntity } from "@/entities/TestHintEntity";
import { ImportTestHints } from "@/interfaces/TestHints";
import { TransactionRunner } from "@/TransactionRunner";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection();
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

const preparation = async () => {
  const testHintPropEntity = await TestDataSource.getRepository(
    TestHintPropEntity
  ).save(
    new TestHintPropEntity({
      name: "propname",
      type: "string",
      listItems: "",
      index: 0,
    })
  );
  const testHintEntity = await TestDataSource.getRepository(
    TestHintEntity
  ).save({
    value: "hintValue",
    testMatrixName: "tm1",
    groupName: "g1",
    testTargetName: "tt1",
    viewPointName: "v1",
    customs: JSON.stringify([
      {
        propId: testHintPropEntity.id,
        value: "propValue",
      },
    ]),
    commentWords: '["commentWords"]',
    operationElement: "",
    issues: '["issue1"]',
  });

  return { testHintEntity, testHintPropEntity };
};

describe("TestHintsService", () => {
  describe("getAllTestHints", () => {
    describe("TestHintを全て取得", () => {
      it("propが登録されていない場合", async () => {
        const filePath = path.join(
          __dirname,
          "..",
          "..",
          "resources",
          "latteart.config.json"
        );
        SettingsUtility.loadFile(filePath);

        const result = await new TestHintsService(
          TestDataSource
        ).getAllTestHints();
        expect(result).toEqual({
          props: [
            {
              name: "ドメイン特化度",
              id: "001",
              type: "list",
              listItems: [
                { key: "001-1", value: "1" },
                { key: "001-2", value: "2" },
                { key: "001-3", value: "3" },
                { key: "001-4", value: "4" },
                { key: "001-5", value: "5" },
              ],
            },
            {
              name: "バグ潜在時の重大度",
              id: "002",
              type: "list",
              listItems: [
                { key: "002-1", value: "1" },
                { key: "002-2", value: "2" },
                { key: "002-3", value: "3" },
                { key: "002-4", value: "4" },
                { key: "002-5", value: "5" },
              ],
            },
            {
              name: "バグ潜在の頻度",
              id: "003",
              type: "list",
              listItems: [
                { key: "003-1", value: "1" },
                { key: "003-2", value: "2" },
                { key: "003-3", value: "3" },
                { key: "003-4", value: "4" },
                { key: "003-5", value: "5" },
              ],
            },
            {
              name: "テストケースカテゴリ",
              id: "004",
              type: "list",
              listItems: [
                { key: "004-1", value: "1" },
                { key: "004-2", value: "2" },
                { key: "004-3", value: "3" },
                { key: "004-4", value: "4" },
                { key: "004-5", value: "5" },
              ],
            },
          ],
          data: [],
        });
      });
      it("propが既に登録されている場合", async () => {
        const { testHintEntity, testHintPropEntity } = await preparation();

        const result = await new TestHintsService(
          TestDataSource
        ).getAllTestHints();
        expect(result).toEqual({
          props: [
            {
              id: testHintPropEntity.id,
              name: "propname",
              type: "string",
            },
          ],
          data: [
            {
              id: testHintEntity.id,
              value: "hintValue",
              testMatrixName: "tm1",
              groupName: "g1",
              testTargetName: "tt1",
              viewPointName: "v1",
              customs: [
                {
                  propId: testHintPropEntity.id,
                  value: "propValue",
                },
              ],
              commentWords: ["commentWords"],
              operationElements: [],
              issues: ["issue1"],
              createdAt: expect.any(Number),
            },
          ],
        });
      });
    });
  });
  describe("importAllTestHints", () => {
    it("testHintのimport", async () => {
      const importTesthints: ImportTestHints = {
        props: [{ id: "propId", name: "propName", type: "string" }],
        data: [
          {
            id: "dataId",
            value: "hintValue",
            testMatrixName: "tm1",
            groupName: "g1",
            testTargetName: "tt1",
            viewPointName: "v1",
            customs: [
              {
                propId: "propId",
                value: "propValue",
              },
            ],
            commentWords: ["commentWords"],
            operationElements: [],
            issues: ["issue1"],
            createdAt: 100,
          },
        ],
      };

      const service = new TestHintsService(TestDataSource);
      await service.importAllTestHints(
        importTesthints,
        new TransactionRunner(TestDataSource)
      );
      const result = await service.getAllTestHints();

      expect(result).toEqual({
        props: [
          {
            id: result.props[0].id,
            name: "propName",
            type: "string",
            listItems: undefined,
          },
        ],
        data: [
          {
            id: result.data[0].id,
            value: "hintValue",
            testMatrixName: "tm1",
            groupName: "g1",
            testTargetName: "tt1",
            viewPointName: "v1",
            customs: [
              {
                propId: result.props[0].id,
                value: "propValue",
              },
            ],
            commentWords: ["commentWords"],
            operationElements: [],
            issues: ["issue1"],
            createdAt: expect.any(Number),
          },
        ],
      });
    });
  });
  describe("postTestHint", () => {
    it("TestHintの登録", async () => {
      const testHintPropEntity = await TestDataSource.getRepository(
        TestHintPropEntity
      ).save(
        new TestHintPropEntity({
          name: "propname",
          type: "string",
          listItems: "",
          index: 0,
        })
      );

      const result = await new TestHintsService(TestDataSource).postTestHint({
        value: "hintValue",
        testMatrixName: "tm1",
        groupName: "g1",
        testTargetName: "tt1",
        viewPointName: "v1",
        customs: [
          {
            propId: testHintPropEntity.id,
            value: "propValue",
          },
        ],
        commentWords: ["commentWords"],
        operationElements: [],
        issues: ["issue1"],
      });

      expect(result).toEqual({
        id: result.id,
        value: "hintValue",
        testMatrixName: "tm1",
        groupName: "g1",
        testTargetName: "tt1",
        viewPointName: "v1",
        customs: [
          {
            propId: testHintPropEntity.id,
            value: "propValue",
          },
        ],
        commentWords: ["commentWords"],
        operationElements: [],
        issues: ["issue1"],
        createdAt: expect.any(Number),
      });
    });
  });
  describe("putTestHint", () => {
    it("TestHintの更新", async () => {
      const { testHintEntity } = await preparation();

      const result = await new TestHintsService(TestDataSource).putTestHint(
        testHintEntity.id,
        {
          value: "updateValue",
          testMatrixName: "newTestMatrixName",
          groupName: "newGroupName",
          testTargetName: "newTestTargetName",
          viewPointName: "newViewPointName",
          customs: [],
          commentWords: ["up1", "up2"],
          operationElements: [],
          issues: ["issue1"],
        }
      );

      expect(result).toEqual({
        id: result.id,
        value: "updateValue",
        testMatrixName: "newTestMatrixName",
        groupName: "newGroupName",
        testTargetName: "newTestTargetName",
        viewPointName: "newViewPointName",
        customs: [],
        commentWords: ["up1", "up2"],
        operationElements: [],
        issues: ["issue1"],
        createdAt: expect.any(Number),
      });
    });
  });
});
