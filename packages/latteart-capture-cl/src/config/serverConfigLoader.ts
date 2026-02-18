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

import LoggingService from "@/logger/LoggingService";
import { ConfigFileReader, ServerConfig, ServerConfigLoader } from "./types";

export function createConfigLoader(
  configFileReader: ConfigFileReader
): ServerConfigLoader {
  return {
    async load(): Promise<ServerConfig> {
      const configFileData = await configFileReader.readJson().catch(() => {
        LoggingService.warn(
          "Failed to read config file. Using default configuration."
        );
      });

      return parseConfigFile(configFileData);
    },
  };
}

function parseConfigFile(data: unknown): ServerConfig {
  const defaultConfig: ServerConfig = {
    captureMode: "cdp",
    remoteDebuggingPort: 9222,
  };

  if (data == null || typeof data !== "object") {
    return defaultConfig;
  }

  const configData = data as { [key: string]: unknown };

  const captureMode =
    configData.captureMode === "webdriver"
      ? "webdriver"
      : defaultConfig.captureMode;
  const remoteDebuggingPort =
    typeof configData.remoteDebuggingPort === "number"
      ? configData.remoteDebuggingPort
      : defaultConfig.remoteDebuggingPort;
  const chromeExecutablePath =
    typeof configData.chromeExecutablePath === "string"
      ? configData.chromeExecutablePath
      : undefined;
  const edgeExecutablePath =
    typeof configData.edgeExecutablePath === "string"
      ? configData.edgeExecutablePath
      : undefined;
  const acceptInsecureCerts =
    typeof configData.acceptInsecureCerts === "boolean"
      ? configData.acceptInsecureCerts
      : undefined;

  return {
    captureMode,
    remoteDebuggingPort,
    chromeExecutablePath,
    edgeExecutablePath,
    acceptInsecureCerts,
  };
}
