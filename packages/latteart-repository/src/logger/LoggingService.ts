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
import EmptyLogger from "./EmptyLogger";

/**
 * A service that provides access to loggers.
 */
export default class LoggingService {
  /**
   * Set and initialize the logger to access.
   * @param logger  Logger to be accessed
   */
  public static initialize(logger: ILogger): void {
    LoggingService.logger = logger;
  }

  /**
   * Output DEBUG level log.
   * @param message  Log message
   */
  public static debug(message: string): void {
    LoggingService.logger.debug(message);
  }

  /**
   * Output INFO level log.
   * @param message  Log message
   */
  public static info(message: string): void {
    LoggingService.logger.info(message);
  }

  /**
   * Output WARN level log.
   * @param message  Log message
   */
  public static warn(message: string): void {
    LoggingService.logger.warn(message);
  }

  /**
   * Output ERROR level log.
   * @param message ログメッセージ
   */
  public static error(message: string, error?: Error): void {
    LoggingService.logger.error(
      `${message}${error ? ` : ${error.stack}` : ""}`
    );
  }

  private static logger: ILogger = new EmptyLogger();
}
