import {
  SqliteTestConnectionHelper,
  TestDataSource,
} from "../../helper/TestConnectionHelper";
import { ConfigsService } from "@/services/ConfigsService";
import { ConfigEntity } from "@/entities/ConfigEntity";
import { PutConfigDto } from "@/interfaces/Configs";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection();
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("ConfigsService", () => {
  describe("#updateConfig", () => {
    it("Configの内容を更新する", async () => {
      const service = new ConfigsService(TestDataSource);
      const settings = {
        viewPointsPreset: [],
        defaultTagList: [],
        config: {
          autofillSetting: { conditionGroups: [] },
          autoOperationSetting: { conditionGroups: [] },
          screenDefinition: { screenDefType: "url", conditionGroups: [] },
          coverage: {
            include: {
              tags: [],
            },
          },
          imageCompression: { format: "webp" },
        },
      };

      const newConfig = new ConfigEntity();
      newConfig.projectId = "projectId";
      newConfig.text = JSON.stringify(settings);
      newConfig.deviceText = "";
      newConfig.repositoryUrl = "";

      const configEntity =
        await TestDataSource.getRepository(ConfigEntity).save(newConfig);

      const projectId = configEntity.projectId;

      const requestBody: PutConfigDto = {
        viewPointsPreset: [],
        defaultTagList: [],
        config: {
          autofillSetting: { conditionGroups: [] },
          autoOperationSetting: { conditionGroups: [] },
          screenDefinition: { screenDefType: "title", conditionGroups: [] },
          coverage: {
            include: {
              tags: [],
            },
          },
          captureMediaSetting: {
            mediaType: "image",
            imageCompression: { format: "png" },
          },
          testResultComparison: {
            excludeItems: {
              isEnabled: false,
              values: [],
            },
            excludeElements: {
              isEnabled: false,
              values: [],
            },
          },
          experimentalFeatureSetting: { captureArch: "polling" },
        },
      };

      const result = await service.updateConfig(projectId, requestBody);

      expect(result).toEqual(requestBody);
    });
  });
});
