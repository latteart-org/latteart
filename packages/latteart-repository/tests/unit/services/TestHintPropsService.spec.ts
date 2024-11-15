import { TestHintPropEntity } from "@/entities/TestHintPropEntity";
import {
  SqliteTestConnectionHelper,
  TestDataSource,
} from "../../helper/TestConnectionHelper";
import { TestHintEntity } from "@/entities/TestHintEntity";
import { TestHintPropsService } from "@/services/TestHintPropsService";
import { TransactionRunner } from "@/TransactionRunner";
import { TestHintsService } from "@/services/TestHintsService";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection();
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

const preparation = async () => {
  const testHintPropEntities = await TestDataSource.getRepository(
    TestHintPropEntity
  ).save([
    new TestHintPropEntity({
      name: "propname1",
      type: "string",
      listItems: "",
      index: 0,
    }),
    new TestHintPropEntity({
      name: "propname2",
      type: "string",
      listItems: "",
      index: 1,
    }),
  ]);
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
        propId: testHintPropEntities[0].id,
        value: "propValue1",
      },
      {
        propId: testHintPropEntities[1].id,
        value: "propValue2",
      },
    ]),
    commentWords: '["commentWords"]',
    operationElement: "",
    issues: '["issue1"]',
  });

  return { testHintEntity, testHintPropEntities };
};

describe("TestHintPropsService", () => {
  describe("putTestHintProps", () => {
    it("propの更新", async () => {
      const { testHintPropEntities } = await preparation();

      const result = await new TestHintPropsService(
        TestDataSource
      ).putTestHintProps(
        [
          {
            id: testHintPropEntities[0].id,
            name: testHintPropEntities[0].name,
            type: testHintPropEntities[0].type,
          },
          {
            id: testHintPropEntities[1].id,
            name: testHintPropEntities[1].name,
            type: testHintPropEntities[1].type,
          },
          {
            name: "name3",
            type: "string",
          },
        ],
        new TransactionRunner(TestDataSource)
      );

      expect(result).toEqual([
        {
          id: testHintPropEntities[0].id,
          name: testHintPropEntities[0].name,
          type: testHintPropEntities[0].type,
        },
        {
          id: testHintPropEntities[1].id,
          name: testHintPropEntities[1].name,
          type: testHintPropEntities[1].type,
        },
        {
          id: result[2].id,
          name: "name3",
          type: "string",
        },
      ]);
    });
    it("propの追加", async () => {
      const { testHintPropEntities } = await preparation();

      const result = await new TestHintPropsService(
        TestDataSource
      ).putTestHintProps(
        [
          {
            id: testHintPropEntities[1].id,
            name: "newPropname1",
            type: "list",
            listItems: [{ key: "key1", value: "value1" }],
          },
          {
            id: testHintPropEntities[0].id,
            name: "newPropname2",
            type: "string",
          },
        ],
        new TransactionRunner(TestDataSource)
      );

      expect(result).toEqual([
        {
          id: testHintPropEntities[1].id,
          name: "newPropname1",
          type: "list",
          listItems: [{ key: "key1", value: "value1" }],
        },
        {
          id: testHintPropEntities[0].id,
          name: "newPropname2",
          type: "string",
        },
      ]);
    });
    it("propの削除", async () => {
      const { testHintPropEntities, testHintEntity } = await preparation();

      const result = await new TestHintPropsService(
        TestDataSource
      ).putTestHintProps(
        [
          {
            id: testHintPropEntities[0].id,
            name: testHintPropEntities[0].name,
            type: testHintPropEntities[0].type,
          },
        ],
        new TransactionRunner(TestDataSource)
      );

      expect(result).toEqual([
        {
          id: testHintPropEntities[0].id,
          name: testHintPropEntities[0].name,
          type: testHintPropEntities[0].type,
        },
      ]);
      const testHints = await new TestHintsService(
        TestDataSource
      ).getAllTestHints();
      expect(testHints.data[0]).toEqual({
        id: testHintEntity.id,
        value: "hintValue",
        testMatrixName: "tm1",
        groupName: "g1",
        testTargetName: "tt1",
        viewPointName: "v1",
        customs: [
          {
            propId: testHintPropEntities[0].id,
            value: "propValue1",
          },
        ],
        commentWords: ["commentWords"],
        operationElements: [],
        issues: ["issue1"],
        createdAt: expect.any(Number),
      });
    });
  });
});
