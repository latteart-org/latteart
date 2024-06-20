/**
 * Copyright 2023 NTT Corporation.
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
import cors from "cors";
import { SettingsUtility } from "./gateways/settings/SettingsUtility";
import { appRootPath, configFilePath, publicDirPath } from "./common";
import fs from "fs-extra";
import path from "path";
import { RegisterRoutes } from "./routes/routes";
import { ServerError } from "./ServerError";
import { TransactionRunner } from "./TransactionRunner";
import { createLogger } from "./logger/logger";
import { AppDataSource } from "./data-source";
import { extensions } from "./extensions";

export const transactionRunner = new TransactionRunner(AppDataSource);

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
  if (AppDataSource.options.type === "sqlite") {
    const databasePath = AppDataSource.options.database;
    const databaseName = path.basename(AppDataSource.options.database);

    const backupDatabaseName = `${databaseName}.bak`;
    const backupDatabasePath = path.join(appRootPath, backupDatabaseName);

    if (fs.existsSync(databasePath)) {
      createLogger().info(
        `Backup sqlite database file. -> ${backupDatabasePath}`
      );

      await fs.copyFile(databasePath, backupDatabasePath);
    }
  }

  await AppDataSource.initialize();

  await AppDataSource.query("PRAGMA foreign_keys=OFF;");
  await AppDataSource.runMigrations().catch(async (error) => {
    createLogger().error(error);

    await AppDataSource.destroy();

    throw new Error(`Migration failed.`);
  });
  await AppDataSource.query("PRAGMA foreign_keys=ON;");
}

function runServer(port: number, timeout?: number) {
  const app = express();

  app.use(cors());
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

  RegisterRoutes(app);
  for (const extension of extensions) {
    extension.registerRoutes(app);
  }

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
