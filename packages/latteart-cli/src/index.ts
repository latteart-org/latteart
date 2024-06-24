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

import express from "express";
import history from "connect-history-api-fallback";
import path from "path";

const port = process.env.PORT || 3000;

const app = express();

app.use(history());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const executablePath = (process as any).pkg?.entrypoint;
const currentDirPath = path.relative(
  process.cwd(),
  path.dirname(executablePath ? process.argv[0] : __dirname)
);

app.use(express.static(path.join(currentDirPath, "public")));

const v1RootPath = "/api/v1";
/**
 * Get server name.
 */
app.get(`${v1RootPath}/server-name`, (req, res) => {
  console.info("Get server name.");

  res.json("latteart");
});

app.listen(port, () => {
  console.info(`LatteArt: http://127.0.0.1:${port}`);
});
