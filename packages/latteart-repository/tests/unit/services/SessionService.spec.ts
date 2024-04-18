import {
  SqliteTestConnectionHelper,
  TestDataSource,
} from "../../helper/TestConnectionHelper";
import { SessionEntity } from "@/entities/SessionEntity";
import { SessionsService } from "@/services/SessionsService";
import { StoryEntity } from "@/entities/StoryEntity";
import { TimestampService } from "@/services/TimestampService";
import { TestTargetEntity } from "@/entities/TestTargetEntity";
import { ProjectEntity } from "@/entities/ProjectEntity";
import { FileRepository } from "@/interfaces/fileRepository";
import { TransactionRunner } from "@/TransactionRunner";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection();
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("SessionService", () => {
  describe("#postSession", () => {
    describe("空のセッションを新規作成する", () => {
      it("指定のIDのストーリーに空のセッションを追加する", async () => {
        const projectId = (await saveTestProject()).projectId;
        const storyId = (await saveTestStory()).storyId;

        const result = await new SessionsService(TestDataSource).postSession(
          projectId,
          storyId
        );

        expect(result).toEqual({
          index: 0,
          name: "",
          id: expect.any(String),
          isDone: false,
          doneDate: "",
          testItem: "",
          testerName: "",
          memo: "",
          attachedFiles: [],
          testResultFiles: [],
          testPurposes: [],
          notes: [],
        });
      });

      it("指定のIDのストーリーが見つからない場合はエラーをスローする", async () => {
        try {
          const projectId = (await saveTestProject()).projectId;
          await new SessionsService(TestDataSource).postSession(
            projectId,
            "AAA"
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
        },
      ])(
        "指定のIDのセッションの内容を渡されたパラメータの値に更新する",
        async (params) => {
          const projectId = (await saveTestProject()).projectId;
          const storyId = (await saveTestStory()).storyId;
          const savedSession = await new SessionsService(
            TestDataSource
          ).postSession(projectId, storyId);
          const sessionId = savedSession.id;

          const result = await new SessionsService(TestDataSource).patchSession(
            projectId,
            sessionId,
            params,
            createServiceMock({ doneDate })
          );

          expect(result).toEqual({
            ...params,
            index: 0,
            name: "",
            id: expect.any(String),
            doneDate,
            testItem: "",
            attachedFiles: [],
            testResultFiles: [],
            testPurposes: [],
            notes: [],
          });
        }
      );

      it("指定のIDのセッションが見つからない場合はエラーをスローする", async () => {
        try {
          const projectId = (await saveTestProject()).projectId;
          const sessionId = "AAA";

          await new SessionsService(TestDataSource).patchSession(
            projectId,
            sessionId,
            {},
            createServiceMock({ doneDate })
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

        const session1 = await new SessionsService(TestDataSource).postSession(
          projectId,
          storyId
        );

        const session2 = await new SessionsService(TestDataSource).postSession(
          projectId,
          storyId
        );

        await new SessionsService(TestDataSource).deleteSession(
          projectId,
          session1.id
        );

        const result = await TestDataSource.getRepository(SessionEntity).find();

        expect((result ?? []).length).toEqual(1);

        expect((result ?? [])[0].id).toEqual(session2.id);
      });
    });
  });
});

async function saveTestStory() {
  const testTarget = new TestTargetEntity();
  testTarget.index = 0;
  testTarget.name = "";
  testTarget.text = JSON.stringify([]);
  const savedTestTarget =
    await TestDataSource.getRepository(TestTargetEntity).save(testTarget);

  const story = new StoryEntity();
  story.index = 0;
  story.status = "ok";
  story.planedSessionNumber = 0;
  story.testTarget = savedTestTarget;
  const savedStory =
    await TestDataSource.getRepository(StoryEntity).save(story);

  return { storyId: savedStory.id };
}

async function saveTestProject() {
  const project = new ProjectEntity("1");
  const savedProject =
    await TestDataSource.getRepository(ProjectEntity).save(project);

  return { projectId: savedProject.id };
}

function createServiceMock(params: { doneDate: string }) {
  const timestampService: TimestampService = {
    unix: jest.fn(),
    format: jest.fn().mockReturnValue(params.doneDate),
    epochMilliseconds: jest.fn(),
  };
  const attachedFileRepository: FileRepository = {
    readFile: jest.fn(),
    outputFile: jest.fn(),
    outputJSON: jest.fn(),
    outputZip: jest.fn(),
    removeFile: jest.fn(),
    getFileUrl: jest.fn().mockReturnValue("testStep.png"),
    getFilePath: jest.fn(),
    moveFile: jest.fn(),
    copyFile: jest.fn(),
    appendFile: jest.fn(),
  };

  return {
    timestampService,
    attachedFileRepository,
    transactionRunner: new TransactionRunner(TestDataSource),
  };
}
