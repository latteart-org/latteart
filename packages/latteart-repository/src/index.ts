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
import "reflect-metadata";

import express, {
  Response as ExResponse,
  Request as ExRequest,
  NextFunction,
} from "express";
import { ValidateError } from "tsoa";
import bodyParser from "body-parser";
import { SettingsUtility } from "./gateways/settings/SettingsUtility";
import { appRootPath, configFilePath, publicDirPath } from "./common";
import { ConnectionOptions, createConnection } from "typeorm";
import { NoteEntity } from "./entities/NoteEntity";
import { TagEntity } from "./entities/TagEntity";
import fs from "fs-extra";
import path from "path";
import { RegisterRoutes } from "./routes/routes";
import { TestStepEntity } from "./entities/TestStepEntity";
import { CoverageSourceEntity } from "./entities/CoverageSourceEntity";
import { TestPurposeEntity } from "./entities/TestPurposeEntity";
import { TestResultEntity } from "./entities/TestResultEntity";
import { ScreenshotEntity } from "./entities/ScreenshotEntity";
import { AttachedFileEntity } from "./entities/AttachedFilesEntity";
import { ConfigEntity } from "./entities/ConfigEntity";
import { ProjectEntity } from "./entities/ProjectEntity";
import { SessionEntity } from "./entities/SessionEntity";
import { SnapshotEntity } from "./entities/SnapshotEntity";
import { StoryEntity } from "./entities/StoryEntity";
import { TestMatrixEntity } from "./entities/TestMatrixEntity";
import { TestTargetEntity } from "./entities/TestTargetEntity";
import { TestTargetGroupEntity } from "./entities/TestTargetGroupEntity";
import { ViewPointEntity } from "./entities/ViewPointEntity";
import { ViewPointPresetEntity } from "./entities/ViewPointPresetEntity";
import { ServerError } from "./ServerError";
import { TransactionRunner } from "./TransactionRunner";
import { Init1638930268191 } from "./migrations/1638930268191-Init";
import { UpdateProjectEntity1641956149882 } from "./migrations/1641956149882-UpdateProjectEntity";
import { UpdateAttachedFilesEntity1642388104855 } from "./migrations/1642388104855-UpdateAttachedFilesEntity";
import { UpdateViewPointEntity1654749340817 } from "./migrations/1654749340817-UpdateViewPointEntity";
import { UpdateViewPointEntity1655772848395 } from "./migrations/1655772848395-UpdateViewPointEntity";
import { UpdateSessionEntity1656305325919 } from "./migrations/1656305325919-UpdateSessionEntity";
import { TestProgressEntity } from "./entities/TestProgressEntity";
import { AddTestProgressEntity1657768635961 } from "./migrations/1657768635961-AddTestProgressEntity";
import { DeleteDefaultInputElementEntity1661223982605 } from "./migrations/1661223982605-DeleteDefaultInputElementEntity";
import { UpdateTestStepEntity1666848612089 } from "./migrations/1666848612089-UpdateTestStepEntity";
import { UpdateTestResultEntity1671087205573 } from "./migrations/1671087205573-UpdateTestResultEntity";
import { createLogger } from "./logger/logger";
import { UpdateTestStepEntity1677835465468 } from "./migrations/1677835465468-UpdateTestStepEntity";
import { UpdateTestResultEntity1680078703857 } from "./migrations/1680078703857-UpdateTestResultEntity";

export const transactionRunner = new TransactionRunner();

(async () => {
  SettingsUtility.loadFile(configFilePath);

  await initializeOrmConnection();

  const envPort = parseInt(process.env.PORT ?? "");
  const port = Number.isNaN(envPort) ? 3002 : envPort;

  const timeout = 1000 * 60 * 60;

  runServer(port, timeout);
})().catch((error) => {
  createLogger().error(error);
});

async function initializeOrmConnection() {
  const baseOptions: ConnectionOptions = {
    name: "default",
    type: "sqlite",
    database: "latteart.sqlite",
    logging: false,
  };

  const options = {
    ...baseOptions,
    entities: [
      CoverageSourceEntity,
      NoteEntity,
      ScreenshotEntity,
      TagEntity,
      TestPurposeEntity,
      TestResultEntity,
      TestStepEntity,
      AttachedFileEntity,
      ConfigEntity,
      ProjectEntity,
      SessionEntity,
      SnapshotEntity,
      StoryEntity,
      TestMatrixEntity,
      TestTargetEntity,
      TestTargetGroupEntity,
      ViewPointEntity,
      ViewPointPresetEntity,
      TestProgressEntity,
    ],
    migrations: [
      Init1638930268191,
      UpdateProjectEntity1641956149882,
      UpdateAttachedFilesEntity1642388104855,
      UpdateViewPointEntity1654749340817,
      UpdateViewPointEntity1655772848395,
      UpdateSessionEntity1656305325919,
      AddTestProgressEntity1657768635961,
      DeleteDefaultInputElementEntity1661223982605,
      UpdateTestStepEntity1666848612089,
      UpdateTestResultEntity1671087205573,
      UpdateTestStepEntity1677835465468,
      UpdateTestResultEntity1680078703857,
    ],
  };

  if (baseOptions.type === "sqlite") {
    const databaseName = path.basename(baseOptions.database);
    const databasePath = path.join(appRootPath, databaseName);

    const backupDatabaseName = `${databaseName}.bak`;
    const backupDatabasePath = path.join(appRootPath, backupDatabaseName);

    options.database = databasePath;

    if (fs.existsSync(databasePath)) {
      createLogger().info(
        `Backup sqlite database file. -> ${backupDatabasePath}`
      );

      await fs.copyFile(databasePath, backupDatabasePath);
    }
  }

  const connection = await createConnection(options);
  await connection.query("PRAGMA foreign_keys=OFF;");
  await connection.runMigrations().catch(async (error) => {
    createLogger().error(error);

    await connection.close();

    throw new Error(`Migration failed.`);
  });
  await connection.query("PRAGMA foreign_keys=ON;");
}

function runServer(port: number, timeout?: number) {
  const app = express();

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type"
    );

    next();
  });

  app.use(express.static(publicDirPath));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json({ limit: "100mb" }));

  // app.use("/api/v1", BaseRouter);

  RegisterRoutes(app);

  const logger = createLogger();

  app.use(function errorHandler(
    err: unknown,
    req: ExRequest,
    res: ExResponse,
    next: NextFunction
  ): ExResponse | void {
    console.log("errorHandler");

    if (err instanceof ValidateError) {
      logger.warn(
        `Caught Validation Error for ${req.path}: ${JSON.stringify(err.fields)}`
      );
      logger.warn(req.body);

      return res.status(422).json({
        message: "Validation Failed",
        details: err?.fields,
      });
    } else if (err instanceof ServerError) {
      logger.error(JSON.stringify(err));

      return res.status(err.statusCode).json(err.data);
    } else if (err instanceof Error) {
      logger.error(JSON.stringify(err));

      return res.status(500).json({
        message: "Internal Server Error",
      });
    } else {
      logger.error(`${err}`);
    }

    next();
  });

  const server = app.listen(port, () => {
    logger.info(`Listening on *:${port}`);
  });

  if (timeout) {
    server.timeout = timeout;
  }
}
