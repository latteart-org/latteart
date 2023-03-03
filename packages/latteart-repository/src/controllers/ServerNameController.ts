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
import { Get, Response, Route, SuccessResponse } from "tsoa";
import { ServerNameService } from "../services/ServerNameService";
import { createLogger } from "@/logger/logger";

@Route("server-name")
export class ServerNameController {
  /**
   * Get server name.
   * @returns The name of the server
   */
  @Response<ServerErrorData<"get_servername_failed">>(
    404,
    "Get server name failed"
  )
  @SuccessResponse(200, "Success")
  @Get()
  public async getServerName(): Promise<string> {
    try {
      return new ServerNameService().getServerName();
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Get server name failed.", error);

        throw new ServerError(404, {
          code: "get_servername_failed",
        });
      }
      throw error;
    }
  }
}
