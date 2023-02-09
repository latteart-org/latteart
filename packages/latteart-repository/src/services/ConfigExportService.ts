/**
 * Copyright 2022 NTT Corporation.
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

import fs from "fs-extra";
import { StaticDirectoryService } from "./StaticDirectoryService";
import { TimestampService } from "./TimestampService";
import { ConfigsService } from "./ConfigsService";
import { convertToExportableConfig } from "@/lib/settings/settingsConverter";

export class ConfigExportService {
  public async export(
    projectId: string,
    service: {
      configService: ConfigsService;
      timestampService: TimestampService;
      tempDirectoryService: StaticDirectoryService;
    }
  ): Promise<string> {
    const tempConfig = await service.configService.getConfig(projectId);

    const config = convertToExportableConfig(tempConfig);

    const fileName = `config_${service.timestampService.format(
      "YYYYMMDD_HHmmss"
    )}.json`;
    const filePath = service.tempDirectoryService.getJoinedPath(fileName);
    await fs.outputFile(filePath, JSON.stringify(config, null, 2), "utf-8");

    return service.tempDirectoryService.getFileUrl(fileName);
  }
}
