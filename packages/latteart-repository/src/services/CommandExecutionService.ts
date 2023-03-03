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

import { createLogger } from "@/logger/logger";
import { exec } from "child_process";
import encoding from "encoding-japanese";

export interface CommandExecutionService {
  /**
   * Execute an external command.
   * @param command
   */
  execute(command: string): Promise<{ stdout: string; stderr: string }>;
}

export class CommandExecutionServiceImpl {
  public execute(command: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise<{ stdout: string; stderr: string }>(
      (resolve, reject) => {
        createLogger().info(command);

        exec(command, { encoding: "buffer" }, (error, stdout, stderr) => {
          if (error !== null) {
            const message = this.decodeBuffer(stderr);
            reject(
              new Error(
                `Command Failed. : ${command}
${message}`
              )
            );
            return;
          }

          const decodedStdout = this.decodeBuffer(stdout);
          const decodedStderr = this.decodeBuffer(stderr);

          resolve({
            stdout: decodedStdout,
            stderr: decodedStderr,
          });
        });
      }
    );
  }

  private decodeBuffer(buffer: Buffer) {
    return String.fromCharCode(...encoding.convert(buffer, "UNICODE"));
  }
}
