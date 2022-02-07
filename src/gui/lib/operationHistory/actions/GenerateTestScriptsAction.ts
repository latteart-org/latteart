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
    invaridOperationTypeExists: boolean;
  }> {
    const testScript = this.scriptGenerator.generate(params.sources);

    if (!testScript.testSuite) {
      throw new Error(`generate_test_suite_failed`);
    }

    const untargetedOperations = [
      "accept_alert",
      "dismiss_alert",
      "browser_back",
      "browser_forward",
    ];

    const invaridOperationTypeList = params.sources.flatMap((session) => {
      return session.history.map((operation) => {
        return untargetedOperations.includes(operation.type);
      });
    });

    const invaridOperationTypeExists = invaridOperationTypeList.some(
      (invaridOperation) => invaridOperation === true
    );

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
        invaridOperationTypeExists: invaridOperationTypeExists,
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
        invaridOperationTypeExists: invaridOperationTypeExists,
      };
    }

    throw new Error(`save_test_scripts_no_operation_error`);
  }
}
