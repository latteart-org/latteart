/**
 * Copyright 2024 NTT Corporation.
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const executablePath = (process as any).pkg?.entrypoint;

export const appRootPath = path.relative(
  process.cwd(),
  path.dirname(executablePath ? process.argv[0] : __dirname)
);
export const publicDirPath = path.join(appRootPath, "public");
export const configFilePath = path.join(appRootPath, "latteart.config.json");
