import { getRepository } from "typeorm";
import { SqliteTestConnectionHelper } from "../../helper/TestConnectionHelper";
import { ConfigsService } from "@/services/ConfigsService";
import { ConfigEntity } from "@/entities/ConfigEntity";
import { PutConfigDto } from "@/interfaces/Configs";

const testConnectionHelper = new SqliteTestConnectionHelper();

beforeEach(async () => {
  await testConnectionHelper.createTestConnection({ logging: false });
});

afterEach(async () => {
  await testConnectionHelper.closeTestConnection();
});

describe("ConfigsService", () => {
  describe("#updateConfig", () => {
    it("Configの内容を更新する", async () => {
      const service = new ConfigsService();
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
          imageCompression: {
            isEnabled: false,
            isDeleteSrcImage: false,
          },
        },
      };

      const newConfig = new ConfigEntity();
      newConfig.projectId = "projectId";
      newConfig.text = JSON.stringify(settings);
      newConfig.deviceText = "";
      newConfig.repositoryUrl = "";

      const configEntity = await getRepository(ConfigEntity).save(newConfig);

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
          imageCompression: {
            isEnabled: false,
            isDeleteSrcImage: false,
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
        },
      };

      const result = await service.updateConfig(projectId, requestBody);

      expect(result).toEqual({
        ...requestBody,
        config: {
          ...requestBody.config,
          imageCompression: {
            ...requestBody.config.imageCompression,
            command: "",
          },
        },
      });
    });
  });
});
