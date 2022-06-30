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

import { TestScriptGeneratorImpl } from "../scriptGenerator/TestScriptGenerator";
import { Operation } from "../Operation";
import { invalidOperationTypeExists } from "../scriptGenerator/model/pageObject/method/operation/PageObjectOperation";
import {
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";

const GENERATE_TEST_SCRIPTS_FAILED_MESSAGE_KEY =
  "error.operation_history.save_test_scripts_failed";
const NO_SCREEN_TRANSITION_ERROR_MESSAGE_KEY =
  "error.operation_history.save_test_scripts_no_section_error";
const NO_OPERATION_ERROR_MESSAGE_KEY =
  "error.operation_history.save_test_scripts_no_operation_error";

export class GenerateTestScriptsAction {
  constructor(
    private repositoryContainer: Pick<
      RepositoryContainer,
      "testScriptRepository"
    >,
    private imageUrlResolver: (url: string) => string,
    private option: {
      testScript: { isSimple: boolean };
      testData: {
        useDataDriven: boolean;
        maxGeneration: number;
      };
    }
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
    const testScriptGenerator = new TestScriptGeneratorImpl(
      this.imageUrlResolver,
      this.option
    );

    const testScript = testScriptGenerator.generate(params.sources);

    if (!testScript.testSuite) {
      if (this.option.testScript.isSimple) {
        return new ActionFailure({
          messageKey: NO_OPERATION_ERROR_MESSAGE_KEY,
        });
      }

      return new ActionFailure({
        messageKey: NO_SCREEN_TRANSITION_ERROR_MESSAGE_KEY,
      });
    }

    const invalidTypeExists = params.sources.some((session) => {
      return session.history.some((operation) => {
        return invalidOperationTypeExists(operation.type);
      });
    });

    if (params.projectId) {
      const postTestScriptsWithProjectIdResult =
        await this.repositoryContainer.testScriptRepository.postTestscriptsWithProjectId(
          params.projectId,
          testScript
        );

      if (postTestScriptsWithProjectIdResult.isFailure()) {
        return new ActionFailure({
          messageKey: GENERATE_TEST_SCRIPTS_FAILED_MESSAGE_KEY,
        });
      }

      const outputUrl = postTestScriptsWithProjectIdResult.data.url;
      const data = {
        outputUrl,
        invalidOperationTypeExists: invalidTypeExists,
      };

      return new ActionSuccess(data);
    }

    if (params.testResultId) {
      const postTestScriptsWithTestResultId =
        await this.repositoryContainer.testScriptRepository.postTestscriptsWithTestResultId(
          params.testResultId,
          testScript
        );

      if (postTestScriptsWithTestResultId.isFailure()) {
        return new ActionFailure({
          messageKey: GENERATE_TEST_SCRIPTS_FAILED_MESSAGE_KEY,
        });
      }

      const outputUrl = postTestScriptsWithTestResultId.data.url;
      const data = {
        outputUrl,
        invalidOperationTypeExists: invalidTypeExists,
      };

      return new ActionSuccess(data);
    }

    return new ActionFailure({
      messageKey: NO_OPERATION_ERROR_MESSAGE_KEY,
    });
  }
}
