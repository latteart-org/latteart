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

import { exec, ExecOptions } from "child_process";
import http from "http";
import { bufferToString } from "./util";
import open from "open";

export function launchServer(
  serverBinaryFilePath: string,
  env: NodeJS.ProcessEnv
): void {
  const option: { encoding: "buffer" } & ExecOptions = {
    encoding: "buffer",
    env,
  };

  exec(serverBinaryFilePath, option, (err, stdout, stderr) => {
    if (err) {
      console.error(bufferToString(stderr));
      return;
    }
    console.info(bufferToString(stdout));
  });
}

export async function serverIsReady(
  serverUrl: string,
  serverName: string
): Promise<boolean> {
  return new Promise((resolve) => {
    http
      .get(`${serverUrl}/api/v1/server-name`, (res) => {
        res.setEncoding("utf8");
        let returnData = "";
        res.on("data", (chunk) => {
          returnData += chunk;
        });
        res.on("end", () => {
          try {
            const returnName = JSON.parse(returnData);

            if (`${returnName}` === serverName) {
              resolve(true);
            } else {
              resolve(false);
            }
          } catch (error) {
            resolve(false);
          }
        });
      })
      .on("error", (e) => {
        resolve(false);
      });
  });
}

export function openPage(pageUrl: string): void {
  open(pageUrl);
}
