import { SessionEntity } from "@/entities/SessionEntity";
import { StoryEntity } from "@/entities/StoryEntity";
import { TestMatrixEntity } from "@/entities/TestMatrixEntity";
import { TestProgressEntity } from "@/entities/TestProgressEntity";
import { TestTargetEntity } from "@/entities/TestTargetEntity";
import { TestTargetGroupEntity } from "@/entities/TestTargetGroupEntity";
import { ViewPointEntity } from "@/entities/ViewPointEntity";
import { TestProgressServiceImpl } from "@/services/TestProgressService";
import { getRepository } from "typeorm";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe.each([
  {
    plannedSessionNumber: 1,
    completedSessionNumber: 2,
    incompletedSessionNumber: 3,
  },
  {
    plannedSessionNumber: 0,
    completedSessionNumber: 0,
    incompletedSessionNumber: 0,
  },
])("TestProgressService", (progress) => {
  describe("#registerStoryTestProgresses", () => {
    it("テスト進捗を登録する", async () => {
      const { storyId } = await saveTestStory(progress);
      const service = new TestProgressServiceImpl();
      await service["registerStoryTestProgresses"](storyId);
      const progressEntities = await getRepository(TestProgressEntity).find({
        relations: ["story"],
      });

      expect(progressEntities[0].story.id).toEqual(storyId);
      expect(progressEntities[0].plannedSessionNumber).toEqual(
        progress.plannedSessionNumber
      );
      expect(progressEntities[0].completedSessionNumber).toEqual(
        progress.completedSessionNumber
      );
      expect(progressEntities[0].incompletedSessionNumber).toEqual(
        progress.incompletedSessionNumber
      );
    });
  });

  describe("#collectStoryDailyTestProgresses", () => {
    it("日ごとのテスト進捗を取得する", async () => {
      const {
        storyId,
        testTargetGroupId,
        testTargetId,
        viewPointId,
        testMatrixId,
      } = await saveTestStory(progress);

      const service = new TestProgressServiceImpl();
      await service["registerStoryTestProgresses"](storyId);

      const result = await service.collectStoryDailyTestProgresses([storyId]);

      expect(result[0].storyProgresses).toEqual([
        {
          storyId,
          plannedSessionNumber: progress.plannedSessionNumber,
          completedSessionNumber: progress.completedSessionNumber,
          incompletedSessionNumber: progress.incompletedSessionNumber,
          testMatrixId,
          testTargetGroupId,
          testTargetId,
          viewPointId,
        },
      ]);
      expect(result[0].date).toMatch(/[0-9]{4}-[0-9]{2}-[0-9]{2}/);
    });
  });
});

async function saveTestStory(progress: {
  plannedSessionNumber: number;
  completedSessionNumber: number;
  incompletedSessionNumber: number;
}) {
  const defaultSessionParams = {
    doneDate: "",
    index: 0,
    name: "",
    testUser: "",
    memo: "",
    testItem: "",
    testingTime: 0,
  };

  const testMatrixEntity = await getRepository(TestMatrixEntity).save({
    name: "",
    index: 0,
  });
  const viewPointEntity = await getRepository(ViewPointEntity).save({
    name: "",
    description: "",
  });
  const testTargetGroupEntity = await getRepository(TestTargetGroupEntity).save(
    {
      name: "",
      index: 0,
      testMatrix: testMatrixEntity,
    }
  );
  const testTargetEntity = await getRepository(TestTargetEntity).save({
    name: "",
    index: 0,
    text: JSON.stringify([
      {
        viewPointId: viewPointEntity.id,
        value: progress.plannedSessionNumber,
      },
    ]),
    testTargetGroup: testTargetGroupEntity,
  });
  const storyEntity = await getRepository(StoryEntity).save(
    (() => {
      const story = new StoryEntity();
      story.index = 0;
      story.status = "";
      story.planedSessionNumber = 0;
      story.testMatrix = testMatrixEntity;
      story.viewPoint = viewPointEntity;
      story.testTarget = testTargetEntity;

      return story;
    })()
  );

  const completedSessions = new Array(progress.completedSessionNumber)
    .fill({
      ...defaultSessionParams,
      story: storyEntity,
      doneDate: "dummy",
    })
    .map((params) => new SessionEntity(params));
  const incompletedSessions = new Array(progress.incompletedSessionNumber)
    .fill({
      ...defaultSessionParams,
      story: storyEntity,
      doneDate: "",
    })
    .map((params) => new SessionEntity(params));

  await getRepository(SessionEntity).save([
    ...completedSessions,
    ...incompletedSessions,
  ]);

  return {
    storyId: storyEntity.id,
    testTargetGroupId: testTargetGroupEntity.id,
    testTargetId: testTargetEntity.id,
    viewPointId: viewPointEntity.id,
    testMatrixId: testMatrixEntity.id,
  };
}
