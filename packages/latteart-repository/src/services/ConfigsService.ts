/**
 * Copyright 2024 NTT Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ProjectConfig, PutConfigDto } from "../interfaces/Configs";
import { ConfigEntity } from "../entities/ConfigEntity";
import { SettingsUtility } from "../gateways/settings/SettingsUtility";
import { parseProjectConfig } from "./helper/configHelper";
import { DataSource } from "typeorm";
import { createLogger } from "@/logger/logger";

export class ConfigsService {
  constructor(private dataSource: DataSource) {}

  public async getProjectConfig(projectId: string): Promise<ProjectConfig> {
    const configEntity = await this.getConfigSource(projectId);
    return parseProjectConfig(configEntity.text);
  }

  public async updateConfig(
    projectId: string,
    requestBody: PutConfigDto
  ): Promise<ProjectConfig> {
    const configEntity = await this.getConfigSource(projectId);

    configEntity.text = JSON.stringify(requestBody);

    const savedConfigEntity = await this.dataSource
      .getRepository(ConfigEntity)
      .save(configEntity);

    return parseProjectConfig(savedConfigEntity.text);
  }

  private async getConfigSource(projectId: string): Promise<ConfigEntity> {
    const configRepository = this.dataSource.getRepository(ConfigEntity);
    let config = await configRepository.find();
    if (!config[0]) {
      const settings = SettingsUtility.settingsProvider.settings;
      createLogger().info("Initialize config.");
      const deviceSettings = {
        config: {
          platformName: "PC",
          browser: "Chrome",
          device: {
            deviceName: "",
            modelNumber: "",
            osVersion: "",
          },
          platformVersion: "",
          waitTimeForStartupReload: 0,
          executablePaths: {
            browser: "",
            driver: "",
          },
        },
      };

      const newConfig = new ConfigEntity();
      newConfig.projectId = projectId;
      newConfig.text = JSON.stringify(settings);
      newConfig.deviceText = JSON.stringify(deviceSettings);
      newConfig.repositoryUrl = "http://127.0.0.1:3000/";
      try {
        await configRepository.save(newConfig);
      } catch (error) {
        console.error(error);
      }
      config = await configRepository.find();
      if (!config[0]) {
        throw new Error();
      }
    }
    return config[0];
  }
}
