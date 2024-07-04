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

import { ServerError, ServerErrorData } from "../ServerError";

import {
  Controller,
  Body,
  Post,
  Route,
  Path,
  Tags,
  Response,
  SuccessResponse,
} from "tsoa";
import { createFileRepositoryManager } from "@/gateways/fileRepository";
import { AppDataSource } from "@/data-source";
import {
  CreateMutationDto,
  CreateMutationResponse,
} from "../interfaces/Mutations";
import { MutationService } from "@/services/MutationsService";
import { createLogger } from "@/logger/logger";
import { transactionRunner } from "..";

@Route("test-results/{testResultId}/mutations")
@Tags("test-results")
export class MutationsController extends Controller {
  /**
   * Add mutation on test results.
   * @param testResultId Target test result id.
   * @param requestBody Mutations.
   * @returns Registered Mutations.
   */
  @Response<ServerErrorData<"add_mutation_failed">>(500, "Add mutation failed")
  @SuccessResponse(200, "Success")
  @Post()
  public async addMutation(
    @Path() testResultId: string,
    @Body() requestBody: CreateMutationDto[]
  ): Promise<CreateMutationResponse[]> {
    try {
      return new MutationService(AppDataSource).createMutation(
        testResultId,
        requestBody,
        transactionRunner,
        (await createFileRepositoryManager()).getRepository("screenshot")
      );
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        const logger = createLogger();
        logger.error("Add mutation failed.", error);

        throw new ServerError(500, {
          code: "add_mutation_failed",
        });
      }
      throw error;
    }
  }
}
