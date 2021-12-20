/**
 * Copyright 2021 NTT Corporation.
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

export type Config = {
  servers: {
    name: string;
    binaryFilePath: string;
    env?: Env;
    http?: {
      url: string;
      connectionCheck?: boolean;
    };
  }[];
};

type Env = {
  port: string;
};

export async function readConfig(
  filepath: string
): Promise<Config | undefined> {
  try {
    return await fs.readJSON(filepath);
  } catch (error) {
    console.error(error);

    return undefined;
  }
}

export function mergeEnv(env: Env | undefined): NodeJS.ProcessEnv {
  const originalEnv = process.env;

  if (!env) {
    return originalEnv;
  }

  Object.keys(env).forEach((key) => {
    originalEnv[key] = (env as any)[key];
  });

  return originalEnv;
}
