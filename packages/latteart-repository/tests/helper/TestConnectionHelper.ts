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

import { createConnection, getConnection } from "typeorm";
import path from "path";

export interface TestConnectionHelper {
  createTestConnection(option: { logging: boolean }): Promise<void>;

  closeTestConnection(): Promise<void>;
}

const packageRootDirPath = path.join(__dirname, "..", "..");

export class SqliteTestConnectionHelper implements TestConnectionHelper {
  constructor(private databaseName: string = "test.sqlite") {}

  public async createTestConnection(option: {
    logging: boolean;
  }): Promise<void> {
    await createConnection({
      type: "sqlite",
      database: path.join(packageRootDirPath, this.databaseName),
      logging: option.logging,
      entities: [path.join(packageRootDirPath, "src/entities/**/*.ts")],
      migrations: [path.join(packageRootDirPath, "src/migrations/**/*.ts")],
      synchronize: true,
      dropSchema: true,
    });
  }

  public async closeTestConnection(): Promise<void> {
    await getConnection().close();
  }
}
