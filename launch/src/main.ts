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

import { readConfig, mergeEnv } from "./setting";
import { launchServer, serverIsReady, openPage } from "./server";
import { sleep } from "./util";
import path from "path";

(async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const executablePath = (process as any).pkg?.entrypoint;
  const appRootPath = path.relative(
    process.cwd(),
    path.dirname(executablePath ? process.argv[0] : __dirname)
  );

  const configFilePath = path.join(appRootPath, "launch.config.json");
  const config = await readConfig(configFilePath);

  if (!config) {
    return;
  }

  for (const serverConfig of config.servers) {
    console.info(`START ${serverConfig.name}`);

    const url = serverConfig.http?.url ? serverConfig.http.url : "";

    if (await serverIsReady(url, serverConfig.name)) {
      console.info("This server is already started.");
    } else {
      const binaryFilePath = path.join(
        appRootPath,
        serverConfig.binaryFilePath
      );
      launchServer(binaryFilePath, mergeEnv(serverConfig.env));

      if (!serverConfig.http?.connectionCheck) {
        await sleep(1000);
        continue;
      }

      let retryCount = 0;
      const retryLimit = 10;
      do {
        await sleep(1000);
        if (await serverIsReady(url, serverConfig.name)) {
          break;
        }
        console.info(`retrying connect to ${url}.`);
        retryCount++;
      } while (retryCount < retryLimit);

      if (retryCount === retryLimit) {
        console.error("Could not connect.");
        return;
      } else {
        console.info(`Connected to ${url}.`);
      }
      await sleep(1000);
    }
  }

  const captureClUrl = config.servers.find(
    (server) => server.name === "latteart-capture-cl"
  )?.http?.url;
  const repositoryUrl = config.servers.find(
    (server) => server.name === "latteart-repository"
  )?.http?.url;
  const latteartServer = config.servers[config.servers.length - 1];
  const captureUrl = `${latteartServer.http?.url}?capture=${captureClUrl}&repository=${repositoryUrl}`;
  const manageUrl = `${latteartServer.http?.url}?mode=manage&capture=${captureClUrl}&repository=${repositoryUrl}`;

  console.info(`\

capture: ${captureUrl}
manage: ${manageUrl}
`);

  if (process.env.LATTEART_BOOT_MODE === "manage") {
    openPage(manageUrl);
  } else {
    openPage(captureUrl);
  }
})();
