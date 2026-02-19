/**
 * Copyright 2025 NTT Corporation.
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

import path from "path";
import fs from "fs";
import { ConfigFileReader } from "./types";
import LoggingService from "@/logger/LoggingService";

/**
 * Creates a config file reader for reading the configuration file.
 *
 * @param appRootPath - The root path of the application where the config file is located.
 * @returns config file reader.
 */
export function createConfigFileReader(appRootPath: string): ConfigFileReader {
  const configFileName = "latteart.capturecl.config.json";

  return {
    async readJson(): Promise<unknown> {
      LoggingService.info(`Reading config file: ${configFileName}`);
      const fileData = await fs.promises.readFile(
        path.join(appRootPath, configFileName),
        "utf8"
      );

      const parsedData = JSON.parse(fileData);

      LoggingService.info("Config file read successfully.");

      return parsedData;
    },
  };
}
