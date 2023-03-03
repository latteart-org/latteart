import { TestResultEntity } from "@/entities/TestResultEntity";
import { CreateNoteDto } from "@/interfaces/Notes";
import { NotesServiceImpl } from "@/services/NotesService";
import { TimestampService } from "@/services/TimestampService";
import { getRepository } from "typeorm";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";
import { FileRepository } from "@/interfaces/fileRepository";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("NotesService", () => {
  describe("#createNote", () => {
    it("メモを1件新規追加する", async () => {
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
      };
      const timestampService: TimestampService = {
        unix: jest.fn().mockReturnValue(0),
        format: jest.fn(),
        epochMilliseconds: jest.fn(),
      };
      const service = new NotesServiceImpl({
        screenshotFileRepository,
        timestamp: timestampService,
      });

      const testResultEntity = await getRepository(TestResultEntity).save(
        new TestResultEntity()
      );

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
      });
    });
  });
});
