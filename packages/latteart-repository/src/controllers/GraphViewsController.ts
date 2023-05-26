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

import { ServerError, ServerErrorData } from "../ServerError";
import { TimestampServiceImpl } from "@/services/TimestampService";
import {
  Controller,
  Body,
  Post,
  Route,
  Tags,
  SuccessResponse,
  Response,
} from "tsoa";

import { createFileRepositoryManager } from "@/gateways/fileRepository";
import { createLogger } from "@/logger/logger";
import { GenerateGraphViewDto } from "@/interfaces/GraphViews";
import { GetGraphViewResponse } from "@/interfaces/TestResults";
import { TestResultServiceImpl } from "@/services/TestResultService";
import { TestStepServiceImpl } from "@/services/TestStepService";
import { ConfigsService } from "@/services/ConfigsService";

/**
 * Generate graph view model of test result.
 * @param testResultIds Target test result ids.
 * @param requestBody Test result view option.
 * @returns Generated graph view model.
 */
@Route("graph-views")
@Tags("graph-views")
export class GraphViewsController extends Controller {
  @Response<ServerErrorData<"generate_graph_view_failed">>(
    500,
    "Generate graph view failed"
  )
  @SuccessResponse(200, "Success")
  @Post()
  public async generate(
    @Body() requestBody: GenerateGraphViewDto
  ): Promise<GetGraphViewResponse> {
    const timestampService = new TimestampServiceImpl();
    const fileRepositoryManager = await createFileRepositoryManager();
    const screenshotFileRepository =
      fileRepositoryManager.getRepository("screenshot");
    const workingFileRepository = fileRepositoryManager.getRepository("work");
    const compareReportRepository = fileRepositoryManager.getRepository("temp");

    const service = new TestResultServiceImpl({
      timestamp: timestampService,
      testStep: new TestStepServiceImpl({
        screenshotFileRepository,
        timestamp: timestampService,
        config: new ConfigsService(),
      }),
      screenshotFileRepository,
      workingFileRepository,
      compareReportRepository,
    });

    try {
      return await service.generateGraphView(requestBody.testResultIds, {
        node: requestBody.node,
      });
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Generate graph view failed.", error);
        throw new ServerError(500, {
          code: "generate_graph_view_failed",
        });
      }
      throw error;
    }
  }
}
