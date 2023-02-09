import { ImageFileRepositoryServiceImpl } from "@/services/ImageFileRepositoryService";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";
import { StaticDirectoryService } from "@/services/StaticDirectoryService";
import fs from "fs-extra";
import path from "path";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("ImageFileRepositoryService", () => {
  describe("#writeBufferToFile", () => {
    it("base64形式の画像を指定ファイル名のファイルとして保存する", async () => {
      const expectedUrl = "expectedUrl";

      const staticDirectoryService: StaticDirectoryService = {
        mkdir: jest.fn(),
        outputFile: jest.fn(),
        removeFile: jest.fn(),
        copyFile: jest.fn(),
        getFileUrl: jest.fn().mockReturnValue(expectedUrl),
        getJoinedPath: jest.fn(),
        moveFile: jest.fn(),
        collectFileNames: jest.fn(),
        collectFilePaths: jest.fn(),
      };

      const service = new ImageFileRepositoryServiceImpl({
        staticDirectory: staticDirectoryService,
      });

      const testImage = await fs.promises.readFile(
        path.join("tests", "resources", "test.png")
      );
      const base64TestImage = testImage.toString("base64");
      const fileName = "fileName";

      const url = await service.writeBase64ToFile(fileName, base64TestImage);

      expect(url).toEqual(expectedUrl);
      expect(staticDirectoryService.outputFile).toBeCalledWith(
        fileName,
        testImage
      );
      expect(staticDirectoryService.getFileUrl).toBeCalledWith(fileName);
    });
  });
});
