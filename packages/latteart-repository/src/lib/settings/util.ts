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

import { exec } from "child_process";
import LoggingService from "../../logger/LoggingService";
import encoding from "encoding-japanese";

/**
 * Determine if value is included in type.
 * @param value
 * @param type
 * @returns Returns true if included
 */
export function isIncludeEnum(value: any, type: any): boolean {
  let result = false;
  Object.entries(type).forEach(([, v]) => {
    if (value === v) {
      result = true;
    }
  });
  return result;
}

/**
 * Recursively search for the key in the target data.
 * @param keyPath
 * @param target
 * @returns Value
 */
export const findValueRecursively = (
  keyPath: string[],
  target: { [key: string]: any }
): any => {
  const head = keyPath[0];
  const tail = keyPath.slice(1);

  const value = target[head];

  if (value === undefined) {
    return undefined;
  }

  if (tail.length > 0) {
    return findValueRecursively(tail, value);
  }

  return value;
};

/**
 * Execute an external command.
 * @param command
 */
export const executeExternalCommand = (command: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    LoggingService.info(command);
    exec(command, { encoding: "buffer" }, (error, stdout, stderr) => {
      if (error !== null) {
        const message = decodeBuffer(stderr);
        reject(
          new Error(
            `Command Failed. : ${command}
${message}`
          )
        );
        return;
      }
      if (stdout) {
        LoggingService.debug("stdout");
        LoggingService.debug(decodeBuffer(stdout));
      }
      if (stderr) {
        LoggingService.debug("stderr");
        LoggingService.debug(decodeBuffer(stderr));
      }
      resolve();
    });
  });
};

/**
 * Decode.
 * @param buffer
 */
const decodeBuffer = (buffer: Buffer) => {
  return String.fromCharCode(...encoding.convert(buffer, "UNICODE"));
};
