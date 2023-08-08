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

import { ProjectEntity } from "@/entities/ProjectEntity";
import { TestScript } from "@/domain/testScriptGeneration";
import { TestScriptGenerator } from "@/domain/testScriptGeneration";
import { TestScriptOption } from "@/domain/types";
import { ServerError } from "@/ServerError";
import { getRepository } from "typeorm";
import { TestResultService } from "./TestResultService";
import { TestScriptFileRepositoryService } from "./TestScriptFileRepositoryService";
import {
  createTestScriptSourceOperations as createTestScriptSourceOperations,
  createScreenDefinitionConfig,
  convertEntityToTestResult,
} from "./helper/testScriptGenerationHelper";
import { TestResultEntity } from "@/entities/TestResultEntity";
import ScreenDefFactory, {
  ScreenDefinitionConfig,
} from "@/domain/ScreenDefFactory";

export class TestScriptsService {
  constructor(
    private service: {
      testResult: TestResultService;
      testScriptFileRepository: TestScriptFileRepositoryService;
    }
  ) {}

  public async createTestScriptByProject(
    projectId: string,
    option: TestScriptOption
  ): Promise<{ url: string; invalidOperationTypeExists: boolean }> {
    const testResultIds = (
      await getRepository(ProjectEntity).findOneOrFail(projectId, {
        relations: [
          "testMatrices",
          "testMatrices.stories",
          "testMatrices.stories.sessions",
          "testMatrices.stories.sessions.testResult",
        ],
      })
    ).testMatrices.flatMap((testMatrix) => {
      return testMatrix.stories.flatMap((story) => {
        return story.sessions.flatMap((session) => {
          return session.testResult ? [session.testResult.id] : [];
        });
      });
    });

    const { testScript, invalidOperationTypeExists } =
      await this.generateTestScript({ testResultIds, option });

    if (!testScript.testSuite) {
      throw new ServerError(500, {
        code: "no_test_cases_generated",
      });
    }

    const screenshots: { id: string; fileUrl: string }[] = (
      await Promise.all(
        testResultIds.map((testResultId) => {
          return this.service.testResult.collectAllTestStepScreenshots(
            testResultId
          );
        })
      )
    ).flat();

    const url = await this.service.testScriptFileRepository.write(
      {
        ...testScript,
        testSuite: testScript.testSuite,
      },
      screenshots
    );

    return { url, invalidOperationTypeExists };
  }

  public async createTestScriptByTestResult(
    testResultId: string,
    option: TestScriptOption
  ): Promise<{ url: string; invalidOperationTypeExists: boolean }> {
    const { testScript, invalidOperationTypeExists } =
      await this.generateTestScript({ testResultIds: [testResultId], option });

    if (!testScript.testSuite) {
      throw new ServerError(500, {
        code: "no_test_cases_generated",
      });
    }

    const screenshots =
      await this.service.testResult.collectAllTestStepScreenshots(testResultId);

    const url = await this.service.testScriptFileRepository.write(
      {
        ...testScript,
        testSuite: testScript.testSuite,
      },
      screenshots
    );

    return { url, invalidOperationTypeExists };
  }

  private async generateTestScript(params: {
    testResultIds: string[];
    option: TestScriptOption;
  }): Promise<{
    testScript: TestScript;
    invalidOperationTypeExists: boolean;
  }> {
    const testResultEntities = (
      await Promise.all(
        params.testResultIds.map(async (testResultId) => {
          const testResultEntity = await getRepository(
            TestResultEntity
          ).findOne(testResultId, {
            relations: [
              "testSteps",
              "testSteps.screenshot",
              "testSteps.video",
              "coverageSources",
            ],
          });

          return testResultEntity ? [testResultEntity] : [];
        })
      )
    ).flat();

    const testResults = testResultEntities.map((testResultEntity) =>
      convertEntityToTestResult(testResultEntity)
    );
    const screenDefinitionConfig = createScreenDefinitionConfig(params.option);
    const screenDefFactory = new ScreenDefFactory(screenDefinitionConfig);

    const sources = testResults.flatMap((testResult) => {
      return {
        initialUrl: testResult.initialUrl,
        history: createTestScriptSourceOperations(
          testResult,
          screenDefFactory,
          params.option
        ),
      };
    });

    const testScriptGenerator = new TestScriptGenerator({
      optimized: params.option.optimized,
      useMultiLocator: params.option.useMultiLocator,
      testData: {
        useDataDriven: params.option.testData.useDataDriven,
        maxGeneration: params.option.testData.maxGeneration,
      },
      buttonDefinitions: params.option.buttonDefinitions,
    });

    const { testScript, warnings } = testScriptGenerator.generate(sources);

    return {
      testScript,
      invalidOperationTypeExists: warnings.includes(
        "invalid_operation_type_exists"
      ),
    };
  }
}
