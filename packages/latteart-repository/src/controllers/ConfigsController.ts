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

import {
  GetConfigResponse,
  PutConfigDto,
  PutConfigResponse,
} from "../interfaces/Configs";
import { ServerError, ServerErrorData } from "../ServerError";
import {
  Get,
  Route,
  Path,
  Put,
  Body,
  Response,
  Tags,
  SuccessResponse,
} from "tsoa";
import { ConfigsService } from "../services/ConfigsService";
import { convertToExportableConfig } from "@/services/helper/configHelper";
import { createLogger } from "@/logger/logger";

@Route("projects/{projectId}/configs")
@Tags("projects")
export class ConfigsController {
  /**
   * Get project settings.
   * @param projectId Target project id.
   * @returns Project settings.
   */
  @Response<ServerErrorData<"get_settings_failed">>(404, "Get settings failed")
  @SuccessResponse(200, "Success")
  @Get()
  public async getProjectSettings(
    @Path() projectId: string
  ): Promise<GetConfigResponse> {
    try {
      const config = await new ConfigsService().getConfig(projectId);
      return convertToExportableConfig(config);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Get settings failed.", error);

        throw new ServerError(404, {
          code: "get_settings_failed",
        });
      }
      throw error;
    }
  }

  /**
   * Update project settings to specified.
   * @param projectId Target project id.
   * @param requestBody Setting.
   * @returns Settings after update.
   */
  @Response<ServerErrorData<"save_settings_failed">>(
    500,
    "Save settings failed"
  )
  @SuccessResponse(200, "Success")
  @Put()
  public async updateProjectSettings(
    @Path() projectId: string,
    @Body() requestBody: PutConfigDto
  ): Promise<PutConfigResponse> {
    try {
      const config = await new ConfigsService().updateConfig(
        projectId,
        requestBody
      );
      return convertToExportableConfig(config);
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Save settings failed.", error);

        throw new ServerError(500, {
          code: "save_settings_failed",
        });
      }
      throw error;
    }
  }
}
