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

import { TestScriptGenerator } from "../scriptGenerator/TestScriptGenerator";
import { Operation } from "../Operation";
import { invalidOperationTypeExists } from "../scriptGenerator/model/pageObject/method/operation/PageObjectOperation";
import { TestScriptRepository } from "@/lib/eventDispatcher/repositoryService/TestScriptRepository";
import { ActionResult } from "@/lib/common/ActionResult";

export interface TestScriptExportable {
  readonly testScriptRepository: TestScriptRepository;
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
  }): Promise<
    ActionResult<{
      outputUrl: string;
      invalidOperationTypeExists: boolean;
    }>
  > {
    const testScript = this.scriptGenerator.generate(params.sources);

    if (!testScript.testSuite) {
      return { data: undefined, error: { code: "generate_test_suite_failed" } };
    }

    const invalidTypeExists = params.sources.some((session) => {
      return session.history.some((operation) => {
        return invalidOperationTypeExists(operation.type);
      });
    });

    if (params.projectId) {
      const reply = await this.dispatcher.testScriptRepository.postTestscriptsWithProjectId(
        params.projectId,
        testScript
      );

      const outputUrl = reply.data!.url;
      const data = {
        outputUrl,
        invalidOperationTypeExists: invalidTypeExists,
      };
      const error = reply.error ?? undefined;
      const result = {
        data,
        error,
      };

      return result;
    }

    if (params.testResultId) {
      const reply = await this.dispatcher.testScriptRepository.postTestscriptsWithTestResultId(
        params.testResultId,
        testScript
      );
      const outputUrl = reply.data!.url;
      const data = {
        outputUrl,
        invalidOperationTypeExists: invalidTypeExists,
      };
      const error = reply.error ?? undefined;
      const result = {
        data,
        error,
      };

      return result;
    }
    return {
      data: undefined,
      error: { code: "save_test_scripts_no_operation_error" },
    };
  }
}
