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

import { ProjectEntity } from "@/entities/ProjectEntity";
import { TestResult } from "@/interfaces/TestResults";
import { TestScriptOption } from "@/interfaces/TestScripts";
import {
  createWDIOLocatorFormatter,
  ScreenElementLocatorGenerator,
} from "@/lib/elementLocator";
import ScreenDefFactory, {
  ScreenDefinitionConfig,
} from "@/lib/ScreenDefFactory";
import { invalidOperationTypeExists } from "@/lib/scriptGenerator/model/pageObject/method/operation/PageObjectOperation";
import { TestScript } from "@/lib/scriptGenerator/TestScript";
import { TestScriptGeneratorImpl } from "@/lib/scriptGenerator/TestScriptGenerator";
import { TestScriptSourceOperation } from "@/lib/scriptGenerator/TestScriptSourceOperation";
import { ServerError } from "@/ServerError";
import { getRepository } from "typeorm";
import { TestResultService } from "./TestResultService";
import { TestScriptFileRepositoryService } from "./TestScriptFileRepositoryService";

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
    const testResults = (
      await Promise.all(
        params.testResultIds.map(async (testResultId) => {
          const testResult = await this.service.testResult.getTestResult(
            testResultId
          );
          return testResult ? [testResult] : [];
        })
      )
    ).flat();

    const screenDefinitionConfig: ScreenDefinitionConfig = {
      screenDefType: params.option.view.node.unit,
      conditionGroups: params.option.view.node.definitions.map((definition) => {
        return {
          isEnabled: true,
          screenName: definition.name,
          conditions: definition.conditions.map((condition) => {
            return {
              isEnabled: true,
              definitionType: condition.target,
              matchType: condition.method,
              word: condition.value,
            };
          }),
        };
      }),
    };

    let isPauseCapturing = false;

    const sources = testResults.map(
      ({ initialUrl, testSteps, coverageSources }) => {
        const elementInfoListMapByScreenDef =
          this.convElementInfoListByScreenDef(
            coverageSources,
            screenDefinitionConfig
          );
        const locatorGeneratorMap = new Map<
          string,
          ScreenElementLocatorGenerator
        >();
        return {
          initialUrl,
          history: testSteps.reduce(
            (acc: TestScriptSourceOperation[], { operation }, index) => {
              const url = operation.url;
              const title = operation.title;
              const keywordTexts: string[] = operation.keywordTexts ?? [];
              const screenDef = new ScreenDefFactory(
                screenDefinitionConfig
              ).create({
                url,
                title,
                keywordSet: new Set(keywordTexts),
              });

              const locatorGenerator =
                locatorGeneratorMap.get(screenDef) ??
                new ScreenElementLocatorGenerator(
                  createWDIOLocatorFormatter(),
                  elementInfoListMapByScreenDef.get(screenDef) ?? ([] as any)
                );

              const elementInfo = operation.elementInfo
                ? {
                    ...operation.elementInfo,
                    locator: locatorGenerator.generateFrom(
                      operation.elementInfo
                    ),
                  }
                : null;

              locatorGeneratorMap.set(screenDef, locatorGenerator);

              if (operation.type === "pause_capturing") {
                isPauseCapturing = true;
                acc.push({
                  input: operation.input,
                  type: "skipped_operations",
                  elementInfo,
                  url,
                  screenDef,
                  imageFilePath: operation.imageFileUrl,
                });
              } else if (operation.type === "resume_capturing") {
                isPauseCapturing = false;
                if (acc.at(-1)?.type !== "skipped_operations") {
                  acc.push({
                    input: operation.input,
                    type: "skipped_operations",
                    elementInfo,
                    url,
                    screenDef,
                    imageFilePath: operation.imageFileUrl,
                  });
                }
              } else if (
                isPauseCapturing &&
                operation.type === "screen_transition" &&
                testSteps.at(index + 1) !== undefined &&
                testSteps.at(index + 1)?.operation.type !== "resume_capturing"
              ) {
                acc.push({
                  input: operation.input,
                  type: operation.type,
                  elementInfo,
                  url,
                  screenDef,
                  imageFilePath: operation.imageFileUrl,
                });
                acc.push({
                  input: operation.input,
                  type: "skipped_operations",
                  elementInfo,
                  url,
                  screenDef,
                  imageFilePath: operation.imageFileUrl,
                });
              } else {
                acc.push({
                  input: operation.input,
                  type: operation.type,
                  elementInfo,
                  url,
                  screenDef,
                  imageFilePath: operation.imageFileUrl,
                });
              }
              return acc;
            },
            []
          ),
        };
      }
    );

    const testScriptGenerationOption = {
      optimized: params.option.optimized,
      testData: {
        useDataDriven: params.option.testData.useDataDriven,
        maxGeneration: params.option.testData.maxGeneration,
      },
      buttonDefinitions: params.option.buttonDefinitions,
    };
    const testScriptGenerator = new TestScriptGeneratorImpl(
      testScriptGenerationOption
    );

    const testScript = testScriptGenerator.generate(sources);

    const invalidTypeExists = sources.some((source) => {
      return source.history.some((operation) => {
        return invalidOperationTypeExists(operation.type);
      });
    });

    return {
      testScript,
      invalidOperationTypeExists: invalidTypeExists,
    };
  }

  private convElementInfoListByScreenDef(
    coverageSources: TestResult["coverageSources"],
    screenDefinitionConfig: ScreenDefinitionConfig
  ): Map<
    string,
    {
      tagname: string;
      text?: string;
      xpath: string;
      value?: string;
      checked?: boolean;
      attributes?: {
        [key: string]: string;
      };
    }[]
  > {
    {
      const duplicateCheckMap = new Map<string, Set<string>>();

      return (coverageSources ?? []).reduce(
        (map, source) => {
          const keywordSet = source.screenElements.reduce((set, element) => {
            set.add(element.text);
            return set;
          }, new Set<string>());
          const url = source.url;
          const title = source.title;
          const keywordTexts: string[] = Array.from(keywordSet);
          const screenDef = new ScreenDefFactory(screenDefinitionConfig).create(
            {
              url,
              title,
              keywordSet: new Set(keywordTexts),
            }
          );

          const xpathList = map.get(screenDef) ?? [];

          const xpathSet =
            duplicateCheckMap.get(screenDef) ?? new Set<string>();
          source.screenElements.forEach((element) => {
            if (!xpathSet?.has(element.xpath)) {
              xpathList.push(element);
              xpathSet?.add(element.xpath);
            }
          });

          map.set(screenDef, xpathList);
          return map;
        },
        new Map<
          string,
          {
            tagname: string;
            text?: string;
            xpath: string;
            value?: string;
            checked?: boolean;
            attributes?: {
              [key: string]: string;
            };
          }[]
        >()
      );
    }
  }
}
