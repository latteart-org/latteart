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
  ActionResult,
  ActionFailure,
  ActionSuccess,
} from "@/lib/common/ActionResult";
import { RepositoryContainer } from "@/lib/eventDispatcher/RepositoryContainer";
import { RepositoryAccessResult } from "@/lib/captureControl/Reply";
import { TestScriptOption } from "@/lib/eventDispatcher/repositoryService/TestScriptRepository";
import { ScreenDefinition } from "@/lib/common/settings/Settings";

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
      "testScriptRepository" | "settingRepository"
    >,
    private option: {
      testScript: { isSimple: boolean };
      testData: {
        useDataDriven: boolean;
        maxGeneration: number;
      };
    }
  ) {}

  public async generateFromTestResult(testResultId: string): Promise<
    ActionResult<{
      outputUrl: string;
      invalidOperationTypeExists: boolean;
    }>
  > {
    const getSettingsResult =
      await this.repositoryContainer.settingRepository.getSettings();

    if (getSettingsResult.isFailure()) {
      return new ActionFailure({
        messageKey: GENERATE_TEST_SCRIPTS_FAILED_MESSAGE_KEY,
      });
    }

    const testScriptOption = this.buildTestScriptOption(
      getSettingsResult.data.config.screenDefinition
    );

    const result =
      await this.repositoryContainer.testScriptRepository.postTestscriptsWithTestResultId(
        testResultId,
        testScriptOption
      );

    return this.createActionResult(result);
  }

  public async generateFromProject(projectId: string): Promise<
    ActionResult<{
      outputUrl: string;
      invalidOperationTypeExists: boolean;
    }>
  > {
    const getSettingsResult =
      await this.repositoryContainer.settingRepository.getSettings();

    if (getSettingsResult.isFailure()) {
      return new ActionFailure({
        messageKey: GENERATE_TEST_SCRIPTS_FAILED_MESSAGE_KEY,
      });
    }

    const testScriptOption = this.buildTestScriptOption(
      getSettingsResult.data.config.screenDefinition
    );

    const result =
      await this.repositoryContainer.testScriptRepository.postTestscriptsWithProjectId(
        projectId,
        testScriptOption
      );

    return this.createActionResult(result);
  }

  private createActionResult(
    result: RepositoryAccessResult<{
      url: string;
      invalidOperationTypeExists: boolean;
    }>
  ): ActionResult<{
    outputUrl: string;
    invalidOperationTypeExists: boolean;
  }> {
    if (result.isFailure()) {
      if (result.error.code === "no_test_cases_generated") {
        return new ActionFailure({
          messageKey: this.option.testScript.isSimple
            ? NO_OPERATION_ERROR_MESSAGE_KEY
            : NO_SCREEN_TRANSITION_ERROR_MESSAGE_KEY,
        });
      }

      return new ActionFailure({
        messageKey: GENERATE_TEST_SCRIPTS_FAILED_MESSAGE_KEY,
      });
    }

    const outputUrl = result.data.url;
    const data = {
      outputUrl,
      invalidOperationTypeExists: result.data.invalidOperationTypeExists,
    };

    return new ActionSuccess(data);
  }

  private buildTestScriptOption(
    screenDefinitionConfig: ScreenDefinition
  ): TestScriptOption {
    const viewOption = {
      node: {
        unit: screenDefinitionConfig.screenDefType,
        definitions: screenDefinitionConfig.conditionGroups
          .filter((group) => group.isEnabled)
          .map((group) => {
            const conditions = group.conditions
              .filter((condition) => condition.isEnabled)
              .map((condition) => {
                return {
                  target: condition.definitionType,
                  method: condition.matchType,
                  value: condition.word,
                };
              });

            return {
              name: group.screenName,
              conditions,
            };
          }),
      },
    };

    const testScriptOption = {
      optimized: !this.option.testScript.isSimple,
      testData: this.option.testData,
      view: viewOption,
    };

    return testScriptOption;
  }
}
