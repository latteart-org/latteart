import { TestResultEntity } from "@/entities/TestResultEntity";
import { CreateNoteDto } from "@/interfaces/Notes";
import { NotesServiceImpl } from "@/services/NotesService";
import { ImageFileRepositoryService } from "@/services/ImageFileRepositoryService";
import { TimestampService } from "@/services/TimestampService";
import { getRepository } from "typeorm";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";

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
      const imageFileRepositoryService: ImageFileRepositoryService = {
        writeBufferToFile: jest.fn(),
        writeBase64ToFile: jest.fn(),
        removeFile: jest.fn(),
        getFilePath: jest.fn(),
        getFileUrl: jest.fn(),
      };
      const timestampService: TimestampService = {
        unix: jest.fn().mockReturnValue(0),
        format: jest.fn(),
        epochMilliseconds: jest.fn(),
      };
      const service = new NotesServiceImpl({
        imageFileRepository: imageFileRepositoryService,
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
