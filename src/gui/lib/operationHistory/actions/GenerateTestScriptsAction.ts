/**
 * Copyright 2021 NTT Corporation.
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

import { TestScript } from "../scriptGenerator/TestScript";
import { Reply } from "@/lib/captureControl/Reply";
import { TestScriptGenerator } from "../scriptGenerator/TestScriptGenerator";
import { Operation } from "../Operation";
import { invalidOperationTypeExists } from "../scriptGenerator/model/pageObject/method/operation/PageObjectOperation";

export interface TestScriptExportable {
  postTestscriptsWithProjectId(
    projectId: string,
    body: TestScript
  ): Promise<Reply<{ url: string }>>;

  postTestscriptsWithTestResultId(
    testResultId: string,
    body: TestScript
  ): Promise<Reply<{ url: string }>>;
}

export class GenerateTestScriptsAction {
  constructor(
    private dispatcher: TestScriptExportable,
    private scriptGenerator: TestScriptGenerator
  ) {}

  public async generate(params: {
    testResultId: string | undefined;
    projectId: string | undefined;
    sources: { initialUrl: string; history: Operation[] }[];
  }): Promise<{
    outputUrl: string;
    invalidOperationTypeExists: boolean;
  }> {
    const testScript = this.scriptGenerator.generate(params.sources);

    if (!testScript.testSuite) {
      throw new Error(`generate_test_suite_failed`);
    }

    const invalidTypeExists = params.sources.some((session) => {
      return session.history.some((operation) => {
        return invalidOperationTypeExists(operation.type);
      });
    });

    if (params.projectId) {
      const reply = await this.dispatcher.postTestscriptsWithProjectId(
        params.projectId,
        testScript
      );

      if (!reply.data) {
        throw reply.error;
      }

      const outputUrl: string = reply.data.url;

      return {
        outputUrl,
        invalidOperationTypeExists: invalidTypeExists,
      };
    }

    if (params.testResultId) {
      const reply = await this.dispatcher.postTestscriptsWithTestResultId(
        params.testResultId,
        testScript
      );

      if (!reply.data) {
        throw reply.error;
      }

      const outputUrl: string = reply.data.url;

      return {
        outputUrl,
        invalidOperationTypeExists: invalidTypeExists,
      };
    }

    throw new Error(`save_test_scripts_no_operation_error`);
  }
}
