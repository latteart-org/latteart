/**
 * Copyright 2025 NTT Corporation.
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
  Route,
  Tags,
  Response,
  SuccessResponse,
  Put,
} from "tsoa";
import { createLogger } from "@/logger/logger";
import { TestHintPropsService } from "../services/TestHintPropsService";
import {
  PutTestHintPropDto,
  PutTestHintPropResponse,
} from "../interfaces/TestHints";
import { transactionRunner } from "..";
import { AppDataSource } from "@/data-source";

@Route("test-hint-props")
@Tags("test-hints")
export class TestHintPropsController extends Controller {
  /**
   * Update test hint props.
   * @param requestBody Test hint props.
   * @returns Updated test hint props.
   */
  @Response<ServerErrorData<"put_test_hint_props_failed">>(
    500,
    "Put testHintProps failed"
  )
  @SuccessResponse(200, "Success")
  @Put()
  public async putTestHintPops(
    @Body() requestBody: PutTestHintPropDto[]
  ): Promise<PutTestHintPropResponse> {
    try {
      return await new TestHintPropsService(AppDataSource).putTestHintProps(
        requestBody,
        transactionRunner
      );
    } catch (error) {
      if (error instanceof Error) {
        createLogger().error("Put TestHintProps failed.", error);

        throw new ServerError(500, {
          code: "put_test_hint_props_failed",
        });
      }
      throw error;
    }
  }
}
