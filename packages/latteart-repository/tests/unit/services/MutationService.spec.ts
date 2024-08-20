import { TestResultEntity } from "@/entities/TestResultEntity";
import {
  SqliteTestConnectionHelper,
  TestDataSource,
} from "../../helper/TestConnectionHelper";
import { MutationService } from "@/services/MutationsService";
import { FileRepository } from "@/interfaces/fileRepository";
import { MutationEntity } from "@/entities/MutationEntity";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection();
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("MutationsService", () => {
  describe("importMutations", () => {
    describe("mutationをimportする", () => {
      it("1件登録", async () => {
        const testResultEntity = await TestDataSource.getRepository(
          TestResultEntity
        ).save(new TestResultEntity());

        const screenshotFileRepository: FileRepository = {
          readFile: jest.fn(),
          outputFile: jest.fn(),
          outputJSON: jest.fn(),
          outputZip: jest.fn(),
          removeFile: jest.fn(),
          getFileUrl: jest.fn().mockReturnValue("path/image.png"),
          getFilePath: jest.fn(),
          moveFile: jest.fn(),
          copyFile: jest.fn(),
          appendFile: jest.fn(),
        };

        const importData = [
          {
            testResultId: testResultEntity.id,
            data: [
              {
                testResult: "oldTestResultId",
                elementMutations: "[]",
                timestamp: 10,
                screenshot: "path/image.png",
                windowHandle: "windowHandle",
                scrollPositionX: 1,
                scrollPositionY: 2,
                clientSizeWidth: 3,
                clientSizeHeight: 4,
                url: "url",
                title: "title",
              },
            ],
          },
        ];
        const mutationImageFiles = [
          {
            filePath: "path/image.png",
            data: "data",
          },
        ];

        await new MutationService(TestDataSource).importMutations(
          importData,
          mutationImageFiles,
          screenshotFileRepository
        );

        const result = await TestDataSource.getRepository(MutationEntity).find({
          relations: ["screenshot"],
        });

        expect(result).toEqual([
          {
            clientSizeHeight: 4,
            clientSizeWidth: 3,
            elementMutations: "[]",
            id: expect.any(String),
            screenshot: {
              fileUrl: "path/image.png",
              id: expect.any(String),
            },
            scrollPositionX: 1,
            scrollPositionY: 2,
            timestamp: 10,
            title: "title",
            url: "url",
            windowHandle: "windowHandle",
          },
        ]);
      });
    });
  });
});
