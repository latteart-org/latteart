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

import { ServerError, ServerErrorData } from "../ServerError";
import { ConfigsService } from "@/services/ConfigsService";

import { TimestampServiceImpl } from "@/services/TimestampService";
import {
  Controller,
  Post,
  Route,
  Path,
  Response,
  Tags,
  SuccessResponse,
} from "tsoa";
import { ConfigExportService } from "@/services/ConfigExportService";
import { createFileRepositoryManager } from "@/gateways/fileRepository";
import { createLogger } from "@/logger/logger";

@Route("projects/{projectId}/configs/export")
@Tags("projects")
export class ConfigExportController extends Controller {
  /**
   * Export project settings.
   * @param projectId Target project id.
   * @returns Download url for the exported configuration file.
   */
  @Response<ServerErrorData<"export_config_failed">>(
    500,
    "Export config failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async exportProjectSettings(
    @Path() projectId: string
  ): Promise<{ url: string }> {
    const fileRepositoryManager = await createFileRepositoryManager();
    const exportFileRepository = fileRepositoryManager.getRepository("export");

    const result = await new ConfigExportService().export(projectId, {
      configService: new ConfigsService(),
      timestampService: new TimestampServiceImpl(),
      exportFileRepository,
    });

    try {
      return { url: result };
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Export config failed.", error);
        throw new ServerError(500, {
          code: "export_config_failed",
        });
      }
      throw error;
    }
  }
}
