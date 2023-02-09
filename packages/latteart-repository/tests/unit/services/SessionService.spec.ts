import { getRepository } from "typeorm";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";
import { SessionEntity } from "@/entities/SessionEntity";
import { SessionsService } from "@/services/SessionsService";
import { StoryEntity } from "@/entities/StoryEntity";
import { TimestampService } from "@/services/TimestampService";
import { ImageFileRepositoryService } from "@/services/ImageFileRepositoryService";
import { TestTargetEntity } from "@/entities/TestTargetEntity";
import { Session } from "@/interfaces/Sessions";
import { ProjectEntity } from "@/entities/ProjectEntity";
import { TransactionRunner } from "@/TransactionRunner";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("SessionService", () => {
  const emptySessionParams: Session = {
    isDone: false,
    memo: "",
    name: "",
    testerName: "",
    testingTime: 0,
    doneDate: "",
    attachedFiles: [],
    issues: [],
    testItem: "",
    testResultFiles: [],
    index: 0,
    id: "",
  };

  describe("#postSession", () => {
    describe("空のセッションを新規作成する", () => {
      it("指定のIDのストーリーに空のセッションを追加する", async () => {
        const projectId = (await saveTestProject()).projectId;
        const storyId = (await saveTestStory()).storyId;

        const result = await new SessionsService().postSession(
          projectId,
          storyId,
          new TransactionRunner()
        );

        expect(result).toEqual({
          ...emptySessionParams,
          id: expect.any(String),
        });
      });

      it("指定のIDのストーリーが見つからない場合はエラーをスローする", async () => {
        try {
          const projectId = (await saveTestProject()).projectId;
          await new SessionsService().postSession(
            projectId,
            "AAA",
            new TransactionRunner()
          );
        } catch (error) {
          expect((error as Error).message).toEqual(`Story not found. AAA`);
        }
      });
    });
  });

  describe("#patchSession", () => {
    describe("セッションの内容を更新する", () => {
      const doneDate = "YYYYMMDDHHmmss";

      it.each([
        {
          isDone: true,
          memo: "memo",
          name: "name",
          testerName: "testerName",
          testingTime: 0,
        },
      ])(
        "指定のIDのセッションの内容を渡されたパラメータの値に更新する",
        async (params) => {
          const projectId = (await saveTestProject()).projectId;
          const storyId = (await saveTestStory()).storyId;
          const savedSession = await new SessionsService().postSession(
            projectId,
            storyId,
            new TransactionRunner()
          );
          const sessionId = savedSession.id;

          const result = await new SessionsService().patchSession(
            projectId,
            sessionId,
            params,
            createServiceMock({ doneDate }),
            new TransactionRunner()
          );

          expect(result).toEqual({
            ...emptySessionParams,
            ...params,
            doneDate,
            id: expect.any(String),
          });
        }
      );

      it("指定のIDのセッションが見つからない場合はエラーをスローする", async () => {
        try {
          const projectId = (await saveTestProject()).projectId;
          const sessionId = "AAA";

          await new SessionsService().patchSession(
            projectId,
            sessionId,
            {},
            createServiceMock({ doneDate }),
            new TransactionRunner()
          );
        } catch (error) {
          expect((error as Error).message).toEqual(`Session not found: AAA`);
        }
      });
    });
  });

  describe("#deleteSession", () => {
    describe("セッションを削除する", () => {
      it("指定のIDのセッションを削除する", async () => {
        const projectId = (await saveTestProject()).projectId;
        const storyId = (await saveTestStory()).storyId;

        const savedSession = await new SessionsService().postSession(
          projectId,
          storyId,
          new TransactionRunner()
        );

        const sessionRepository = getRepository(SessionEntity);
        const session1 = await sessionRepository.findOne(savedSession.id);
        if (!session1) {
          throw new Error("no session");
        }

        await new SessionsService().deleteSession(
          projectId,
          session1.id,
          new TransactionRunner()
        );

        const session2 = await sessionRepository.findOne(savedSession.id);

        if (session2) {
          throw new Error("delete failed");
        }
      });
    });
  });
});

async function saveTestStory() {
  const testTarget = new TestTargetEntity();
  testTarget.index = 0;
  testTarget.name = "";
  testTarget.text = JSON.stringify([]);
  const savedTestTarget = await getRepository(TestTargetEntity).save(
    testTarget
  );

  const story = new StoryEntity();
  story.index = 0;
  story.status = "ok";
  story.planedSessionNumber = 0;
  story.testTarget = savedTestTarget;
  const savedStory = await getRepository(StoryEntity).save(story);

  return { storyId: savedStory.id };
}

async function saveTestProject() {
  const project = new ProjectEntity("1");
  const savedProject = await getRepository(ProjectEntity).save(project);

  return { projectId: savedProject.id };
}

function createServiceMock(params: { doneDate: string }) {
  const timestampService: TimestampService = {
    unix: jest.fn(),
    format: jest.fn().mockReturnValue(params.doneDate),
    epochMilliseconds: jest.fn(),
  };
  const imageFileRepositoryService: ImageFileRepositoryService = {
    writeBufferToFile: jest.fn(),
    writeBase64ToFile: jest.fn().mockResolvedValue("testStep.png"),
    removeFile: jest.fn(),
    getFilePath: jest.fn(),
    getFileUrl: jest.fn(),
  };

  return {
    timestampService,
    imageFileRepositoryService,
  };
}
