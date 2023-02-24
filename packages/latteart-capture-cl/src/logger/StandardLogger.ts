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

import ILogger from "./ILogger";
import * as log4js from "log4js";

/**
 * Running mode.
 */
export enum RunningMode {
  Production = "production",
  Debug = "debug",
}

/**
 * The class for logging.
 */
export default class StandardLogger implements ILogger {
  private logger: log4js.Logger;

  /**
   * Constructor.
   * @param mode Running mode.
   * @param logFilePath Log file path.
   */
  constructor(mode: RunningMode, logFilePath: string) {
    const config: log4js.Configuration = {
      appenders: {
        out: {
          type: "stdout",
        },
        file: {
          type: "file",
          filename: logFilePath,
        },
      },
      categories: {
        default: {
          appenders: ["out", "file"],
          level: mode === RunningMode.Production ? "INFO" : "DEBUG",
          enableCallStack: true,
        },
      },
    };
    log4js.configure(config);
    this.logger = log4js.getLogger();
  }

  /**
   * @inheritdoc
   */
  public debug(message: string): void {
    this.logger.debug(message);
  }

  /**
   * @inheritdoc
   */
  public info(message: string): void {
    this.logger.info(message);
  }

  /**
   * @inheritdoc
   */
  public warn(message: string): void {
    this.logger.warn(message);
  }

  /**
   * @inheritdoc
   */
  public error(message: string): void {
    this.logger.error(message);
  }
}
