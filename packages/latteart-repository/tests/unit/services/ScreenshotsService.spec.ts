import { ScreenshotEntity } from "@/entities/ScreenshotEntity";
import { TestResultEntity } from "@/entities/TestResultEntity";
import { TestStepEntity } from "@/entities/TestStepEntity";
import { ScreenshotsService } from "@/services/ScreenshotsService";
import {
  FileRepositoryManager,
  StaticDirectory,
} from "@/gateways/fileRepository";
import { TimestampServiceImpl } from "@/services/TimestampService";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";
import { getRepository } from "typeorm";
import path from "path";
import fs from "fs-extra";
import os from "os";
import {
  getCurrentUnixtime,
  unixtimeToFormattedString,
} from "@/domain/timeUtil";

const testConnectionHelper = new SqliteTestConnectionHelper();

const resourcesDirPath = path.join(
  path.relative(process.cwd(), path.dirname(__dirname)),
  "../",
  "resources"
);
const tempDirPath = path.join(resourcesDirPath, "temp");

beforeEach(async () => {
  await fs.mkdir(tempDirPath).catch((e) => {
    console.error(e);
  });
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await fs.remove(tempDirPath).catch((e) => {
    console.error(e);
  });
  await testConnectionHelper.closeTestConnection();
});

describe("ScreenshotsService", () => {
  describe("#getScreenshots", () => {
    it("スクリーンショット出力", async () => {
      const tmpDirPath = await fs.mkdtemp(path.join(os.tmpdir(), "latteart-"));

      const fileRepositories = new Map([
        [
          "screenshot",
          new StaticDirectory(path.join(resourcesDirPath, "screenshots")),
        ],
        ["temp", new StaticDirectory(path.join(resourcesDirPath, "temp"))],
        ["work", new StaticDirectory(path.join(tmpDirPath, "work"))],
      ]);
      const workingFileRepository = new FileRepositoryManager(
        fileRepositories,
        resourcesDirPath
      ).getRepository("work");

      const tempFileRepository = new FileRepositoryManager(
        fileRepositories,
        resourcesDirPath
      ).getRepository("temp");

      const testResultEntity = await getRepository(TestResultEntity).save(
        new TestResultEntity({ name: "test" })
      );

      const testStepEntity = await getRepository(TestStepEntity).save(
        new TestStepEntity({ testResult: testResultEntity })
      );

      await getRepository(ScreenshotEntity).save(
        new ScreenshotEntity({
          fileUrl: "/test.png",
          testResult: testResultEntity,
          testStep: testStepEntity,
        })
      );

      const datetime = unixtimeToFormattedString(
        getCurrentUnixtime(),
        "YYYYMMDD_HHmmss"
      );
      const timeStampService: TimestampServiceImpl = {
        unix: jest.fn(),
        format: () => {
          return datetime;
        },
        epochMilliseconds: jest.fn(),
      };

      await new ScreenshotsService().getScreenshots(
        testResultEntity.id,
        tempFileRepository,
        workingFileRepository,
        timeStampService
      );

      const zipPath = tempFileRepository.getFilePath(
        `screenshots_${testResultEntity.name}_${datetime}.zip`
      );
      await fs.stat(zipPath);
    });
  });
});
