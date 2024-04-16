import { TestResultEntity } from "@/entities/TestResultEntity";
import { CreateNoteDto, UpdateNoteDto } from "@/interfaces/Notes";
import { NotesServiceImpl } from "@/services/NotesService";
import { TimestampService } from "@/services/TimestampService";
import {
  SqliteTestConnectionHelper,
  TestDataSource,
} from "../../helper/TestConnectionHelper";
import { FileRepository } from "@/interfaces/fileRepository";
import { NoteEntity } from "@/entities/NoteEntity";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection();
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("NotesService", () => {
  const screenshotFileRepository: FileRepository = {
    readFile: jest.fn(),
    outputFile: jest.fn(),
    outputJSON: jest.fn(),
    outputZip: jest.fn(),
    removeFile: jest.fn(),
    getFileUrl: jest.fn(),
    getFilePath: jest.fn(),
    moveFile: jest.fn(),
    copyFile: jest.fn(),
    appendFile: jest.fn(),
  };
  const timestampService: TimestampService = {
    unix: jest.fn(),
    format: jest.fn(),
    epochMilliseconds: jest.fn().mockReturnValue(0),
  };
  describe("#createNote", () => {
    it("メモを1件新規追加する", async () => {
      const service = new NotesServiceImpl(TestDataSource, {
        screenshotFileRepository,
        timestamp: timestampService,
      });

      const testResultEntity = await TestDataSource.getRepository(
        TestResultEntity
      ).save(new TestResultEntity());

      const requestBody: CreateNoteDto = {
        type: "notice",
        value: "value",
        details: "details",
      };

      const result = await service.createNote(testResultEntity.id, requestBody);

      expect(result).toEqual({
        id: expect.any(String),
        type: "notice",
        value: "value",
        details: "details",
        imageFileUrl: "",
        tags: [],
        timestamp: 0,
      });
    });
  });

  describe("#updateNote", () => {
    it("メモ1件の内容を更新する", async () => {
      const service = new NotesServiceImpl(TestDataSource, {
        screenshotFileRepository,
        timestamp: timestampService,
      });

      const testResultEntity = await TestDataSource.getRepository(
        TestResultEntity
      ).save(new TestResultEntity());

      const noteEntity = await TestDataSource.getRepository(NoteEntity).save(
        new NoteEntity({
          testResult: testResultEntity,
        })
      );

      const requestBody: UpdateNoteDto = {
        type: "notice",
        value: "changedValue",
        details: "changedDetails",
      };

      const result = await service.updateNote(noteEntity.id, requestBody);

      expect(result).toEqual({
        id: expect.any(String),
        type: "notice",
        value: "changedValue",
        details: "changedDetails",
        imageFileUrl: "",
        tags: [],
        timestamp: 0,
      });
    });
  });

  describe("#deleteNote", () => {
    it("指定のIDのnoteを削除する", async () => {
      const service = new NotesServiceImpl(TestDataSource, {
        screenshotFileRepository,
        timestamp: timestampService,
      });

      const testResultEntity = await TestDataSource.getRepository(
        TestResultEntity
      ).save(new TestResultEntity());

      const note1 = await service.createNote(testResultEntity.id, {
        type: "notice",
        value: "value",
        details: "details",
      });

      const note2 = await service.createNote(testResultEntity.id, {
        type: "notice2",
        value: "value2",
        details: "details2",
      });

      await service.deleteNote(note1.id);

      const result = await TestDataSource.getRepository(NoteEntity).find();

      expect((result ?? []).length).toEqual(1);

      expect((result ?? [])[0]).toMatchObject({
        id: note2.id,
        details: note2.details,
        value: note2.value,
        timestamp: 0,
      });
    });
  });
});
